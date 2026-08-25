import fs from 'fs';
let code = fs.readFileSync('src/pages/CompanyDashboard.tsx', 'utf8');

// There are probably 4 budget inputs now. Let's remove all but one.
const regex = /                  <div>\n                    <label className="block text-sm font-semibold text-ob-text mb-1\.5">Maximale bestelwaarde per medewerker \(€\)<\/label>[\s\S]*?<\/div>\n/g;

code = code.replace(regex, "");

const budgetInput = `
                  <div>
                    <label className="block text-sm font-semibold text-ob-text mb-1.5">Maximale bestelwaarde per medewerker (€)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={spendLimit}
                      onChange={e => setSpendLimit(e.target.value)}
                      placeholder="Bijv. 15.00 (Leeg = onbeperkt)"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-ob-blue focus:ring-1 focus:ring-ob-blue"
                    />
                    <p className="text-xs text-gray-500 mt-1">Laat dit veld leeg als er geen limiet is. Bestellingen boven dit bedrag worden geblokkeerd.</p>
                  </div>
`;

code = code.replace(
  '                  <button type="submit" disabled={isSaving} className="bg-ob-blue text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-ob-blue-dark transition-colors flex items-center gap-2 disabled:opacity-50">', 
  budgetInput + '                  <button type="submit" disabled={isSaving} className="bg-ob-blue text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-ob-blue-dark transition-colors flex items-center gap-2 disabled:opacity-50">'
);

fs.writeFileSync('src/pages/CompanyDashboard.tsx', code);
