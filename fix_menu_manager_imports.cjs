const fs = require('fs');
let code = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');

code = code.replace(/import \{ Plus, Trash2, Edit2, Check, X, Image as ImageIcon, GripVertical \} from 'lucide-react';/, "import { Plus, Trash2, Edit2, Check, X, Image as ImageIcon, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';");

fs.writeFileSync('src/components/MenuManager.tsx', code);
