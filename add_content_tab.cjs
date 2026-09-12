const fs = require('fs');
let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

// The replacement that failed:
const searchString = ") : activeTab === 'store' && localStoreSettings ? (";
const tabContent = `                    ) : activeTab === 'content' && localStoreSettings ? (
                      <div className="space-y-8 animate-in fade-in duration-300">
                        <section>
                          <h3 className="text-xl font-serif font-semibold text-[#05053D] mb-6">Website Teksten Beheren</h3>
                          
                          <div className="space-y-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Hoofdtitel (Voorpagina)</label>
                              <input 
                                type="text"
                                className="w-full px-4 py-2 border rounded-lg focus:border-[#151f33] focus:ring-1 focus:ring-[#151f33] outline-none"
                                value={localStoreSettings.page_content?.hero_title || ''}
                                onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, hero_title: e.target.value}} as any)}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Ondertitel Hoofdscherm</label>
                              <textarea 
                                rows={2}
                                className="w-full px-4 py-2 border rounded-lg focus:border-[#151f33] focus:ring-1 focus:ring-[#151f33] outline-none resize-none"
                                value={localStoreSettings.page_content?.hero_subtitle || ''}
                                onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, hero_subtitle: e.target.value}} as any)}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Ondertitel "Hoe Werkt Office Butler"</label>
                              <textarea 
                                rows={2}
                                className="w-full px-4 py-2 border rounded-lg focus:border-[#151f33] focus:ring-1 focus:ring-[#151f33] outline-none resize-none"
                                value={localStoreSettings.page_content?.how_it_works_subtitle || ''}
                                onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, how_it_works_subtitle: e.target.value}} as any)}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Ondertitel "Onze Assortimenten"</label>
                              <textarea 
                                rows={2}
                                className="w-full px-4 py-2 border rounded-lg focus:border-[#151f33] focus:ring-1 focus:ring-[#151f33] outline-none resize-none"
                                value={localStoreSettings.page_content?.assortments_subtitle || ''}
                                onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assortments_subtitle: e.target.value}} as any)}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Ondertitel "Menu"</label>
                              <textarea 
                                rows={2}
                                className="w-full px-4 py-2 border rounded-lg focus:border-[#151f33] focus:ring-1 focus:ring-[#151f33] outline-none resize-none"
                                value={localStoreSettings.page_content?.menu_subtitle || ''}
                                onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, menu_subtitle: e.target.value}} as any)}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Ondertitel "Voor Bedrijven"</label>
                              <textarea 
                                rows={2}
                                className="w-full px-4 py-2 border rounded-lg focus:border-[#151f33] focus:ring-1 focus:ring-[#151f33] outline-none resize-none"
                                value={localStoreSettings.page_content?.business_subtitle || ''}
                                onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, business_subtitle: e.target.value}} as any)}
                              />
                            </div>
                          </div>
                          
                          <div className="mt-8 flex justify-end">
                            <button onClick={handleSaveStoreSettings} disabled={isSaving} className="bg-[#111827] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1f2937] transition-colors disabled:opacity-50">
                              {isSaving ? 'Opslaan...' : 'Teksten Opslaan'}
                            </button>
                          </div>
                        </section>
                      </div>
`;
code = code.replace(searchString, tabContent + "\n                    ) : activeTab === 'store' && localStoreSettings ? (");

fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
