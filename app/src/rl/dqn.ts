import type { AgentAction, AgentState } from "../agents/policy.js";
import { clamp } from "./utils.js";

export type DqnAction = "hold" | "discount_10" | "discount_20" | "reject";

export type Transition = {
  state: number[];
  action: number;
  reward: number;
  nextState: number[];
  done: boolean;
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
};

const DEFAULT_ACTION_SPACE: DqnAction[] = ["hold", "discount_10", "discount_20", "reject"];

function randomMatrix(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => (Math.random() - 0.5) * 0.01)
  );
}

function dot(weights: number[][], input: number[]): number[] {
  if (!weights.length) {
    return [];
  }

  const cols = weights[0]?.length ?? 0;
  const output = Array.from({ length: cols }, () => 0);

  for (let row = 0; row < weights.length; row += 1) {
    const value = input[row] ?? 0;
    for (let col = 0; col < cols; col += 1) {
      output[col] += value * (weights[row]?.[col] ?? 0);
    }
  }

  return output;
}

function maxIndex(values: number[]): number {
  let best = 0;
  for (let i = 1; i < values.length; i += 1) {
    if (values[i] > values[best]) {
      best = i;
    }
  }
  return best;
}

function sampleBatch<T>(items: T[], size: number): T[] {
  if (items.length <= size) {
    return [...items];
  }

  const result: T[] = [];
  for (let i = 0; i < size; i += 1) {
    const index = Math.floor(Math.random() * items.length);
    result.push(items[index]);
  }
  return result;
}

export function encodeState(state: AgentState): number[] {
  const candidateCount = state.candidates.length;
  const actionRate = state.actionsLastMin;
  const baselineAction: AgentAction = {
    type: "rank",
    pick: state.candidates[0]?.id ?? null,
    discount: 0
  };

  const margin = state.marginAfter(baselineAction);

  return [...state.vector, candidateCount, actionRate, margin];
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

  private epsilon: number;
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
    this.replayBufferSize = config.replayBufferSize ?? 20_000;
    this.batchSize = config.batchSize ?? 64;
    this.tau = config.tau ?? 0.01;

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

    const qValues = dot(this.onlineWeights, state);
    return maxIndex(qValues);
  }

  public storeTransition(transition: Transition): void {
    this.replayBuffer.push(transition);
    if (this.replayBuffer.length > this.replayBufferSize) {
      this.replayBuffer.shift();
    }
  }

  public trainStep(): boolean {
    if (this.replayBuffer.length < this.batchSize) {
      return false;
    }

    const batch = sampleBatch(this.replayBuffer, this.batchSize);

    for (const transition of batch) {
      const qOnline = dot(this.onlineWeights, transition.state);
      const qNextOnline = dot(this.onlineWeights, transition.nextState);
      const qNextTarget = dot(this.targetWeights, transition.nextState);

      const bestNextAction = maxIndex(qNextOnline);
      const target = transition.reward + (transition.done ? 0 : this.gamma * (qNextTarget[bestNextAction] ?? 0));
      const prediction = qOnline[transition.action] ?? 0;
      const tdError = target - prediction;

      for (let i = 0; i < this.stateDim; i += 1) {
        this.onlineWeights[i][transition.action] += this.learningRate * tdError * (transition.state[i] ?? 0);
      }
    }

    this.epsilon = clamp(this.epsilon * this.epsilonDecay, this.epsilonMin, 1);
    this.softUpdateTarget();
    return true;
  }

  public toAgentAction(state: AgentState): AgentAction {
    const encoded = encodeState(state);
    const actionIndex = this.selectAction(encoded);
    const action = this.actionSpace[actionIndex] ?? "hold";
    const pick = state.candidates[0]?.id ?? null;

    switch (action) {
      case "discount_10":
        return { type: "rank", pick, discount: 0.1 };
      case "discount_20":
        return { type: "rank", pick, discount: 0.2 };
      case "reject":
        return { type: "rank", pick: null, discount: 0, reject: true };
      case "hold":
      default:
        return { type: "rank", pick, discount: 0 };
    }
  }

  private softUpdateTarget(): void {
    for (let i = 0; i < this.stateDim; i += 1) {
      for (let j = 0; j < this.actionCount; j += 1) {
        const online = this.onlineWeights[i][j];
        const target = this.targetWeights[i][j];
        this.targetWeights[i][j] = this.tau * online + (1 - this.tau) * target;
      }
    }
  }
}
