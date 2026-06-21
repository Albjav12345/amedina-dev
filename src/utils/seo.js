const SITE_ORIGIN = 'https://amedina.dev';
const DEFAULT_IMAGE = `${SITE_ORIGIN}/assets/og-amedina.png`;

const SECTION_METADATA = {
    home: {
        path: '/',
        title: 'Alberto Medina | Full-Stack Systems, Automation & AI',
        description: 'Full-stack systems, automation workflows, and AI products engineered by Alberto Medina with polished interfaces and reliable backend operations.',
    },
    about: {
        path: '/about',
        title: 'About Alberto Medina | Systems & Automation Engineer',
        description: 'Background, engineering approach, delivery track record, and verified client feedback for full-stack developer Alberto Medina.',
    },
    projects: {
        path: '/projects',
        title: 'Selected Systems & Projects | Alberto Medina',
        description: 'Selected interface, automation, AI, real-time data, and authorized security research systems built by Alberto Medina.',
    },
    'tech-stack': {
        path: '/stack',
        title: 'Technical Stack | Alberto Medina',
        description: 'The languages, frameworks, AI tooling, infrastructure, and delivery stack Alberto Medina uses to build production-ready systems.',
    },
    architect: {
        path: '/architect',
        title: 'Project Architect | Alberto Medina',
        description: 'Turn a product or automation idea into a structured, build-ready technical brief.',
    },
    contact: {
        path: '/contact',
        title: 'Contact Alberto Medina | Engineering & Automation',
        description: 'Contact Alberto Medina about product engineering roles, freelance systems, automation workflows, or AI-enabled software.',
    },
};

function setMeta(selector, attribute, value) {
    const element = document.head.querySelector(selector);
    if (element) {
        element.setAttribute(attribute, value);
    }
}

export function syncDocumentMetadata(sectionId = 'home') {
    if (typeof document === 'undefined') return;

    const metadata = SECTION_METADATA[sectionId] || SECTION_METADATA.home;
    const canonicalUrl = `${SITE_ORIGIN}${metadata.path}`;
    document.title = metadata.title;

    setMeta('meta[name="title"]', 'content', metadata.title);
    setMeta('meta[name="description"]', 'content', metadata.description);
    setMeta('meta[property="og:title"]', 'content', metadata.title);
    setMeta('meta[property="og:description"]', 'content', metadata.description);
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);
    setMeta('meta[property="og:image"]', 'content', DEFAULT_IMAGE);
    setMeta('meta[name="twitter:title"]', 'content', metadata.title);
    setMeta('meta[name="twitter:description"]', 'content', metadata.description);
    setMeta('meta[name="twitter:url"]', 'content', canonicalUrl);
    setMeta('meta[name="twitter:image"]', 'content', DEFAULT_IMAGE);

    const canonical = document.head.querySelector('link[rel="canonical"]');
    canonical?.setAttribute('href', canonicalUrl);
}
