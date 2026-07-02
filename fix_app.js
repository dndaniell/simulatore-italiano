import fs from 'fs';

const content = fs.readFileSync('app.js', 'utf8');
const wheelIndex = content.indexOf('function spinWheel()');
console.log(content.substring(wheelIndex, wheelIndex + 1000));
