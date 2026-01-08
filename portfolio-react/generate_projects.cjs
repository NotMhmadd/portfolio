const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imagesDir = './public/images';
const folders = fs.readdirSync(imagesDir).filter(f =>
    fs.statSync(path.join(imagesDir, f)).isDirectory() &&
    !f.startsWith('images_backup')
);

const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const videoExts = ['.mp4', '.mov', '.MOV', '.MP4'];
const pdfExts = ['.pdf'];

const projectTypes = {
    // User specified exact matches
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
    'Private': 'Others',
    'Happies': 'Social Media + AI Reels',

    // Consolidating deprecated labels
    'McCafe': 'Social Media',
    'Popeyes': 'Social Media',
    'La Roche': 'Social Media',
    'Aveeno': 'Social Media',
    'DermaCare': 'Social Media',
    'NeoStrata': 'Social Media',
    'FFF': 'Social Media',
    'Cannelle': 'Others',

    'Aalaqaat': 'Social Media + Branding',
    'Al Hawari': 'Social Media + Branding',
    'Rami Baddour': 'Social Media + Branding',
    'Sifr': 'Social Media + Branding',
    'Sunnymoon': 'Social Media + Branding',
    'Ferra Rawan': 'Social Media + Branding',
};

const priorityOrder = [
    'Avene',
    'McCafe',
    'Sunnymoon',
    'Sofar',
    'Cannelle',
    'OPPO',
    'Freshdays',
    'Popeyes',
    'Gipsy',
    'Handy',
    'ASH',
    'La Roche',
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
    const numA = parseInt(a.match(/\d+/) || [0]);
    const numB = parseInt(b.match(/\d+/) || [0]);
    if (numA !== numB) return numA - numB;
    return a.localeCompare(b);
}

function encodePath(folder, filename) {
    const encodedFolder = encodeURIComponent(folder);
    const encodedFile = filename.split('/').map(encodeURIComponent).join('/');
    return `/images/${encodedFolder}/${encodedFile}`;
}

async function generate() {
    console.log('Starting project generation...');
    const projectPromises = folders.map(async folder => {
        const files = getFiles(folder);
        const images = files.filter(f => imageExts.some(ext => f.toLowerCase().endsWith(ext))).sort(sortImages);
        const videos = files.filter(f => videoExts.some(ext => f.endsWith(ext))).sort(sortImages);
        const pdfs = files.filter(f => pdfExts.some(ext => f.toLowerCase().endsWith(ext))).sort(sortImages);

        const id = folder.toLowerCase().replace(/\s+/g, '-');

        // Default to square
        let orientation = 'square';
        let thumbnail = null;

        if (images.length > 0) {
            thumbnail = encodePath(folder, images[0]);

            try {
                // Get physical path for sharp
                const thumbPath = path.join(imagesDir, folder, images[0]);
                const metadata = await sharp(thumbPath).metadata();
                const ratio = metadata.width / metadata.height;

                // Detection logic
                if (ratio < 0.85) {
                    orientation = 'portrait';
                } else if (ratio > 1.25) {
                    orientation = 'landscape';
                }
            } catch (err) {
                console.warn(`Warning: Could not read metadata for ${folder}/${images[0]}:`, err.message);
            }
        } else if (videos.length > 0) {
            thumbnail = encodePath(folder, videos[0]);
            orientation = 'landscape';
        } else if (pdfs.length > 0) {
            thumbnail = 'pdf';
        }

        const project = {
            id,
            name: folder,
            type: projectTypes[folder] || 'Design',
            thumbnail,
            orientation
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
    });

    const projectsRaw = await Promise.all(projectPromises);
    const projects = projectsRaw.filter(p => p.thumbnail !== null);

    // Sort projects
    projects.sort((a, b) => {
        const aIndex = priorityOrder.indexOf(a.name);
        const bIndex = priorityOrder.indexOf(b.name);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return a.name.localeCompare(b.name);
    });

    // Generate output
    let output = '// Portfolio Data - All projects with their images (Auto-generated)\nexport const projects = [\n';

    projects.forEach((p) => {
        output += '  {\n';
        output += `    id: "${p.id}",\n`;
        output += `    name: "${p.name}",\n`;
        output += `    type: "${p.type}",\n`;
        output += `    thumbnail: "${p.thumbnail}",\n`;
        output += `    orientation: "${p.orientation}",\n`;

        if (p.images) {
            output += '    images: [\n';
            p.images.forEach(img => output += `      "${img}",\n`);
            output += '    ],\n';
        }
        if (p.videos) {
            output += '    videos: [\n';
            p.videos.forEach(v => output += `      "${v}",\n`);
            output += '    ],\n';
        }
        if (p.pdfs) {
            output += '    pdfs: [\n';
            p.pdfs.forEach(pdf => output += `      "${pdf}",\n`);
            output += '    ],\n';
        }

        output += '  },\n';
    });

    output += ']\n';

    // Skills & Experience (Static data restoration)
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
  { date: 'June 2025 - Current', title: 'Head of Design', company: 'BYND Network' },
  { date: 'Jan 2025 - June 2025', title: 'Senior Graphic Designer', company: 'BYND Network' },
  { date: '2024', title: 'Mid-Senior Level Graphic Designer', company: 'MAC Platforms' },
  { date: '2022 - 2024', title: 'Graphic Designer', company: 'Ethos' },
  { date: '2019 - 2022', title: 'Freelance Graphic Designer', company: 'Multiple Clients' },
  { date: '2023 - Current', title: 'Organizer & Art Director', company: 'Sofar Sounds Beirut', subtitle: true },
]
`;

    fs.writeFileSync('./src/data/projects.js', output);
    console.log('Generated projects.js with', projects.length, 'projects');
    console.log('Total images:', projects.reduce((sum, p) => sum + (p.images?.length || 0), 0));
}

generate().catch(console.error);
