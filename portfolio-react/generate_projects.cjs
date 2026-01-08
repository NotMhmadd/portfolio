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
    // User specified
    'Avene': 'Art Direction',
    'Sofar': 'Social Media + Art Direction',
    'OPPO': 'Social Media + AI Reels',
    'Freshdays': 'Social Media + AI Reels',
    'Gipsy': 'Social Media + AI Reels',
    'CwF': 'Social Media + Branding',
    'Handy': 'Social Media + AI Reels',
    'DGA': 'Others',
    'ASH': 'Social Media',
    'MAC': 'Social Media',
    'Ethos': 'Social Media',
    'Private': 'Other',
    'Happies': 'Social Media + AI Reels',

    // Inferred mappings for other projects to match user's allowed labels
    'McCafe': 'Social Media',
    'Popeyes': 'Social Media',
    'La Roche': 'Social Media',
    'Aveeno': 'Social Media',
    'DermaCare': 'Social Media',
    'NeoStrata': 'Social Media',
    'FFF': 'Social Media',

    'Aalaqaat': 'Social Media + Branding',
    'Al Hawari': 'Social Media + Branding',
    'Rami Baddour': 'Social Media + Branding',
    'Sifr': 'Social Media + Branding',
    'Sunnymoon': 'Social Media + Branding',
    'Ferra Rawan': 'Social Media + Branding',

    'Cannelle': 'Others',
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
  { name: 'Photoshop', percent: 93, icon: 'fas fa-image' },
  { name: 'Premiere', percent: 88, icon: 'fas fa-video' },
  { name: 'Illustrator', percent: 79, icon: 'fas fa-pen-nib' },
  { name: 'AI Images Generation', percent: 95, icon: 'fas fa-robot' },
  { name: 'AI Video Generation', percent: 91, icon: 'fas fa-film' },
  { name: 'Vibe Coding', percent: 83, icon: 'fas fa-code' },
]

// Experience data for About section
export const experience = [
  { date: 'June 2025 - Current', title: 'Head of Design', company: 'BYND Network', subtitle: true },
  { date: 'Jan 2025 - June 2025', title: 'Senior Graphic Designer', company: 'BYND Network' },
  { date: '2024', title: 'Mid-Senior Level Graphic Designer', company: 'MAC Platforms' },
  { date: '2022 - 2024', title: 'Graphic Designer', company: 'Ethos' },
  { date: '2019 - 2022', title: 'Freelance Graphic Designer', company: 'Multiple Clients' },
  { date: '2023 - Current', title: 'Organizer & Art Director', company: 'Sofar Sounds Beirut' },
]
`;

fs.writeFileSync('./src/data/projects.js', output);
console.log('Generated projects.js with', projects.length, 'projects');
console.log('Total images:', projects.reduce((sum, p) => sum + (p.images?.length || 0), 0));
console.log('Total videos:', projects.reduce((sum, p) => sum + (p.videos?.length || 0), 0));
console.log('Total PDFs:', projects.reduce((sum, p) => sum + (p.pdfs?.length || 0), 0));
