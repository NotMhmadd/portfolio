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

const projectDescriptions = {
    'McCafe': "I handled the account of McCafe - KSA for well over a year, building a consistent yet creative social media image for the brand. Here is a sample of my work for McCafe, many of which I myself come with everything in it from the concept, the copy, and the design.",
    'Sunnymoon': "I handled the full branding, from the original logo ideation down to the smallest detail. I put an emphasis on the icons in this project, where the three icons each represent a character with its own theme, but within one greater identity.",
    'Popeyes': "I handled the account of Popeyes as they were opening in KSA. Popeyes integrated right into the Saudi culture as a fun and exciting brand touching with the excited Saudi youth. Here is a sample of my work for Popeyes, many of which I myself come with everything in it from the concept, the copy, and the design.",
    'MAC': "I worked on the account of MAC Platforms, a creative agency I worked in. I adopted a collage style for it along with different style of reels for depending on the client.",
    'Sofar': "I organize Sofar Beirut - a music concept where hundreds of people attend a music gig without knowing who are the bands that are going to play, also knowing the venue only one day before the gig. I create the poster for every gig announcement, do promotional videos, art direct sets and video shooting style while eventually editing the videos.",
    'CwF': "I created both the visual identity and the communication style for Crispy w Fahita, adapted to reach all of its potential target audience with a strong persona. Redesigned the logo, adapted poppy colors, directed photoshoots, created new wrapping paper and packaging, store sign, and much more.",
    'DGA': "DGA is a program by the Saudi Government that aims to digitalize work in all of its branches. I created the PDF that was given to all entities to explain the program (You can find snippets below) as well as designing and directing the main video of it.",
    'Al Hawari': "I was responsible for the full rebranding of Al Hawari's famous juice shop in Beirut. I focused on blending 2 key elements into it; 1st was the old nostalgic Beirut feel as it Al Hawari's history is a big plus against its competitors. 2nd key element was having a very appealing visual style, using strong colors with minimal design to give it an aesthetic sense its target audiences would notice and enjoy.",
    'La Roche': "Adapted a dreamy visual style with the products being the main element in the brand.",
    'Aalaqaat': "I designed the core identity of Alaqaat, a Saudi law firm looking to position itself as a market-leading trustable partner.",
    'FFF': "Created the social media visual style and opening grids for Frozen Food Factory, a brand selling high level - long lasting frozen meals.",
    'Sifr': "Participated in creating the visual identity, adapting a powerful style of duotone and bitmap for image treatment, and conceptual graphics work. The aim was to create a unique to be stand out in the overwhelming timelines of today.",
    'Ethos': "Ethos is a KSA based creative agency I spent over a year working in. I used to create the visuals for the company whether they were needed to be posted on LinkedIn or be sent to the team or clients.",
    'ASH': "ASH Vodka is a Lebanese Vodka Brand that is bold, young, elegant and proud.",
    'Avene': "Directed the visual art direction for Avene's digital presence, focusing on clean, dermatological aesthetics that highlight product purity and efficacy.",
    'OPPO': "Produced dynamic social media content and AI-driven reels to showcase the technological innovation of OPPO smartphones.",
    'Freshdays': "Developed engaging social media content and AI reels for Freshdays, focusing on a fresh and relatable brand voice.",
    'Gipsy': "Created high-energy social media content and AI reels for Gipsy, aligning with their bold brand identity.",
    'Handy': "Managed social media visuals and AI reels for Handy, ensuring a clean and professional aesthetic.",
    'Happies': "Produced fun and vibrant social media content and AI reels for Happies, capturing the brand's joyful essence.",
    'Cannelle': "Product photography and visual content creation for Cannelle, highlighting the texture and quality of their offerings.",
    'Private': "Confidential projects involving branding and visual identity design."
};

// Priority order for projects (most important first)
// Projects not in this list will appear alphabetically after these
const priorityOrder = [
    'Avene',
    'McCafe',
    'Sofar',
    'Sunnymoon',
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

    let thumbnail = null;
    // Custom Thumbnail for Sunnymoon (27th image)
    if (folder === 'Sunnymoon' && images.length > 26) {
        thumbnail = encodePath(folder, images[26]);
    } else if (images.length > 0) {
        thumbnail = encodePath(folder, images[0]);
    } else if (videos.length > 0) {
        thumbnail = encodePath(folder, videos[0]);
    } else if (pdfs.length > 0) {
        thumbnail = 'pdf';
    }

    const project = {
        id,
        name: folder,
        type: projectTypes[folder] || 'Design',
        description: projectDescriptions[folder] || '',
        thumbnail,
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

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;

    return a.name.localeCompare(b.name);
});

// Generate JS code
let output = '// Portfolio Data - All projects with their images (Auto-generated)\nexport const projects = [\n';

projects.forEach((p, i) => {
    output += '  {\n';
    output += `    id: "${p.id}",\n`;
    output += `    name: "${p.name}",\n`;
    output += `    type: "${p.type}",\n`;
    output += `    description: \`${p.description.replace(/`/g, '\\`')}\`,\n`; // Use backticks for safety
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
console.log('Total videos:', projects.reduce((sum, p) => sum + (p.videos?.length || 0), 0));
console.log('Total PDFs:', projects.reduce((sum, p) => sum + (p.pdfs?.length || 0), 0));
