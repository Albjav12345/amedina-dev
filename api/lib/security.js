const DEFAULT_ALLOWED_ORIGINS = [
    'https://amedina.dev',
    'https://www.amedina.dev',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
];

export function applySecurityHeaders(res) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
}

export function getAllowedOrigins() {
    const customOrigins = process.env.ALLOWED_ORIGINS
        ?.split(',')
        .map(origin => origin.trim())
        .filter(Boolean);

    return new Set(customOrigins?.length ? customOrigins : DEFAULT_ALLOWED_ORIGINS);
}

export function isAllowedOrigin(origin) {
    if (!origin) return true;

    try {
        const normalizedOrigin = new URL(origin).origin;
        return getAllowedOrigins().has(normalizedOrigin);
    } catch {
        return false;
    }
}

export function clampText(value, { min = 0, max = 500, fallback = '' } = {}) {
    if (typeof value !== 'string') return fallback;
    const trimmed = value.trim().replace(/\s+/g, ' ');
    if (trimmed.length < min) return fallback;
    return trimmed.slice(0, max);
}

export function sanitizeMultilineText(value, { min = 0, max = 1500, fallback = '' } = {}) {
    if (typeof value !== 'string') return fallback;
    const trimmed = value.trim().replace(/\r/g, '');
    if (trimmed.length < min) return fallback;
    return trimmed.slice(0, max);
}

export function sanitizeEnum(value, allowedValues, fallback) {
    return allowedValues.includes(value) ? value : fallback;
}

export function sanitizeHistory(history) {
    if (!Array.isArray(history)) return [];

    return history
        .slice(-4)
        .map(entry => {
            const role = entry?.type === 'input' ? 'user' : entry?.type === 'output' ? 'assistant' : null;
            const content = clampText(entry?.content, { min: 1, max: 500, fallback: '' });

            if (!role || !content) return null;
            return { role, content };
        })
        .filter(Boolean);
}

export function extractJsonObject(rawContent) {
    if (typeof rawContent !== 'string') {
        throw new Error('MODEL_RESPONSE_EMPTY');
    }

    try {
        return JSON.parse(rawContent);
    } catch {
        const match = rawContent.match(/\{[\s\S]*\}/);
        if (!match) throw new Error('MODEL_RESPONSE_INVALID_JSON');
        return JSON.parse(match[0]);
    }
}

export function getAllowedExternalUrls(portfolioData) {
    const urls = new Set();

    portfolioData.projects.forEach(project => {
        if (project.githubLink) urls.add(project.githubLink);
    });

    const socialUrls = [
        portfolioData.profile?.social?.github,
        portfolioData.profile?.social?.linkedin,
        ...(portfolioData.ui?.contact?.social || []).map(item => item.url),
    ].filter(Boolean);

    socialUrls.forEach(url => urls.add(url));

    return urls;
}

export function getSafeExternalUrl(candidateUrl, allowedUrls) {
    if (!candidateUrl || typeof candidateUrl !== 'string') return null;

    try {
        const normalized = new URL(candidateUrl);
        if (!['https:', 'http:'].includes(normalized.protocol)) return null;
        return allowedUrls.has(normalized.toString()) ? normalized.toString() : null;
    } catch {
        return null;
    }
}
