import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import ffmpegPath from 'ffmpeg-static';

import { projectSources } from '../src/data/projectSources.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const outputDir = path.join(publicDir, 'assets', 'generated', 'projects');
const manifestPath = path.join(rootDir, 'src', 'data', 'generated', 'projectMediaManifest.json');
const cachePath = path.join(rootDir, 'node_modules', '.cache', 'amedina-project-media.json');

const PIPELINE_VERSION = 1;

const previewConfig = {
  suffix: 'preview',
  durationSeconds: 4.2,
  maxWidth: 640,
  fps: 18,
  crf: 31,
  maxRate: '900k',
  bufSize: '1800k',
  preset: 'veryfast',
};

const modalConfig = {
  suffix: 'modal',
  maxWidth: 1280,
  crf: 24,
  preset: 'medium',
  audioBitrate: '128k',
};

function toPosixPath(targetPath) {
  return targetPath.split(path.sep).join('/');
}

function resolvePublicAsset(assetPath) {
  const normalized = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
  return path.join(publicDir, normalized);
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

async function fileExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(targetDir) {
  await fs.mkdir(targetDir, { recursive: true });
}

async function readCache() {
  try {
    const raw = await fs.readFile(cachePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeCache(cache) {
  await ensureDir(path.dirname(cachePath));
  await fs.writeFile(cachePath, `${JSON.stringify(cache, null, 2)}\n`, 'utf8');
}

function runFfmpeg(args, sourceLabel) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, args, {
      cwd: rootDir,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stderr = '';
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      reject(new Error(`[media] Failed to spawn ffmpeg for ${sourceLabel}: ${error.message}`));
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`[media] ffmpeg failed for ${sourceLabel} (exit ${code}).\n${stderr}`));
    });
  });
}

async function generatePreview(sourcePath, outputPath, project) {
  const previewFilter = [
    `fps=${previewConfig.fps}`,
    `scale=${previewConfig.maxWidth}:-2:flags=lanczos:force_original_aspect_ratio=decrease`,
    'pad=ceil(iw/2)*2:ceil(ih/2)*2',
  ].join(',');

  const args = [
    '-y',
    '-ss', '0',
    '-t', String(previewConfig.durationSeconds),
    '-i', sourcePath,
    '-map', '0:v:0',
    '-an',
    '-vf', previewFilter,
    '-c:v', 'libx264',
    '-preset', previewConfig.preset,
    '-crf', String(previewConfig.crf),
    '-maxrate', previewConfig.maxRate,
    '-bufsize', previewConfig.bufSize,
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    outputPath,
  ];

  await runFfmpeg(args, `${project.title} preview`);
}

async function generateModalVideo(sourcePath, outputPath, project) {
  const modalFilter = [
    `scale=${modalConfig.maxWidth}:-2:flags=lanczos:force_original_aspect_ratio=decrease`,
    'pad=ceil(iw/2)*2:ceil(ih/2)*2',
  ].join(',');

  const args = [
    '-y',
    '-i', sourcePath,
    '-map', '0:v:0',
    '-map', '0:a?',
    '-vf', modalFilter,
    '-c:v', 'libx264',
    '-preset', modalConfig.preset,
    '-crf', String(modalConfig.crf),
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    '-c:a', 'aac',
    '-b:a', modalConfig.audioBitrate,
    outputPath,
  ];

  await runFfmpeg(args, `${project.title} modal`);
}

async function generatePoster(sourcePath, outputPath, project) {
  const args = [
    '-y',
    '-ss', '0.5',
    '-i', sourcePath,
    '-frames:v', '1',
    '-q:v', '2',
    outputPath,
  ];

  await runFfmpeg(args, `${project.title} poster`);
}

function getDerivationSignature(project, sourceStats) {
  return [
    PIPELINE_VERSION,
    project.id,
    project.videoSource || '',
    project.thumbnail || '',
    sourceStats.size,
    Math.round(sourceStats.mtimeMs),
    previewConfig.durationSeconds,
    previewConfig.maxWidth,
    previewConfig.fps,
    previewConfig.crf,
    modalConfig.maxWidth,
    modalConfig.crf,
  ].join(':');
}

async function outputsExist(cacheEntry) {
  if (!cacheEntry) {
    return false;
  }

  const targets = [cacheEntry.previewPath, cacheEntry.modalPath, cacheEntry.posterPath].filter(Boolean);
  const checks = await Promise.all(targets.map((targetPath) => fileExists(targetPath)));

  return checks.every(Boolean);
}

export async function generateProjectMedia() {
  if (!ffmpegPath) {
    throw new Error('[media] ffmpeg-static is unavailable. Project media derivation cannot run.');
  }

  await ensureDir(outputDir);

  const cache = await readCache();
  const nextCache = {};
  const manifest = {};
  const activeOutputs = new Set();

  for (const project of projectSources) {
    if (!project.videoSource) {
      manifest[String(project.id)] = {
        poster: project.thumbnail || null,
        cardPreview: null,
        modalVideo: null,
      };
      continue;
    }

    const sourcePath = resolvePublicAsset(project.videoSource);
    const sourceStats = await fs.stat(sourcePath);
    const sourceStem = slugify(path.basename(project.videoSource, path.extname(project.videoSource)) || project.title);
    const previewPath = path.join(outputDir, `${sourceStem}.${previewConfig.suffix}.mp4`);
    const modalPath = path.join(outputDir, `${sourceStem}.${modalConfig.suffix}.mp4`);

    let posterPublicPath = project.thumbnail || null;
    let posterPath = posterPublicPath ? resolvePublicAsset(posterPublicPath) : path.join(outputDir, `${sourceStem}.poster.jpg`);

    const signature = getDerivationSignature(project, sourceStats);
    const cacheEntry = cache[String(project.id)];
    const outputsAreReady = cacheEntry?.signature === signature && await outputsExist(cacheEntry);

    if (!outputsAreReady) {
      await generatePreview(sourcePath, previewPath, project);
      await generateModalVideo(sourcePath, modalPath, project);

      if (!posterPublicPath || !(await fileExists(posterPath))) {
        posterPath = path.join(outputDir, `${sourceStem}.poster.jpg`);
        await generatePoster(sourcePath, posterPath, project);
        posterPublicPath = `/${toPosixPath(path.relative(publicDir, posterPath))}`;
      }
    } else if (!posterPublicPath && cacheEntry.posterPublicPath) {
      posterPublicPath = cacheEntry.posterPublicPath;
      posterPath = cacheEntry.posterPath;
    }

    const previewPublicPath = `/${toPosixPath(path.relative(publicDir, previewPath))}`;
    const modalPublicPath = `/${toPosixPath(path.relative(publicDir, modalPath))}`;

    manifest[String(project.id)] = {
      poster: posterPublicPath,
      cardPreview: previewPublicPath,
      modalVideo: modalPublicPath,
    };

    activeOutputs.add(previewPath);
    activeOutputs.add(modalPath);
    if (posterPublicPath && posterPath.startsWith(outputDir)) {
      activeOutputs.add(posterPath);
    }

    nextCache[String(project.id)] = {
      signature,
      previewPath,
      modalPath,
      posterPath,
      posterPublicPath,
    };
  }

  const existingGeneratedFiles = await fs.readdir(outputDir).catch(() => []);
  await Promise.all(existingGeneratedFiles.map(async (filename) => {
    const targetPath = path.join(outputDir, filename);
    if (!activeOutputs.has(targetPath)) {
      await fs.rm(targetPath, { force: true });
    }
  }));

  await ensureDir(path.dirname(manifestPath));
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  await writeCache(nextCache);
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  generateProjectMedia().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
