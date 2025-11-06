/*
  Generates PNG app icons from the brand SVG.
  Requires: sharp (npm i -D sharp)
*/

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const srcSvg = path.join(projectRoot, 'assets/brand/circle-logo.svg');
  const splashSvg = path.join(projectRoot, 'assets/brand/splash-screen.svg');
  const outDir = path.join(projectRoot, 'assets/app-icons');
  const imagesDir = path.join(projectRoot, 'assets/images');

  await ensureDir(outDir);
  await ensureDir(imagesDir);

  // App icons
  const appIconTargets = [
    { name: 'icon-1024.png', size: 1024 }, // iOS icon
    { name: 'icon-512.png', size: 512 },
    { name: 'icon-192.png', size: 192 },
    { name: 'adaptive-foreground-432.png', size: 432 }, // Android adaptive fg
  ];

  // Logo files for assets/images
  const logoTargets = [
    { name: 'logo-lg.png', size: 512 }, // Large logo
    { name: 'logo-sm.png', size: 256 }, // Small logo
    { name: 'logo.png', size: 256 }, // Default logo
  ];

  // Splash screen (high resolution for all devices)
  const splashTarget = {
    name: 'splash-screen.png',
    width: 1242,
    height: 2688,
  };

  for (const t of appIconTargets) {
    const outPath = path.join(outDir, t.name);
    await sharp(srcSvg)
      .resize(t.size, t.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outPath);
    // eslint-disable-next-line no-console
    console.log('Wrote', path.relative(projectRoot, outPath));
  }

  for (const t of logoTargets) {
    const outPath = path.join(imagesDir, t.name);
    await sharp(srcSvg)
      .resize(t.size, t.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outPath);
    // eslint-disable-next-line no-console
    console.log('Wrote', path.relative(projectRoot, outPath));
  }

  // Generate splash screen
  const splashPath = path.join(imagesDir, splashTarget.name);
  await sharp(splashSvg)
    .resize(splashTarget.width, splashTarget.height, { fit: 'contain', background: { r: 10, g: 10, b: 10, alpha: 1 } })
    .png()
    .toFile(splashPath);
  // eslint-disable-next-line no-console
  console.log('Wrote', path.relative(projectRoot, splashPath));
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});


