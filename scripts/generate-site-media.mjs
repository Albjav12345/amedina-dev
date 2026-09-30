import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';
import { projectSources } from '../src/data/projectSources.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const sourcePortrait = path.join(rootDir, 'src', 'assets', 'source', 'alberto.png');
const publicAssets = path.join(rootDir, 'public', 'assets');
const portraitOutput = path.join(publicAssets, 'alberto.webp');
const socialOutput = path.join(publicAssets, 'og-amedina.png');

const escapeXml = (value) => String(value).replace(/[<>&"']/g, (character) => ({
  '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;',
}[character]));

async function createProjectWall() {
  // Use source thumbnails so this also works before project media is generated.
  const projects = projectSources.filter((project) => project.thumbnail);
  if (!projects.length) return '';

  const posters = await Promise.all(projects.map(async (project) => {
    const source = path.join(rootDir, 'public', project.thumbnail.replace(/^\//, ''));
    const buffer = await sharp(source)
      .rotate()
      .resize(280, 180, { fit: 'cover' })
      .modulate({ brightness: 0.72, saturation: 0.76 })
      .png()
      .toBuffer();
    return `data:image/png;base64,${buffer.toString('base64')}`;
  }));

  const cards = Array.from({ length: 20 }, (_, index) => {
    const projectIndex = (index * 2 + Math.floor(index / 5)) % projects.length;
    const project = projects[projectIndex];
    const x = (index % 5) * 298;
    const y = Math.floor(index / 5) * 198;
    return `
      <g transform="translate(${x} ${y})">
        <rect width="280" height="180" rx="14" fill="#10241F"/>
        <image width="280" height="180" href="${posters[projectIndex]}" clip-path="url(#project-clip)"/>
        <rect width="280" height="180" rx="14" fill="url(#project-shade)"/>
        <rect x="0.5" y="0.5" width="279" height="179" rx="14" fill="none" stroke="#57FFB9" stroke-opacity="0.42"/>
        <text x="12" y="164" fill="#EEFFF7" fill-opacity="0.8" font-family="DejaVu Sans Mono, Consolas, Courier New, monospace" font-size="10" font-weight="700">${escapeXml(project.title.toUpperCase())}</text>
        <text x="268" y="22" text-anchor="end" fill="#79FFC7" fill-opacity="0.66" font-family="DejaVu Sans Mono, Consolas, Courier New, monospace" font-size="10">${escapeXml((project.stack?.[0] || 'SYSTEM').toUpperCase())}</text>
      </g>`;
  }).join('');

  return `<g transform="translate(-125 -80) rotate(-5 720 395) skewX(3)">${cards}</g>`;
}

const createSocialCard = (projectWall) => `
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
    <clipPath id="canvas-clip"><rect width="1200" height="630" rx="36"/></clipPath>
    <clipPath id="project-clip"><rect width="280" height="180" rx="14"/></clipPath>
    <linearGradient id="project-shade" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#00FF99" stop-opacity="0.08"/>
      <stop offset="0.55" stop-color="#05100D" stop-opacity="0.12"/>
      <stop offset="1" stop-color="#05100D" stop-opacity="0.88"/>
    </linearGradient>
    <linearGradient id="copy-shade" x1="0" y1="0" x2="1" y2="0">
      <stop stop-color="#050A0A" stop-opacity="0.85"/>
      <stop offset="0.45" stop-color="#050A0A" stop-opacity="0.68"/>
      <stop offset="1" stop-color="#050A0A" stop-opacity="0.12"/>
    </linearGradient>
    <linearGradient id="vignette" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#070A0C" stop-opacity="0.35"/>
      <stop offset="0.4" stop-color="#070A0C" stop-opacity="0"/>
      <stop offset="1" stop-color="#070A0C" stop-opacity="0.8"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" rx="36" fill="url(#bg)"/>
  <rect width="1200" height="630" rx="36" fill="url(#grid)"/>
  <g clip-path="url(#canvas-clip)">
    ${projectWall}
    <rect width="1200" height="630" fill="url(#copy-shade)"/>
    <rect width="1200" height="630" fill="url(#vignette)"/>
  </g>
  <rect width="1200" height="630" rx="36" fill="url(#glow)"/>
  <rect x="56" y="54" width="1088" height="522" rx="28" fill="#0B0D11" fill-opacity="0.16" stroke="#FFFFFF" stroke-opacity="0.10"/>
  <circle cx="88" cy="89" r="6" fill="#00FF99"/>
  <text x="108" y="97" fill="#00FF99" font-family="Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="4">AMEDINA.DEV</text>
  <text x="84" y="270" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="96" font-weight="800" letter-spacing="-3">ALBERTO</text>
  <text x="84" y="366" fill="#00FF99" font-family="Arial, sans-serif" font-size="96" font-weight="800" letter-spacing="-3">MEDINA</text>
  <text x="88" y="418" fill="#C6D0CC" font-family="Arial, sans-serif" font-size="25" font-weight="500">Full-stack systems, automation workflows, and AI products.</text>
  <rect x="84" y="478" width="582" height="48" rx="24" fill="#00FF99" fill-opacity="0.09" stroke="#00FF99" stroke-opacity="0.28"/>
  <text x="108" y="510" fill="#9FFFD5" font-family="DejaVu Sans Mono, Consolas, Courier New, monospace" font-size="18" font-weight="700" letter-spacing="2">PRODUCTS / AUTOMATION / AI</text>
  <text x="918" y="520" fill="#8FA39B" font-family="DejaVu Sans Mono, Consolas, Courier New, monospace" font-size="16" letter-spacing="2">SPAIN / REMOTE</text>
</svg>`;

export async function generateSiteMedia() {
  await fs.mkdir(publicAssets, { recursive: true });

  await sharp(sourcePortrait)
    .rotate()
    .resize({ width: 720, height: 720, fit: 'cover', position: 'centre', withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(portraitOutput);

  const socialCard = createSocialCard(await createProjectWall());
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
