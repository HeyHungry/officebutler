const fs = require('fs');
let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

const targetSidebar = '<div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 p-4 shrink-0 overflow-y-auto">\n                    <nav className="space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">';

const newSidebar = '<div className={`w-full ${isSidebarCollapsed ? "md:w-20" : "md:w-64"} bg-gray-50 border-r border-gray-200 p-4 shrink-0 overflow-y-auto transition-all duration-300`}>\n                    <nav className="space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 items-start">';

code = code.replace(targetSidebar, newSidebar);

code = code.replace(/Winkel Status/g, "{!isSidebarCollapsed && <span>Winkel Status</span>}");
code = code.replace(/Website Teksten/g, "{!isSidebarCollapsed && <span>Website Teksten</span>}");
code = code.replace(/Aanmeldingen/g, "{!isSidebarCollapsed && <span>Aanmeldingen</span>}");
code = code.replace(/Klanten \(Kantoren\)/g, "{!isSidebarCollapsed && <span>Klanten (Kantoren)</span>}");
code = code.replace(/Bestellingen/g, "{!isSidebarCollapsed && <span>Bestellingen</span>}");
code = code.replace(/Portie Prijzen/g, "{!isSidebarCollapsed && <span>Portie Prijzen</span>}");
code = code.replace(/Menu & Producten/g, "{!isSidebarCollapsed && <span>Menu & Producten</span>}");
code = code.replace(/Bezorgopties/g, "{!isSidebarCollapsed && <span>Bezorgopties</span>}");

fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
