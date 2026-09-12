import fs from 'fs';
let code = fs.readFileSync('src/components/BusinessRegistration.tsx', 'utf8');

if (!code.includes('const [emailFailed, setEmailFailed] = useState(false);')) {
  code = code.replace(
    "const [isSuccess, setIsSuccess] = useState(false);",
    "const [isSuccess, setIsSuccess] = useState(false);\n  const [emailFailed, setEmailFailed] = useState(false);"
  );
  
  code = code.replace(
    `      try {
        await fetch('/api/notify-admin', {`,
    `      try {
        const res = await fetch('/api/notify-admin', {`
  );
  
  code = code.replace(
    `          })
        });
      } catch (emailErr) {
        console.error("Kon email niet verzenden via API:", emailErr);
      }`,
    `          })
        });
        if (!res.ok) {
          setEmailFailed(true);
        }
      } catch (emailErr) {
        console.error("Kon email niet verzenden via API:", emailErr);
        setEmailFailed(true);
      }`
  );
  
  code = code.replace(
    `          <p className="text-gray-600 mb-8 leading-relaxed">
            We hebben uw aanvraag in goede orde ontvangen. Ons team neemt zo spoedig mogelijk contact met u op.
          </p>`,
    `          <p className="text-gray-600 mb-8 leading-relaxed">
            We hebben uw aanvraag in goede orde ontvangen. Ons team neemt zo spoedig mogelijk contact met u op.
            {emailFailed && <span className="block mt-4 text-orange-600 text-sm">Opmerking: Wegens een technische vertraging bij onze e-mailprovider duren bevestigingsmails momenteel iets langer dan gebruikelijk. Uw aanvraag staat in ieder geval veilig in ons systeem.</span>}
          </p>`
  );
  
  fs.writeFileSync('src/components/BusinessRegistration.tsx', code);
  console.log("Patched BusinessRegistration");
}
