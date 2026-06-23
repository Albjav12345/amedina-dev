import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import QRCode from 'qrcode';
import { buildCvHtml as buildCvHtmlStatic } from '../../shared/cv/template.js';

const LOCAL_BROWSER_CANDIDATES = [
    process.env.CV_CHROME_PATH,
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
].filter(Boolean);

async function findLocalBrowser() {
    for (const candidate of LOCAL_BROWSER_CANDIDATES) {
        try {
            await fs.access(candidate);
            return candidate;
        } catch {
            // Try the next installed browser.
        }
    }
    return '';
}

async function fileToDataUrl(filePath, mimeType) {
    const buffer = await fs.readFile(filePath);
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

function imageMime(filePath) {
    const extension = path.extname(filePath).toLowerCase();
    return ({ '.avif': 'image/avif', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp' })[extension] || '';
}

async function resolvePortraitDataUrl(rootDir, configuredUrl) {
    const publicRoot = path.resolve(rootDir, 'public');
    const assetPath = String(configuredUrl || '/assets/alberto.webp').split(/[?#]/, 1)[0];
    if (!assetPath.startsWith('/')) throw new Error('PORTRAIT_MUST_BE_A_PUBLIC_ASSET');

    const resolved = path.resolve(publicRoot, `.${decodeURIComponent(assetPath)}`);
    if (resolved !== publicRoot && !resolved.startsWith(`${publicRoot}${path.sep}`)) throw new Error('INVALID_PORTRAIT_PATH');
    const mimeType = imageMime(resolved);
    if (!mimeType) throw new Error('UNSUPPORTED_PORTRAIT_FORMAT');
    return fileToDataUrl(resolved, mimeType);
}

async function loadCvTemplateRenderer(rootDir) {
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') return buildCvHtmlStatic;

    const templatePath = path.join(rootDir, 'shared', 'cv', 'template.js');
    const templateStats = await fs.stat(templatePath);
    const templateUrl = pathToFileURL(templatePath).href;
    const templateModule = await import(`${templateUrl}?updated=${Math.trunc(templateStats.mtimeMs)}`);
    return templateModule.buildCvHtml;
}

async function launchBrowser() {
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
        return puppeteer.launch({
            args: await puppeteer.defaultArgs({ args: chromium.args, headless: 'shell' }),
            defaultViewport: { width: 794, height: 1123, deviceScaleFactor: 1 },
            executablePath: await chromium.executablePath(),
            headless: 'shell',
        });
    }

    const executablePath = await findLocalBrowser();
    if (!executablePath) throw new Error('LOCAL_CHROMIUM_NOT_FOUND');

    return puppeteer.launch({
        executablePath,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: { width: 794, height: 1123, deviceScaleFactor: 1 },
    });
}

export async function buildCvArtifacts(data) {
    const rootDir = process.cwd();
    const buildCvHtml = await loadCvTemplateRenderer(rootDir);
    const portraitUrl = await resolvePortraitDataUrl(rootDir, data.assets?.portraitUrl);
    const qrUrl = await QRCode.toDataURL(data.portfolio?.url || 'https://amedina.dev/', {
        width: 512,
        margin: 2,
        color: { dark: '#0d1828', light: '#fafcf8' },
        errorCorrectionLevel: 'M',
    });
    const html = buildCvHtml(data, { portraitUrl, qrUrl });
    const browser = await launchBrowser();

    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
        await page.emulateMediaType('print');
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            tagged: true,
        });
        return { html, pdf: Buffer.from(pdf) };
    } finally {
        await browser.close();
    }
}
