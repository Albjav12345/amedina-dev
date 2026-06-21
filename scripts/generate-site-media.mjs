import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const sourcePortrait = path.join(rootDir, 'src', 'assets', 'source', 'alberto.png');
const publicAssets = path.join(rootDir, 'public', 'assets');
const portraitOutput = path.join(publicAssets, 'alberto.webp');
const socialOutput = path.join(publicAssets, 'og-amedina.png');

const socialCard = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop stop-color="#07100D"/>
      <stop offset="0.58" stop-color="#0B0C10"/>
      <stop offset="1" stop-color="#071419"/>
    </linearGradient>
    <radialGradient id="glow" cx="0" cy="0" r="1" gradientTransform="translate(954 96) rotate(132) scale(540 620)" gradientUnits="userSpaceOnUse">
      <stop stop-color="#00FF99" stop-opacity="0.24"/>
      <stop offset="1" stop-color="#00FF99" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="#00FF99" stroke-opacity="0.07"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" rx="36" fill="url(#bg)"/>
  <rect width="1200" height="630" rx="36" fill="url(#grid)"/>
  <rect width="1200" height="630" rx="36" fill="url(#glow)"/>
  <rect x="56" y="54" width="1088" height="522" rx="28" fill="#0B0D11" fill-opacity="0.58" stroke="#FFFFFF" stroke-opacity="0.10"/>
  <circle cx="88" cy="89" r="6" fill="#00FF99"/>
  <text x="108" y="97" fill="#00FF99" font-family="Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="4">AMEDINA.DEV</text>
  <text x="84" y="270" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="84" font-weight="800" letter-spacing="-3">ALBERTO</text>
  <text x="84" y="356" fill="#00FF99" font-family="Arial, sans-serif" font-size="84" font-weight="800" letter-spacing="-3">MEDINA</text>
  <text x="88" y="418" fill="#C6D0CC" font-family="Arial, sans-serif" font-size="25" font-weight="500">Full-stack systems, automation workflows, and AI products.</text>
  <rect x="84" y="478" width="582" height="48" rx="24" fill="#00FF99" fill-opacity="0.09" stroke="#00FF99" stroke-opacity="0.28"/>
  <text x="108" y="510" fill="#9FFFD5" font-family="monospace" font-size="18" font-weight="700" letter-spacing="2">PRODUCTS / AUTOMATION / AI</text>
  <text x="918" y="520" fill="#8FA39B" font-family="monospace" font-size="16" letter-spacing="2">SPAIN / REMOTE</text>
</svg>`;

export async function generateSiteMedia() {
  await fs.mkdir(publicAssets, { recursive: true });

  await sharp(sourcePortrait)
    .rotate()
    .resize({ width: 720, height: 720, fit: 'cover', position: 'centre', withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(portraitOutput);

  await sharp(Buffer.from(socialCard))
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(socialOutput);

  console.log(`[site-media] portrait -> ${path.relative(rootDir, portraitOutput)}`);
  console.log(`[site-media] social card -> ${path.relative(rootDir, socialOutput)}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  generateSiteMedia().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
