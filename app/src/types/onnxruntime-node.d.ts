declare module "onnxruntime-node" {
  export type TensorType = "float32";

  export class Tensor {
    constructor(type: TensorType, data: Float32Array, dims: number[]);
    data: ArrayLike<number>;
  }

  export type InferenceSessionOutput = Record<string, Tensor>;

  export class InferenceSession {
    static create(path: string): Promise<InferenceSession>;
    run(feeds: Record<string, Tensor>): Promise<InferenceSessionOutput>;
  }
}
