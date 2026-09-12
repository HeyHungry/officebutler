import fs from 'fs';
let code = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');

if (!code.includes('const [emailFailed, setEmailFailed] = useState(false);')) {
  code = code.replace(
    "const [orderSuccess, setOrderSuccess] = useState(false);",
    "const [orderSuccess, setOrderSuccess] = useState(false);\n  const [emailFailed, setEmailFailed] = useState(false);"
  );
  
  code = code.replace(
    `        try {
          await fetch('/api/send-invoice', {`,
    `        try {
          const res = await fetch('/api/send-invoice', {`
  );
  
  code = code.replace(
    `            })
          });
        } catch (emailErr) {
          console.error("Kon email niet verzenden:", emailErr);
          // We still show success to the user since the DB insert worked
        }`,
    `            })
          });
          if (!res.ok) {
            setEmailFailed(true);
          }
        } catch (emailErr) {
          console.error("Kon email niet verzenden:", emailErr);
          setEmailFailed(true);
        }`
  );
  
  code = code.replace(
    `            Bedankt voor je bestelling namens {companyName}. We hebben je aanvraag goed ontvangen en de bevestiging is verstuurd.`,
    `            Bedankt voor je bestelling namens {companyName}. We hebben je aanvraag goed ontvangen.{emailFailed ? " (Wegens een lichte vertraging in het e-mailsysteem ontvang je de bevestigingsmail mogelijk iets later)." : " De bevestiging is zojuist naar het opgegeven mailadres verstuurd."}`
  );
  
  fs.writeFileSync('src/pages/EmployeeOrdering.tsx', code);
  console.log("Patched EmployeeOrdering");
}
