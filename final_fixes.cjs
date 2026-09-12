const fs = require('fs');

// 1. Fix Badges
// Old badge class: `text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ml-2 shrink-0`
// Or similar. Let's just replace the whole badge span in Menu.tsx, GuestOrdering.tsx, EmployeeOrdering.tsx

function replaceBadge(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  
  // Replace the badge logic
  const regex = /<span className=\{`text-\[10px\] uppercase tracking-wider px-2 py-0\.5 rounded-full font-bold (ml-2 )?shrink-0 \$\{\['uitverkocht', 'sold out', 'sold_out'\]\.includes\(\(item\.status \|\| ''\)\.toLowerCase\(\)\) \? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'\}\`\}>\{item\.status\}<\/span>/g;
  
  const newBadge = `<span className={\`px-2 py-1 rounded-full text-xs font-medium \${(item.status && ['uitverkocht', 'sold out', 'sold_out'].includes(item.status.toLowerCase())) ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'} \${filePath.includes('Menu.tsx') ? 'ml-2 shrink-0' : 'shrink-0'}\`}>
    {item.status && item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase()}
  </span>`;
  
  // Wait, I need to dynamically evaluate ml-2 based on file? No, just keep it simple.
  
  code = code.replace(regex, (match, p1) => {
    return `<span className={\`px-2 py-1 rounded-full text-xs font-medium \${['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase()) ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'} \${p1 || ''}shrink-0\`}>
      {item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase()}
    </span>`;
  });
  
  // Employee ordering has one that is different:
  const empRegex = /\$\{ \['uitverkocht', 'sold out', 'sold_out'\]\.includes\(\(item\.status \|\| ''\)\.toLowerCase\(\)\) \? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'\}/g;
  code = code.replace(empRegex, "${['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase()) ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}");
  
  fs.writeFileSync(filePath, code);
}

replaceBadge('src/components/Menu.tsx');
replaceBadge('src/pages/GuestOrdering.tsx');
// EmployeeOrdering has a custom badge span too
let empCode = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');
empCode = empCode.replace(
  /<span className=\{`text-\[10px\] uppercase tracking-wider px-2 py-0\.5 rounded-full font-bold shrink-0 \$\{\['uitverkocht', 'sold out', 'sold_out'\]\.includes\(\(item\.status \|\| ''\)\.toLowerCase\(\)\) \? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'\}\`\}>/g,
  '<span className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${[\'uitverkocht\', \'sold out\', \'sold_out\'].includes((item.status || \'\').toLowerCase()) ? \'bg-red-100 text-red-700\' : \'bg-blue-100 text-blue-700\'}`}>'
);
// Make sure it capitalizes correctly. Actually {item.status} might just render as is. We'll leave the text transform out of Employee if it's tricky, but CSS capitalize works!
// Wait, we can just add `capitalize` class to make it title case!
empCode = empCode.replace(/text-xs font-medium/g, 'text-xs font-medium capitalize');
fs.writeFileSync('src/pages/EmployeeOrdering.tsx', empCode);

let guestCode2 = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');
guestCode2 = guestCode2.replace(/text-xs font-medium/g, 'text-xs font-medium capitalize');
fs.writeFileSync('src/pages/GuestOrdering.tsx', guestCode2);

let menuCode2 = fs.readFileSync('src/components/Menu.tsx', 'utf8');
menuCode2 = menuCode2.replace(/text-xs font-medium/g, 'text-xs font-medium capitalize');
// Also remove {item.status.charAt...} that I just added and replace with {item.status}
menuCode2 = menuCode2.replace(/\{item\.status\.charAt\(0\)\.toUpperCase\(\) \+ item\.status\.slice\(1\)\.toLowerCase\(\)\}/g, '{item.status}');
guestCode2 = guestCode2.replace(/\{item\.status\.charAt\(0\)\.toUpperCase\(\) \+ item\.status\.slice\(1\)\.toLowerCase\(\)\}/g, '{item.status}');
fs.writeFileSync('src/components/Menu.tsx', menuCode2);
fs.writeFileSync('src/pages/GuestOrdering.tsx', guestCode2);

// 2. Fix white buttons hover effect (Hero & Navbar)
let heroCode = fs.readFileSync('src/components/Hero.tsx', 'utf8');

// Replace old hover:bg-gray-100 with the dark blue glow
heroCode = heroCode.replace(/hover:bg-gray-100/g, 'hover:shadow-[0_0_20px_rgba(5,5,61,0.3)] hover:bg-white');

// "Bekijk aanbod" is border border-white/40 text-white. 
// It currently has hover:bg-gray-100 in the regex earlier, but wait, the last iteration made it hover:border-white hover:bg-gray-100.
// Let's reset it to border border-white text-white hover:bg-white hover:text-ob-blue
heroCode = heroCode.replace(
  /className="font-serif group border border-white\/40 text-white px-8 py-4 flex items-center gap-3 hover:border-white hover:bg-gray-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 w-full sm:w-auto justify-center"/g,
  'className="font-serif group border border-white/50 text-white px-8 py-4 flex items-center gap-3 hover:bg-white hover:text-ob-blue hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto justify-center"'
);

// Gradient Overlay
heroCode = heroCode.replace(
  /<div className="absolute inset-0 bg-ob-blue\/80"><\/div>/g,
  '<div className="absolute inset-0 bg-gradient-to-b from-ob-blue via-ob-blue/80 to-ob-blue/30"></div>'
);

fs.writeFileSync('src/components/Hero.tsx', heroCode);

let navCode = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
navCode = navCode.replace(/hover:bg-gray-100/g, 'hover:shadow-[0_0_20px_rgba(5,5,61,0.3)] hover:bg-white');
fs.writeFileSync('src/components/Navbar.tsx', navCode);

console.log('Fixes applied successfully');
