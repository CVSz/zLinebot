import { mkdir, mkdtemp, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
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

  const exportRoot = process.env.EXPORT_DIR ?? "/tmp";
  await mkdir(exportRoot, { recursive: true, mode: 0o700 });

  const exportDir = await mkdtemp(path.join(exportRoot, "ledger_export_"));
  const filePath = path.join(exportDir, `ledger_${Date.now()}_${randomUUID()}.csv`);
  await writeFile(filePath, [header, ...lines].join("\n"), "utf8");

  return filePath;
}
