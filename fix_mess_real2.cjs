const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  // There are duplicated closing blocks in the file itself. We need to delete them.
  // We'll extract everything before the map start, and everything after the ACTUAL map end.
  const lines = code.split('\\n');
  let startIdx = -1;
  let endIdx = -1;
  
  for(let i=0; i<lines.length; i++) {
    if (lines[i].includes("{category.items.map((item) => {")) {
      startIdx = i;
    }
  }
  
  // Find the exact line that closes the category mapping correctly.
  // It should be followed by something like:
  //                 ))}
  //               </div>
  for(let i=startIdx; i<lines.length; i++) {
    if (lines[i].trim() === "}))}" || (lines[i].trim() === "))}")) {
       // Look backwards to find the end of the item map
       for(let j=i; j>i-10; j--) {
         if (lines[j].trim() === "})}") {
            endIdx = j;
            break;
         }
       }
       if (endIdx !== -1) break;
    }
  }

  // Actually, I can just use a much safer regex that replaces EVERYTHING between {category.items.map((item) => { and the VERY LAST instance of })\\} before </div></div>
  // Let's just do it manually. I will output the file to guest_cleaned.tsx and inspect it.
}

fixFile('src/pages/GuestOrdering.tsx');

