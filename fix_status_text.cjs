const fs = require('fs');

const statusMapper = `{item.status === 'new' ? 'Nieuw' : item.status === 'popular' ? 'Meest Gekozen' : item.status === 'sold_out' ? 'Uitverkocht' : item.status === 'coming_soon' ? 'Binnenkort' : item.status}`;

function fix(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  // In GuestOrdering and Menu, we have:
  // {item.status && !['actief', 'inactief', 'verborgen', 'active', 'inactive', 'hidden'].includes((item.status || '').toLowerCase()) && (  <span className={...}>{item.status}</span>)}
  // or {item.status.charAt(0)...}
  
  // First, let's just find the span content.
  // In Menu and GuestOrdering, the span is: <span className="...">...</span>)}
  
  // Let's do a regex that catches the span contents
  code = code.replace(
    /(<span className=\{`px-2 py-1 rounded-full text-xs font-medium capitalize [^`]*`\}>)[^<]*(<\/span>)/g,
    `$1${statusMapper}$2`
  );

  // In EmployeeOrdering, it is:
  // <div className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider w-max ...`}>
  //   {item.status}
  // </div>
  
  // Let's fix EmployeeOrdering to match the exact styling of the others as requested previously (light blue bg, dark blue text, pill shape, normal text case).
  // Wait, EmployeeOrdering still uses text-[10px] uppercase font-bold!
  // I missed it in my previous fix script because the class regex was different.
  code = code.replace(
    /<div className=\{`inline-block mt-1 px-2 py-0\.5 rounded text-\[10px\] font-bold uppercase tracking-wider w-max\s*\$\{([^`]+)\}\s*`\}>\s*\{item\.status\}\s*<\/div>/g,
    `<span className={\`px-2 py-1 rounded-full text-xs font-medium \${$1}\`}>
      ${statusMapper}
    </span>`
  );
  
  // Let's also remove `capitalize` class from the spans, since we are explicitly defining the text case in the mapper now.
  code = code.replace(/text-xs font-medium capitalize/g, 'text-xs font-medium');

  fs.writeFileSync(file, code);
}

fix('src/components/Menu.tsx');
fix('src/pages/GuestOrdering.tsx');
fix('src/pages/EmployeeOrdering.tsx');

console.log('Fixed status mapping');
