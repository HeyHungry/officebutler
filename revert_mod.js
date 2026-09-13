import fs from 'fs';

let modCode = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

// Revert main content area
modCode = modCode.replace(
  'className="flex-1 bg-white p-6 md:p-8 flex flex-col min-h-0"',
  'className="flex-1 overflow-y-auto bg-white p-6 md:p-8"'
);

// Revert impersonating
modCode = modCode.replace(
  '{impersonating ? (\n                      <div className="space-y-6 h-full overflow-y-auto custom-scrollbar pr-2">',
  '{impersonating ? (\n                      <div className="space-y-6">'
);

// Revert customers
modCode = modCode.replace(
  'activeTab === \'customers\' ? (\n                      <div className="space-y-6 max-w-4xl h-full overflow-y-auto custom-scrollbar pr-2">',
  'activeTab === \'customers\' ? (\n                      <div className="space-y-6 max-w-4xl">'
);

// Revert orders tab wrapper
modCode = modCode.replace(
  'activeTab === \'orders\' ? (\n                      <div className="space-y-6 h-full flex flex-col min-h-0">\n                        <div className="flex items-center justify-between shrink-0">',
  'activeTab === \'orders\' ? (\n                      <div className="space-y-6">\n                        <div className="flex items-center justify-between">'
);

// Revert orders table
modCode = modCode.replace(
  '<div className="w-full max-w-full overflow-auto custom-scrollbar bg-white border border-gray-200 rounded-xl flex-1 min-h-0">',
  '<div className="w-full max-w-full overflow-auto custom-scrollbar bg-white border border-gray-200 rounded-xl max-h-[65vh]">'
);

// Revert prices
modCode = modCode.replace(
  'activeTab === \'prices\' ? (\n                      <div className="space-y-6 max-w-2xl h-full overflow-y-auto custom-scrollbar pr-2">',
  'activeTab === \'prices\' ? (\n                      <div className="space-y-6 max-w-2xl">'
);

// Revert menu wrapper
modCode = modCode.replace(
  'activeTab === \'menu\' ? (\n                      <div className="h-full flex flex-col min-h-0">\n                        <MenuManager />\n                      </div>',
  'activeTab === \'menu\' ? (\n                      <MenuManager />'
);

fs.writeFileSync('src/components/ModeratorPanel.tsx', modCode);

let menuCode = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');

// Revert MenuManager wrapper
menuCode = menuCode.replace(
  '<div className="space-y-6 max-w-5xl h-full flex flex-col min-h-0">\n      <div className="flex justify-between items-center shrink-0">',
  '<div className="space-y-6 max-w-5xl">\n      <div className="flex justify-between items-center mb-6">'
);

// Fix table wrapper to use exactly the same styling as the orders table
menuCode = menuCode.replace(
  '<div className="w-full max-w-full overflow-auto custom-scrollbar bg-white border border-gray-200 rounded-xl shadow-sm flex-1 min-h-0">',
  '<div className="w-full max-w-full overflow-auto custom-scrollbar bg-white border border-gray-200 rounded-xl shadow-sm max-h-[65vh]">'
);

fs.writeFileSync('src/components/MenuManager.tsx', menuCode);

console.log('Reverted changes');
