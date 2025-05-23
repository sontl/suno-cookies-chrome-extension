import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const sizes = [16, 48, 128];
const sourceSvg = path.join(process.cwd(), 'icons', 'icon.svg');
const outputDir = path.join(process.cwd(), 'icons');

async function generateIcons() {
  try {
    // Read the SVG file
    const svgBuffer = await fs.readFile(sourceSvg);

    // Generate each size
    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon${size}.png`);
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`Generated ${size}x${size} icon`);
    }
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons(); 