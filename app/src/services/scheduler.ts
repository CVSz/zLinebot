export type ComputeTarget = "gpu" | "cpu";

export function chooseCompute(load: number): ComputeTarget {
  if (load > 0.7) {
    return "gpu";
  }

  return "cpu";
}
