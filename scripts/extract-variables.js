const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../app/views');

const pageVariables = {};

function scanDir(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (file.endsWith('.njk') || file.endsWith('.html')) {
      const content = fs.readFileSync(fullPath, 'utf8');

      const relPath = path.relative(ROOT, fullPath);
      const variableSet = new Set();

      // ✅ data['something']
      const bracketMatches = content.match(/data\[['"]([^'"]+)['"]\]/g) || [];
      bracketMatches.forEach(match => {
        const name = match.match(/data\[['"]([^'"]+)['"]\]/)[1];
        variableSet.add(name);
      });

      // ✅ data.something
      const dotMatches = content.match(/data\.([a-zA-Z0-9_-]+)/g) || [];
      dotMatches.forEach(match => {
        const name = match.replace('data.', '');
        variableSet.add(name);
      });

      // ✅ name="something"
      const nameMatches = content.match(/name="([^"]+)"/g) || [];
      nameMatches.forEach(match => {
        const name = match.match(/name="([^"]+)"/)[1];
        variableSet.add(name);
      });

      if (variableSet.size > 0) {
        pageVariables[relPath] = Array.from(variableSet).sort();
      }
    }
  });
}

scanDir(ROOT);

// ✅ Build output
let output = '';

Object.keys(pageVariables)
  .sort()
  .forEach(page => {
    output += `=== ${page} ===\n`;
    output += pageVariables[page].join('\n');
    output += '\n\n';
  });

// ✅ Write file
fs.writeFileSync(
  path.join(__dirname, '../variable-list.txt'),
  output
);

console.log('✅ variable-list.txt generated (grouped by page)');