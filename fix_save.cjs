const fs = require('fs');
let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

code = code.replace(
  /override_status: localStoreSettings\.override_status,\s*schedule: localStoreSettings\.schedule/g,
  `override_status: localStoreSettings.override_status,
            schedule: localStoreSettings.schedule,
            page_content: localStoreSettings.page_content`
);

fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
