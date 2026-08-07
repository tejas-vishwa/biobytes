const fs = require('fs');
const path = require('path');

const directory = './app';
const directory2 = './components';

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = content.replace(/E-Health Tracker and Doctor Appointments/g, 'BioBytes e-health tracker');
  updated = updated.replace(/E-Health Tracker/g, 'BioBytes e-health tracker');
  if (content !== updated) {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        replaceInFile(file);
      }
    }
  });
  return results;
}

walk(directory);
walk(directory2);
console.log('Rebranding complete.');
