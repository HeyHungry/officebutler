const fs = require('fs');
let code = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');

code = code.replace(
`          });
        });
        });
        
        const results = await Promise.all(orderPromises);`,
`          });
        });
        
        const results = await Promise.all(orderPromises);`
);
// It might be slightly different in employee ordering.
// Let's check employee ordering around line 190.
