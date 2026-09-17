const fs = require('fs');

const file = 'src/components/Hero.tsx';
let code = fs.readFileSync(file, 'utf8');

const search = 'style={{ backgroundImage: \'url("https://i.imgur.com/OvgsSyu.png")\' }}';
const replace = 'style={{ backgroundImage: \'url("https://i.imgur.com/VKJOvsI.png")\' }}';

code = code.replace(search, replace);
fs.writeFileSync(file, code);
