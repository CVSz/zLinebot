interface AGIInput {
  user: Record<string, unknown>;
  context: Record<string, unknown>;
  items: Array<Record<string, unknown>>;
}

interface OllamaGenerateResponse {
  response: string;
}

export async function agiRecommend(input: AGIInput) {
  const prompt = [
    `User: ${JSON.stringify(input.user)}`,
    `Context: ${JSON.stringify(input.context)}`,
    `Items: ${JSON.stringify(input.items)}`,
    "",
    "Rank the best items and include concise reasoning."
  ].join("\n");

  const response = await fetch("http://ollama:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "mistral",
      prompt,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`AGI recommendation failed with status ${response.status}`);
  }

  const payload = (await response.json()) as OllamaGenerateResponse;
  return payload.response;
}
