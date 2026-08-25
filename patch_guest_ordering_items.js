import fs from 'fs';

const menuCategories = [
  {
    title: 'Deals',
    items: [
      { name: 'Bitterballen Deal', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_326b38dcee73a775f892e835c057c0bd82a331ff30cac86050212b55404a5e3d/responsive320' },
      { name: 'Dutch Classic Deal', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/3f0af910-b1b9-498c-b744-5d20c6c8b600/responsive320' },
      { name: 'Deluxe Deal', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/efa8dd02-7551-4367-9b38-40ed4e3c6600/responsive320' },
      { name: 'Chicken Deal', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_d536a8e36dbb3466292358eb7220e395cf43a00f539abdc333d35ef625a63982/responsive320' },
      { name: 'Vega Deal', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_707cf27d8a142b4b2a4a95940d7cc906c9a7c3a7a86d3f6e8589924d38557734/responsive320' },
    ]
  },
  {
    title: 'Snacks',
    items: [
      { name: 'Snack Mix', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_0743d367c64afbf145e9c0fea03ba65553996e64ffef54a95252060ee7ac758c/responsive320' },
      { name: 'Bitterballen', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/233e7d3e-19d8-4504-adf9-2100d5c71800/responsive640' },
      { name: 'Vlammetjes', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/c3a12a9a-1fd9-4041-11a7-c2ba71d3c100/responsive960' },
      { name: 'Frikandelletjes', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/089a0deb-f72e-46b4-cd48-de98d1f82a00/responsive640' },
      { name: 'Mini Kroketjes', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/53ee579e-f63d-4c57-8f54-dae1e90a1c00/responsive640' },
      { name: 'Chicken Wings', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/ee601f8d-efac-4ef4-2cee-c4c59c117200/responsive640' },
      { name: 'Kipnuggets', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/b58dad40-1353-4159-e305-2669d75f6b00/responsive640' },
      { name: 'Karaage Kip', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_5991de8e937102a4dd1ef314fb255423bf85586b62f82c8285e054e14615ce52/responsive640' },
      { name: 'Butterfly Gamba\'s', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/8688dded-96d4-414f-e816-8553f5ec8000/responsive640' },
    ]
  },
  {
    title: 'Vega',
    items: [
      { name: 'Kaasstengels', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_8d2216804329784b49540823b54b47525bfcf318725033896b6fb9646d6cc0d1/responsive640' },
      { name: 'Curry Samosas', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/ae28ddae-8a3f-4049-3527-09fa31308f00/responsive640' },
      { name: 'Mini Loempia', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/9eab1d3b-96cc-449a-e6af-7a4ee6e66d00/responsive640' },
      { name: 'Vegan Bitterballen', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_382e6f9d8eabd5d872ed938ed4c12f25c6696f38b8ab2d2791d968c2783fd954/responsive640' },
    ]
  }
];

let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

// Inject menu categories constant
code = code.replace(
  'export function GuestOrdering() {',
  \`const menuCategories = \${JSON.stringify(menuCategories, null, 2)};\n\nexport function GuestOrdering() {\`
);

// We don't really need the plain assortment string array anymore in the UI, but let's just keep the state for logic simplicity if needed.
// Actually we can map over menuCategories instead.

const newAssortmentUI = \`
            <div className="p-6">
              <div className="flex flex-col gap-12">
                {menuCategories.map((category) => (
                  <div key={category.title}>
                    <h3 className="text-2xl font-serif font-bold text-ob-blue mb-6 border-b pb-2">{category.title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.items.map((item) => {
                        const product = item.name;
                        const price25 = prices[\`\${product}_25\`];
                        const price50 = prices[\`\${product}_50\`];
                        const selectedSize = selections[product];
                        
                        // Only show items that have a price in the DB, or just show them anyway and wait for prices?
                        // Let's show them and if price25/50 is not defined, we fallback or hide the buttons.
                        
                        return (
                          <div key={product} className={\`flex gap-4 border rounded-xl p-4 transition-all \${selectedSize ? 'border-ob-blue bg-blue-50/30 shadow-sm' : 'border-gray-200 hover:border-ob-blue/30'}\`}>
                            <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                              <img src={item.image} alt={product} className="w-full h-full object-cover" />
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-between">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-gray-900">{product}</h4>
                              </div>
                              
                              <div className="flex gap-2 mt-auto">
                                {price25 !== undefined && (
                                  <button
                                    type="button"
                                    onClick={() => handlePortionSelect(product, 25)}
                                    className={\`px-3 py-1.5 text-xs rounded-lg border transition-colors \${selectedSize === 25 ? 'bg-ob-blue text-white border-ob-blue font-semibold' : 'bg-white text-gray-600 border-gray-200 hover:border-ob-blue'}\`}
                                  >
                                    25 st. (€{price25.toFixed(2)})
                                  </button>
                                )}
                                {price50 !== undefined && (
                                  <button
                                    type="button"
                                    onClick={() => handlePortionSelect(product, 50)}
                                    className={\`px-3 py-1.5 text-xs rounded-lg border transition-colors \${selectedSize === 50 ? 'bg-ob-blue text-white border-ob-blue font-semibold' : 'bg-white text-gray-600 border-gray-200 hover:border-ob-blue'}\`}
                                  >
                                    50 st. (€{price50.toFixed(2)})
                                  </button>
                                )}
                                {price25 === undefined && price50 === undefined && (
                                  <span className="text-xs text-gray-400 italic">Prijs wordt geladen...</span>
                                )}
                              </div>

                              {selectedSize && (
                                <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-100">
                                  <span className="text-xs font-semibold text-ob-blue">Geselecteerd: {selectedSize} st.</span>
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
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
\`;

code = code.replace(/<div className="p-6">\s*<div className="grid grid-cols-1 md:grid-cols-2 gap-4">[\s\S]*?<\/div>\s*\{\/\* Order Summary Line \*\/\}/, newAssortmentUI + '\n              {/* Order Summary Line */}');

fs.writeFileSync('src/pages/GuestOrdering.tsx', code);
