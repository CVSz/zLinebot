import { chooseCompute } from "./scheduler.js";

export async function infer(task: unknown, load: number): Promise<Response> {
  const target = chooseCompute(load);
  const endpoint = target === "gpu" ? "http://gpu-infer:8000" : "http://cpu-infer:8000";

  return fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(task)
  });
}
