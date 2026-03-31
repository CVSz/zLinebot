import type { AgentAction, AgentState } from "../agents/policy.js";
import { computeReward, type RewardConfig } from "./reward.js";

/**
 * Per-agent reward contribution for credit assignment.
 */
export interface AgentReward {
  readonly agentId: string;
  readonly localReward: number;
  readonly globalContribution: number;
}

/**
 * Coordinated multi-agent reward output.
 */
export interface CoordinatedReward {
  readonly globalReward: number;
  readonly agentRewards: AgentReward[];
  readonly metadata: Record<string, number>;
}

/**
 * Multi-agent reward coordination configuration.
 */
export interface MultiAgentRewardConfig extends RewardConfig {
  readonly globalMarginWeight: number;
  readonly negotiationBonus: number;
  readonly auctionSynergyBonus: number;
  readonly creditAssignmentAlpha: number;
}

const DEFAULT_MULTI_AGENT_CONFIG: MultiAgentRewardConfig = {
  marginWeight: 100,
  volumeMultiplier: 0.01,
  discountThreshold: 0.3,
  discountPenalty: -5,
  rejectPenalty: -20,
  explorationBonus: 1.5,
  clipMin: -50,
  clipMax: 200,
  globalMarginWeight: Number(process.env.RL_GLOBAL_MARGIN_WEIGHT ?? 150),
  negotiationBonus: Number(process.env.RL_NEGOTIATION_BONUS ?? 8),
  auctionSynergyBonus: Number(process.env.RL_AUCTION_SYNERGY_BONUS ?? 12),
  creditAssignmentAlpha: Number(process.env.RL_CREDIT_ASSIGNMENT_ALPHA ?? 0.7)
};

let multiAgentConfig: MultiAgentRewardConfig = DEFAULT_MULTI_AGENT_CONFIG;

export function setMultiAgentRewardConfig(config: Partial<MultiAgentRewardConfig>): void {
  multiAgentConfig = { ...multiAgentConfig, ...config };
  // eslint-disable-next-line no-console
  console.info("[rl] multi_agent_reward_config_updated", multiAgentConfig);
}

export function computeCoordinatedReward(
  state: AgentState,
  actions: Record<string, AgentAction>
): CoordinatedReward {
  try {
    const actionEntries = Object.entries(actions);
    const actionCount = Math.max(actionEntries.length, 1);

    const globalMargin = state.marginAfterGlobal?.(actions) ?? 0;
    let globalReward = globalMargin * multiAgentConfig.globalMarginWeight;

    const hasNegotiation = actionEntries.some(([agentId]) => agentId.includes("negotiation"));
    const hasAuction = actionEntries.some(([agentId]) => agentId.includes("auction"));
    if (hasNegotiation && hasAuction) {
      globalReward += multiAgentConfig.negotiationBonus + multiAgentConfig.auctionSynergyBonus;
    }

    const agentRewards: AgentReward[] = actionEntries.map(([agentId, action]) => {
      const localReward = computeReward(state, action);
      const globalContribution =
        localReward * multiAgentConfig.creditAssignmentAlpha +
        (globalReward / actionCount) * (1 - multiAgentConfig.creditAssignmentAlpha);

      return { agentId, localReward, globalContribution };
    });

    const totalLocal = agentRewards.reduce((sum, reward) => sum + reward.localReward, 0);
    const normalizedGlobal = Math.max(-100, Math.min(300, globalReward + totalLocal * 0.2));

    const metadata: Record<string, number> = {
      globalMargin,
      agentCount: actionEntries.length,
      synergyBonusApplied: hasNegotiation && hasAuction ? 1 : 0
    };

    // eslint-disable-next-line no-console
    console.debug(`[rl] coordinated_reward global=${normalizedGlobal.toFixed(2)} agents=${agentRewards.length}`);

    return {
      globalReward: normalizedGlobal,
      agentRewards,
      metadata
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[rl] multi_agent_reward_failed", error);

    return {
      globalReward: -50,
      agentRewards: Object.keys(actions).map((agentId) => ({
        agentId,
        localReward: -20,
        globalContribution: -20
      })),
      metadata: { error: 1 }
    };
  }
}

export function initializeMultiAgentRewardSystem(config?: Partial<MultiAgentRewardConfig>): void {
  if (config) {
    setMultiAgentRewardConfig(config);
  }
  // eslint-disable-next-line no-console
  console.info("[rl] multi_agent_reward_system_ready", multiAgentConfig);
}
