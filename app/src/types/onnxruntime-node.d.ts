declare module "onnxruntime-node" {
  export type TensorType = "float32" | "int64";

  export class Tensor {
    constructor(type: "float32", data: Float32Array, dims: number[]);
    constructor(type: "int64", data: BigInt64Array, dims: number[]);
    data: ArrayLike<number | bigint>;
  }

  export type InferenceSessionOutput = Record<string, Tensor>;

  export class InferenceSession {
    static create(path: string): Promise<InferenceSession>;
    run(feeds: Record<string, Tensor>): Promise<InferenceSessionOutput>;
  }
}
