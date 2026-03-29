export async function sendPush(msg: string): Promise<void> {
  await fetch("https://your-push-service", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ msg })
  });
}
