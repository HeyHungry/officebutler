const fs = require('fs');

let guest = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');
guest = guest.replace(
  'import { Utensils, CheckCircle, Info, ShoppingBag, ArrowLeft, Building, Mail, MapPin, Phone, Calendar, Clock, Truck } from \'lucide-react\';',
  'import { Utensils, CheckCircle, Info, ShoppingBag, ArrowLeft, Building, Mail, MapPin, Phone, Calendar, Clock, Truck, X } from \'lucide-react\';'
);
fs.writeFileSync('src/pages/GuestOrdering.tsx', guest);
