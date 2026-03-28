import torch


def ppo_step(policy, old_policy, states, actions, rewards, clip_eps: float = 0.2):
    probs = policy(states)
    old_probs = old_policy(states)

    action_probs = probs.gather(1, actions.unsqueeze(1)).squeeze(1)
    old_action_probs = old_probs.gather(1, actions.unsqueeze(1)).squeeze(1)

    ratios = action_probs / old_action_probs.clamp_min(1e-8)
    unclipped = ratios * rewards
    clipped = torch.clamp(ratios, 1 - clip_eps, 1 + clip_eps) * rewards

    return -torch.min(unclipped, clipped).mean()
