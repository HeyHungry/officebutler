const fs = require('fs');

let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

const searchBlock = `                                    </button>
                                  )})
                                ) : (
                                  <span className="text-xs text-gray-400 italic col-span-2">Prijs wordt geladen...</span>
                                )}
                              </div>
                              {Object.keys(prodSelections).length > 0 && (`;

const replaceBlock = `                                    </button>
                                  )})
                                ) : (
                                  <span className="text-xs text-gray-400 italic col-span-2">Prijs wordt geladen...</span>
                                )}
                              </div>
                              {Object.keys(prodSelections).length > 0 && (
                                <div className="mt-2 pt-3 border-t border-gray-200">
                                  <div className="flex flex-col gap-1">
                                    {Object.entries(prodSelections).map(([s, qty]) => {
                                      const parts = s.split('_');
                                      const sizeNum = parts[0];
                                      const variant = parts[1] || '';
                                      return (
                                        <div key={s} className="flex justify-between items-center">
                                          <span className="text-[11px] font-semibold text-[#151f33]">{qty as number}x {sizeNum} st. {variant && <span className="text-gray-500 font-normal">({variant})</span>}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>`;

// Actually wait, let's just use regular expressions or precise replacements.
// Let's first view the actual content to replace.
