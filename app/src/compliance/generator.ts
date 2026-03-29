import fs from "fs";
import path from "path";
import { db } from "../db.js";

export type ComplianceReportType = "pdpa" | "gdpr";

export async function generateReport(tenantId: string, type: ComplianceReportType) {
  const consents = await db.query(
    "SELECT * FROM consents WHERE user_id IN (SELECT id FROM users WHERE tenant_id=$1)",
    [tenantId]
  );

  const dsr = await db.query(
    "SELECT * FROM dsr_requests WHERE user_id IN (SELECT id FROM users WHERE tenant_id=$1)",
    [tenantId]
  );

  const audit = await db.query("SELECT * FROM audit_logs WHERE tenant_id=$1", [tenantId]);

  const report = {
    type,
    tenantId,
    consents: consents.rows,
    dsr: dsr.rows,
    audit: audit.rows,
    generatedAt: new Date().toISOString()
  };

  const exportsDir = "/exports";
  fs.mkdirSync(exportsDir, { recursive: true });
  fs.writeFileSync(
    path.join(exportsDir, `${type}_${tenantId}.json`),
    JSON.stringify(report, null, 2),
    "utf-8"
  );

  return report;
}
