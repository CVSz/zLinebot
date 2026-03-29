export type PredictiveModel<T> = {
  predict: (sequence: T[]) => Promise<T>;
};

export async function rollout<T>(model: PredictiveModel<T>, stateSeq: T[], horizon = 10) {
  const trajectory: T[] = [];
  let seq = [...stateSeq];

  for (let t = 0; t < horizon; t += 1) {
    const pred = await model.predict(seq);
    trajectory.push(pred);
    seq = [...seq.slice(1), pred];
  }

  return trajectory;
}
