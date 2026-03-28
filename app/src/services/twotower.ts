import * as ort from "onnxruntime-node";

let session: ort.InferenceSession | null = null;

export async function loadTwoTower(modelPath = process.env.TWO_TOWER_MODEL_PATH ?? "/models/two_tower.onnx") {
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
