import { randomUUID } from "crypto";
import { db } from "../db.js";
import { addPoints } from "./loyalty.js";

export async function registerReferral(referrer: string, referee: string) {
  if (referrer === referee) {
    return;
  }

  const existing = await db.query<{ id: string }>(
    "SELECT id FROM referrals WHERE referrer = $1 AND referee = $2 LIMIT 1",
    [referrer, referee]
  );

  if (existing.rows.length > 0) {
    return;
  }

  await db.query(
    `INSERT INTO referrals (id, referrer, referee)
     VALUES ($1, $2, $3)`,
    [randomUUID(), referrer, referee]
  );

  await addPoints(referrer, 50);
}
