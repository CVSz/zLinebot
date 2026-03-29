export async function edgeAI(prompt: string) {
  return fetch("https://worker.zeaz.dev", {
    method: "POST",
    body: JSON.stringify({ prompt })
  });
}
