import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('OrderModalProvider')) {
  code = code.replace(
    'import { Navbar } from "./components/Navbar";',
    'import { Navbar } from "./components/Navbar";\nimport { OrderModalProvider } from "./contexts/OrderModalContext";\nimport { OrderModal } from "./components/OrderModal";\nimport { GuestOrdering } from "./pages/GuestOrdering";'
  );

  code = code.replace(
    '<BrowserRouter>',
    '<BrowserRouter>\n      <OrderModalProvider>'
  );

  code = code.replace(
    '</BrowserRouter>',
    '        <OrderModal />\n      </OrderModalProvider>\n    </BrowserRouter>'
  );

  code = code.replace(
    '<Route path="/order" element={<EmployeeOrdering />} />',
    '<Route path="/order" element={<EmployeeOrdering />} />\n          <Route path="/guest-order" element={<GuestOrdering />} />'
  );

  fs.writeFileSync('src/App.tsx', code);
}
