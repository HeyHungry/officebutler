const fs = require('fs');

const file = 'src/pages/GuestOrdering.tsx';
let code = fs.readFileSync(file, 'utf8');

const search = `              totalOrderPrice,
              deliveryDate: deliveryMode === 'zsm' ? new Date().toISOString().split('T')[0] : deliveryDate,
              deliveryTime: deliveryMode === 'zsm' ? 'Zo snel mogelijk' : deliveryTime
            })
          });`;

const replace = `              totalOrderPrice,
              deliveryDate: deliveryMode === 'zsm' ? new Date().toISOString().split('T')[0] : deliveryDate,
              deliveryTime: deliveryMode === 'zsm' ? 'Zo snel mogelijk' : deliveryTime,
              deliveryMethod: selectedDeliveryMethod?.name || 'Standaard Bezorging',
              deliveryMethodPrice: selectedDeliveryMethod?.price || 0
            })
          });`;

code = code.replace(search, replace);
fs.writeFileSync(file, code);
