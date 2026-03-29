const localEndpoint = "http://localhost:6333";

function resolveCloudEndpoint(): string {
  if (!process.env.QDRANT_CLOUD) {
    throw new Error("QDRANT_CLOUD is not set");
  }
  return process.env.QDRANT_CLOUD;
}

export function endpoint(load: number): string {
  return load > 0.7 ? resolveCloudEndpoint() : localEndpoint;
}

export async function upsert(vec: number[], id: string, load: number): Promise<Response> {
  const url = endpoint(load);

  return fetch(`${url}/collections/main/points`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      points: [{ id, vector: vec }]
    })
  });
}
