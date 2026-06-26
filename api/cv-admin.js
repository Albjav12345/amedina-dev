import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { applySecurityHeaders, isAllowedOrigin } from './lib/security.js';
import {
    checkLoginRate,
    clearFailedLogins,
    clearCvSessionCookie,
    createCvSession,
    hasValidCsrf,
    isCvAdminConfigured,
    readCvSession,
    recordFailedLogin,
    setCvSessionCookie,
    verifyPassword,
} from './lib/cv-auth.js';
import { buildCvArtifacts as buildCvArtifactsStatic } from './lib/cv-pdf.js';
import { publishCvArtifacts } from './lib/cv-publish.js';

export const config = { maxDuration: 60 };

const MAX_DOCUMENT_BYTES = 300_000;

function getAction(req) {
    return String(req.query?.action || req.body?.action || '').trim().toLowerCase();
}

function validateCvData(candidate) {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
        throw new Error('CV_DATA_INVALID');
    }
    const serialized = JSON.stringify(candidate);
    if (Buffer.byteLength(serialized, 'utf8') > MAX_DOCUMENT_BYTES) {
        throw new Error('CV_DATA_TOO_LARGE');
    }
    if (candidate.schemaVersion !== 1 || !candidate.identity?.firstName || !candidate.identity?.lastName) {
        throw new Error('CV_DATA_SCHEMA_INVALID');
    }
    return structuredClone(candidate);
}

async function readPublishedData() {
    const filePath = path.join(process.cwd(), 'src', 'data', 'cv', 'published.json');
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

async function loadCvArtifactBuilder() {
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') return buildCvArtifactsStatic;

    const modulePath = path.join(process.cwd(), 'api', 'lib', 'cv-pdf.js');
    const moduleStats = await fs.stat(modulePath);
    const moduleUrl = pathToFileURL(modulePath).href;
    const module = await import(`${moduleUrl}?updated=${Math.trunc(moduleStats.mtimeMs)}`);
    return module.buildCvArtifacts;
}

export default async function handler(req, res) {
    applySecurityHeaders(res);

    if (!isAllowedOrigin(req.headers.origin)) {
        return res.status(403).json({ message: 'ORIGIN_NOT_ALLOWED' });
    }

    const action = getAction(req);

    if (action === 'login') {
        if (req.method !== 'POST') return res.status(405).json({ message: 'METHOD_NOT_ALLOWED' });
        if (!isCvAdminConfigured()) return res.status(503).json({ message: 'CV_ADMIN_NOT_CONFIGURED' });
        if (!checkLoginRate(req)) return res.status(429).json({ message: 'TOO_MANY_LOGIN_ATTEMPTS' });
        if (!verifyPassword(req.body?.password || '')) {
            recordFailedLogin(req);
            return res.status(401).json({ message: 'INVALID_CREDENTIALS' });
        }

        clearFailedLogins(req);
        const { session, token } = createCvSession();
        setCvSessionCookie(res, token);
        return res.status(200).json({ authenticated: true, csrf: session.csrf, data: await readPublishedData() });
    }

    const session = readCvSession(req);
    if (!session) return res.status(401).json({ authenticated: false, message: 'AUTHENTICATION_REQUIRED' });

    if (action === 'session') {
        if (req.method !== 'GET') return res.status(405).json({ message: 'METHOD_NOT_ALLOWED' });
        return res.status(200).json({ authenticated: true, csrf: session.csrf, data: await readPublishedData() });
    }

    if (!hasValidCsrf(req, session)) {
        return res.status(403).json({ message: 'CSRF_VALIDATION_FAILED' });
    }

    if (action === 'logout') {
        if (req.method !== 'POST') return res.status(405).json({ message: 'METHOD_NOT_ALLOWED' });
        clearCvSessionCookie(res);
        return res.status(200).json({ authenticated: false });
    }

    if (req.method !== 'POST') return res.status(405).json({ message: 'METHOD_NOT_ALLOWED' });

    try {
        const data = validateCvData(req.body?.data);
        const current = await readPublishedData();
        const buildCvArtifacts = await loadCvArtifactBuilder();

        if (action === 'preview') {
            const { pdf } = await buildCvArtifacts(data);
            res.status(200);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="Alberto_Medina_CV_preview.pdf"');
            return res.send(pdf);
        }

        if (action === 'publish') {
            data.publication = {
                updatedAt: new Date().toISOString(),
                revision: Number(current.publication?.revision || 0) + 1,
            };
            const { html, pdf } = await buildCvArtifacts(data);
            const publication = await publishCvArtifacts({ data, html, pdf });
            return res.status(200).json({
                published: true,
                revision: data.publication.revision,
                updatedAt: data.publication.updatedAt,
                publication,
            });
        }

        return res.status(404).json({ message: 'ACTION_NOT_FOUND' });
    } catch (error) {
        console.error('[cv-admin]', error);
        const knownClientError = ['CV_DATA_INVALID', 'CV_DATA_TOO_LARGE', 'CV_DATA_SCHEMA_INVALID'].includes(error?.message);
        return res.status(knownClientError ? 400 : 500).json({
            message: knownClientError ? error.message : 'CV_ADMIN_OPERATION_FAILED',
            details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
        });
    }
}
