import fs from 'fs';
let code = fs.readFileSync('src/components/Footer.tsx', 'utf8');

const target = `        {/* Bottom links */}
        <div className="flex justify-center items-center gap-6 flex-wrap text-sm text-white/60 font-sans">
          <a href="#" className="hover:text-white transition-colors">Zakelijk</a>
          <a href="#" className="hover:text-white transition-colors">Rondvaart</a>
          <a href="#" className="hover:text-white transition-colors">Verhuur</a>
          <a href="#" className="hover:text-white transition-colors">Vacatures</a>
        </div>`;

const replacement = `        {/* Bottom info */}
        <div className="flex justify-center items-center gap-6 flex-wrap text-sm text-white/40 font-sans mt-8">
          <span>&copy; {new Date().getFullYear()} Office Butler</span>
        </div>`;

if (code.includes(target)) {
  fs.writeFileSync('src/components/Footer.tsx', code.replace(target, replacement));
  console.log("Patched");
} else {
  console.log("Target not found");
}
