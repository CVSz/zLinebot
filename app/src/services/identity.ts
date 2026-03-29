import { db } from "../db.js";

export async function resolveIdentity(platform: string, platformUserId: string) {
  const result = await db.query<{ global_id: string | null }>(
    `SELECT global_id FROM identities
     WHERE platform = $1 AND platform_user_id = $2
     ORDER BY global_id NULLS LAST
     LIMIT 1`,
    [platform, platformUserId]
  );

  return result.rows[0]?.global_id ?? platformUserId;
}
