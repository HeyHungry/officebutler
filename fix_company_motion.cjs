const fs = require('fs');
let code = fs.readFileSync('src/pages/CompanyDashboard.tsx', 'utf8');

if (!code.includes("import { motion } from 'motion/react';")) {
  code = code.replace(/import \{ useNavigate \} from 'react-router-dom';/, "import { useNavigate } from 'react-router-dom';\nimport { motion } from 'motion/react';");
  fs.writeFileSync('src/pages/CompanyDashboard.tsx', code);
}
