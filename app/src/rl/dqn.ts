import type { AgentAction, AgentState } from "../agents/policy.js";
import type { CoordinatedReward } from "./multi-agent-reward.js";
import { clamp } from "./utils.js";

export type DqnAction = "hold" | "discount" | "bundle" | "upsell" | "reject" | "escalate";

export type Transition = {
  state: number[];
  action: number;
  reward: number;
  nextState: number[];
  done: boolean;
  priority?: number;
  agentContributions?: Record<string, number>;
};

export type DqnConfig = {
  stateDim: number;
  actionSpace?: DqnAction[];
  learningRate?: number;
  discountFactor?: number;
  epsilonStart?: number;
  epsilonMin?: number;
  epsilonDecay?: number;
  replayBufferSize?: number;
  batchSize?: number;
  tau?: number;
  targetUpdateInterval?: number;
};

const DEFAULT_ACTION_SPACE: DqnAction[] = ["discount", "bundle", "hold", "upsell", "reject", "escalate"];

function randomMatrix(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => (Math.random() - 0.5) * 0.01)
  );
}

function dot(weights: number[][], input: number[]): number[] {
  if (!weights.length) return [];

  const cols = weights[0]?.length ?? 0;
  const output = Array.from({ length: cols }, () => 0);

  for (let row = 0; row < weights.length; row += 1) {
    const value = input[row] ?? 0;
    const weightRow = weights[row];
    if (!weightRow) continue;

    for (let col = 0; col < cols; col += 1) {
      output[col] = (output[col] ?? 0) + value * (weightRow[col] ?? 0);
    }
  }
  return output;
}

function maxIndex(values: number[]): number {
  let best = 0;
  for (let i = 1; i < values.length; i += 1) {
    if ((values[i] ?? -Infinity) > (values[best] ?? -Infinity)) {
      best = i;
    }
  }
  return best;
}

function samplePrioritizedBatch(items: Transition[], size: number): Transition[] {
  if (items.length <= size) return [...items];

  const totalPriority = items.reduce((sum, item) => sum + Math.max(item.priority ?? 1, 1e-6), 0);
  const result: Transition[] = [];

  for (let i = 0; i < size; i += 1) {
    const threshold = Math.random() * totalPriority;
    let cumulative = 0;
    for (const item of items) {
      cumulative += Math.max(item.priority ?? 1, 1e-6);
      if (cumulative >= threshold) {
        result.push(item);
        break;
      }
    }
  }
  return result;
}

export function encodeState(state: AgentState): number[] {
  const vector = [...state.vector.slice(0, 252)];
  while (vector.length < 252) vector.push(0);

  const candidateCount = state.candidates.length;
  const actionRate = state.actionsLastMin;
  const baselineAction: AgentAction = {
    type: "rank",
    pick: state.candidates[0]?.id ?? null,
    discount: 0
  };
  const margin = state.marginAfter(baselineAction);

  return [...vector, candidateCount, actionRate, margin, Number(state.tenantId.length > 0)];
}

export class DQN {
  private readonly actionSpace: DqnAction[];
  private readonly actionCount: number;
  private readonly stateDim: number;
  private readonly learningRate: number;
  private readonly gamma: number;
  private readonly epsilonMin: number;
  private readonly epsilonDecay: number;
  private readonly replayBufferSize: number;
  private readonly batchSize: number;
  private readonly tau: number;
  private readonly targetUpdateInterval: number;

  private epsilon: number;
  private stepCount = 0;
  private replayBuffer: Transition[] = [];
  private onlineWeights: number[][];
  private targetWeights: number[][];

  constructor(config: DqnConfig) {
    this.stateDim = config.stateDim;
    this.actionSpace = config.actionSpace ?? DEFAULT_ACTION_SPACE;
    this.actionCount = this.actionSpace.length;
    this.learningRate = config.learningRate ?? 0.001;
    this.gamma = config.discountFactor ?? 0.95;
    this.epsilon = config.epsilonStart ?? 1;
    this.epsilonMin = config.epsilonMin ?? 0.05;
    this.epsilonDecay = config.epsilonDecay ?? 0.995;
    this.replayBufferSize = config.replayBufferSize ?? 50_000;
    this.batchSize = config.batchSize ?? 64;
    this.tau = config.tau ?? 0.005;
    this.targetUpdateInterval = config.targetUpdateInterval ?? 100;

    this.onlineWeights = randomMatrix(this.stateDim, this.actionCount);
    this.targetWeights = this.onlineWeights.map((row) => [...row]);
  }

  public getEpsilon(): number {
    return this.epsilon;
  }

  public selectAction(state: number[]): number {
    if (Math.random() < this.epsilon) {
      return Math.floor(Math.random() * this.actionCount);
    }
    return maxIndex(dot(this.onlineWeights, state));
  }

  public storeTransition(transition: Omit<Transition, "reward" | "agentContributions"> & { reward: number | CoordinatedReward }): void {
    const normalizedReward = typeof transition.reward === "number" ? transition.reward : transition.reward.globalReward;
    const agentContributions = typeof transition.reward === "number" 
      ? undefined 
      : Object.fromEntries(transition.reward.agentRewards.map((e) => [e.agentId, e.globalContribution]));

    const stored: Transition = { ...transition, reward: normalizedReward, agentContributions };
    stored.priority = Math.max(Math.abs(stored.reward), 1e-6);
    
    this.replayBuffer.push(stored);
    if (this.replayBuffer.length > this.replayBufferSize) this.replayBuffer.shift();
  }

  public trainStep(): number | null {
    if (this.replayBuffer.length < this.batchSize) return null;

    const batch = samplePrioritizedBatch(this.replayBuffer, this.batchSize);
    let totalTdError = 0;

    for (const transition of batch) {
      const qOnline = dot(this.onlineWeights, transition.state);
      const qNextOnline = dot(this.onlineWeights, transition.nextState);
      const qNextTarget = dot(this.targetWeights, transition.nextState);

      const bestNextAction = maxIndex(qNextOnline);
      const nextTargetQ = qNextTarget[bestNextAction] ?? 0;
      const target = transition.reward + (transition.done ? 0 : this.gamma * nextTargetQ);
      const prediction = qOnline[transition.action] ?? 0;
      const tdError = target - prediction;

      totalTdError += Math.abs(tdError);

      // Weight Update Loop (Fix for TS1128)
      for (let i = 0; i < this.stateDim; i += 1) {
        const row = this.onlineWeights[i];
        if (row && transition.action >= 0 && transition.action < this.actionCount) {
          row[transition.action] = (row[transition.action] ?? 0) + this.learningRate * tdError * (transition.state[i] ?? 0);
        }
      }
      transition.priority = Math.max(Math.abs(tdError), 1e-6);
    }

    this.epsilon = clamp(this.epsilon * this.epsilonDecay, this.epsilonMin, 1);
    this.stepCount += 1;
    if (this.stepCount % this.targetUpdateInterval === 0) this.softUpdateTarget();

    return totalTdError / batch.length;
  }

  public toAgentAction(state: AgentState): AgentAction {
    const actionIndex = this.selectAction(encodeState(state));
    const action = this.actionSpace[actionIndex] ?? "hold";
    const pick = state.candidates[0]?.id ?? null;

    switch (action) {
      case "discount": return { type: "rank", pick, discount: 0.15 };
      case "bundle":   return { type: "rank", pick, discount: 0.1 };
      case "upsell":   return { type: "rank", pick, discount: 0.05 };
      case "reject":   return { type: "rank", pick: null, discount: 0, reject: true };
      case "escalate": return { type: "rank", pick: null, discount: 0 };
      default:         return { type: "rank", pick, discount: 0 };
    }
  }

  private softUpdateTarget(): void {
    for (let i = 0; i < this.stateDim; i += 1) {
      const onlineRow = this.onlineWeights[i];
      const targetRow = this.targetWeights[i];
      if (!onlineRow || !targetRow) continue;

      for (let j = 0; j < this.actionCount; j += 1) {
        const onlineVal = onlineRow[j] ?? 0;
        const targetVal = targetRow[j] ?? 0;
        targetRow[j] = this.tau * onlineVal + (1 - this.tau) * targetVal;
      }
    }
  }
}

let dqnInstance: DQN | null = null;

export function configureDQN(config: DqnConfig): DQN {
  if (!dqnInstance) dqnInstance = new DQN(config);
  return dqnInstance;
}

export function getDQN(): DQN | null {
  return dqnInstance;
}
