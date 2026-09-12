import fs from 'fs';

['src/pages/GuestOrdering.tsx', 'src/pages/EmployeeOrdering.tsx'].forEach(file => {
  let code = fs.readFileSync(file, 'utf8');

  // Fix ternary in GuestOrdering & EmployeeOrdering rendering
  const badTernary = `{item.status === 'sold_out' ? 'Uitverkocht' : item.status === 'coming_soon' ? 'Binnenkort' : item.status === 'new' ? 'Nieuw' : 'Meest Gekozen'}`;
  const goodTernary = `{item.status === 'sold_out' ? 'Uitverkocht' : item.status === 'coming_soon' ? 'Binnenkort' : item.status === 'new' ? 'Nieuw' : item.status === 'popular' ? 'Meest Gekozen' : item.status}`;
  
  // Fix background classes logic
  const badClasses = `\${item.status === 'sold_out' ? 'bg-red-500/90 text-white' : ''}
                                  \${item.status === 'coming_soon' ? 'bg-yellow-400/90 text-black' : ''}
                                  \${item.status === 'new' ? 'bg-blue-500/90 text-white' : ''}
                                  \${item.status === 'popular' ? 'bg-purple-500/90 text-white' : ''}`;
  
  const goodClasses = `\${item.status === 'sold_out' ? 'bg-red-500/90 text-white' : ''}
                                  \${item.status === 'coming_soon' ? 'bg-yellow-400/90 text-black' : ''}
                                  \${item.status === 'new' ? 'bg-blue-500/90 text-white' : ''}
                                  \${item.status === 'popular' ? 'bg-purple-500/90 text-white' : ''}
                                  \${!['active', 'inactive', 'sold_out', 'coming_soon', 'new', 'popular'].includes(item.status) ? 'bg-gray-800/90 text-white' : ''}`;
  
  code = code.replaceAll(badTernary, goodTernary);
  code = code.replaceAll(badClasses, goodClasses);

  fs.writeFileSync(file, code);
});
console.log("Fixed badges for custom statuses");
