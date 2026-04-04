export type OrtTensorType = "float32" | "int64";

type OrtModule = {
  Tensor: new (type: OrtTensorType, data: Float32Array | BigInt64Array, dims: number[]) => {
    data: ArrayLike<number | bigint>;
  };
  InferenceSession: {
    create(path: string): Promise<{ run(feeds: Record<string, unknown>): Promise<Record<string, { data: ArrayLike<number | bigint> }>> }>;
  };
};

let cachedOrt: OrtModule | null | undefined;

export async function getOrt(): Promise<OrtModule | null> {
  if (cachedOrt !== undefined) {
    return cachedOrt;
  }

  try {
    const mod = (await import("onnxruntime-node")) as unknown as OrtModule;
    cachedOrt = mod;
    return mod;
  } catch {
    cachedOrt = null;
    return null;
  }
}
