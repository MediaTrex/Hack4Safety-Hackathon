const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sourceDir = 'C:\\Users\\VIPUL SHAH\\OneDrive\\Documents\\Figma Internship\\Internship\\Hack4safety\\Hack4Safety-Hackathon\\frontend\\WEB\\thumbs';
const outDir = 'C:\\Users\\VIPUL SHAH\\OneDrive\\Documents\\Figma Internship\\Internship\\Hack4safety\\Hack4Safety-Hackathon\\frontend\\WEB\\small';

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.png'));

(async () => {
  for (const file of files) {
    const inputPath = path.join(sourceDir, file);
    const outputPath = path.join(outDir, file.replace('.png', '.jpg'));
    await sharp(inputPath)
      .resize({ width: 400, withoutEnlargement: true })
      .jpeg({ quality: 50, progressive: true })
      .toFile(outputPath);
    const stats = fs.statSync(outputPath);
    console.log(`${file.replace('.png', '.jpg')}: ${(stats.size / 1024).toFixed(1)}KB`);
  }
})();
