import fs from 'fs';

let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

if (!code.includes("import { MenuManager }")) {
  code = code.replace(
    "import { useNavigate } from 'react-router-dom';",
    "import { useNavigate } from 'react-router-dom';\nimport { MenuManager } from './MenuManager';"
  );
  fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
  console.log("Imported MenuManager");
} else {
  console.log("Already imported");
}
