import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { db } from "../db.js";

type LedgerRow = {
  id: string;
  amount: string;
  type: "debit" | "credit";
  ref: string | null;
  created_at: string;
};

function escapeCsv(value: string) {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

function safePathToken(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}

export async function exportLedger(tenantId: string) {
  const result = await db.query<LedgerRow>(
    `SELECT id, amount::text, type, ref, created_at::text
     FROM ledger
     WHERE tenant_id = $1
     ORDER BY created_at ASC`,
    [tenantId]
  );

  const header = ["id", "amount", "type", "ref", "created_at"].join(",");
  const lines = result.rows.map((row) => {
    return [
      escapeCsv(row.id),
      escapeCsv(row.amount),
      escapeCsv(row.type),
      escapeCsv(row.ref ?? ""),
      escapeCsv(row.created_at)
    ].join(",");
  });

  const exportDir = process.env.EXPORT_DIR ?? "/tmp/exports";
  await mkdir(exportDir, { recursive: true });

  const filePath = path.join(exportDir, `ledger_${safePathToken(tenantId)}_${Date.now()}.csv`);
  await writeFile(filePath, [header, ...lines].join("\n"), "utf8");

  return filePath;
}
