const fs = require('fs');
let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

// The replacement logic:
const oldJsx = `                        <div className="bg-[#f0f4f8] border border-[#d1e0ec] rounded-xl p-8 text-center space-y-4">
                          <div className="w-16 h-16 bg-[#151f33] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users size={32} />
                          </div>
                          <h3 className="text-2xl font-serif text-[#05053D]">Impersonatie: {impersonating.name}</h3>
                          <p className="text-gray-600 max-w-md mx-auto">
                            U bekijkt nu de Office Beheerder weergave voor deze klant. In <strong>Stap 3</strong> wordt dit portaal volledig gebouwd. Hier kunt u straks assortiment koppelen, werknemers beheren en afleveradressen toevoegen.
                          </p>
                          <div className="pt-6">
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">
                              Binnenkort Beschikbaar (Stap 3)
                            </span>
                          </div>
                        </div>`;

const newJsx = `                        <div className="bg-[#f0f4f8] border border-[#d1e0ec] rounded-xl p-8 text-center space-y-4">
                          <div className="w-16 h-16 bg-[#151f33] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users size={32} />
                          </div>
                          <h3 className="text-2xl font-serif text-[#05053D]">Impersonatie: {impersonating.name}</h3>
                          <p className="text-gray-600 max-w-md mx-auto mb-4">
                            U heeft dit kantoor geselecteerd voor beheer. Open het Beheerder Dashboard om het assortiment, werknemers en instellingen aan te passen.
                          </p>
                          <div className="pt-4">
                            <button 
                              onClick={() => {
                                window.open(\`/dashboard?companyId=\${impersonating.id}\`, '_blank');
                              }}
                              className="inline-flex items-center gap-2 px-6 py-3 bg-ob-blue text-white rounded-lg font-semibold hover:bg-ob-blue-dark transition-colors"
                            >
                              Open Beheer Dashboard
                            </button>
                          </div>
                        </div>`;

if(code.includes(oldJsx)) {
  code = code.replace(oldJsx, newJsx);
  fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
  console.log("Replaced ModeratorPanel UI successfully.");
} else {
  // Let's try replacing a part of it in case formatting differs
  code = code.replace(/<div className="bg-\[#f0f4f8\] border border-\[#d1e0ec\] rounded-xl p-8 text-center space-y-4">[\s\S]*?Binnenkort Beschikbaar \(Stap 3\)[\s\S]*?<\/div>[\s\S]*?<\/div>/, newJsx);
  fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
  console.log("Replaced ModeratorPanel UI using Regex.");
}
