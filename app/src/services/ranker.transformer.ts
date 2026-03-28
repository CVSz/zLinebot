import * as ort from "onnxruntime-node";

let session: ort.InferenceSession | null = null;

export async function loadRanker(modelPath = process.env.RANKER_MODEL_PATH ?? "/models/ranker.onnx") {
  session = await ort.InferenceSession.create(modelPath);
}

export async function scoreWithTransformer(inputIds: bigint[], mask: bigint[]) {
  if (!session) {
    return 0;
  }

  const ids = BigInt64Array.from(inputIds);
  const attentionMask = BigInt64Array.from(mask);

  const outputs = await session.run({
    input_ids: new ort.Tensor("int64", ids, [1, ids.length]),
    attention_mask: new ort.Tensor("int64", attentionMask, [1, attentionMask.length])
  });

  const scoreTensor = outputs.score;
  if (!scoreTensor || scoreTensor.data.length === 0) {
    return 0;
  }

  return Number(scoreTensor.data[0]);
}
