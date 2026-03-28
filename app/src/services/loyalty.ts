import { db } from "../db.js";

export async function addPoints(userId: string, pts: number) {
  await db.query(
    `INSERT INTO loyalty_points (user_id, points)
     VALUES ($1, $2)
     ON CONFLICT (user_id)
     DO UPDATE SET points = loyalty_points.points + $2`,
    [userId, pts]
  );
}

export async function getPoints(userId: string) {
  const result = await db.query<{ points: number }>(
    "SELECT points FROM loyalty_points WHERE user_id = $1",
    [userId]
  );

  return result.rows[0]?.points ?? 0;
}
