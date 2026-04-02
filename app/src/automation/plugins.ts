type Plugin = (payload: any) => Promise<void>;

const plugins: Record<string, Plugin> = {};

export function registerPlugin(name: string, fn: Plugin): void {
  plugins[name] = fn;
}

export async function runPlugin(name: string, payload: any): Promise<void> {
  if (plugins[name]) {
    await plugins[name](payload);
  }
}

registerPlugin("webhook", async (payload) => {
  if (!payload?.url) {
    return;
  }

  await fetch(payload.url, {
    method: "POST",
    body: JSON.stringify(payload.data ?? {}),
    headers: { "Content-Type": "application/json" }
  });
});
