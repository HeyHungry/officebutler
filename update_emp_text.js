import fs from 'fs';
let code = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');

const target = `<p className="text-gray-600 mb-8 leading-relaxed">
            Uw kantoorborrel is succesvol besteld en zal op de gekozen afleverlocatie worden bezorgd.
          </p>`;

const rep = `<p className="text-gray-600 mb-8 leading-relaxed">
            Uw kantoorborrel is succesvol besteld en zal op de gekozen afleverlocatie worden bezorgd.
            {emailFailed && <span className="block mt-4 text-orange-600 text-sm">Opmerking: Wegens een technische vertraging bij onze e-mailprovider duren bevestigingsmails momenteel iets langer dan gebruikelijk.</span>}
          </p>`;

if (code.includes(target)) {
  fs.writeFileSync('src/pages/EmployeeOrdering.tsx', code.replace(target, rep));
  console.log("Patched EmployeeOrdering text");
} else {
  console.log("Not found in EmployeeOrdering");
}
