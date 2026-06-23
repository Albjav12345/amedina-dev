import fs from 'node:fs/promises';
import path from 'node:path';
import QRCode from 'qrcode';

const rootDir = path.resolve(import.meta.dirname, '..');
const outputDir = path.join(rootDir, 'public', 'assets', 'cv');

await fs.mkdir(outputDir, { recursive: true });
await QRCode.toFile(path.join(outputDir, 'qr-portfolio.png'), 'https://amedina.dev/', {
    type: 'png',
    width: 512,
    margin: 2,
    color: {
        dark: '#0d1828',
        light: '#fafcf8',
    },
    errorCorrectionLevel: 'M',
});

console.log('[cv-assets] QR code generated');
