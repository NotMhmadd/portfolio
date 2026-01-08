const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PROFILE_PATH = './public/images/profile.png';
const OUTPUT_PATH = './public/og-image.jpg';

async function createOGImage() {
    try {
        // 1. Define dimensions
        const width = 1200;
        const height = 630;
        const bg = '#F5F3EE'; // Hero background

        // 2. Prepare Profile Image
        // Resize profile to fit height of 630 (or slightly less to have padding)
        // 1500x2000 -> resize to height 630 -> width approx 472
        const profileBuffer = await sharp(PROFILE_PATH)
            .resize({ height: 630, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .toBuffer();

        // 3. Create SVG for Text and Background
        // Navy color: #1a237e
        const svgImage = `
    <svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${width}" height="${height}" fill="${bg}"/>
      
      <!-- Decorative Elements (Scrappy style) -->
      <circle cx="50" cy="50" r="100" fill="none" stroke="#1a237e" stroke-width="2" stroke-opacity="0.1" stroke-dasharray="10 10" />
      <path d="M1100 50 L1150 100" stroke="#1a237e" stroke-width="3" stroke-opacity="0.2" />
      <path d="M1150 50 L1100 100" stroke="#1a237e" stroke-width="3" stroke-opacity="0.2" />

      <!-- Text Content -->
      <text x="80" y="280" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#6366F1" letter-spacing="3">EST. 2026 // LEBANON</text>
      
      <text x="80" y="340" font-family="Arial, sans-serif" font-size="60" font-weight="900" fill="#0a0a0a" letter-spacing="-1">MOHAMAD</text>
      <text x="80" y="400" font-family="Arial, sans-serif" font-size="60" font-weight="900" fill="#0a0a0a" letter-spacing="-1">GHAZAL</text>
      
      <rect x="80" y="430" width="60" height="4" fill="#1a237e" />
      
      <text x="80" y="480" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#1a237e">GRAPHIC DESIGNER</text>
      <text x="80" y="520" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#1a237e">&amp; AI SPECIALIST</text>
    </svg>
    `;

        // 4. Composite
        await sharp(Buffer.from(svgImage))
            .composite([
                { input: profileBuffer, gravity: 'northeast' } // Place profile on the right
            ])
            .toFile(OUTPUT_PATH);

        console.log(`Created OG Image at ${OUTPUT_PATH}`);

    } catch (error) {
        console.error('Error creating OG image:', error);
    }
}

createOGImage();
