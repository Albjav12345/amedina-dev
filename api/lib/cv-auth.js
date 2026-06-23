import crypto from 'node:crypto';

const COOKIE_NAME = 'amedina_cv_session';
const SESSION_TTL_SECONDS = 8 * 60 * 60;
const loginAttempts = new Map();

function base64url(value) {
    return Buffer.from(value).toString('base64url');
}

function getSecret() {
    return process.env.CV_SESSION_SECRET || '';
}

function sign(payload) {
    return crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

function safeEqual(left, right) {
    const leftBuffer = Buffer.from(String(left));
    const rightBuffer = Buffer.from(String(right));
    if (leftBuffer.length !== rightBuffer.length) return false;
    return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function parseCookies(req) {
    return Object.fromEntries(String(req.headers.cookie || '')
        .split(';')
        .map(part => part.trim())
        .filter(Boolean)
        .map(part => {
            const separator = part.indexOf('=');
            return separator === -1
                ? [part, '']
                : [part.slice(0, separator), safeDecode(part.slice(separator + 1))];
        }));
}

function safeDecode(value) {
    try {
        return decodeURIComponent(value);
    } catch {
        return '';
    }
}

function getClientKey(req) {
    return String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
}

export function isCvAdminConfigured() {
    return Boolean(process.env.CV_ADMIN_PASSWORD && getSecret());
}

export function checkLoginRate(req) {
    const key = getClientKey(req);
    const now = Date.now();
    const recent = (loginAttempts.get(key) || []).filter(timestamp => now - timestamp < 15 * 60 * 1000);
    loginAttempts.set(key, recent);
    return recent.length < 8;
}

export function recordFailedLogin(req) {
    const key = getClientKey(req);
    const recent = loginAttempts.get(key) || [];
    recent.push(Date.now());
    loginAttempts.set(key, recent.slice(-12));
}

export function clearFailedLogins(req) {
    loginAttempts.delete(getClientKey(req));
}

export function verifyPassword(candidate) {
    return isCvAdminConfigured() && safeEqual(candidate, process.env.CV_ADMIN_PASSWORD);
}

export function createCvSession() {
    const session = {
        exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
        csrf: crypto.randomBytes(24).toString('base64url'),
    };
    const encoded = base64url(JSON.stringify(session));
    return { session, token: `${encoded}.${sign(encoded)}` };
}

export function readCvSession(req) {
    const token = parseCookies(req)[COOKIE_NAME];
    if (!token || !getSecret()) return null;
    const [encoded, signature] = token.split('.');
    if (!encoded || !signature || !safeEqual(signature, sign(encoded))) return null;

    try {
        const session = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
        if (!session?.exp || session.exp <= Math.floor(Date.now() / 1000) || !session.csrf) return null;
        return session;
    } catch {
        return null;
    }
}

export function hasValidCsrf(req, session) {
    return Boolean(session && safeEqual(req.headers['x-cv-csrf'] || '', session.csrf));
}

export function setCvSessionCookie(res, token) {
    const secure = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/api/cv-admin; HttpOnly; SameSite=Strict; Priority=High; Max-Age=${SESSION_TTL_SECONDS}${secure ? '; Secure' : ''}`);
}

export function clearCvSessionCookie(res) {
    const secure = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/api/cv-admin; HttpOnly; SameSite=Strict; Priority=High; Max-Age=0${secure ? '; Secure' : ''}`);
}
