const fs = require('fs');
let code = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');

// 1. scroll to top
if (!code.includes('window.scrollTo(0, 0);')) {
  code = code.replace(/export function EmployeeOrdering\(\) {/, `export function EmployeeOrdering() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
`);
}

// 2. update the selection map (it uses inline arrow function)
const selectionSearch = `                                onClick={() => {
                                  setSelections(prev => {
                                    const prodSelections = prev[product] || {};
                                    const currentQty = prodSelections[size] || 0;
                                    return {
                                      ...prev,
                                      [product]: {
                                        ...prodSelections,
                                        [size]: currentQty + 1
                                      }
                                    };
                                  });
                                }}`;

const selectionReplace = `                                onClick={() => {
                                  setSelections(prev => {
                                    const prodSelections = prev[product] || {};
                                    // in employee ordering, size might just be size, not variant. 
                                    // let's use the size directly.
                                    const currentQty = prodSelections[size] || 0;
                                    return {
                                      ...prev,
                                      [product]: {
                                        ...prodSelections,
                                        [size]: currentQty + 1
                                      }
                                    };
                                  });
                                }}`;

// wait, the problem is we need to add the minus button.
// let's look at the button jsx for EmployeeOrdering
const buttonJsx = `                              <button
                                key={size}
                                type="button"
                                disabled={!hasPrice || ['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase())}`;

const buttonComplete = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');
