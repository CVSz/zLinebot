import * as ort from "onnxruntime-node";

let session: ort.InferenceSession | null = null;

const MODEL_PATH = process.env.RANK_MODEL_PATH ?? "/models/rank.onnx";

export async function loadModel(path = MODEL_PATH) {
  session = await ort.InferenceSession.create(path);
}

export async function inferScore(q: number[], u: number[], s: number[]) {
  if (!session) {
    throw new Error("ONNX ranking model is not loaded");
  }

  const feeds = {
    q: new ort.Tensor("float32", Float32Array.from(q), [1, q.length]),
    u: new ort.Tensor("float32", Float32Array.from(u), [1, u.length]),
    s: new ort.Tensor("float32", Float32Array.from(s), [1, s.length])
  };

  const output = await session.run(feeds);
  const firstTensor = Object.values(output)[0];

  if (!firstTensor?.data || firstTensor.data.length === 0) {
    return 0;
  }

  return Number(firstTensor.data[0]);
}

export function isModelLoaded() {
  return session !== null;
}
