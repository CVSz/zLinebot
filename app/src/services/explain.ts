type ExplainResponse = {
  shapValues: number[];
  modelVersion?: string;
};

export async function explain(features: number[]): Promise<ExplainResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const res = await fetch(process.env.ML_EXPLAIN_URL ?? "http://ml:8000/explain", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ features }),
      signal: controller.signal
    });

    if (!res.ok) {
      throw new Error(`Explainability request failed: ${res.status}`);
    }

    return (await res.json()) as ExplainResponse;
  } finally {
    clearTimeout(timeout);
  }
}
