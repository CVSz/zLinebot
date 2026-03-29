import { randomUUID } from "crypto";
import { db } from "../db.js";

export async function collectEvidence(controlId: string, artifact: unknown) {
  await db.query(
    `INSERT INTO evidence (id,control_id,artifact)
     VALUES ($1,$2,$3)`,
    [randomUUID(), controlId, JSON.stringify(artifact)]
  );
}
