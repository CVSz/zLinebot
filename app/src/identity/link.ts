import { db } from "../db.js";

export async function link(a: string, b: string, weight = 1) {
  await db.query("INSERT INTO links (a, b, weight) VALUES ($1, $2, $3)", [a, b, weight]);
}
