import axios from "axios";

export type AnomalyResult = {
  query: string;
  current: number;
  threshold: number;
  anomalous: boolean;
};

function parsePrometheusValue(payload: unknown): number {
  const value = (payload as { data?: { result?: Array<{ value?: [number | string, string] }> } })
    ?.data?.result?.[0]?.value?.[1];

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function detectAnomaly(options?: {
  threshold?: number;
  prometheusBaseUrl?: string;
  query?: string;
  onAnomaly?: (result: AnomalyResult) => Promise<void> | void;
}): Promise<AnomalyResult> {
  const query = options?.query ?? "rate(http_requests_total[1m])";
  const threshold = options?.threshold ?? 1000;
  const baseUrl = options?.prometheusBaseUrl ?? process.env.PROMETHEUS_URL ?? "http://prometheus:9090";

  const metrics = await axios.get(`${baseUrl}/api/v1/query`, {
    params: { query },
    timeout: 5000
  });

  const current = parsePrometheusValue(metrics.data);
  const result: AnomalyResult = {
    query,
    current,
    threshold,
    anomalous: current > threshold
  };

  if (result.anomalous) {
    // eslint-disable-next-line no-console
    console.log("🚨 Traffic spike anomaly detected", result);
    await options?.onAnomaly?.(result);
  }

  return result;
}
