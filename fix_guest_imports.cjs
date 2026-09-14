const fs = require('fs');
let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

code = code.replace(/import \{ Utensils, CheckCircle, Info, ShoppingBag, ArrowLeft, Building, Mail, MapPin, Phone, Calendar, Clock \} from 'lucide-react';/, "import { Utensils, CheckCircle, Info, ShoppingBag, ArrowLeft, Building, Mail, MapPin, Phone, Calendar, Clock, Truck } from 'lucide-react';");

fs.writeFileSync('src/pages/GuestOrdering.tsx', code);
