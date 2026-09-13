import fs from 'fs';

let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

if (!code.includes('const [resendingInvoice, setResendingInvoice]')) {
  code = code.replace(
    'const [impersonating, setImpersonating] = useState<ObCompany | null>(null);',
    'const [impersonating, setImpersonating] = useState<ObCompany | null>(null);\n  const [resendingInvoice, setResendingInvoice] = useState<string | null>(null);'
  );
  fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
  console.log("Patched resendingInvoice state successfully.");
} else {
  console.log("State already there?");
}

