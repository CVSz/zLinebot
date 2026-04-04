import { getOrt } from "./ort.js";

let session: { run(feeds: Record<string, unknown>): Promise<Record<string, { data: ArrayLike<number | bigint> }>> } | null = null;

export async function loadTwoTower(modelPath = process.env.TWO_TOWER_MODEL_PATH ?? "/models/two_tower.onnx") {
  const ort = await getOrt();
  if (!ort) {
    session = null;
    return;
  }

  session = await ort.InferenceSession.create(modelPath);
}

export async function scoreTwoTower(userFeatures: number[], itemFeatures: number[]) {
  if (!session) {
    await loadTwoTower();
  }

  const activeSession = session;
  if (!activeSession) {
    throw new Error("Two-tower model is not loaded");
  }

  if (userFeatures.length === 0 || itemFeatures.length === 0) {
    throw new Error("Two-tower score requires non-empty user/item feature vectors");
  }

  const ort = await getOrt();
  if (!ort) {
    throw new Error("ONNX runtime is unavailable");
  }

  const output = await activeSession.run({
    user: new ort.Tensor("float32", Float32Array.from(userFeatures), [1, userFeatures.length]),
    item: new ort.Tensor("float32", Float32Array.from(itemFeatures), [1, itemFeatures.length])
  });

  const scoreTensor = output.score;
  if (!scoreTensor || !scoreTensor.data || scoreTensor.data.length === 0) {
    throw new Error("Two-tower output does not include score tensor");
  }

  return Number(scoreTensor.data[0]);
}
