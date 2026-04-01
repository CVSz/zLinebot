export type CandidateModel = {
  id: string;
};

export type Batch = unknown;

export type ModelEvaluator<TModel, TBatch> = (model: TModel, batch: TBatch) => Promise<number>;
export type TrafficSplitter = (input: { candidate: string; pct: number }) => Promise<void>;

async function setTrafficSplit(_input: { candidate: string; pct: number }) {
  // Placeholder integration: plug into app/src/services/traffic.ts when rollout infra is ready.
}

export async function improve<TModel extends CandidateModel, TBatch = Batch>(
  models: TModel[],
  batch: TBatch,
  evaluator: ModelEvaluator<TModel, TBatch>,
  splitter: TrafficSplitter = setTrafficSplit
): Promise<TModel> {
  if (models.length === 0) {
    throw new Error("models must not be empty");
  }

  const scores = await Promise.all(models.map((model) => evaluator(model, batch)));
  const bestIndex = scores.indexOf(Math.max(...scores));
  const best = models[bestIndex];
  if (!best) {
    throw new Error("failed to select best model");
  }

  await splitter({ candidate: best.id, pct: 0.1 });

  return best;
}
