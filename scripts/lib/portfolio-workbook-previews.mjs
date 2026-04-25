import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

import ffmpegPath from 'ffmpeg-static';
import sharp from 'sharp';

const PREVIEW_PIPELINE_VERSION = 1;
const PREVIEW_WIDTH = 220;
const PREVIEW_HEIGHT = 144;
const PREVIEW_BG = { r: 11, g: 18, b: 26, alpha: 1 };
const PREVIEW_CACHE_DIRNAME = 'portfolio-workbook-previews';

function slugify(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
}

async function ensureDir(targetDir) {
    await fs.mkdir(targetDir, { recursive: true });
}

async function fileExists(targetPath) {
    try {
        await fs.access(targetPath);
        return true;
    } catch {
        return false;
    }
}

async function readJson(targetPath, fallbackValue) {
    try {
        const raw = await fs.readFile(targetPath, 'utf8');
        return JSON.parse(raw);
    } catch {
        return fallbackValue;
    }
}

async function writeJson(targetPath, value) {
    await ensureDir(path.dirname(targetPath));
    await fs.writeFile(targetPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function createHash(input) {
    return crypto.createHash('sha1').update(input).digest('hex');
}

function createPlaceholderSvg({ title, subtitle, accent = '#14f195', badge = 'ASSET' }) {
    const safeTitle = String(title || 'Asset').slice(0, 42);
    const safeSubtitle = String(subtitle || '').slice(0, 58);
    const safeBadge = String(badge || 'ASSET').slice(0, 18);

    return `
    <svg width="${PREVIEW_WIDTH}" height="${PREVIEW_HEIGHT}" viewBox="0 0 ${PREVIEW_WIDTH} ${PREVIEW_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0b1119" />
          <stop offset="100%" stop-color="#132533" />
        </linearGradient>
        <linearGradient id="line" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.95" />
          <stop offset="100%" stop-color="#7dd3fc" stop-opacity="0.75" />
        </linearGradient>
      </defs>
      <rect width="${PREVIEW_WIDTH}" height="${PREVIEW_HEIGHT}" rx="18" fill="url(#bg)" />
      <rect x="1.5" y="1.5" width="${PREVIEW_WIDTH - 3}" height="${PREVIEW_HEIGHT - 3}" rx="16.5" fill="none" stroke="rgba(255,255,255,0.12)" />
      <path d="M20 36h180" stroke="rgba(255,255,255,0.06)" />
      <path d="M20 108h180" stroke="rgba(255,255,255,0.06)" />
      <rect x="20" y="18" width="62" height="20" rx="10" fill="rgba(20,241,149,0.12)" stroke="url(#line)" />
      <text x="51" y="31.5" fill="#14f195" text-anchor="middle" font-size="10" font-family="Consolas, monospace" letter-spacing="2">${safeBadge}</text>
      <text x="20" y="72" fill="#ffffff" font-size="20" font-weight="700" font-family="Segoe UI, Arial, sans-serif">${safeTitle}</text>
      <text x="20" y="96" fill="#9fb4c8" font-size="12" font-family="Segoe UI, Arial, sans-serif">${safeSubtitle}</text>
      <circle cx="182" cy="96" r="24" fill="rgba(20,241,149,0.08)" stroke="url(#line)" />
      <path d="M171 97h22M182 86v22" stroke="${accent}" stroke-width="3" stroke-linecap="round" />
    </svg>
  `;
}

async function renderPlaceholder(targetPath, options) {
    const svg = createPlaceholderSvg(options);
    await ensureDir(path.dirname(targetPath));
    await sharp(Buffer.from(svg))
        .png()
        .toFile(targetPath);
}

async function rasterizeImage(sourcePath, targetPath) {
    await ensureDir(path.dirname(targetPath));
    await sharp(sourcePath, { density: 240 })
        .resize(PREVIEW_WIDTH, PREVIEW_HEIGHT, {
            fit: 'contain',
            background: PREVIEW_BG,
        })
        .png()
        .toFile(targetPath);
}

function runFfmpeg(args, label) {
    return new Promise((resolve, reject) => {
        const child = spawn(ffmpegPath, args, {
            stdio: ['ignore', 'pipe', 'pipe'],
        });

        let stderr = '';
        child.stderr.on('data', (chunk) => {
            stderr += chunk.toString();
        });

        child.on('error', (error) => {
            reject(new Error(`[preview] Failed to spawn ffmpeg for ${label}: ${error.message}`));
        });

        child.on('exit', (code) => {
            if (code === 0) {
                resolve();
                return;
            }

            reject(new Error(`[preview] ffmpeg failed for ${label} (exit ${code}).\n${stderr}`));
        });
    });
}

async function extractVideoFrame(sourcePath, targetPath, label) {
    if (!ffmpegPath) {
        throw new Error('[preview] ffmpeg-static is unavailable. Video preview extraction cannot run.');
    }

    await ensureDir(path.dirname(targetPath));
    await runFfmpeg([
        '-y',
        '-ss', '0.45',
        '-i', sourcePath,
        '-frames:v', '1',
        '-vf', `scale=${PREVIEW_WIDTH}:-2:flags=lanczos`,
        targetPath,
    ], label);
}

async function getFileSignature(sourcePath) {
    if (!sourcePath || !(await fileExists(sourcePath))) return 'missing';
    const stats = await fs.stat(sourcePath);
    return `${sourcePath}:${stats.size}:${Math.round(stats.mtimeMs)}`;
}

function getCachePaths(rootDir) {
    const cacheDir = path.join(rootDir, 'node_modules', '.cache', PREVIEW_CACHE_DIRNAME);
    return {
        cacheDir,
        manifestPath: path.join(cacheDir, 'manifest.json'),
    };
}

function buildVideoPosterMap(masterData) {
    const byVideoAssetId = new Map();

    for (const project of masterData.projectEntries || []) {
        if (project.videoAssetId && project.thumbnailAssetId) {
            byVideoAssetId.set(String(project.videoAssetId), String(project.thumbnailAssetId));
        }
    }

    return byVideoAssetId;
}

function resolveLinkHref(targetPathOrUrl) {
    if (!targetPathOrUrl) return null;
    if (/^https?:\/\//i.test(targetPathOrUrl)) return targetPathOrUrl;

    const absolutePath = path.resolve(targetPathOrUrl);
    return `file:///${absolutePath.replace(/\\/g, '/')}`;
}

export function getPreviewExtensionLabel(asset) {
    if (!asset.previewSourcePath) return asset.kind.toUpperCase();
    return path.extname(asset.previewSourcePath).replace('.', '').toUpperCase() || asset.kind.toUpperCase();
}

export async function buildAssetPreviewIndex(masterData, resolvedAssets, { rootDir }) {
    const { cacheDir, manifestPath } = getCachePaths(rootDir);
    const previousManifest = await readJson(manifestPath, {});
    const nextManifest = {};
    const staleFiles = new Set(Object.values(previousManifest).map((entry) => entry?.previewPath).filter(Boolean));
    const videoPosterMap = buildVideoPosterMap(masterData);
    const assetsById = new Map(resolvedAssets.map((asset) => [asset.assetId, asset]));
    const index = new Map();

    await ensureDir(cacheDir);

    for (const asset of resolvedAssets) {
        const safeStem = slugify(asset.assetId) || createHash(asset.assetId).slice(0, 12);
        const previewPath = path.join(cacheDir, `${safeStem}.png`);
        const sourceExtension = path.extname(asset.previewSourcePath ?? '').toLowerCase();
        const existingManifestEntry = previousManifest[asset.assetId];
        const posterAssetId = videoPosterMap.get(asset.assetId);
        const posterAsset = posterAssetId ? assetsById.get(posterAssetId) : null;

        let previewMode = 'placeholder';
        let previewSourcePath = asset.previewSourcePath ?? null;
        let previewLabel = getPreviewExtensionLabel(asset);
        let placeholderTitle = asset.assetId;
        let placeholderSubtitle = asset.resolvedUrl || asset.notes || asset.kind;

        if (asset.enabled) {
            if (asset.kind === 'video') {
                if (posterAsset?.previewSourcePath) {
                    previewMode = 'poster-image';
                    previewSourcePath = posterAsset.previewSourcePath;
                    previewLabel = 'POSTER';
                } else if (asset.previewSourcePath) {
                    previewMode = 'video-frame';
                    previewSourcePath = asset.previewSourcePath;
                    previewLabel = 'VIDEO';
                }
            } else if (previewSourcePath) {
                if (sourceExtension === '.ico') {
                    previewMode = 'placeholder';
                    previewLabel = 'ICO';
                } else if (['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(sourceExtension)) {
                    previewMode = 'image';
                } else {
                    previewMode = 'placeholder';
                }
            } else if (/^https?:\/\//i.test(asset.resolvedUrl || '')) {
                previewMode = 'placeholder';
                previewLabel = 'URL';
            }
        } else {
            previewLabel = 'OFF';
            placeholderSubtitle = 'Disabled asset';
        }

        const signature = [
            PREVIEW_PIPELINE_VERSION,
            asset.assetId,
            asset.kind,
            asset.mode,
            asset.resolvedUrl,
            previewMode,
            previewLabel,
            await getFileSignature(previewSourcePath),
            posterAsset ? await getFileSignature(posterAsset.previewSourcePath) : '',
        ].join('|');

        const hasUsableCache = existingManifestEntry?.signature === signature && await fileExists(existingManifestEntry.previewPath);

        if (!hasUsableCache) {
            try {
                if (previewMode === 'image' || previewMode === 'poster-image') {
                    await rasterizeImage(previewSourcePath, previewPath);
                } else if (previewMode === 'video-frame') {
                    const rawFramePath = path.join(cacheDir, `${safeStem}.frame.png`);
                    await extractVideoFrame(previewSourcePath, rawFramePath, asset.assetId);
                    await rasterizeImage(rawFramePath, previewPath);
                } else {
                    await renderPlaceholder(previewPath, {
                        title: asset.assetId,
                        subtitle: placeholderSubtitle,
                        badge: previewLabel,
                    });
                }
            } catch {
                previewMode = 'placeholder';
                previewLabel = 'FALLBACK';
                await renderPlaceholder(previewPath, {
                    title: asset.assetId,
                    subtitle: placeholderSubtitle,
                    badge: previewLabel,
                });
            }
        }

        nextManifest[asset.assetId] = {
            signature,
            previewPath,
        };
        staleFiles.delete(existingManifestEntry?.previewPath);

        index.set(asset.assetId, {
            assetId: asset.assetId,
            previewPath,
            previewMode,
            previewLabel,
            sourceHref: resolveLinkHref(
                asset.mode === 'import_local'
                    ? (path.isAbsolute(asset.sourceValue) ? asset.sourceValue : path.resolve(rootDir, asset.sourceValue))
                    : previewSourcePath,
            ),
            resolvedHref: resolveLinkHref(
                /^https?:\/\//i.test(asset.resolvedUrl || '')
                    ? asset.resolvedUrl
                    : asset.resolvedUrl
                        ? path.join(rootDir, 'public', asset.resolvedUrl.replace(/^\//, ''))
                        : '',
            ),
        });
    }

    await Promise.all(
        [...staleFiles]
            .filter(Boolean)
            .map(async (targetPath) => {
                if (await fileExists(targetPath)) {
                    await fs.rm(targetPath, { force: true });
                }
            }),
    );

    await writeJson(manifestPath, nextManifest);
    return index;
}
