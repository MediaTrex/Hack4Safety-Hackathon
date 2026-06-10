const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sourceDir = 'C:\\Users\\VIPUL SHAH\\OneDrive\\Documents\\Figma Internship\\Internship\\Hack4safety\\Hack4Safety-Hackathon\\frontend\\WEB';
const outDir = 'C:\\Users\\VIPUL SHAH\\OneDrive\\Documents\\Figma Internship\\Internship\\Hack4safety\\Hack4Safety-Hackathon\\frontend\\WEB\\resized';

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.png'));

(async () => {
  for (const file of files) {
    const inputPath = path.join(sourceDir, file);
    const outputPath = path.join(outDir, file);
    await sharp(inputPath)
      .resize({ width: 1200, withoutEnlargement: true })
      .png({ quality: 80, compressionLevel: 9 })
      .toFile(outputPath);
    console.log(`Resized ${file}`);
  }
})();
