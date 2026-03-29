import fs from "fs";

const content = `
# ZLineBot Ultimate

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

fs.writeFileSync("README.md", content);
