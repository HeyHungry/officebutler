import fs from 'fs';

function updateFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Change overflow-x-auto to overflow-auto and add max-height so vertical scroll appears inside the table wrapper
  const findWrapper = 'className="w-full max-w-full overflow-x-auto custom-scrollbar bg-white border border-gray-200 rounded-xl"';
  const replaceWrapper = 'className="w-full max-w-full overflow-auto custom-scrollbar bg-white border border-gray-200 rounded-xl max-h-[65vh]"';
  code = code.replace(findWrapper, replaceWrapper);

  // Make the table header sticky so it stays visible while scrolling vertically
  const findHeader = 'className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200"';
  const replaceHeader = 'className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200 sticky top-0 z-10 shadow-sm"';
  code = code.replace(findHeader, replaceHeader);

  fs.writeFileSync(filePath, code);
  console.log("Patched " + filePath);
}

updateFile('src/components/ModeratorPanel.tsx');
updateFile('src/pages/CompanyDashboard.tsx');
