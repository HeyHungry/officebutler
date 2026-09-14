const fs = require('fs');
let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

const targetClass = 'bg-white shadow-2xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col rounded-lg';
const newClass = 'bg-white w-full h-full max-w-none rounded-none overflow-hidden flex flex-col';

code = code.replace(targetClass, newClass);

// Also let's change p-4 in the backdrop to p-0 so it goes edge to edge
code = code.replace('className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d131f]/80 backdrop-blur-sm p-4 font-sans"', 'className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d131f]/80 backdrop-blur-sm p-0 font-sans"');

fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
