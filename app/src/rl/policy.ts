export type PolicyEvent<TState, TAction> = {
  state: TState;
  action: TAction;
  reward: number;
  baseline: number;
  pi: number;
  mu: number;
};

export type TrainablePolicy<TState, TAction> = {
  learn: (input: { state: TState; action: TAction; grad: number }) => Promise<void>;
};

export async function update<TState, TAction>(
  policy: TrainablePolicy<TState, TAction>,
  batch: Array<PolicyEvent<TState, TAction>>
) {
  for (const event of batch) {
    const w = event.mu > 0 ? event.pi / event.mu : 0;
    const adv = event.reward - event.baseline;

    await policy.learn({
      state: event.state,
      action: event.action,
      grad: w * adv
    });
  }
}
