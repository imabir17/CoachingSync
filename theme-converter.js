const fs = require('fs');
const path = require('path');

const mappings = [
  // Backgrounds
  { search: /#E7ECF3/gi, replace: '#1B1E23' },
  { search: /#DCE3ED/gi, replace: '#14161A' },
  // Shadows
  { search: /#AEB9C9/gi, replace: '#111317' },
  { search: /#FFFFFF/gi, replace: '#252A31' },
  // Text
  { search: /#202638/gi, replace: '#F0F3F8' },
  { search: /#5C6478/gi, replace: '#AAB4C4' },
  { search: /#8891A3/gi, replace: '#707C91' },
  // Inputs transparent backgrounds (handling variations of bg-white/x if any, mostly bg-white/50)
  { search: /bg-white\/50/g, replace: 'bg-black/20' },
  { search: /bg-white\/10/g, replace: 'bg-black/10' },
  // Border colors (sometimes white or light grey)
  { search: /border-white\/20/g, replace: 'border-white/5' },
  { search: /border-white\/50/g, replace: 'border-white/10' },
];

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.css') || fullPath.endsWith('.js'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;

      for (const map of mappings) {
        content = content.replace(map.search, map.replace);
      }

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated theme colors in: ${fullPath}`);
      }
    }
  }
}

// Start processing from src directory
processDirectory(path.join(__dirname, 'src'));
console.log('Theme conversion completed!');
