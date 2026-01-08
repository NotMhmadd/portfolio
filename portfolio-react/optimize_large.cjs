const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sharp = require('sharp');

const imagesDir = './public/images';
const MAX_SIZE = 1024 * 1024; // 1MB
const MAX_WIDTH = 1920;
const QUALITY = 85;

// Find all large images
const largeFiles = execSync(`find ${imagesDir} -type f \\( -name "*.jpg" -o -name "*.png" -o -name "*.jpeg" \\) -size +1M`)
    .toString()
    .trim()
    .split('\n')
    .filter(f => f.length > 0);

console.log(`Found ${largeFiles.length} files over 1MB\n`);

async function optimizeFile(filePath) {
    const originalSize = fs.statSync(filePath).size;
    const ext = path.extname(filePath).toLowerCase();

    try {
        const image = sharp(filePath);
        const metadata = await image.metadata();

        let pipeline = image;

        // Resize if too wide
        if (metadata.width > MAX_WIDTH) {
            pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
        }

        // Compress
        if (ext === '.png') {
            pipeline = pipeline.png({ quality: QUALITY, compressionLevel: 9, palette: true });
        } else {
            pipeline = pipeline.jpeg({ quality: QUALITY, mozjpeg: true });
        }

        const buffer = await pipeline.toBuffer();

        if (buffer.length < originalSize) {
            fs.writeFileSync(filePath, buffer);
            const saved = originalSize - buffer.length;
            console.log(`✓ ${path.basename(filePath)}: ${(originalSize / 1024 / 1024).toFixed(1)}MB → ${(buffer.length / 1024 / 1024).toFixed(1)}MB (saved ${(saved / 1024).toFixed(0)}KB)`);
            return saved;
        } else {
            console.log(`- ${path.basename(filePath)}: Already optimal`);
            return 0;
        }
    } catch (err) {
        console.log(`✗ ${path.basename(filePath)}: ${err.message}`);
        return 0;
    }
}

async function main() {
    let totalSaved = 0;
    for (const file of largeFiles) {
        totalSaved += await optimizeFile(file);
    }
    console.log(`\nTotal saved: ${(totalSaved / 1024 / 1024).toFixed(1)}MB`);
}

main();
