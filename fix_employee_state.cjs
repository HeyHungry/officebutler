const fs = require('fs');
let code = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');

const stateBlock = `
  const [maxSpendLimit, setMaxSpendLimit] = useState<number | null>(null);

  const [deliveryMethods, setDeliveryMethods] = useState<any[]>([]);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<any>(null);

  // New multi-select state: productName -> portionSize
`;

code = code.replace(/const \[maxSpendLimit, setMaxSpendLimit\] = useState<number \| null>\(null\);\s*\/\/ New multi-select state/, stateBlock);

fs.writeFileSync('src/pages/EmployeeOrdering.tsx', code);
