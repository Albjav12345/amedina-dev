import { isArchitectSectionEnabled } from '../config/siteFeatures';

export const DEFAULT_SECTION_ID = 'home';
export const NAV_HEIGHT = 50;
export const SECTION_NAVIGATION_EVENT = 'section:navigate';
export const SECTION_ACTIVE_LOCK_EVENT = 'section:active-lock';
export const SECTION_VISIBLE_EVENT = 'section:visible';

const BASE_SECTION_IDS = [
    'home',
    'about',
    'projects',
    'tech-stack',
    'architect',
    'contact',
];

const BASE_SECTION_TARGETS = {
    home: 'home',
    about: 'about-wrapper',
    projects: 'projects-wrapper',
    'tech-stack': 'tech-stack-wrapper',
    architect: 'architect-wrapper',
    contact: 'contact-wrapper',
};

const BASE_SECTION_PATHS = {
    home: '/',
    about: '/about',
    projects: '/projects',
    'tech-stack': '/stack',
    architect: '/architect',
    contact: '/contact',
};

function isSectionEnabled(sectionId) {
    return sectionId !== 'architect' || isArchitectSectionEnabled;
}

export const SECTION_IDS = BASE_SECTION_IDS.filter(isSectionEnabled);
export const SECTION_TARGETS = Object.fromEntries(
    Object.entries(BASE_SECTION_TARGETS).filter(([sectionId]) => isSectionEnabled(sectionId)),
);
export const SECTION_PATHS = Object.fromEntries(
    Object.entries(BASE_SECTION_PATHS).filter(([sectionId]) => isSectionEnabled(sectionId)),
);

const FALLBACK_ORIGIN = 'https://amedina.dev';

const SECTION_PATH_LOOKUP = Object.entries(SECTION_PATHS).reduce((acc, [sectionId, pathname]) => {
    acc[pathname] = sectionId;
    return acc;
}, {});

export function normalizePathname(pathname = '/') {
    let nextPathname = pathname;

    try {
        nextPathname = new URL(
            pathname,
            typeof window !== 'undefined' ? window.location.origin : FALLBACK_ORIGIN,
        ).pathname;
    } catch {
        nextPathname = pathname;
    }

    if (!nextPathname.startsWith('/')) {
        nextPathname = `/${nextPathname}`;
    }

    const normalized = nextPathname
        .toLowerCase()
        .replace(/\/{2,}/g, '/')
        .replace(/\/+$/, '');

    return normalized || '/';
}

export function isSectionId(sectionId) {
    return SECTION_IDS.includes(sectionId);
}

export function getSectionIdFromPathname(pathname) {
    return SECTION_PATH_LOOKUP[normalizePathname(pathname)] || null;
}

export function getPathnameForSection(sectionId) {
    return SECTION_PATHS[sectionId] || SECTION_PATHS[DEFAULT_SECTION_ID];
}

export function getSectionElement(sectionId) {
    const targetId = SECTION_TARGETS[sectionId] || sectionId;
    return document.getElementById(targetId) || document.getElementById(sectionId);
}

export function getSectionScrollY(sectionId) {
    const element = getSectionElement(sectionId);

    if (!element) {
        return null;
    }

    return Math.max(0, element.getBoundingClientRect().top + window.pageYOffset - NAV_HEIGHT);
}

export function getActiveSectionId(sectionIds = SECTION_IDS) {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const anchorY = scrollY + NAV_HEIGHT + Math.min(viewportHeight * 0.32, 260);

    if (scrollY <= 24) {
        return DEFAULT_SECTION_ID;
    }

    if (scrollY + viewportHeight >= documentHeight - 24) {
        return 'contact';
    }

    const positionedSections = sectionIds
        .map((sectionId) => {
            const element = getSectionElement(sectionId);

            if (!element) {
                return null;
            }

            return {
                id: sectionId,
                top: element.getBoundingClientRect().top + scrollY,
            };
        })
        .filter(Boolean);

    if (!positionedSections.length) {
        return DEFAULT_SECTION_ID;
    }

    let activeId = positionedSections[0].id;

    positionedSections.forEach((section) => {
        if (section.top <= anchorY) {
            activeId = section.id;
        }
    });

    return activeId;
}

export function dispatchSectionNavigation(sectionId, detail = {}) {
    if (typeof window === 'undefined' || !isSectionId(sectionId)) {
        return;
    }

    window.dispatchEvent(new CustomEvent(SECTION_NAVIGATION_EVENT, {
        detail: {
            sectionId,
            historyMode: 'push',
            behavior: 'smooth',
            ...detail,
        },
    }));
}

export function dispatchSectionActiveLock(sectionId, locked) {
    if (typeof window === 'undefined') {
        return;
    }

    window.dispatchEvent(new CustomEvent(SECTION_ACTIVE_LOCK_EVENT, {
        detail: {
            sectionId: isSectionId(sectionId) ? sectionId : DEFAULT_SECTION_ID,
            locked: Boolean(locked),
        },
    }));
}

export function dispatchVisibleSection(sectionId) {
    if (typeof window === 'undefined' || !isSectionId(sectionId)) {
        return;
    }

    window.dispatchEvent(new CustomEvent(SECTION_VISIBLE_EVENT, {
        detail: { sectionId },
    }));
}

export function isPlainLeftClick(event) {
    const button = typeof event.button === 'number' ? event.button : 0;

    return button === 0
        && !event.defaultPrevented
        && !event.metaKey
        && !event.altKey
        && !event.ctrlKey
        && !event.shiftKey;
}
