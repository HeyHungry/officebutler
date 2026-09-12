const fs = require('fs');
let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

// The massive tab content
const newTabContent = `                    ) : activeTab === 'content' && localStoreSettings ? (
                      <div className="space-y-8 animate-in fade-in duration-300">
                        <section>
                          <h3 className="text-xl font-serif font-semibold text-[#05053D] mb-6">Website Teksten Beheren</h3>
                          <p className="text-sm text-gray-500 mb-6">Bewerk hier alle teksten, titels, ondertitels en knoppen van de homepagina.</p>
                          
                          {/* HERO */}
                          <div className="bg-white p-6 rounded-xl border shadow-sm mb-6 space-y-4">
                            <h4 className="font-bold text-ob-blue mb-4 border-b pb-2">Sectie 1: Hoofdscherm (Hero)</h4>
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Pre-titel (kleine tekst bovenaan)</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm"
                                  value={localStoreSettings.page_content?.hero_pre_title || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, hero_pre_title: e.target.value}} as any)} />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Hoofdtitel</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm"
                                  value={localStoreSettings.page_content?.hero_title || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, hero_title: e.target.value}} as any)} />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Ondertitel</label>
                                <textarea rows={2} className="w-full px-3 py-2 border rounded-md text-sm"
                                  value={localStoreSettings.page_content?.hero_subtitle || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, hero_subtitle: e.target.value}} as any)} />
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Knop 1</label>
                                  <input type="text" className="w-full px-3 py-2 border rounded-md text-sm"
                                    value={localStoreSettings.page_content?.hero_btn_scheduled || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, hero_btn_scheduled: e.target.value}} as any)} />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Knop 2</label>
                                  <input type="text" className="w-full px-3 py-2 border rounded-md text-sm"
                                    value={localStoreSettings.page_content?.hero_btn_direct || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, hero_btn_direct: e.target.value}} as any)} />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Knop 3</label>
                                  <input type="text" className="w-full px-3 py-2 border rounded-md text-sm"
                                    value={localStoreSettings.page_content?.hero_btn_offer || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, hero_btn_offer: e.target.value}} as any)} />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* HOW IT WORKS */}
                          <div className="bg-white p-6 rounded-xl border shadow-sm mb-6 space-y-4">
                            <h4 className="font-bold text-ob-blue mb-4 border-b pb-2">Sectie 2: Hoe Werkt Office Butler</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Titel</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm"
                                  value={localStoreSettings.page_content?.how_title || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, how_title: e.target.value}} as any)} />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Ondertitel</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm"
                                  value={localStoreSettings.page_content?.how_subtitle || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, how_subtitle: e.target.value}} as any)} />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Stap 1: Titel</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm mb-2"
                                  value={localStoreSettings.page_content?.how_step1_title || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, how_step1_title: e.target.value}} as any)} />
                                <label className="block text-xs font-medium text-gray-700 mb-1">Stap 1: Beschrijving</label>
                                <textarea rows={2} className="w-full px-3 py-2 border rounded-md text-sm"
                                  value={localStoreSettings.page_content?.how_step1_desc || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, how_step1_desc: e.target.value}} as any)} />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Stap 2: Titel</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm mb-2"
                                  value={localStoreSettings.page_content?.how_step2_title || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, how_step2_title: e.target.value}} as any)} />
                                <label className="block text-xs font-medium text-gray-700 mb-1">Stap 2: Beschrijving</label>
                                <textarea rows={2} className="w-full px-3 py-2 border rounded-md text-sm"
                                  value={localStoreSettings.page_content?.how_step2_desc || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, how_step2_desc: e.target.value}} as any)} />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Stap 3: Titel</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm mb-2"
                                  value={localStoreSettings.page_content?.how_step3_title || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, how_step3_title: e.target.value}} as any)} />
                                <label className="block text-xs font-medium text-gray-700 mb-1">Stap 3: Beschrijving</label>
                                <textarea rows={2} className="w-full px-3 py-2 border rounded-md text-sm"
                                  value={localStoreSettings.page_content?.how_step3_desc || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, how_step3_desc: e.target.value}} as any)} />
                              </div>
                            </div>
                          </div>

                          {/* ASSORTMENTS */}
                          <div className="bg-white p-6 rounded-xl border shadow-sm mb-6 space-y-4">
                            <h4 className="font-bold text-ob-blue mb-4 border-b pb-2">Sectie 3: Assortimenten (Pakketten)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Titel</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm"
                                  value={localStoreSettings.page_content?.assortments_title || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assortments_title: e.target.value}} as any)} />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Ondertitel</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm"
                                  value={localStoreSettings.page_content?.assortments_subtitle || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assortments_subtitle: e.target.value}} as any)} />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                              <div className="space-y-3">
                                <h5 className="font-semibold text-sm">Pakket 1 (Links)</h5>
                                <input type="text" placeholder="Titel Pakket 1" className="w-full px-3 py-2 border rounded-md text-sm"
                                  value={localStoreSettings.page_content?.assort_snacks_title || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_snacks_title: e.target.value}} as any)} />
                                <input type="text" placeholder="Bullet 1" className="w-full px-3 py-2 border rounded-md text-sm"
                                  value={localStoreSettings.page_content?.assort_snacks_item1 || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_snacks_item1: e.target.value}} as any)} />
                                <input type="text" placeholder="Bullet 2" className="w-full px-3 py-2 border rounded-md text-sm"
                                  value={localStoreSettings.page_content?.assort_snacks_item2 || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_snacks_item2: e.target.value}} as any)} />
                                <input type="text" placeholder="Bullet 3" className="w-full px-3 py-2 border rounded-md text-sm"
                                  value={localStoreSettings.page_content?.assort_snacks_item3 || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_snacks_item3: e.target.value}} as any)} />
                                <input type="text" placeholder="Knop Tekst" className="w-full px-3 py-2 border rounded-md text-sm font-medium"
                                  value={localStoreSettings.page_content?.assort_snacks_btn || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_snacks_btn: e.target.value}} as any)} />
                              </div>
                              <div className="space-y-3">
                                <h5 className="font-semibold text-sm">Pakket 2 (Rechts)</h5>
                                <input type="text" placeholder="Titel Pakket 2" className="w-full px-3 py-2 border rounded-md text-sm"
                                  value={localStoreSettings.page_content?.assort_complete_title || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_complete_title: e.target.value}} as any)} />
                                <input type="text" placeholder="Bullet 1" className="w-full px-3 py-2 border rounded-md text-sm"
                                  value={localStoreSettings.page_content?.assort_complete_item1 || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_complete_item1: e.target.value}} as any)} />
                                <input type="text" placeholder="Bullet 2" className="w-full px-3 py-2 border rounded-md text-sm"
                                  value={localStoreSettings.page_content?.assort_complete_item2 || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_complete_item2: e.target.value}} as any)} />
                                <input type="text" placeholder="Bullet 3" className="w-full px-3 py-2 border rounded-md text-sm"
                                  value={localStoreSettings.page_content?.assort_complete_item3 || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_complete_item3: e.target.value}} as any)} />
                                <input type="text" placeholder="Knop Tekst" className="w-full px-3 py-2 border rounded-md text-sm font-medium"
                                  value={localStoreSettings.page_content?.assort_complete_btn || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_complete_btn: e.target.value}} as any)} />
                              </div>
                            </div>
                          </div>
                          
                          {/* MENU */}
                          <div className="bg-white p-6 rounded-xl border shadow-sm mb-6 space-y-4">
                            <h4 className="font-bold text-ob-blue mb-4 border-b pb-2">Sectie 4: Menu Overzicht</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Titel</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm"
                                  value={localStoreSettings.page_content?.menu_title || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, menu_title: e.target.value}} as any)} />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Knop (Volledig menu)</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm"
                                  value={localStoreSettings.page_content?.menu_btn || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, menu_btn: e.target.value}} as any)} />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Ondertitel</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm"
                                  value={localStoreSettings.page_content?.menu_subtitle || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, menu_subtitle: e.target.value}} as any)} />
                              </div>
                            </div>
                          </div>

                          {/* BUSINESS */}
                          <div className="bg-white p-6 rounded-xl border shadow-sm mb-6 space-y-4">
                            <h4 className="font-bold text-ob-blue mb-4 border-b pb-2">Sectie 5: Voor Bedrijven</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Titel</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm"
                                  value={localStoreSettings.page_content?.business_title || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, business_title: e.target.value}} as any)} />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Knop</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm"
                                  value={localStoreSettings.page_content?.business_btn || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, business_btn: e.target.value}} as any)} />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Ondertitel</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm"
                                  value={localStoreSettings.page_content?.business_subtitle || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, business_subtitle: e.target.value}} as any)} />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Bullet 1</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm"
                                  value={localStoreSettings.page_content?.business_point1 || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, business_point1: e.target.value}} as any)} />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Bullet 2</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm"
                                  value={localStoreSettings.page_content?.business_point2 || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, business_point2: e.target.value}} as any)} />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Bullet 3</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm"
                                  value={localStoreSettings.page_content?.business_point3 || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, business_point3: e.target.value}} as any)} />
                              </div>
                            </div>
                          </div>

                          {/* CONTACT */}
                          <div className="bg-white p-6 rounded-xl border shadow-sm mb-6 space-y-4">
                            <h4 className="font-bold text-ob-blue mb-4 border-b pb-2">Sectie 6: Contact & FAQ</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Titel Contact Sectie</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm"
                                  value={localStoreSettings.page_content?.contact_title || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, contact_title: e.target.value}} as any)} />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Titel FAQ Sectie</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm"
                                  value={localStoreSettings.page_content?.faq_title || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, faq_title: e.target.value}} as any)} />
                              </div>
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

// Extract old content to replace it
const oldContentStart = `) : activeTab === 'content' && localStoreSettings ? (`;
const oldContentEnd = `</section>\n                      </div>`;

const before = code.substring(0, code.indexOf(oldContentStart));
const after = code.substring(code.indexOf(oldContentEnd) + oldContentEnd.length);

fs.writeFileSync('src/components/ModeratorPanel.tsx', before + newTabContent + after);
