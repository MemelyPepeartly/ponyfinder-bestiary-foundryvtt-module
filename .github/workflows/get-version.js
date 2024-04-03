// ES Module Syntax
import fs from 'fs';

const moduleJson = JSON.parse(fs.readFileSync('src/module.json', { encoding: 'utf-8' }));
console.log(moduleJson.includes.join(" "));
