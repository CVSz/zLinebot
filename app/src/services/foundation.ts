import { getOrt } from "./ort.js";

let session: { run(feeds: Record<string, unknown>): Promise<Record<string, { data: ArrayLike<number | bigint> }>> } | null = null;

const MODEL_PATH = process.env.FOUNDATION_MODEL_PATH ?? "/models/foundation_ranker.onnx";

export async function loadFoundationModel(path = MODEL_PATH) {
  const ort = await getOrt();
  if (!ort) {
    session = null;
    return;
  }

  session = await ort.InferenceSession.create(path);
}

export function isFoundationLoaded() {
  return session !== null;
}

export async function rankBatch(features: number[][]): Promise<number[]> {
  if (!session) {
    throw new Error("foundation model is not loaded");
  }

  if (features.length === 0 || (features[0]?.length ?? 0) === 0) {
    return [];
  }

  const ort = await getOrt();
  if (!ort) {
    throw new Error("ONNX runtime is unavailable");
  }

  const rows = features.length;
  const cols = features[0]?.length ?? 0;
  const flat = Float32Array.from(features.flat());

  const output = await session.run({
    input: new ort.Tensor("float32", flat, [rows, cols])
  });

  const firstTensor = Object.values(output)[0];
  if (!firstTensor?.data) {
    return [];
  }

  return Array.from(firstTensor.data as ArrayLike<number>).map((v) => Number(v));
}
