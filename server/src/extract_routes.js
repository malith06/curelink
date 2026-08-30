const fs = require('fs');
const path = require('path');

function getRoutes(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getRoutes(file));
    } else {
      if(file.endsWith('.routes.js')) results.push(file);
    }
  });
  return results;
}

const files = getRoutes(__dirname);
files.forEach(f => {
  console.log('--- ' + path.basename(f));
  const content = fs.readFileSync(f, 'utf8');
  // Match router.get('/path', ...)
  const regex = /router\.(get|post|put|patch|delete)\(\s*['"]([^'"]+)['"]/g;
  let match;
  while((match = regex.exec(content)) !== null) {
    console.log(match[1].toUpperCase() + ' ' + match[2]);
  }
});
