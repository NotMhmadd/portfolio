const fs = require('fs');
const path = require('path');

// Simple verification - check if files exist
const projectsPath = './src/data/projects.js';
const content = fs.readFileSync(projectsPath, 'utf8');

// Extract all image paths using regex
const imagePattern = /"\/images\/[^"]+"/g;
const matches = content.match(imagePattern) || [];

let missing = [];
let exists = [];

matches.forEach(match => {
    const imgPath = match.slice(1, -1); // Remove quotes
    const filePath = './public' + imgPath;
    if (fs.existsSync(filePath)) {
        exists.push(imgPath);
    } else {
        missing.push(imgPath);
    }
});

console.log('Total image references:', matches.length);
console.log('Existing files:', exists.length);
console.log('');

if (missing.length) {
    console.log('Missing images (' + missing.length + '):');
    missing.slice(0, 20).forEach(m => console.log('  -', m));
    if (missing.length > 20) console.log('  ... and', missing.length - 20, 'more');
} else {
    console.log('✓ All images exist!');
}
