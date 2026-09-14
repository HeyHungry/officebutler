const fs = require('fs');
let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

const targetEffect = `  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchDashboardData();
    }
  }, [isOpen, isAuthenticated]);`;

const newEffect = `  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchDashboardData();
    }
  }, [isOpen, isAuthenticated, activeTab]);`;

code = code.replace(targetEffect, newEffect);
fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
