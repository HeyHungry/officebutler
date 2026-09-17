const fs = require('fs');

let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

const oldModalRemove = `{countForCurrentSelection > 0 && (
                          <div 
                            className="absolute -top-2 -right-2 bg-red-500 text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white hover:bg-red-600 transition-colors z-10 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePortionDeselect(infoModalProduct.name, size, currentVariant, e);
                            }}
                          >
                            <X size={12} />
                          </div>
                        )}
                        {countForCurrentSelection > 0 && (
                          <span className="absolute -top-2 -left-2 bg-blue-500 text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white">
                            {countForCurrentSelection}
                          </span>
                        )}`;

const newModalRemove = `{countForCurrentSelection > 0 && (
                          <div 
                            role="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePortionDeselect(infoModalProduct.name, size, currentVariant, e);
                            }}
                            className="absolute top-5 -right-2 bg-gray-400 text-white text-[12px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white hover:bg-red-500 transition-colors z-10 cursor-pointer"
                            title="Verwijder één"
                          >
                            -
                          </div>
                        )}
                        {countForCurrentSelection > 0 && (
                          <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white">
                            {countForCurrentSelection}
                          </span>
                        )}`;

code = code.replace(oldModalRemove, newModalRemove);

fs.writeFileSync('src/pages/GuestOrdering.tsx', code);
