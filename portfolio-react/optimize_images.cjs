const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imagesDir = './public/images';
const MAX_SIZE = 1024 * 1024; // 1MB
const MAX_WIDTH = 1920; // Max width for images
const QUALITY = 85; // JPEG quality

async function getFileSize(filePath) {
    const stats = fs.statSync(filePath);
    return stats.size;
}

async function optimizeImage(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const size = getFileSize(filePath);

    // Skip if already under 1MB
    if (size <= MAX_SIZE) {
        return { skipped: true, original: size };
    }

    try {
        const image = sharp(filePath);
        const metadata = await image.metadata();

        let pipeline = image;

        // Resize if wider than MAX_WIDTH
        if (metadata.width > MAX_WIDTH) {
            pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
        }

        // Compress based on format
        if (ext === '.jpg' || ext === '.jpeg') {
            pipeline = pipeline.jpeg({ quality: QUALITY, mozjpeg: true });
        } else if (ext === '.png') {
            pipeline = pipeline.png({ quality: QUALITY, compressionLevel: 9 });
        } else if (ext === '.webp') {
            pipeline = pipeline.webp({ quality: QUALITY });
        }

        const outputBuffer = await pipeline.toBuffer();

        // Only save if smaller than original
        if (outputBuffer.length < size) {
            fs.writeFileSync(filePath, outputBuffer);
            return {
                optimized: true,
                original: size,
                new: outputBuffer.length,
                saved: size - outputBuffer.length
            };
        }

        return { unchanged: true, original: size };
    } catch (err) {
        return { error: err.message, original: size };
    }
}

async function walkDir(dir, callback) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            await walkDir(filePath, callback);
        } else {
            await callback(filePath);
        }
    }
}

async function main() {
    console.log('Starting image optimization...\n');

    let totalOriginal = 0;
    let totalNew = 0;
    let optimizedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    const imageExts = ['.jpg', '.jpeg', '.png', '.webp'];

    await walkDir(imagesDir, async (filePath) => {
        const ext = path.extname(filePath).toLowerCase();
        if (!imageExts.includes(ext)) return;

        const result = await optimizeImage(filePath);
        totalOriginal += result.original;

        if (result.optimized) {
            totalNew += result.new;
            optimizedCount++;
            console.log(`✓ Optimized: ${path.basename(filePath)} (${(result.original / 1024).toFixed(0)}KB → ${(result.new / 1024).toFixed(0)}KB, saved ${(result.saved / 1024).toFixed(0)}KB)`);
        } else if (result.skipped) {
            totalNew += result.original;
            skippedCount++;
        } else if (result.unchanged) {
            totalNew += result.original;
            skippedCount++;
        } else if (result.error) {
            totalNew += result.original;
            errorCount++;
            console.log(`✗ Error: ${path.basename(filePath)} - ${result.error}`);
        }
    });

    console.log('\n=== Summary ===');
    console.log(`Optimized: ${optimizedCount} files`);
    console.log(`Skipped (already small): ${skippedCount} files`);
    console.log(`Errors: ${errorCount} files`);
    console.log(`Original size: ${(totalOriginal / 1024 / 1024).toFixed(1)}MB`);
    console.log(`New size: ${(totalNew / 1024 / 1024).toFixed(1)}MB`);
    console.log(`Saved: ${((totalOriginal - totalNew) / 1024 / 1024).toFixed(1)}MB`);
}

main().catch(console.error);
