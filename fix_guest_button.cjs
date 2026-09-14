const fs = require('fs');
let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

const search = `                                        <button 
                                          type="button"
                                          onClick={(e) => handlePortionDeselect(product, size, currentVariant, e)}
                                          className="absolute -top-2 -left-2 bg-red-500 text-white text-[12px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white hover:bg-red-600 transition-colors z-10"
                                          title="Verwijder één"
                                        >
                                          -
                                        </button>`;

const replace = `                                        <div 
                                          role="button"
                                          onClick={(e) => handlePortionDeselect(product, size, currentVariant, e)}
                                          className="absolute -top-2 -left-2 bg-red-500 text-white text-[12px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white hover:bg-red-600 transition-colors z-10 cursor-pointer"
                                          title="Verwijder één"
                                        >
                                          -
                                        </div>`;

code = code.replace(search, replace);
fs.writeFileSync('src/pages/GuestOrdering.tsx', code);
