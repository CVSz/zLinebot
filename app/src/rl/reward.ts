import type { AgentAction, AgentState } from "../agents/policy.js";

export interface RewardConfig {
  readonly marginWeight: number;
  readonly volumeMultiplier: number;
  readonly discountThreshold: number;
  readonly discountPenalty: number;
  readonly rejectPenalty: number;
  readonly explorationBonus: number;
  readonly clipMin: number;
  readonly clipMax: number;
}

const DEFAULT_CONFIG: RewardConfig = {
  marginWeight: 100,
  volumeMultiplier: 0.01,
  discountThreshold: 0.3,
  discountPenalty: -5,
  rejectPenalty: -20,
  explorationBonus: 1.5,
  clipMin: -50,
  clipMax: 200
};

let rewardConfig: RewardConfig = DEFAULT_CONFIG;

export function setRewardConfig(config: Partial<RewardConfig>): void {
  rewardConfig = { ...rewardConfig, ...config };
  // eslint-disable-next-line no-console
  console.info("[rl] reward_config_updated", rewardConfig);
}

export function initializeRewardSystem(config?: Partial<RewardConfig>): void {
  if (config) {
    setRewardConfig(config);
  }
  // eslint-disable-next-line no-console
  console.info("[rl] reward_system_ready", rewardConfig);
}

export function computeReward(state: AgentState, action: AgentAction): number {
  const margin = state.marginAfter?.(action) ?? 0;
  const projectedVolume = Math.max(1, state.actionsLastMin || 1);

  let reward = margin * rewardConfig.marginWeight;
  reward *= projectedVolume * rewardConfig.volumeMultiplier;

  const discountPenalty = action.discount > rewardConfig.discountThreshold ? rewardConfig.discountPenalty : 2;
  reward += discountPenalty;

  if (action.reject) {
    reward += rewardConfig.rejectPenalty;
  }

  if (Math.random() < 0.1) {
    reward += rewardConfig.explorationBonus;
  }

  reward = Math.max(rewardConfig.clipMin, Math.min(rewardConfig.clipMax, reward));

  // eslint-disable-next-line no-console
  console.debug(`[rl] reward=${reward.toFixed(2)} margin=${margin.toFixed(2)} volume=${projectedVolume}`);

  return reward;
}
