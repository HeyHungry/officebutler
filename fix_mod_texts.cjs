const fs = require('fs');
let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

// First replace the buttons
const heroBtnsSearch = `<div className="grid grid-cols-3 gap-2">
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
                              </div>`;

const heroBtnsReplace = `<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Knop Bestel Nu</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Grootte (bijv. 16px)</span>
                                  </label>
                                  <div className="flex gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      value={localStoreSettings.page_content?.hero_btn_order || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, hero_btn_order: e.target.value}} as any)} />
                                    <input type="text" className="w-24 px-3 py-2 border rounded-md text-sm" placeholder="px/rem"
                                      value={localStoreSettings.page_content?.hero_btn_order_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, hero_btn_order_size: e.target.value}} as any)} />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Knop Bekijk Aanbod</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Grootte (bijv. 16px)</span>
                                  </label>
                                  <div className="flex gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      value={localStoreSettings.page_content?.hero_btn_offer || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, hero_btn_offer: e.target.value}} as any)} />
                                    <input type="text" className="w-24 px-3 py-2 border rounded-md text-sm" placeholder="px/rem"
                                      value={localStoreSettings.page_content?.hero_btn_offer_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, hero_btn_offer_size: e.target.value}} as any)} />
                                  </div>
                                </div>
                              </div>`;

code = code.replace(heroBtnsSearch, heroBtnsReplace);

// Now the specific texts for Assortments
const assortmentsAddition = `                            <h4 className="font-bold text-ob-blue mb-4 border-b pb-2 mt-8">Sectie 3: Assortimenten Extra Teksten</h4>
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Office Snacks Ondertitel</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Grootte (bijv. 16px)</span>
                                </label>
                                <div className="flex gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    value={localStoreSettings.page_content?.assort_snacks_subtitle || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_snacks_subtitle: e.target.value}} as any)} />
                                  <input type="text" className="w-24 px-3 py-2 border rounded-md text-sm" placeholder="px/rem"
                                    value={localStoreSettings.page_content?.assort_snacks_subtitle_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_snacks_subtitle_size: e.target.value}} as any)} />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Office Compleet Ondertitel</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Grootte (bijv. 16px)</span>
                                </label>
                                <div className="flex gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    value={localStoreSettings.page_content?.assort_complete_subtitle || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_complete_subtitle: e.target.value}} as any)} />
                                  <input type="text" className="w-24 px-3 py-2 border rounded-md text-sm" placeholder="px/rem"
                                    value={localStoreSettings.page_content?.assort_complete_subtitle_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_complete_subtitle_size: e.target.value}} as any)} />
                                </div>
                              </div>
                            </div>
                            
                            <h4 className="font-bold text-ob-blue mb-4 border-b pb-2 mt-8">Sectie 3: Assortimenten (Pakketten)</h4>`;

code = code.replace('<h4 className="font-bold text-ob-blue mb-4 border-b pb-2">Sectie 3: Assortimenten (Pakketten)</h4>', assortmentsAddition);


// Add size inputs using Regex for generic fields:
// Find blocks like:
/*
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Hoofdtitel</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm"
                                  value={localStoreSettings.page_content?.hero_title || ''}
                                  onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, hero_title: e.target.value}} as any)} />
                              </div>
*/

const genericRegex = /<div>\s*<label className="block text-xs font-medium text-gray-700 mb-1">([^<]+)<\/label>\s*<(input|textarea)([^>]*)className="w-full px-3 py-2 border rounded-md text-sm"([^>]*)value=\{localStoreSettings\.page_content\?\.([a-zA-Z0-9_]+) \|\| ''\}\s*onChange=\{e => setLocalStoreSettings\(\{\.\.\.localStoreSettings, page_content: \{\.\.\.localStoreSettings\.page_content, [a-zA-Z0-9_]+: e\.target\.value\}\} as any\)\} \/>\s*<\/div>/g;

code = code.replace(genericRegex, (match, label, tag, beforeClass, afterClass, key) => {
    return `<div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>${label}</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Grootte (bijv. 24px)</span>
                                </label>
                                <div className="flex gap-2">
                                  <${tag}${beforeClass}className="flex-1 px-3 py-2 border rounded-md text-sm"${afterClass}value={localStoreSettings.page_content?.${key} || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, ${key}: e.target.value}} as any)} />
                                  <input type="text" className="w-24 h-fit px-3 py-2 border rounded-md text-sm" placeholder="px/rem"
                                    value={localStoreSettings.page_content?.${key}_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, ${key}_size: e.target.value}} as any)} />
                                </div>
                              </div>`;
});

fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
