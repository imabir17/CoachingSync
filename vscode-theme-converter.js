const fs = require('fs');
const path = require('path');

const mappings = [
  // 1. Strip shadows and replace with VS Code border
  // For standard shadows
  { search: /hover:shadow-\[[^\]]+\]/g, replace: 'hover:border-[#555555]' }, // highlight border on hover
  { search: /shadow-\[[^\]]+\]/g, replace: 'border border-[#3E3E42]' },
  { search: /shadow-md/g, replace: 'border border-[#3E3E42]' },
  { search: /shadow-lg/g, replace: 'border border-[#3E3E42]' },
  { search: /hover:shadow-lg/g, replace: 'hover:border-[#555555]' },
  { search: /hover:shadow-md/g, replace: 'hover:border-[#555555]' },

  // 2. Color remapping (Previous dark to VS Code dark)
  { search: /#1B1E23/gi, replace: '#1E1E1E' }, // Main Editor bg
  { search: /#14161A/gi, replace: '#252526' }, // Sidebar/Panel bg
  
  // Text colors
  { search: /#F0F3F8/gi, replace: '#D4D4D4' },
  { search: /#AAB4C4/gi, replace: '#CCCCCC' },
  { search: /#707C91/gi, replace: '#858585' },
  
  // Accents (Buttons, links)
  { search: /#4855E4/gi, replace: '#007ACC' },
  { search: /#6E79F2/gi, replace: '#007ACC' },
  { search: /#333FC2/gi, replace: '#0062A3' },
  { search: /#12A8B5/gi, replace: '#4EC9B0' }, // VS code teal-ish accent
  { search: /#FF7A52/gi, replace: '#CE9178' }, // VS code orange-ish string color

  // 3. Flatten corners
  { search: /rounded-2xl/g, replace: 'rounded-md' },
  { search: /rounded-xl/g, replace: 'rounded-sm' },
  { search: /rounded-lg/g, replace: 'rounded-sm' },
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

      // Also clean up any potential double borders if the original element already had a border
      content = content.replace(/border border-\[\#3E3E42\] border border-\[\#3E3E42\]/g, 'border border-[#3E3E42]');

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Flattened UI and mapped VS Code colors in: ${fullPath}`);
      }
    }
  }
}

// Process globals.css specifically to remove the .neo-* classes
function cleanGlobalsCss() {
  const cssPath = path.join(__dirname, 'src', 'app', 'globals.css');
  if (fs.existsSync(cssPath)) {
    let css = fs.readFileSync(cssPath, 'utf8');
    
    // Remove everything from /* Custom Neomorphic scrollbar */ to the end of .neo-inline-pressed
    // Since we're dealing with regex, it might be simpler to just remove the known block.
    // Or we just leave the CSS classes alone since we stripped the tailwind usages. 
    // It's safer to leave them unused than to risk breaking the file.
    // We will just map the colors in globals.css which processDirectory already does.
  }
}

// Start processing from src directory
processDirectory(path.join(__dirname, 'src'));
cleanGlobalsCss();
console.log('VS Code Classic Dark conversion completed!');
