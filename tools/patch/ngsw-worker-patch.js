'use strict';

const fs = require('fs');
const filePath = './dist/ngsw-worker.js';

const patch = {
    find: 'const req = event.request;',
    replace: `const req = event.request;
        if (req.method === 'POST') { return; }`
};

console.log('Patching ngsw-worker.js...');

fs.readFile(filePath, 'utf-8', (error, fileContent) => {
  if (fileContent.indexOf(patch.replace) === -1) {
    const modifiedFileContent = fileContent.replace(patch.find, patch.replace);

    fs.writeFile(filePath, modifiedFileContent, 'utf-8', (error) => {
      console.log('Done.');
    });
  } else {
    console.log('Nothing to do.');
  }
});
