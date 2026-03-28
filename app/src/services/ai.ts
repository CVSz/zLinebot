export async function generateReply(prompt: string) {
  const res = await fetch("http://ollama:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "mistral",
      prompt,
      stream: false
    })
  });

  const data = await res.json();
  return data.response as string;
}
