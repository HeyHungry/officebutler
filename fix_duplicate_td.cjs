const fs = require('fs');
let code = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');

const correctRow = `
      <td className="px-2 py-2"><span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium">{p.category}</span></td>
      <td className="px-2 py-2"><div className="flex flex-wrap gap-1">{p.portions && p.portions.map((port: number) => (<span key={port} className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-xs font-medium">{port} st.</span>))}</div></td>
      <td className="px-2 py-2">
        <span className={\`px-2 py-1 rounded-md text-xs font-medium \${['uitverkocht', 'verborgen', 'sold_out', 'inactive', 'inactief'].includes((p.status || '').toLowerCase()) ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}\`}>
          {p.status === 'inactive' ? 'Verborgen' : 
           p.status === 'sold_out' ? 'Uitverkocht' : 
           p.status === 'coming_soon' ? 'Binnenkort' : 
           p.status === 'new' ? 'Nieuw' : 
           p.status === 'popular' ? 'Populair' : 
           p.status === 'active' ? 'Actief' : (p.status || 'Actief')}
        </span>
      </td>
    </tr>
`;

code = code.replace(/<td className="px-2 py-2"><span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium">\{p\.category\}<\/span><\/td>[\s\S]*?<\/tr>/, correctRow);

fs.writeFileSync('src/components/MenuManager.tsx', code);
