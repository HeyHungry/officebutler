const fs = require('fs');
let code = fs.readFileSync('src/components/DeliveryOptionsManager.tsx', 'utf8');

code = code.replace(/const \[isLoading, setIsLoading\] = useState\(true\);/, "const [isLoading, setIsLoading] = useState(true);\n  const [errorMsg, setErrorMsg] = useState<string | null>(null);");

code = code.replace(/if \(error\) console\.error\('Supabase error:', error\);/, "if (error) { console.error('Supabase error:', error); setErrorMsg(error.message); }");

code = code.replace(/if \(isLoading\) return <div className="p-8 text-center text-gray-500">Laden...<\/div>;/, "if (isLoading) return <div className=\"p-8 text-center text-gray-500\">Laden...</div>;\n  if (errorMsg) return <div className=\"p-8 text-center text-red-500\">Error: {errorMsg}</div>;");

fs.writeFileSync('src/components/DeliveryOptionsManager.tsx', code);
