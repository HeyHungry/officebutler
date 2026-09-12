const fs = require('fs');
let code = fs.readFileSync('src/components/Menu.tsx', 'utf8');

code = code.replace(
  />Ons Menu</g,
  '>{content?.menu_title || "Ons Menu"}<'
);
// Subtitle is already handled in previous iteration:
// >{content?.menu_subtitle || "Zelf samenstellen of iets extra's toevoegen aan uw pakket? Bekijk ons uitgebreide menu."}<

code = code.replace(
  />Bekijk volledig menu</g,
  '>{content?.menu_btn || "Bekijk volledig menu"}<'
);

fs.writeFileSync('src/components/Menu.tsx', code);
