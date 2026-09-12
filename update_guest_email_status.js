import fs from 'fs';
let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

if (!code.includes('const [emailFailed, setEmailFailed] = useState(false);')) {
  code = code.replace(
    "const [orderSuccess, setOrderSuccess] = useState(false);",
    "const [orderSuccess, setOrderSuccess] = useState(false);\n  const [emailFailed, setEmailFailed] = useState(false);"
  );
  
  code = code.replace(
    `        try {
          await fetch('/api/send-guest-invoice', {`,
    `        try {
          const res = await fetch('/api/send-guest-invoice', {`
  );
  
  code = code.replace(
    `            })
          });
        } catch (emailErr) {
          console.error("Kon email niet verzenden:", emailErr);
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
    `Bedankt voor uw bestelling, {guestName}. We hebben uw aanvraag goed ontvangen en de factuur is verstuurd.`,
    `Bedankt voor uw bestelling, {guestName}. We hebben uw aanvraag goed ontvangen.{emailFailed ? " (Op dit moment is er een lichte vertraging in ons e-mailsysteem. Uw bestelling is veilig in goede banen, maar de bevestigingsmail volgt mogelijk iets later)." : " De factuur is verstuurd naar uw e-mail."}`
  );
  
  fs.writeFileSync('src/pages/GuestOrdering.tsx', code);
  console.log("Patched GuestOrdering");
}
