const fs = require('fs');

let code = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');

// Replace the status logic block
const statusBlockRegex = /\{item\.status && !\[([^\]]+)\]\.includes\(item\.status\) && \(\s*<div className=\{`inline-block mt-1 px-2 py-0\.5 rounded text-\[10px\] font-bold uppercase tracking-wider w-max[^`]*`\}>\s*\{item\.status\}\s*<\/div>\s*\)\}/;

const newStatusLogic = `
                            {item.status && !['actief', 'inactief', 'verborgen', 'active', 'inactive', 'hidden'].includes((item.status || '').toLowerCase()) && (
                                <div className={\`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider w-max
                                  \${['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase()) ? 'bg-red-100 text-red-700' : 'bg-ob-blue/10 text-ob-blue'}
                                \`}>
                                  {item.status}
                                </div>
                            )}`;

if(code.match(statusBlockRegex)) {
    code = code.replace(statusBlockRegex, newStatusLogic.trim());
} else {
    // try a more generic replacement
    const fallbackRegex = /\{item\.status[^<]*<div className=\{`inline-block[^`]*`\}>[^<]*\{item\.status\}[^<]*<\/div>[^\}]*\}/;
    code = code.replace(fallbackRegex, newStatusLogic.trim());
}

// Also fix the disabled logic and opacity logic for Uitverkocht
code = code.replace(
  /disabled=\{!\w+ \|\| item\.status === 'Uitverkocht'\}/g,
  "disabled={!hasPrice || ['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase())}"
);
code = code.replace(
  /\${item\.status === 'Uitverkocht' \? 'opacity-70' : ''}/g,
  "${['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase()) ? 'opacity-70' : ''}"
);
code = code.replace(
  /\${\(!hasPrice \|\| item\.status === 'Uitverkocht'\) \? 'opacity-50 cursor-not-allowed border-gray-100 bg-gray-50' :/g,
  "${(!hasPrice || ['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase())) ? 'opacity-50 cursor-not-allowed border-gray-100 bg-gray-50' :"
);

fs.writeFileSync('src/pages/EmployeeOrdering.tsx', code);
console.log('EmployeeOrdering updated');
