export type SlaResponse = {
  latency: number;
  errorRate: number;
};

export function enforceSLA<T extends SlaResponse>(response: T): T {
  if (response.latency > 2000 || response.errorRate > 0.02) {
    throw new Error("SLA breach");
  }

  return response;
}
