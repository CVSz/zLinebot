import { randomUUID } from "crypto";
import { db } from "../db.js";

export async function credit(agentId: string, amount: number, reason: string) {
  await db.query("INSERT INTO ledger (id,agent_id,delta,reason) VALUES ($1,$2,$3,$4)", [
    randomUUID(),
    agentId,
    amount,
    reason
  ]);
}
