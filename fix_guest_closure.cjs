const fs = require('fs');

let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

const search = `                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>`;

const replace = `                                  </div>
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
                ))}
              </div>`;

code = code.replace(search, replace);
fs.writeFileSync('src/pages/GuestOrdering.tsx', code);
