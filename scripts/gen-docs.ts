import fs from "fs";

const readmePath = "README.md";
const backupPath = "README.md.bak";

const content = `# ZLineBot Ultimate

## Features
- AI Commerce Engine
- RL + Bandit + Transformer
- Compliance (PDPA/GDPR/SOX/SOC2)
- Multi-tenant org-per-cluster

## Run
\`\`\`bash
bash install_full.sh
\`\`\`
`;

if (fs.existsSync(readmePath)) {
  fs.copyFileSync(readmePath, backupPath);
}

fs.writeFileSync(readmePath, content);
console.log(`[gen-docs] Generated ${readmePath}${fs.existsSync(backupPath) ? ` (backup: ${backupPath})` : ""}`);
