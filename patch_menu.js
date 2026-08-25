import fs from 'fs';
let code = fs.readFileSync('src/components/Menu.tsx', 'utf8');

const target = `  {
    title: 'Deals',
    items: [
      { name: 'Bitterballen Deal', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_326b38dcee73a775f892e835c057c0bd82a331ff30cac86050212b55404a5e3d/responsive320' },
      { name: 'Dutch Classic Deal', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/3f0af910-b1b9-498c-b744-5d20c6c8b600/responsive320' },
      { name: 'Deluxe Deal', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/efa8dd02-7551-4367-9b38-40ed4e3c6600/responsive320' },
      { name: 'Chicken Deal', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_d536a8e36dbb3466292358eb7220e395cf43a00f539abdc333d35ef625a63982/responsive320' },
      { name: 'Vega Deal', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_707cf27d8a142b4b2a4a95940d7cc906c9a7c3a7a86d3f6e8589924d38557734/responsive320' },
    ]
  },
`;

code = code.replace(target, '');
fs.writeFileSync('src/components/Menu.tsx', code);
console.log("Patched Menu.tsx");
