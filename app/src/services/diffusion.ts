export type DiffusionEmbeddingResponse = {
  embedding: number[];
};

export async function generateEmbedding(signal?: AbortSignal): Promise<number[]> {
  const response = await fetch(process.env.DIFFUSION_URL ?? "http://ml:8000/sample", {
    method: "GET",
    signal
  });

  if (!response.ok) {
    throw new Error(`diffusion service failed: ${response.status}`);
  }

  const body = (await response.json()) as DiffusionEmbeddingResponse | number[];
  if (Array.isArray(body)) {
    return body;
  }

  return body.embedding ?? [];
}
