const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    filelist = fs.statSync(path.join(dir, file)).isDirectory()
      ? walkSync(path.join(dir, file), filelist)
      : filelist.concat(path.join(dir, file));
  });
  return filelist;
};

const files = walkSync('client/src').filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('loading={')) {
    // Replace 'loading={' with 'isLoading={' ONLY if it's on a Button or similar component that we know expects isLoading.
    // Actually, looking at the grep, all occurrences are for Button components.
    // Let's just do a naive replace for now since we know Button takes isLoading.
    const newContent = content.replace(/loading=\{/g, 'isLoading={');
    if (newContent !== content) {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
});
