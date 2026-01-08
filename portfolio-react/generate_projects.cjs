const fs = require('fs');
const path = require('path');

const imagesDir = './public/images';
const folders = fs.readdirSync(imagesDir).filter(f =>
    fs.statSync(path.join(imagesDir, f)).isDirectory() &&
    !f.startsWith('images_backup')
);

const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const videoExts = ['.mp4', '.mov', '.MOV', '.MP4'];
const pdfExts = ['.pdf'];

const projectTypes = {
    'ASH': 'Beverage Branding',
    'Aalaqaat': 'Branding',
    'Al Hawari': 'Branding',
    'Aveeno': 'Skincare Marketing',
    'Avene': 'Skincare & Product Design',
    'Cannelle': 'Product Photography',
    'CwF': 'Restaurant Branding',
    'DGA': 'Government & Corporate',
    'DermaCare': 'Skincare Marketing',
    'Ethos': 'Agency Branding',
    'FFF': 'Food & Beverage',
    'Ferra Rawan': 'Branding',
    'Freshdays': 'Social Media & Video',
    'Gipsy': 'Restaurant Branding',
    'Handy': 'Product Marketing',
    'Happies': 'Social Media & Video',
    'La Roche': 'Food & Beverage',
    'MAC': 'Agency',
    'McCafe': 'Food & Beverage',
    'NeoStrata': 'Skincare Marketing',
    'OPPO': 'Tech & Electronics',
    'Popeyes': 'Food & Beverage',
    'Private': 'Personal Projects',
    'Rami Baddour': 'Branding',
    'Sifr': 'Branding',
    'Sofar': 'Tech & Product',
    'Sunnymoon': 'Branding',
};

// Priority order for projects (most important first)
// Projects not in this list will appear alphabetically after these
const priorityOrder = [
    'Avene',
    'McCafe',
    'Popeyes',
    'OPPO',
    'CwF',
    'MAC',
    'Freshdays',
    'La Roche',
    'Gipsy',
    'Handy',
    'Cannelle',
    'Happies',
    'Al Hawari',
    'Sofar',
    'Sifr',
    'Ethos',
    'DGA',
    'FFF',
    'ASH',
    'Private',
];

function getFiles(folder) {
    const folderPath = path.join(imagesDir, folder);
    const allFiles = [];

    function walkDir(dir, prefix = '') {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                walkDir(fullPath, path.join(prefix, file));
            } else {
                allFiles.push(prefix ? path.join(prefix, file) : file);
            }
        });
    }

    walkDir(folderPath);
    return allFiles;
}

function sortImages(a, b) {
    // Extract numbers for natural sorting
    const numA = parseInt(a.match(/\d+/) || [0]);
    const numB = parseInt(b.match(/\d+/) || [0]);
    if (numA !== numB) return numA - numB;
    return a.localeCompare(b);
}

// Helper function to encode path segments for URLs
function encodePath(folder, filename) {
    const encodedFolder = encodeURIComponent(folder);
    const encodedFile = filename.split('/').map(encodeURIComponent).join('/');
    return `/images/${encodedFolder}/${encodedFile}`;
}

const projects = folders.map(folder => {
    const files = getFiles(folder);
    const images = files.filter(f => imageExts.some(ext => f.toLowerCase().endsWith(ext))).sort(sortImages);
    const videos = files.filter(f => videoExts.some(ext => f.endsWith(ext))).sort(sortImages);
    const pdfs = files.filter(f => pdfExts.some(ext => f.toLowerCase().endsWith(ext))).sort(sortImages);

    const id = folder.toLowerCase().replace(/\s+/g, '-');

    const project = {
        id,
        name: folder,
        type: projectTypes[folder] || 'Design',
        thumbnail: images.length > 0
            ? encodePath(folder, images[0])
            : videos.length > 0
                ? encodePath(folder, videos[0])
                : pdfs.length > 0
                    ? 'pdf'
                    : null,
    };

    if (images.length > 0) {
        project.images = images.map(f => encodePath(folder, f));
    }
    if (videos.length > 0) {
        project.videos = videos.map(f => encodePath(folder, f));
    }
    if (pdfs.length > 0) {
        project.pdfs = pdfs.map(f => encodePath(folder, f));
    }

    return project;
}).filter(p => p.thumbnail !== null);

// Sort projects by priority order
projects.sort((a, b) => {
    const aIndex = priorityOrder.indexOf(a.name);
    const bIndex = priorityOrder.indexOf(b.name);
    // If both are in priority list, sort by their position
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    // If only a is in priority list, a comes first
    if (aIndex !== -1) return -1;
    // If only b is in priority list, b comes first
    if (bIndex !== -1) return 1;
    // Otherwise sort alphabetically
    return a.name.localeCompare(b.name);
});

// Generate JS code
let output = '// Portfolio Data - All projects with their images (Auto-generated)\nexport const projects = [\n';

projects.forEach((p, i) => {
    output += '  {\n';
    output += `    id: "${p.id}",\n`;
    output += `    name: "${p.name}",\n`;
    output += `    type: "${p.type}",\n`;
    output += `    thumbnail: "${p.thumbnail}",\n`;

    if (p.images) {
        output += '    images: [\n';
        p.images.forEach(img => {
            output += `      "${img}",\n`;
        });
        output += '    ],\n';
    }

    if (p.videos) {
        output += '    videos: [\n';
        p.videos.forEach(v => {
            output += `      "${v}",\n`;
        });
        output += '    ],\n';
    }

    if (p.pdfs) {
        output += '    pdfs: [\n';
        p.pdfs.forEach(pdf => {
            output += `      "${pdf}",\n`;
        });
        output += '    ],\n';
    }

    output += '  },\n';
});

output += ']\n';

// Add skills and experience
output += `
// Skills data for About section
export const skills = [
  { name: 'Adobe Photoshop', percent: 95, icon: 'fab fa-adobe' },
  { name: 'Adobe Illustrator', percent: 90, icon: 'fab fa-adobe' },
  { name: 'Adobe After Effects', percent: 80, icon: 'fab fa-adobe' },
  { name: 'Figma', percent: 85, icon: 'fab fa-figma' },
  { name: 'Social Media Marketing', percent: 90, icon: 'fas fa-bullhorn' },
]

// Experience data for About section
export const experience = [
  { date: '2023 - Present', title: 'Senior Graphic Designer', company: 'MAC Platforms' },
  { date: '2021 - 2023', title: 'Graphic Designer', company: 'Ethos Agency (KSA)' },
  { date: '2019 - 2021', title: 'Junior Designer', company: 'Freelance' },
]
`;

fs.writeFileSync('./src/data/projects.js', output);
console.log('Generated projects.js with', projects.length, 'projects');
console.log('Total images:', projects.reduce((sum, p) => sum + (p.images?.length || 0), 0));
console.log('Total videos:', projects.reduce((sum, p) => sum + (p.videos?.length || 0), 0));
console.log('Total PDFs:', projects.reduce((sum, p) => sum + (p.pdfs?.length || 0), 0));
