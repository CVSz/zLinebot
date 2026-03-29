import { sign } from "../services/auth.js";

type Peer = string;

async function getPeers(): Promise<Peer[]> {
  const raw = process.env.FEDERATION_PEERS ?? "";
  return raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
}

export async function broadcastUpdate(update: number[]): Promise<void> {
  const peers = await getPeers();
  const payload = { update, ts: Date.now() };
  const token = sign({ role: "node" });

  await Promise.all(
    peers.map((p) =>
      fetch(`${p}/federation/update`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json"
        },
        body: JSON.stringify(payload)
      })
    )
  );
}
