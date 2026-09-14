const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Looking at lines 463-493, there are 4 duplicated trailing brackets
  // Let's replace the whole section starting from 463 to 493.
  const badPart = `                              )}
                            </div>
                          </div>
                        );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                                    })}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemove(product)}
                                    className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 bg-red-50 rounded-md"
                                  >
                                    Wissen
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );`;
                        
  const goodPart = `                              )}
                            </div>
                          </div>
                        );`;
                        
  code = code.replace(badPart, goodPart);
  fs.writeFileSync(file, code);
}

fixFile('src/pages/GuestOrdering.tsx');
fixFile('src/pages/EmployeeOrdering.tsx');

