import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import ExcelJS from 'exceljs';
import { buildAssetPreviewIndex } from './portfolio-workbook-previews.mjs';

const { Workbook } = ExcelJS;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

export const WORKBOOK_PATH = path.join(rootDir, 'src', 'data', 'content', 'portfolio-master.xlsx');
export const GENERATED_JSON_PATH = path.join(rootDir, 'src', 'data', 'generated', 'portfolioContent.json');
export const CONTENT_README_PATH = path.join(rootDir, 'src', 'data', 'content', 'README.md');

const LOOKUP_SHEET = '_LOOKUPS';
const PREVIEW_SHEET = 'ASSET_PREVIEW';
const README_SHEET = 'README';
const HOME_SHEET = 'HOME';

const SHEET_NAMES = {
    navigationConfig: 'NAVIGATION_CONFIG',
    navigation: 'NAVIGATION',
    profile: 'PROFILE',
    aboutBio: 'ABOUT_BIO',
    aboutStats: 'ABOUT_STATS',
    hero: 'HERO',
    heroMetadata: 'HERO_METADATA',
    terminal: 'TERMINAL',
    terminalLines: 'TERMINAL_LINES',
    terminalCapabilities: 'TERMINAL_CAPABILITIES',
    sectionHeaders: 'SECTION_HEADERS',
    skillCategories: 'SKILL_CATEGORIES',
    skillItems: 'SKILL_ITEMS',
    projects: 'PROJECTS',
    projectStack: 'PROJECT_STACK',
    projectArch: 'PROJECT_ARCH',
    testimonialSources: 'TESTIMONIAL_SOURCES',
    testimonials: 'TESTIMONIALS',
    contact: 'CONTACT',
    contactSocial: 'CONTACT_SOCIAL',
    contactMetadata: 'CONTACT_METADATA',
    footer: 'FOOTER',
    assets: 'ASSETS',
};

const PRIMARY_SHEET_ORDER = [
    HOME_SHEET,
    README_SHEET,
    SHEET_NAMES.profile,
    SHEET_NAMES.hero,
    SHEET_NAMES.projects,
    SHEET_NAMES.testimonials,
    SHEET_NAMES.contact,
    SHEET_NAMES.assets,
    PREVIEW_SHEET,
];

const ADVANCED_SHEET_ORDER = [
    SHEET_NAMES.navigationConfig,
    SHEET_NAMES.navigation,
    SHEET_NAMES.aboutBio,
    SHEET_NAMES.aboutStats,
    SHEET_NAMES.heroMetadata,
    SHEET_NAMES.terminal,
    SHEET_NAMES.terminalLines,
    SHEET_NAMES.terminalCapabilities,
    SHEET_NAMES.sectionHeaders,
    SHEET_NAMES.skillCategories,
    SHEET_NAMES.skillItems,
    SHEET_NAMES.projectStack,
    SHEET_NAMES.projectArch,
    SHEET_NAMES.testimonialSources,
    SHEET_NAMES.contactSocial,
    SHEET_NAMES.contactMetadata,
    SHEET_NAMES.footer,
];

const SHEET_META = {
    [HOME_SHEET]: {
        title: 'Portfolio Content Hub',
        subtitle: 'Edit the workbook from a single control center, then sync the site.',
        group: 'home',
        primary: true,
        tabColor: 'FF14F195',
    },
    [README_SHEET]: {
        title: 'Workbook Guide',
        subtitle: 'Editing rules, shortcuts, and the quickest path to each content area.',
        group: 'home',
        primary: true,
        tabColor: 'FF1E293B',
    },
    [SHEET_NAMES.profile]: {
        title: 'Profile',
        subtitle: 'Identity, bio headline, social links, and testimonial section copy.',
        group: 'profile',
        primary: true,
        tabColor: 'FF16A34A',
        headerRow: 8,
        tableStartRow: 9,
        bufferRows: 4,
        relatedSheets: [SHEET_NAMES.aboutBio, SHEET_NAMES.aboutStats, SHEET_NAMES.assets],
    },
    [SHEET_NAMES.hero]: {
        title: 'Hero',
        subtitle: 'Landing copy, calls to action, and top-level positioning.',
        group: 'profile',
        primary: true,
        tabColor: 'FF16A34A',
        headerRow: 8,
        tableStartRow: 9,
        bufferRows: 4,
        relatedSheets: [SHEET_NAMES.heroMetadata, SHEET_NAMES.navigation],
    },
    [SHEET_NAMES.projects]: {
        title: 'Projects',
        subtitle: 'Main project cards, value story, media wiring, and ordering.',
        group: 'projects',
        primary: true,
        tabColor: 'FF06B6D4',
        headerRow: 8,
        tableStartRow: 9,
        bufferRows: 10,
        relatedSheets: [SHEET_NAMES.projectStack, SHEET_NAMES.projectArch, SHEET_NAMES.assets],
    },
    [SHEET_NAMES.testimonials]: {
        title: 'Testimonials',
        subtitle: 'Review copy, star rating, featured placement, and avatar assets.',
        group: 'proof',
        primary: true,
        tabColor: 'FF22C55E',
        headerRow: 8,
        tableStartRow: 9,
        bufferRows: 12,
        relatedSheets: [SHEET_NAMES.testimonialSources, SHEET_NAMES.assets],
    },
    [SHEET_NAMES.contact]: {
        title: 'Contact',
        subtitle: 'Primary contact copy, form labels, response states, and endpoint info.',
        group: 'contact',
        primary: true,
        tabColor: 'FF38BDF8',
        headerRow: 8,
        tableStartRow: 9,
        bufferRows: 4,
        relatedSheets: [SHEET_NAMES.contactSocial, SHEET_NAMES.contactMetadata, SHEET_NAMES.footer],
    },
    [SHEET_NAMES.assets]: {
        title: 'Assets',
        subtitle: 'Central asset registry, source links, resolved paths, usage context, and preview access.',
        group: 'assets',
        primary: true,
        tabColor: 'FF8B5CF6',
        headerRow: 8,
        tableStartRow: 9,
        bufferRows: 10,
        relatedSheets: [PREVIEW_SHEET, SHEET_NAMES.projects, SHEET_NAMES.testimonials],
        generatedColumns: ['rowStatus', 'openSource', 'openResolved', 'usedBy', 'previewLink'],
    },
    [PREVIEW_SHEET]: {
        title: 'Asset Preview Index',
        subtitle: 'Visual asset browser with cached previews for image, vector, and video-backed media.',
        group: 'assets',
        primary: true,
        tabColor: 'FF8B5CF6',
    },
    [SHEET_NAMES.navigationConfig]: {
        title: 'Navigation Config',
        subtitle: 'Brand lockup and terminal button label.',
        group: 'advanced',
        primary: false,
        tabColor: 'FF334155',
        headerRow: 8,
        tableStartRow: 9,
        bufferRows: 3,
        relatedSheets: [SHEET_NAMES.navigation, SHEET_NAMES.hero],
    },
    [SHEET_NAMES.navigation]: {
        title: 'Navigation',
        subtitle: 'Route labels, hrefs, and section enablement.',
        group: 'advanced',
        primary: false,
        tabColor: 'FF334155',
        headerRow: 8,
        tableStartRow: 9,
        bufferRows: 6,
        relatedSheets: [SHEET_NAMES.navigationConfig, SHEET_NAMES.hero],
    },
    [SHEET_NAMES.aboutBio]: {
        title: 'About Bio',
        subtitle: 'Long-form biography paragraphs in display order.',
        group: 'advanced',
        primary: false,
        tabColor: 'FF334155',
        headerRow: 8,
        tableStartRow: 9,
        bufferRows: 6,
        relatedSheets: [SHEET_NAMES.profile, SHEET_NAMES.aboutStats],
    },
    [SHEET_NAMES.aboutStats]: {
        title: 'About Stats',
        subtitle: 'Quick metrics shown in the profile/about section.',
        group: 'advanced',
        primary: false,
        tabColor: 'FF334155',
        headerRow: 8,
        tableStartRow: 9,
        bufferRows: 6,
        relatedSheets: [SHEET_NAMES.profile, SHEET_NAMES.aboutBio],
    },
    [SHEET_NAMES.heroMetadata]: {
        title: 'Hero Metadata',
        subtitle: 'Small metadata chips shown in the landing hero.',
        group: 'advanced',
        primary: false,
        tabColor: 'FF334155',
        headerRow: 8,
        tableStartRow: 9,
        bufferRows: 6,
        relatedSheets: [SHEET_NAMES.hero],
    },
    [SHEET_NAMES.terminal]: {
        title: 'Terminal',
        subtitle: 'Terminal shell labels and tooltip copy.',
        group: 'advanced',
        primary: false,
        tabColor: 'FF334155',
        headerRow: 8,
        tableStartRow: 9,
        bufferRows: 4,
        relatedSheets: [SHEET_NAMES.terminalLines, SHEET_NAMES.terminalCapabilities],
    },
    [SHEET_NAMES.terminalLines]: {
        title: 'Terminal Lines',
        subtitle: 'Initial and greeting lines for the terminal experience.',
        group: 'advanced',
        primary: false,
        tabColor: 'FF334155',
        headerRow: 8,
        tableStartRow: 9,
        bufferRows: 10,
        relatedSheets: [SHEET_NAMES.terminal, SHEET_NAMES.terminalCapabilities],
    },
    [SHEET_NAMES.terminalCapabilities]: {
        title: 'Terminal Capabilities',
        subtitle: 'Tooltip bullets that explain what the terminal can do.',
        group: 'advanced',
        primary: false,
        tabColor: 'FF334155',
        headerRow: 8,
        tableStartRow: 9,
        bufferRows: 8,
        relatedSheets: [SHEET_NAMES.terminal, SHEET_NAMES.terminalLines],
    },
    [SHEET_NAMES.sectionHeaders]: {
        title: 'Section Headers',
        subtitle: 'Section badge ids and two-line labels across the site.',
        group: 'advanced',
        primary: false,
        tabColor: 'FF334155',
        headerRow: 8,
        tableStartRow: 9,
        bufferRows: 6,
        relatedSheets: [SHEET_NAMES.navigation],
    },
    [SHEET_NAMES.skillCategories]: {
        title: 'Skill Categories',
        subtitle: 'Top-level skill groups, icons, colors, and ordering.',
        group: 'advanced',
        primary: false,
        tabColor: 'FF334155',
        headerRow: 8,
        tableStartRow: 9,
        bufferRows: 6,
        relatedSheets: [SHEET_NAMES.skillItems],
    },
    [SHEET_NAMES.skillItems]: {
        title: 'Skill Items',
        subtitle: 'Individual skills attached to a category id.',
        group: 'advanced',
        primary: false,
        tabColor: 'FF334155',
        headerRow: 8,
        tableStartRow: 9,
        bufferRows: 12,
        relatedSheets: [SHEET_NAMES.skillCategories],
    },
    [SHEET_NAMES.projectStack]: {
        title: 'Project Stack',
        subtitle: 'Technology tags associated with each project.',
        group: 'advanced',
        primary: false,
        tabColor: 'FF334155',
        headerRow: 8,
        tableStartRow: 9,
        bufferRows: 10,
        relatedSheets: [SHEET_NAMES.projects, SHEET_NAMES.projectArch],
    },
    [SHEET_NAMES.projectArch]: {
        title: 'Project Architecture',
        subtitle: 'Architecture nodes associated with each project.',
        group: 'advanced',
        primary: false,
        tabColor: 'FF334155',
        headerRow: 8,
        tableStartRow: 9,
        bufferRows: 10,
        relatedSheets: [SHEET_NAMES.projects, SHEET_NAMES.projectStack],
    },
    [SHEET_NAMES.testimonialSources]: {
        title: 'Testimonial Sources',
        subtitle: 'Source presets and source-level labels used by testimonials.',
        group: 'advanced',
        primary: false,
        tabColor: 'FF334155',
        headerRow: 8,
        tableStartRow: 9,
        bufferRows: 6,
        relatedSheets: [SHEET_NAMES.testimonials],
    },
    [SHEET_NAMES.contactSocial]: {
        title: 'Contact Social',
        subtitle: 'Social links rendered inside the contact section.',
        group: 'advanced',
        primary: false,
        tabColor: 'FF334155',
        headerRow: 8,
        tableStartRow: 9,
        bufferRows: 6,
        relatedSheets: [SHEET_NAMES.contact, SHEET_NAMES.contactMetadata],
    },
    [SHEET_NAMES.contactMetadata]: {
        title: 'Contact Metadata',
        subtitle: 'Latency, encryption, uptime, and similar metadata labels.',
        group: 'advanced',
        primary: false,
        tabColor: 'FF334155',
        headerRow: 8,
        tableStartRow: 9,
        bufferRows: 6,
        relatedSheets: [SHEET_NAMES.contact, SHEET_NAMES.contactSocial, SHEET_NAMES.footer],
    },
    [SHEET_NAMES.footer]: {
        title: 'Footer',
        subtitle: 'Footer labels, status line, location, and vessel id.',
        group: 'advanced',
        primary: false,
        tabColor: 'FF334155',
        headerRow: 8,
        tableStartRow: 9,
        bufferRows: 4,
        relatedSheets: [SHEET_NAMES.contact],
    },
};

const NAVIGATION_BLUEPRINT = [
    { id: 'home', name: 'Start', href: '/', order: 1 },
    { id: 'about', name: 'About', href: '/about', order: 2 },
    { id: 'projects', name: 'Systems', href: '/projects', order: 3 },
    { id: 'tech-stack', name: 'Stack', href: '/stack', order: 4 },
    { id: 'architect', name: 'Architect', href: '/architect', order: 5 },
    { id: 'contact', name: 'Contact', href: '/contact', order: 6 },
];

const SECTION_ORDER = ['about', 'projects', 'tech', 'architect', 'console'];
const KNOWN_BOOLEAN_VALUES = ['TRUE', 'FALSE'];
const STAR_VALUES = ['1', '2', '3', '4', '5'];
const ASSET_KINDS = ['image', 'video', 'icon', 'other'];
const ASSET_MODES = ['existing_public', 'import_local', 'external_url'];
const DEMO_TYPES = ['video', 'image'];
const ICON_FITS = ['auto', 'cover', ''];
const TERMINAL_COLORS = ['electric-green', 'electric-cyan', 'white', 'gray'];
const SKILL_COLORS = ['electric-green', 'electric-cyan'];
const SKILL_ICONS = ['Cpu', 'Brain', 'Layers', 'Globe'];
const SOCIAL_ICONS = ['Github', 'Linkedin', 'Twitter', 'Upwork'];
const PREVIEWABLE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg']);

const SHEET_HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F1720' } };
const REQUIRED_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF173124' } };
const OPTIONAL_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF162130' } };
const GENERATED_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2A1B3A' } };
const STATUS_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0E2A26' } };
const CANVAS_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF09111A' } };
const PANEL_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF101A27' } };
const PANEL_FILL_ALT = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F1824' } };
const PANEL_MUTED_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF121B28' } };
const BODY_ROW_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF101824' } };
const BODY_ROW_ALT_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D1621' } };
const BODY_GENERATED_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF20162D' } };
const BODY_STATUS_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF102923' } };
const HEADER_REQUIRED_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF173124' } };
const HEADER_OPTIONAL_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF162130' } };
const HEADER_GENERATED_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2A1B3A' } };
const HEADER_STATUS_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0E2A26' } };
const BORDER_STYLE = {
    top: { style: 'thin', color: { argb: '223B4958' } },
    left: { style: 'thin', color: { argb: '223B4958' } },
    bottom: { style: 'thin', color: { argb: '223B4958' } },
    right: { style: 'thin', color: { argb: '223B4958' } },
};

const CONTENT_README = `# Portfolio Content Workbook

The source of truth for site content is:

- \`src/data/content/portfolio-master.xlsx\`

Main commands:

\`\`\`bash
npm run content:init
npm run content:check
npm run content:sync
\`\`\`

Quick workflow:

1. Edit workbook rows.
2. Run \`npm run content:check\` if you only want validation.
3. Run \`npm run content:sync\`.
4. Run \`npm run dev\` or \`npm run build\`.

Important:

- \`content:init\` is only for the first bootstrap. Once the workbook exists, keep editing the Excel file and use \`content:sync\`.

Asset modes:

- \`existing_public\`: keep an asset already inside \`public/\`
- \`import_local\`: copy a local file into \`public/\`
- \`external_url\`: point directly to a public URL
`;

function cloneJson(value) {
    return JSON.parse(JSON.stringify(value));
}

function getSheetMeta(sheetName) {
    return SHEET_META[sheetName] ?? {
        title: sheetName,
        subtitle: '',
        group: 'advanced',
        primary: false,
        tabColor: 'FF334155',
    };
}

function getDataSheetOrder() {
    return [
        ...PRIMARY_SHEET_ORDER.filter((sheetName) => ![HOME_SHEET, README_SHEET, PREVIEW_SHEET].includes(sheetName)),
        ...ADVANCED_SHEET_ORDER,
    ];
}

function getDataSheetMeta(sheetName) {
    const meta = getSheetMeta(sheetName);
    return {
        headerRow: 8,
        tableStartRow: 9,
        bufferRows: meta.primary ? 10 : 6,
        relatedSheets: [],
        generatedColumns: ['rowStatus'],
        ...meta,
    };
}

function getGeneratedKeysForSheet(sheetName) {
    return [...new Set(['rowStatus', ...(getDataSheetMeta(sheetName).generatedColumns || [])])];
}

function makeInternalLink(sheetName, cellAddress = 'A1', text) {
    return {
        text,
        hyperlink: `#'${sheetName}'!${cellAddress}`,
        tooltip: `${text} -> ${sheetName}`,
    };
}

function makeFileLink(targetPath, text) {
    if (!targetPath) return null;
    return {
        text,
        hyperlink: `file:///${path.resolve(targetPath).replace(/\\/g, '/')}`,
    };
}

function makeExternalOrFileLink(target, text) {
    if (!target) return null;
    if (/^https?:\/\//i.test(target)) {
        return { text, hyperlink: target };
    }
    return makeFileLink(target, text);
}

function applyCellTextStyle(cell, { color = 'FFE5EEF5', bold = false, size = 10, name = 'Consolas', underline = false } = {}) {
    cell.font = {
        color: { argb: color },
        bold,
        size,
        name,
        underline,
    };
}

function setLinkedCell(cell, value, styleOptions = {}) {
    cell.value = value;
    const isLink = Boolean(value && typeof value === 'object' && 'hyperlink' in value);
    applyCellTextStyle(cell, {
        color: isLink ? 'FF7DD3FC' : (styleOptions.color ?? 'FFE5EEF5'),
        underline: styleOptions.underline ?? isLink,
        ...styleOptions,
    });
}

function formatGeneratedAt(timestamp) {
    const date = new Date(timestamp || Date.now());
    return Number.isNaN(date.valueOf())
        ? 'Unknown sync time'
        : date.toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC');
}

function toSheetAnchor(sheetName, meta = getDataSheetMeta(sheetName)) {
    return `A${meta.headerRow ?? 1}`;
}

function buildStatusMap(rows, getKey, getStatus) {
    return new Map(
        rows.map((row, index) => [getKey(row, index), getStatus(row, index)]),
    );
}

function createRowStatusMaps(masterData, resolvedAssets) {
    return {
        [SHEET_NAMES.navigationConfig]: new Map([['singleton', 'READY']]),
        [SHEET_NAMES.navigation]: buildStatusMap(
            masterData.navigationEntries,
            (row) => asString(row.id),
            (row) => (parseBoolean(row.enabled, true) ? 'ENABLED' : 'DISABLED'),
        ),
        [SHEET_NAMES.profile]: new Map([['singleton', 'READY']]),
        [SHEET_NAMES.aboutBio]: buildStatusMap(
            masterData.aboutBioEntries,
            (row) => asString(row.paragraph_id),
            () => 'READY',
        ),
        [SHEET_NAMES.aboutStats]: buildStatusMap(
            masterData.aboutStatsEntries,
            (row) => asString(row.id),
            () => 'READY',
        ),
        [SHEET_NAMES.hero]: new Map([['singleton', 'READY']]),
        [SHEET_NAMES.heroMetadata]: buildStatusMap(
            masterData.heroMetadataEntries,
            (_, index) => `hero-meta-${index + 1}`,
            () => 'READY',
        ),
        [SHEET_NAMES.terminal]: new Map([['singleton', 'READY']]),
        [SHEET_NAMES.terminalLines]: buildStatusMap(
            masterData.terminalLineEntries,
            (_, index) => `terminal-line-${index + 1}`,
            (row) => `${asString(row.group).toUpperCase()} / READY`,
        ),
        [SHEET_NAMES.terminalCapabilities]: buildStatusMap(
            masterData.terminalCapabilityEntries,
            (_, index) => `terminal-capability-${index + 1}`,
            () => 'READY',
        ),
        [SHEET_NAMES.sectionHeaders]: buildStatusMap(
            masterData.sectionHeaderEntries,
            (row) => asString(row.section_id),
            () => 'READY',
        ),
        [SHEET_NAMES.skillCategories]: buildStatusMap(
            masterData.skillCategoryEntries,
            (row) => asString(row.category_id),
            () => 'READY',
        ),
        [SHEET_NAMES.skillItems]: buildStatusMap(
            masterData.skillItemEntries,
            (_, index) => `skill-item-${index + 1}`,
            () => 'READY',
        ),
        [SHEET_NAMES.projects]: buildStatusMap(
            masterData.projectEntries,
            (row) => asString(row.id),
            (row) => (parseBoolean(row.enabled, true) ? 'READY' : 'DISABLED'),
        ),
        [SHEET_NAMES.projectStack]: buildStatusMap(
            masterData.projectStackEntries,
            (_, index) => `project-stack-${index + 1}`,
            () => 'READY',
        ),
        [SHEET_NAMES.projectArch]: buildStatusMap(
            masterData.projectArchEntries,
            (_, index) => `project-arch-${index + 1}`,
            () => 'READY',
        ),
        [SHEET_NAMES.testimonialSources]: buildStatusMap(
            masterData.testimonialSourceEntries,
            (row) => asString(row.sourceKey),
            () => 'READY',
        ),
        [SHEET_NAMES.testimonials]: buildStatusMap(
            masterData.testimonialEntries,
            (row) => asString(row.id),
            (row) => (parseBoolean(row.featured, false) ? 'FEATURED' : 'LIBRARY'),
        ),
        [SHEET_NAMES.contact]: new Map([['singleton', 'READY']]),
        [SHEET_NAMES.contactSocial]: buildStatusMap(
            masterData.contactSocialEntries,
            (_, index) => `contact-social-${index + 1}`,
            (row) => (parseBoolean(row.enabled, true) ? 'READY' : 'DISABLED'),
        ),
        [SHEET_NAMES.contactMetadata]: buildStatusMap(
            masterData.contactMetadataEntries,
            (_, index) => `contact-metadata-${index + 1}`,
            () => 'READY',
        ),
        [SHEET_NAMES.footer]: new Map([['singleton', 'READY']]),
        [SHEET_NAMES.assets]: new Map(
            resolvedAssets.map((asset) => [asset.assetId, asset.status]),
        ),
    };
}

function buildAssetUsageIndex(masterData) {
    const usageMap = new Map();

    const registerUsage = (assetId, usage) => {
        const normalizedAssetId = asString(assetId);
        if (!normalizedAssetId) return;

        if (!usageMap.has(normalizedAssetId)) {
            usageMap.set(normalizedAssetId, []);
        }

        usageMap.get(normalizedAssetId).push(usage);
    };

    registerUsage(masterData.profileEntry.avatarAssetId, {
        label: 'Profile avatar',
        sheetName: SHEET_NAMES.profile,
        rowKey: 'singleton',
    });

    for (const project of masterData.projectEntries || []) {
        registerUsage(project.videoAssetId, {
            label: `${project.title} video`,
            sheetName: SHEET_NAMES.projects,
            rowKey: asString(project.id),
        });
        registerUsage(project.thumbnailAssetId, {
            label: `${project.title} thumbnail`,
            sheetName: SHEET_NAMES.projects,
            rowKey: asString(project.id),
        });
        registerUsage(project.iconAssetId, {
            label: `${project.title} icon`,
            sheetName: SHEET_NAMES.projects,
            rowKey: asString(project.id),
        });
    }

    for (const testimonial of masterData.testimonialEntries || []) {
        registerUsage(testimonial.avatarAssetId, {
            label: `${testimonial.id} avatar`,
            sheetName: SHEET_NAMES.testimonials,
            rowKey: asString(testimonial.id),
        });
    }

    return usageMap;
}

function sheetColumnHeaders(columns) {
    return columns.map((column) => column.key);
}

function stripGeneratedFields(row, generatedKeys = ['rowStatus']) {
    const nextRow = {};
    Object.entries(row).forEach(([key, value]) => {
        if (!generatedKeys.includes(key)) {
            nextRow[key] = value;
        }
    });
    return nextRow;
}

function getLookupValues(masterData) {
    const uniqueValues = (values) => [...new Set(values.map((value) => asString(value)).filter(Boolean))];

    return {
        booleanValues: KNOWN_BOOLEAN_VALUES,
        starValues: STAR_VALUES,
        assetKinds: ASSET_KINDS,
        assetModes: ASSET_MODES,
        demoTypes: DEMO_TYPES,
        iconFits: ICON_FITS.filter(Boolean),
        terminalColors: TERMINAL_COLORS,
        terminalGroups: ['initial', 'greeting'],
        skillColors: SKILL_COLORS,
        skillIcons: SKILL_ICONS,
        socialIcons: SOCIAL_ICONS,
        sourceKeys: uniqueValues(masterData.testimonialSourceEntries.map((entry) => entry.sourceKey)),
        projectIds: uniqueValues(masterData.projectEntries.map((entry) => entry.id)),
        assetIds: uniqueValues(masterData.assetEntries.map((entry) => entry.assetId)),
        categoryIds: uniqueValues(masterData.skillCategoryEntries.map((entry) => entry.category_id)),
        sectionIds: uniqueValues(SECTION_ORDER),
    };
}

function addValidation(worksheet, columnIndex, startRow, endRow, validation, lookupFormulas) {
    if (!validation) return;

    const resolvedValidation = validation.lookup
        ? {
            type: 'list',
            allowBlank: true,
            formulae: [lookupFormulas[validation.lookup]],
        }
        : {
            allowBlank: true,
            ...validation,
        };

    for (let rowNumber = startRow; rowNumber <= endRow; rowNumber += 1) {
        worksheet.getCell(rowNumber, columnIndex).dataValidation = resolvedValidation;
    }
}

function normalizeWorksheetCellValue(column, value) {
    if (value === null || value === undefined) return '';

    if (column.validation?.lookup === 'booleanValues') {
        return parseBoolean(value, false) ? 'TRUE' : 'FALSE';
    }

    if (column.key === 'starRating') {
        const parsedRating = parseStarRating(value);
        return String(parsedRating ?? 5);
    }

    return value;
}

function getAccentColor(groupOrMeta) {
    const group = typeof groupOrMeta === 'string' ? groupOrMeta : groupOrMeta?.group;
    return (
        (typeof groupOrMeta === 'object' && groupOrMeta?.tabColor) ||
        {
            home: 'FF14F195',
            profile: 'FF16A34A',
            projects: 'FF06B6D4',
            proof: 'FF22C55E',
            contact: 'FF38BDF8',
            assets: 'FF8B5CF6',
            advanced: 'FF64748B',
        }[group] ||
        'FF14F195'
    );
}

function applyChipCellStyle(cell, accentColor, { muted = false } = {}) {
    cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: muted ? 'FF172231' : 'FF122130' },
    };
    cell.border = {
        ...BORDER_STYLE,
        top: { style: 'thin', color: { argb: accentColor } },
        left: { style: 'thin', color: { argb: accentColor } },
        right: { style: 'thin', color: { argb: accentColor } },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true, shrinkToFit: true };
    applyCellTextStyle(cell, {
        color: muted ? 'FFCBD5E1' : accentColor,
        bold: true,
        size: 9,
    });
}

function decorateChromeRange(worksheet, rowNumber, fromColumn, toColumn, fill) {
    for (let columnIndex = fromColumn; columnIndex <= toColumn; columnIndex += 1) {
        const cell = worksheet.getCell(rowNumber, columnIndex);
        cell.fill = fill;
        cell.border = BORDER_STYLE;
    }
}

function toCellAddress(worksheet, rowNumber, columnIndex) {
    return `${worksheet.getColumn(columnIndex).letter}${rowNumber}`;
}

function mergeCellBlock(worksheet, startRow, startColumn, endRow, endColumn) {
    worksheet.mergeCells(`${toCellAddress(worksheet, startRow, startColumn)}:${toCellAddress(worksheet, endRow, endColumn)}`);
    return worksheet.getCell(startRow, startColumn);
}

function fillCellRange(worksheet, startRow, startColumn, endRow, endColumn, fill, { accentColor = null } = {}) {
    for (let rowNumber = startRow; rowNumber <= endRow; rowNumber += 1) {
        for (let columnIndex = startColumn; columnIndex <= endColumn; columnIndex += 1) {
            const cell = worksheet.getCell(rowNumber, columnIndex);
            cell.fill = fill;
            cell.border = {
                ...BORDER_STYLE,
                left: columnIndex === startColumn && accentColor
                    ? { style: 'thin', color: { argb: accentColor } }
                    : BORDER_STYLE.left,
            };
        }
    }
}

function buildSheetNavigationItems(sheetName) {
    const meta = getDataSheetMeta(sheetName);
    const items = [];
    const primarySequence = PRIMARY_SHEET_ORDER.filter((entry) => entry !== HOME_SHEET);

    items.push({ text: 'Back to HOME', sheetName: HOME_SHEET, cell: 'A1' });

    if (sheetName !== README_SHEET) {
        items.push({ text: 'Guide', sheetName: README_SHEET, cell: 'A1' });
    }

    if (meta.primary) {
        const currentIndex = primarySequence.indexOf(sheetName);
        if (currentIndex > 0) {
            const previousSheet = primarySequence[currentIndex - 1];
            items.push({ text: `Prev: ${getSheetMeta(previousSheet).title}`, sheetName: previousSheet, cell: 'A1' });
        }
        if (currentIndex >= 0 && currentIndex < primarySequence.length - 1) {
            const nextSheet = primarySequence[currentIndex + 1];
            items.push({ text: `Next: ${getSheetMeta(nextSheet).title}`, sheetName: nextSheet, cell: 'A1' });
        }
    }

    for (const relatedSheet of meta.relatedSheets || []) {
        items.push({ text: getSheetMeta(relatedSheet).title, sheetName: relatedSheet, cell: toSheetAnchor(relatedSheet) });
    }

    return items;
}

function renderSheetChipRows(worksheet, items, startRow, lastColumnIndex, accentColor, { muted = false } = {}) {
    const chipSpan = lastColumnIndex >= 10 ? 2 : 1;
    const maxRows = 2;
    let rowNumber = startRow;
    let columnIndex = 1;

    items.forEach((item) => {
        if (rowNumber >= startRow + maxRows) return;
        if (columnIndex + chipSpan - 1 > lastColumnIndex) {
            rowNumber += 1;
            columnIndex = 1;
        }
        if (rowNumber >= startRow + maxRows) return;

        const chipCell = chipSpan > 1
            ? mergeCellBlock(worksheet, rowNumber, columnIndex, rowNumber, columnIndex + chipSpan - 1)
            : worksheet.getCell(rowNumber, columnIndex);

        setLinkedCell(chipCell, makeInternalLink(item.sheetName, item.cell, item.text), { underline: false });
        applyChipCellStyle(chipCell, accentColor, { muted });
        columnIndex += chipSpan;
    });

    return rowNumber;
}

function decorateDataSheetChrome(worksheet, config, generatedAt) {
    const meta = getDataSheetMeta(config.name);
    const accentColor = getAccentColor(meta);
    const lastColumnIndex = config.columns.length;
    const lastColumnLetter = worksheet.getColumn(lastColumnIndex).letter;
    const titleRange = `A1:${lastColumnLetter}1`;
    const subtitleRange = `A2:${lastColumnLetter}2`;
    const infoRange = `A3:${lastColumnLetter}3`;

    worksheet.properties.defaultRowHeight = 22;
    worksheet.properties.tabColor = { argb: meta.tabColor };
    worksheet.views = [{ state: 'frozen', ySplit: meta.headerRow, showGridLines: false }];

    fillCellRange(
        worksheet,
        1,
        1,
        Math.max(meta.tableStartRow + meta.bufferRows + (config.rows?.length ?? 0) + 4, 20),
        lastColumnIndex,
        CANVAS_FILL,
    );

    worksheet.mergeCells(titleRange);
    worksheet.mergeCells(subtitleRange);
    worksheet.mergeCells(infoRange);

    const titleCell = worksheet.getCell('A1');
    const subtitleCell = worksheet.getCell('A2');
    const infoCell = worksheet.getCell('A3');

    titleCell.value = meta.title;
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B1119' } };
    titleCell.border = BORDER_STYLE;
    titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
    applyCellTextStyle(titleCell, { color: 'FFFFFFFF', bold: true, size: 20, name: 'Segoe UI' });

    subtitleCell.value = meta.subtitle;
    subtitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF101A27' } };
    subtitleCell.border = BORDER_STYLE;
    subtitleCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    applyCellTextStyle(subtitleCell, { color: 'FFC7D5E0', size: 10, name: 'Segoe UI' });

    infoCell.value = `${meta.primary ? 'PRIMARY EDIT SURFACE' : 'ADVANCED DATA SHEET'} | LAST SYNC ${formatGeneratedAt(generatedAt)}`;
    infoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF101A27' } };
    infoCell.border = BORDER_STYLE;
    infoCell.alignment = { vertical: 'middle', horizontal: 'left' };
    applyCellTextStyle(infoCell, { color: accentColor, bold: true, size: 9 });

    const navigationItems = buildSheetNavigationItems(config.name);
    const lastNavigationRow = renderSheetChipRows(worksheet, navigationItems, 4, lastColumnIndex, accentColor);

    if (lastNavigationRow === 4) {
        const contextCell = mergeCellBlock(worksheet, 5, 1, 5, lastColumnIndex);
        contextCell.value = meta.primary
            ? 'Primary editing surface. Keep changes inside the table area and use linked ids to move between related records.'
            : 'Supporting data sheet. Changes here feed one or more primary editing surfaces.';
        contextCell.fill = PANEL_FILL_ALT;
        contextCell.border = BORDER_STYLE;
        contextCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        applyCellTextStyle(contextCell, { color: 'FF94A3B8', size: 9, name: 'Segoe UI' });
    }

    const legendItems = [
        { text: 'Required', fill: REQUIRED_FILL, color: 'FF9FE870' },
        { text: 'Optional', fill: OPTIONAL_FILL, color: 'FFCBD5E1' },
        { text: 'Generated', fill: GENERATED_FILL, color: 'FFD8B4FE' },
        { text: 'Linked', fill: STATUS_FILL, color: 'FF7DD3FC' },
    ];

    const legendSpan = lastColumnIndex >= 12 ? 2 : 1;
    legendItems.forEach((item, index) => {
        const legendColumn = 1 + (index * legendSpan);
        if (legendColumn > lastColumnIndex) return;
        const cell = legendSpan > 1
            ? mergeCellBlock(worksheet, 6, legendColumn, 6, Math.min(lastColumnIndex, legendColumn + legendSpan - 1))
            : worksheet.getCell(6, legendColumn);
        cell.value = item.text;
        cell.fill = item.fill;
        cell.border = BORDER_STYLE;
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        applyCellTextStyle(cell, { color: item.color, bold: true, size: 9 });
    });

    const helperCell = mergeCellBlock(worksheet, 7, 1, 7, lastColumnIndex);
    helperCell.value = 'Editable data starts below. Use dropdown cells where present, and CTRL+CLICK linked ids to jump between related sheets.';
    helperCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F1720' } };
    helperCell.border = BORDER_STYLE;
    helperCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    applyCellTextStyle(helperCell, { color: 'FF94A3B8', size: 9, name: 'Segoe UI' });

    worksheet.getRow(1).height = 28;
    worksheet.getRow(2).height = 22;
    worksheet.getRow(3).height = 20;
    worksheet.getRow(4).height = 20;
    worksheet.getRow(5).height = 20;
    worksheet.getRow(6).height = 18;
    worksheet.getRow(7).height = 22;
}

function buildDataSheet(workbook, config, lookupFormulas, rowStatusMaps, { generatedAt } = {}) {
    const meta = getDataSheetMeta(config.name);
    const worksheet = workbook.addWorksheet(config.name);
    worksheet.columns = config.columns.map((column) => ({
        key: column.key,
        width: column.width,
        style: {
            alignment: {
                vertical: 'top',
                wrapText: Boolean(column.wrap),
            },
        },
    }));

    decorateDataSheetChrome(worksheet, config, generatedAt);

    const rowStatusMap = rowStatusMaps[config.name] ?? new Map();
    const headers = sheetColumnHeaders(config.columns);
    const headerRowNumber = meta.headerRow;
    const tableStartRow = meta.tableStartRow;

    config.columns.forEach((column, columnIndex) => {
        const cell = worksheet.getCell(headerRowNumber, columnIndex + 1);
        cell.value = column.header;
        cell.fill = column.key === 'rowStatus'
            ? HEADER_STATUS_FILL
            : column.generated
                ? HEADER_GENERATED_FILL
                : column.required
                    ? HEADER_REQUIRED_FILL
                    : HEADER_OPTIONAL_FILL;
        cell.border = BORDER_STYLE;
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
        applyCellTextStyle(cell, { color: 'FFFFFFFF', bold: true, size: 11, name: 'Consolas' });
    });

    config.rows.forEach((row, index) => {
        const rowKey = config.rowKey(row, index);
        const rowNumber = tableStartRow + index;
        const rowValues = config.columns.reduce((acc, column) => {
            acc[column.key] = column.key === 'rowStatus'
                ? rowStatusMap.get(rowKey) ?? ''
                : normalizeWorksheetCellValue(column, row[column.key]);
            return acc;
        }, {});

        const worksheetRow = worksheet.getRow(rowNumber);
        const tallContentLength = config.columns.reduce((maxLength, column) => {
            if (!column.wrap || column.key === 'rowStatus') return maxLength;
            return Math.max(maxLength, String(rowValues[column.key] ?? '').length);
        }, 0);

        headers.forEach((headerKey, columnIndex) => {
            const column = config.columns[columnIndex];
            const cell = worksheetRow.getCell(columnIndex + 1);
            const rowFill = index % 2 === 0 ? BODY_ROW_FILL : BODY_ROW_ALT_FILL;
            const dataFill = headerKey === 'rowStatus'
                ? BODY_STATUS_FILL
                : column.generated
                    ? BODY_GENERATED_FILL
                    : rowFill;

            setLinkedCell(cell, rowValues[headerKey]);
            cell.fill = dataFill;
            cell.border = BORDER_STYLE;
            cell.alignment = {
                vertical: 'top',
                wrapText: Boolean(column.wrap),
            };
            if (column.validation?.lookup === 'booleanValues') {
                cell.numFmt = '@';
            }

            if (headerKey !== 'rowStatus') {
                applyCellTextStyle(cell, { color: 'FFE5EEF5', size: 10 });
            }
        });

        if (tallContentLength > 280) {
            worksheetRow.height = 94;
        } else if (tallContentLength > 150) {
            worksheetRow.height = 68;
        } else if (tallContentLength > 90) {
            worksheetRow.height = 50;
        }
    });

    const desiredDataRows = Math.max(config.rows.length + meta.bufferRows, config.singleRow ? 3 : 8);
    const lastRowToDecorate = tableStartRow + desiredDataRows - 1;

    config.columns.forEach((column, columnIndex) => {
        const worksheetColumn = worksheet.getColumn(columnIndex + 1);

        for (let rowNumber = tableStartRow; rowNumber <= lastRowToDecorate; rowNumber += 1) {
            const cell = worksheet.getCell(rowNumber, columnIndex + 1);
            const rowIndex = rowNumber - tableStartRow;
            const rowFill = rowIndex % 2 === 0 ? BODY_ROW_FILL : BODY_ROW_ALT_FILL;
            const dataFill = column.key === 'rowStatus'
                ? BODY_STATUS_FILL
                : column.generated
                    ? BODY_GENERATED_FILL
                    : rowFill;
            if (!cell.fill || cell.fill === undefined || rowNumber > tableStartRow + config.rows.length - 1) {
                cell.fill = dataFill;
            }
            cell.border = BORDER_STYLE;
            cell.alignment = {
                vertical: 'top',
                wrapText: Boolean(column.wrap),
            };
            if (column.validation?.lookup === 'booleanValues') {
                cell.numFmt = '@';
            }
            if (!cell.font) {
                applyCellTextStyle(cell, {
                    color: column.key === 'rowStatus' ? 'FF94F1CF' : 'FFE5EEF5',
                    size: 10,
                });
            }
        }

        addValidation(worksheet, columnIndex + 1, tableStartRow, lastRowToDecorate, column.validation, lookupFormulas);

        if (column.key === 'rowStatus') {
            worksheetColumn.hidden = false;
        }
    });

    worksheet.autoFilter = {
        from: { row: headerRowNumber, column: 1 },
        to: { row: headerRowNumber, column: config.columns.length },
    };

    return worksheet;
}

function createLookupSheet(workbook, lookupValues) {
    const worksheet = workbook.addWorksheet(LOOKUP_SHEET);
    worksheet.state = 'veryHidden';

    const lookupFormulas = {};
    const entries = Object.entries(lookupValues);

    entries.forEach(([lookupKey, values], index) => {
        const columnIndex = index + 1;
        const columnLetter = worksheet.getColumn(columnIndex).letter;
        const normalizedValues = values.length ? values : [''];

        worksheet.getCell(1, columnIndex).value = lookupKey;
        worksheet.getCell(1, columnIndex).fill = SHEET_HEADER_FILL;
        worksheet.getCell(1, columnIndex).font = {
            color: { argb: 'FFFFFFFF' },
            bold: true,
            name: 'Consolas',
            size: 10,
        };
        worksheet.getColumn(columnIndex).width = 28;

        normalizedValues.forEach((value, valueIndex) => {
            worksheet.getCell(valueIndex + 2, columnIndex).value = value;
        });

        lookupFormulas[lookupKey] = `'${LOOKUP_SHEET}'!$${columnLetter}$2:$${columnLetter}$${normalizedValues.length + 1}`;
    });

    return lookupFormulas;
}

function createHomeSheet(workbook, masterData, generatedAt) {
    const worksheet = workbook.addWorksheet(HOME_SHEET, {
        views: [{ showGridLines: false, showRowColHeaders: false, state: 'frozen', ySplit: 4 }],
    });
    const meta = getSheetMeta(HOME_SHEET);
    worksheet.properties.tabColor = { argb: meta.tabColor };
    worksheet.columns = Array.from({ length: 15 }, (_, index) => ({ width: index === 14 ? 15 : 14 }));
    fillCellRange(worksheet, 1, 1, 31, 15, CANVAS_FILL);

    const createSummaryCard = ({ startRow, startColumn, title, value, note, linkSheet }) => {
        const endColumn = startColumn + 4;
        const endRow = startRow + 4;
        const accentColor = getAccentColor(getSheetMeta(linkSheet));

        fillCellRange(worksheet, startRow, startColumn, endRow, endColumn, PANEL_FILL, { accentColor });

        const cardTitleCell = mergeCellBlock(worksheet, startRow, startColumn, startRow, endColumn);
        cardTitleCell.value = title;
        cardTitleCell.alignment = { vertical: 'middle', horizontal: 'left' };
        applyCellTextStyle(cardTitleCell, { color: accentColor, bold: true, size: 11, name: 'Consolas' });

        const valueCell = mergeCellBlock(worksheet, startRow + 1, startColumn, startRow + 2, endColumn);
        valueCell.value = value;
        valueCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        applyCellTextStyle(valueCell, { color: 'FFFFFFFF', bold: true, size: 15, name: 'Segoe UI' });

        const noteCell = mergeCellBlock(worksheet, startRow + 3, startColumn, endRow, endColumn - 2);
        noteCell.value = note;
        noteCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        applyCellTextStyle(noteCell, { color: 'FFB9CAD8', size: 10, name: 'Segoe UI' });

        const actionCell = mergeCellBlock(worksheet, startRow + 3, endColumn - 1, endRow, endColumn);
        setLinkedCell(actionCell, makeInternalLink(linkSheet, toSheetAnchor(linkSheet), 'Open sheet'), { underline: false });
        applyChipCellStyle(actionCell, accentColor);
    };

    const createTextPanel = ({ startRow, startColumn, endRow, endColumn, title, body, accentColor }) => {
        fillCellRange(worksheet, startRow, startColumn, endRow, endColumn, PANEL_FILL_ALT, { accentColor });

        const panelTitleCell = mergeCellBlock(worksheet, startRow, startColumn, startRow, endColumn);
        panelTitleCell.value = title;
        panelTitleCell.alignment = { vertical: 'middle', horizontal: 'left' };
        applyCellTextStyle(panelTitleCell, { color: accentColor, bold: true, size: 11, name: 'Consolas' });

        const bodyCell = mergeCellBlock(worksheet, startRow + 1, startColumn, endRow, endColumn);
        bodyCell.value = body;
        bodyCell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
        applyCellTextStyle(bodyCell, { color: 'FFE5EEF5', size: 11, name: 'Segoe UI' });
    };

    const createLinkPanel = ({ startRow, startColumn, endRow, endColumn, title, subtitle, items, accentColor, muted = false }) => {
        fillCellRange(worksheet, startRow, startColumn, endRow, endColumn, muted ? PANEL_MUTED_FILL : PANEL_FILL_ALT, { accentColor });

        const panelTitleCell = mergeCellBlock(worksheet, startRow, startColumn, startRow, endColumn);
        panelTitleCell.value = title;
        panelTitleCell.alignment = { vertical: 'middle', horizontal: 'left' };
        applyCellTextStyle(panelTitleCell, { color: accentColor, bold: true, size: 10, name: 'Consolas' });

        const subtitleCell = mergeCellBlock(worksheet, startRow + 1, startColumn, startRow + 1, endColumn);
        subtitleCell.value = subtitle;
        subtitleCell.alignment = { vertical: 'middle', horizontal: 'left' };
        applyCellTextStyle(subtitleCell, { color: muted ? 'FF94A3B8' : 'FFC7D5E0', size: 9, name: 'Segoe UI' });

        items.forEach((sheetName, index) => {
            const rowNumber = startRow + 2 + index;
            if (rowNumber > endRow) return;
            const chipCell = mergeCellBlock(worksheet, rowNumber, startColumn, rowNumber, endColumn);
            setLinkedCell(chipCell, makeInternalLink(sheetName, toSheetAnchor(sheetName), getSheetMeta(sheetName).title), { underline: false });
            applyChipCellStyle(chipCell, accentColor, { muted });
        });
    };

    const titleCell = mergeCellBlock(worksheet, 1, 1, 1, 15);
    titleCell.value = meta.title;
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF071019' } };
    titleCell.border = BORDER_STYLE;
    titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
    applyCellTextStyle(titleCell, { color: 'FFFFFFFF', bold: true, size: 24, name: 'Segoe UI' });

    const heroSubtitleCell = mergeCellBlock(worksheet, 2, 1, 2, 15);
    heroSubtitleCell.value = meta.subtitle;
    heroSubtitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0E1824' } };
    heroSubtitleCell.border = BORDER_STYLE;
    heroSubtitleCell.alignment = { vertical: 'middle', horizontal: 'left' };
    applyCellTextStyle(heroSubtitleCell, { color: 'FFC7D5E0', size: 11, name: 'Segoe UI' });

    const infoCell = mergeCellBlock(worksheet, 3, 1, 3, 15);
    infoCell.value = `MASTER WORKBOOK | LAST SYNC ${formatGeneratedAt(generatedAt)} | CTRL+CLICK LINKS TO NAVIGATE`;
    infoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0E1824' } };
    infoCell.border = BORDER_STYLE;
    infoCell.alignment = { vertical: 'middle', horizontal: 'left' };
    applyCellTextStyle(infoCell, { color: 'FF14F195', bold: true, size: 9 });

    const helperCell = mergeCellBlock(worksheet, 4, 1, 4, 15);
    helperCell.value = 'Use the cards below for primary editing, the workflow panel for the sync cycle, and the grouped panels at the bottom for advanced sheets.';
    helperCell.fill = PANEL_FILL_ALT;
    helperCell.border = BORDER_STYLE;
    helperCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    applyCellTextStyle(helperCell, { color: 'FF94A3B8', size: 9, name: 'Segoe UI' });

    createSummaryCard({
        startRow: 5,
        startColumn: 1,
        title: 'PROFILE',
        value: 'Identity and about copy',
        note: '1 main editor surface',
        linkSheet: SHEET_NAMES.profile,
    });
    createSummaryCard({
        startRow: 5,
        startColumn: 6,
        title: 'PROJECTS',
        value: `${masterData.projectEntries.length} showcased projects`,
        note: 'Cards, media wiring, stack, and ordering',
        linkSheet: SHEET_NAMES.projects,
    });
    createSummaryCard({
        startRow: 5,
        startColumn: 11,
        title: 'TESTIMONIALS',
        value: `${masterData.testimonialEntries.length} client reviews`,
        note: 'Featured order, sources, and avatar assets',
        linkSheet: SHEET_NAMES.testimonials,
    });
    createSummaryCard({
        startRow: 10,
        startColumn: 1,
        title: 'HERO',
        value: `${masterData.heroMetadataEntries.length} metadata rows`,
        note: 'Landing copy, labels, and CTA wiring',
        linkSheet: SHEET_NAMES.hero,
    });
    createSummaryCard({
        startRow: 10,
        startColumn: 6,
        title: 'CONTACT',
        value: `${masterData.contactSocialEntries.length} social links`,
        note: 'Form labels, metadata, and footer copy',
        linkSheet: SHEET_NAMES.contact,
    });
    createSummaryCard({
        startRow: 10,
        startColumn: 11,
        title: 'ASSETS',
        value: `${masterData.assetEntries.length} registered assets`,
        note: 'Sources, resolved paths, usage, and previews',
        linkSheet: SHEET_NAMES.assets,
    });

    createTextPanel({
        startRow: 16,
        startColumn: 1,
        endRow: 21,
        endColumn: 8,
        title: 'WORKFLOW',
        body: '1. Jump into the section you want to edit.\n2. Make changes inside the shaded input area.\n3. Run npm run content:check for validation only.\n4. Run npm run content:sync to refresh the workbook and runtime JSON.\n5. Run npm run build when you want a full site verification.',
        accentColor: 'FF38BDF8',
    });

    createLinkPanel({
        startRow: 16,
        startColumn: 9,
        endRow: 21,
        endColumn: 15,
        title: 'COMMON EDITS',
        subtitle: 'Fast entry points for the sheets you will touch most often.',
        items: [README_SHEET, SHEET_NAMES.profile, SHEET_NAMES.projects, SHEET_NAMES.testimonials, SHEET_NAMES.assets],
        accentColor: 'FF14F195',
    });

    const advancedHeading = mergeCellBlock(worksheet, 23, 1, 23, 15);
    advancedHeading.value = 'ADVANCED SHEETS';
    advancedHeading.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F1720' } };
    advancedHeading.border = BORDER_STYLE;
    advancedHeading.alignment = { vertical: 'middle', horizontal: 'left' };
    applyCellTextStyle(advancedHeading, { color: 'FF94A3B8', bold: true, size: 11, name: 'Consolas' });

    createLinkPanel({
        startRow: 24,
        startColumn: 1,
        endRow: 30,
        endColumn: 3,
        title: 'SITE FRAME',
        subtitle: 'Navigation shell',
        items: [SHEET_NAMES.navigationConfig, SHEET_NAMES.navigation, SHEET_NAMES.sectionHeaders],
        accentColor: 'FF64748B',
        muted: true,
    });
    createLinkPanel({
        startRow: 24,
        startColumn: 4,
        endRow: 30,
        endColumn: 6,
        title: 'ABOUT',
        subtitle: 'Bio and hero support',
        items: [SHEET_NAMES.aboutBio, SHEET_NAMES.aboutStats, SHEET_NAMES.heroMetadata],
        accentColor: 'FF64748B',
        muted: true,
    });
    createLinkPanel({
        startRow: 24,
        startColumn: 7,
        endRow: 30,
        endColumn: 9,
        title: 'TERMINAL',
        subtitle: 'Command UX copy',
        items: [SHEET_NAMES.terminal, SHEET_NAMES.terminalLines, SHEET_NAMES.terminalCapabilities],
        accentColor: 'FF64748B',
        muted: true,
    });
    createLinkPanel({
        startRow: 24,
        startColumn: 10,
        endRow: 30,
        endColumn: 12,
        title: 'RELATIONS',
        subtitle: 'Skills and project links',
        items: [SHEET_NAMES.skillCategories, SHEET_NAMES.skillItems, SHEET_NAMES.projectStack, SHEET_NAMES.projectArch],
        accentColor: 'FF64748B',
        muted: true,
    });
    createLinkPanel({
        startRow: 24,
        startColumn: 13,
        endRow: 30,
        endColumn: 15,
        title: 'SOURCES',
        subtitle: 'Proof and footer',
        items: [SHEET_NAMES.testimonialSources, SHEET_NAMES.contactSocial, SHEET_NAMES.contactMetadata, SHEET_NAMES.footer],
        accentColor: 'FF64748B',
        muted: true,
    });

    worksheet.getRow(1).height = 32;
    worksheet.getRow(2).height = 22;
    worksheet.getRow(3).height = 20;
    worksheet.getRow(4).height = 20;
    for (let rowNumber = 5; rowNumber <= 14; rowNumber += 1) {
        worksheet.getRow(rowNumber).height = rowNumber === 5 || rowNumber === 10 ? 24 : 21;
    }
    for (let rowNumber = 16; rowNumber <= 30; rowNumber += 1) {
        worksheet.getRow(rowNumber).height = 22;
    }

    return worksheet;
}

function createReadmeSheet(workbook, generatedAt) {
    const worksheet = workbook.addWorksheet(README_SHEET, {
        views: [{ showGridLines: false, showRowColHeaders: false, state: 'frozen', ySplit: 4 }],
    });
    const meta = getSheetMeta(README_SHEET);
    worksheet.properties.tabColor = { argb: meta.tabColor };
    worksheet.columns = Array.from({ length: 12 }, () => ({ width: 15 }));
    fillCellRange(worksheet, 1, 1, 30, 12, CANVAS_FILL);

    const createGuidePanel = ({ startRow, startColumn, endRow, endColumn, title, body, accentColor }) => {
        fillCellRange(worksheet, startRow, startColumn, endRow, endColumn, PANEL_FILL, { accentColor });

        const panelTitleCell = mergeCellBlock(worksheet, startRow, startColumn, startRow, endColumn);
        panelTitleCell.value = title;
        panelTitleCell.alignment = { vertical: 'middle', horizontal: 'left' };
        applyCellTextStyle(panelTitleCell, { color: accentColor, bold: true, size: 10, name: 'Consolas' });

        const bodyCell = mergeCellBlock(worksheet, startRow + 1, startColumn, endRow, endColumn);
        bodyCell.value = body;
        bodyCell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
        applyCellTextStyle(bodyCell, { color: 'FFE5EEF5', size: 10, name: 'Segoe UI' });
    };

    const createLinkList = ({ startRow, startColumn, endRow, endColumn, title, items, accentColor, muted = false }) => {
        fillCellRange(worksheet, startRow, startColumn, endRow, endColumn, muted ? PANEL_MUTED_FILL : PANEL_FILL_ALT, { accentColor });

        const listTitleCell = mergeCellBlock(worksheet, startRow, startColumn, startRow, endColumn);
        listTitleCell.value = title;
        listTitleCell.alignment = { vertical: 'middle', horizontal: 'left' };
        applyCellTextStyle(listTitleCell, { color: accentColor, bold: true, size: 10, name: 'Consolas' });

        items.forEach((sheetName, index) => {
            const rowNumber = startRow + 1 + index;
            if (rowNumber > endRow) return;
            const chipCell = mergeCellBlock(worksheet, rowNumber, startColumn, rowNumber, endColumn);
            setLinkedCell(chipCell, makeInternalLink(sheetName, toSheetAnchor(sheetName), getSheetMeta(sheetName).title), { underline: false });
            applyChipCellStyle(chipCell, accentColor, { muted });
        });
    };

    const titleCell = mergeCellBlock(worksheet, 1, 1, 1, 12);
    titleCell.value = meta.title;
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B1119' } };
    titleCell.border = BORDER_STYLE;
    titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
    applyCellTextStyle(titleCell, { color: 'FFFFFFFF', bold: true, size: 22, name: 'Segoe UI' });

    const subtitleCell = mergeCellBlock(worksheet, 2, 1, 2, 12);
    subtitleCell.value = meta.subtitle;
    subtitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF101A27' } };
    subtitleCell.border = BORDER_STYLE;
    subtitleCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    applyCellTextStyle(subtitleCell, { color: 'FFC7D5E0', size: 11, name: 'Segoe UI' });

    const infoCell = mergeCellBlock(worksheet, 3, 1, 3, 12);
    infoCell.value =         `GUIDE SHEET | LAST SYNC ${formatGeneratedAt(generatedAt)} | START FROM HOME FOR THE FASTEST FLOW`;
    infoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF101A27' } };
    infoCell.border = BORDER_STYLE;
    infoCell.alignment = { vertical: 'middle', horizontal: 'left' };
    applyCellTextStyle(infoCell, { color: 'FF7DD3FC', bold: true, size: 9 });

    const backHomeCell = mergeCellBlock(worksheet, 4, 1, 4, 2);
    setLinkedCell(backHomeCell, makeInternalLink(HOME_SHEET, 'A1', 'Back to HOME'), { underline: false });
    applyChipCellStyle(backHomeCell, getAccentColor('home'));

    const helperCell = mergeCellBlock(worksheet, 4, 3, 4, 12);
    helperCell.value = 'Use the quick links below for the main editing areas. Open HOME if you need the full grouped navigation map.';
    helperCell.fill = PANEL_FILL_ALT;
    helperCell.border = BORDER_STYLE;
    helperCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    applyCellTextStyle(helperCell, { color: 'FF94A3B8', size: 9, name: 'Segoe UI' });

    const navLinks = [
        { text: 'Profile', sheetName: SHEET_NAMES.profile },
        { text: 'Projects', sheetName: SHEET_NAMES.projects },
        { text: 'Testimonials', sheetName: SHEET_NAMES.testimonials },
        { text: 'Assets', sheetName: SHEET_NAMES.assets },
        { text: 'Preview', sheetName: PREVIEW_SHEET },
    ];
    navLinks.forEach((link, index) => {
        const columnIndex = 1 + (index * 2);
        const cell = mergeCellBlock(worksheet, 5, columnIndex, 5, columnIndex + 1);
        setLinkedCell(cell, makeInternalLink(link.sheetName, 'A1', link.text), { underline: false });
        applyChipCellStyle(cell, getAccentColor('home'));
    });

    createGuidePanel({
        startRow: 7,
        startColumn: 1,
        endRow: 11,
        endColumn: 4,
        title: 'SOURCE OF TRUTH',
        body: 'Edit only src/data/content/portfolio-master.xlsx. The website consumes generated JSON, but the workbook is the only place you should author content.',
        accentColor: 'FF14F195',
    });
    createGuidePanel({
        startRow: 7,
        startColumn: 5,
        endRow: 11,
        endColumn: 8,
        title: 'COMMAND FLOW',
        body: 'content:init -> one-time bootstrap only\ncontent:check -> validation without publishing\ncontent:sync -> rebuild workbook UI and runtime JSON\nbuild -> final site verification',
        accentColor: 'FF38BDF8',
    });
    createGuidePanel({
        startRow: 7,
        startColumn: 9,
        endRow: 11,
        endColumn: 12,
        title: 'LINK BEHAVIOR',
        body: 'CTRL+CLICK linked ids to jump between sheets. assetId, project_id, sourceKey, and preview links are wired automatically every sync.',
        accentColor: 'FF8B5CF6',
    });

    createGuidePanel({
        startRow: 13,
        startColumn: 1,
        endRow: 18,
        endColumn: 4,
        title: 'ADD A PROJECT',
        body: '1. Add a row in PROJECTS.\n2. Add stack rows in PROJECT_STACK.\n3. Add architecture rows in PROJECT_ARCH.\n4. Point media fields to asset ids from ASSETS.\n5. Run content:sync.',
        accentColor: 'FF06B6D4',
    });
    createGuidePanel({
        startRow: 13,
        startColumn: 5,
        endRow: 18,
        endColumn: 8,
        title: 'ADD A TESTIMONIAL',
        body: '1. Add a row in TESTIMONIALS.\n2. Reuse or add a source preset in TESTIMONIAL_SOURCES.\n3. Set featured = TRUE to show it on the site.\n4. Use featuredOrder to control visible order.\n5. Run content:sync.',
        accentColor: 'FF22C55E',
    });
    createGuidePanel({
        startRow: 13,
        startColumn: 9,
        endRow: 18,
        endColumn: 12,
        title: 'ASSET MODES',
        body: 'existing_public -> file already lives inside public/\nimport_local -> copy a local file into public/\nexternal_url -> point directly to a remote asset',
        accentColor: 'FF8B5CF6',
    });

    createLinkList({
        startRow: 20,
        startColumn: 1,
        endRow: 27,
        endColumn: 6,
        title: 'PRIMARY EDIT SURFACES',
        items: PRIMARY_SHEET_ORDER.filter((sheetName) => ![HOME_SHEET, README_SHEET].includes(sheetName)),
        accentColor: 'FF38BDF8',
    });
    createLinkList({
        startRow: 20,
        startColumn: 7,
        endRow: 27,
        endColumn: 12,
        title: 'ADVANCED SHEETS',
        items: ADVANCED_SHEET_ORDER.slice(0, 7),
        accentColor: 'FF64748B',
        muted: true,
    });

    const advancedOverflowLabel = mergeCellBlock(worksheet, 28, 7, 28, 12);
    advancedOverflowLabel.value = 'Open HOME for the full grouped list of advanced sheets.';
    advancedOverflowLabel.fill = PANEL_MUTED_FILL;
    advancedOverflowLabel.border = BORDER_STYLE;
    advancedOverflowLabel.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    applyCellTextStyle(advancedOverflowLabel, { color: 'FF94A3B8', size: 9, name: 'Segoe UI' });

    worksheet.getRow(1).height = 30;
    worksheet.getRow(2).height = 22;
    worksheet.getRow(3).height = 20;
    worksheet.getRow(4).height = 20;
    for (let rowNumber = 5; rowNumber <= 28; rowNumber += 1) {
        worksheet.getRow(rowNumber).height = rowNumber === 5 ? 20 : 22;
    }

    return worksheet;
}

function createPreviewSheet(workbook, resolvedAssets, previewIndex, assetUsageIndex, generatedAt, sheetRowMaps) {
    const meta = getSheetMeta(PREVIEW_SHEET);
    const worksheet = workbook.addWorksheet(PREVIEW_SHEET);
    worksheet.properties.tabColor = { argb: meta.tabColor };
    worksheet.columns = [
        { key: 'assetId', width: 30 },
        { key: 'kind', width: 14 },
        { key: 'preview', width: 20 },
        { key: 'resolvedUrl', width: 46 },
        { key: 'usedBy', width: 30 },
        { key: 'openSource', width: 18 },
        { key: 'openResolved', width: 18 },
    ];

    const config = {
        name: PREVIEW_SHEET,
        columns: [
            { key: 'assetId', header: 'assetId', width: 30, required: true },
            { key: 'kind', header: 'kind', width: 14, required: true },
            { key: 'preview', header: 'preview', width: 20, generated: true },
            { key: 'resolvedUrl', header: 'resolvedUrl', width: 46, required: true, wrap: true },
            { key: 'usedBy', header: 'usedBy', width: 30, generated: true, wrap: true },
            { key: 'openSource', header: 'openSource', width: 18, generated: true },
            { key: 'openResolved', header: 'openResolved', width: 18, generated: true },
        ],
    };

    decorateDataSheetChrome(worksheet, config, generatedAt);
    const headerRow = getDataSheetMeta(PREVIEW_SHEET).headerRow ?? 8;
    const startRow = (getDataSheetMeta(PREVIEW_SHEET).tableStartRow ?? 9);

    config.columns.forEach((column, columnIndex) => {
        const headerCell = worksheet.getCell(headerRow, columnIndex + 1);
        headerCell.value = column.header;
        headerCell.fill = column.key === 'preview' ? HEADER_GENERATED_FILL : HEADER_OPTIONAL_FILL;
        headerCell.border = BORDER_STYLE;
        applyCellTextStyle(headerCell, { color: 'FFFFFFFF', bold: true, size: 11 });
    });

    resolvedAssets.forEach((asset, index) => {
        const preview = previewIndex.get(asset.assetId);
        const usageList = assetUsageIndex.get(asset.assetId) ?? [];
        const firstUsage = usageList[0];
        const rowNumber = startRow + index;
        const row = worksheet.getRow(rowNumber);

        row.height = 86;
        [
            { key: 'assetId', value: asset.assetId },
            { key: 'kind', value: `${asset.kind.toUpperCase()} | ${preview?.previewLabel ?? asset.kind.toUpperCase()}` },
            { key: 'preview', value: preview?.previewMode === 'placeholder' ? 'Illustrated preview card' : 'Embedded preview' },
            { key: 'resolvedUrl', value: asset.resolvedUrl || 'Unavailable' },
            { key: 'usedBy', value: usageList.length ? usageList.map((entry) => entry.label).join('\n') : 'No active references' },
            { key: 'openSource', value: preview?.sourceHref ? { text: 'Open source', hyperlink: preview.sourceHref } : 'No source' },
            { key: 'openResolved', value: preview?.resolvedHref ? { text: 'Open resolved', hyperlink: preview.resolvedHref } : 'Unavailable' },
        ].forEach((entry, columnIndex) => {
            const cell = row.getCell(columnIndex + 1);
            const rowFill = index % 2 === 0 ? BODY_ROW_FILL : BODY_ROW_ALT_FILL;
            setLinkedCell(cell, entry.value);
            cell.fill = columnIndex === 2 ? BODY_GENERATED_FILL : rowFill;
            cell.border = BORDER_STYLE;
            cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
            if (columnIndex !== 2) {
                applyCellTextStyle(cell, { color: 'FFE5EEF5', size: 10 });
            }
        });

        if (firstUsage) {
            const targetRow = sheetRowMaps[firstUsage.sheetName]?.get(firstUsage.rowKey);
            if (targetRow) {
                setLinkedCell(row.getCell(5), makeInternalLink(firstUsage.sheetName, `A${targetRow}`, row.getCell(5).value));
            }
        }

        if (preview?.previewPath) {
            const imageId = workbook.addImage({
                filename: preview.previewPath,
                extension: 'png',
            });

            worksheet.addImage(imageId, {
                tl: { col: 2.1, row: rowNumber - 0.85 },
                ext: { width: 124, height: 78 },
                editAs: 'oneCell',
            });
        }
    });

    worksheet.autoFilter = {
        from: { row: headerRow, column: 1 },
        to: { row: headerRow, column: config.columns.length },
    };

    return worksheet;
}

function buildPreviewRowMap(resolvedAssets) {
    const meta = getDataSheetMeta(PREVIEW_SHEET);
    return new Map(
        resolvedAssets.map((asset, index) => [asset.assetId, (meta.tableStartRow ?? 9) + index]),
    );
}

function getColumnIndexByKey(columns, key) {
    return columns.findIndex((column) => column.key === key) + 1;
}

function applyWorkbookCrossLinks(workbook, sheetDefinitions, masterData, resolvedAssets, previewIndex, assetUsageIndex) {
    const definitionByName = new Map(sheetDefinitions.map((definition) => [definition.name, definition]));
    const sheetRowMaps = Object.fromEntries(
        sheetDefinitions.map((definition) => [
            definition.name,
            new Map(
                definition.rows.map((row, index) => [
                    definition.rowKey(row, index),
                    (getDataSheetMeta(definition.name).tableStartRow ?? 9) + index,
                ]),
            ),
        ]),
    );
    const previewRowMap = buildPreviewRowMap(resolvedAssets);
    const assetSheetRows = sheetRowMaps[SHEET_NAMES.assets] ?? new Map();
    const projectRows = sheetRowMaps[SHEET_NAMES.projects] ?? new Map();
    const sourceRows = sheetRowMaps[SHEET_NAMES.testimonialSources] ?? new Map();
    const previewSheet = workbook.getWorksheet(PREVIEW_SHEET);

    const linkCellToSheetRow = (worksheet, rowNumber, columnIndex, targetSheet, targetRow, text) => {
        if (!worksheet || !columnIndex || !targetRow || !text) return;
        const cell = worksheet.getCell(rowNumber, columnIndex);
        setLinkedCell(cell, makeInternalLink(targetSheet, `A${targetRow}`, text));
    };

    const linkAssetReference = (sheetName, rowKey, columnKey, assetId) => {
        const rowNumber = sheetRowMaps[sheetName]?.get(rowKey);
        const targetRow = assetSheetRows.get(asString(assetId));
        const definition = definitionByName.get(sheetName);
        if (!rowNumber || !targetRow || !definition) return;
        linkCellToSheetRow(
            workbook.getWorksheet(sheetName),
            rowNumber,
            getColumnIndexByKey(definition.columns, columnKey),
            SHEET_NAMES.assets,
            targetRow,
            asString(assetId),
        );
    };

    linkAssetReference(SHEET_NAMES.profile, 'singleton', 'avatarAssetId', masterData.profileEntry.avatarAssetId);

    for (const project of masterData.projectEntries || []) {
        const rowKey = asString(project.id);
        linkAssetReference(SHEET_NAMES.projects, rowKey, 'videoAssetId', project.videoAssetId);
        linkAssetReference(SHEET_NAMES.projects, rowKey, 'thumbnailAssetId', project.thumbnailAssetId);
        linkAssetReference(SHEET_NAMES.projects, rowKey, 'iconAssetId', project.iconAssetId);
    }

    for (const row of masterData.projectStackEntries || []) {
        const rowNumber = sheetRowMaps[SHEET_NAMES.projectStack]?.get(
            `project-stack-${(masterData.projectStackEntries || []).indexOf(row) + 1}`,
        );
        const targetRow = projectRows.get(asString(row.project_id));
        const definition = definitionByName.get(SHEET_NAMES.projectStack);
        if (rowNumber && targetRow && definition) {
            linkCellToSheetRow(
                workbook.getWorksheet(SHEET_NAMES.projectStack),
                rowNumber,
                getColumnIndexByKey(definition.columns, 'project_id'),
                SHEET_NAMES.projects,
                targetRow,
                asString(row.project_id),
            );
        }
    }

    for (const row of masterData.projectArchEntries || []) {
        const rowNumber = sheetRowMaps[SHEET_NAMES.projectArch]?.get(
            `project-arch-${(masterData.projectArchEntries || []).indexOf(row) + 1}`,
        );
        const targetRow = projectRows.get(asString(row.project_id));
        const definition = definitionByName.get(SHEET_NAMES.projectArch);
        if (rowNumber && targetRow && definition) {
            linkCellToSheetRow(
                workbook.getWorksheet(SHEET_NAMES.projectArch),
                rowNumber,
                getColumnIndexByKey(definition.columns, 'project_id'),
                SHEET_NAMES.projects,
                targetRow,
                asString(row.project_id),
            );
        }
    }

    for (const row of masterData.testimonialEntries || []) {
        const rowKey = asString(row.id);
        const rowNumber = sheetRowMaps[SHEET_NAMES.testimonials]?.get(rowKey);
        const definition = definitionByName.get(SHEET_NAMES.testimonials);
        if (!rowNumber || !definition) continue;

        const sourceTargetRow = sourceRows.get(asString(row.sourceKey));
        if (sourceTargetRow) {
            linkCellToSheetRow(
                workbook.getWorksheet(SHEET_NAMES.testimonials),
                rowNumber,
                getColumnIndexByKey(definition.columns, 'sourceKey'),
                SHEET_NAMES.testimonialSources,
                sourceTargetRow,
                asString(row.sourceKey),
            );
        }

        if (row.avatarAssetId) {
            linkAssetReference(SHEET_NAMES.testimonials, rowKey, 'avatarAssetId', row.avatarAssetId);
        }
    }

    const assetDefinition = definitionByName.get(SHEET_NAMES.assets);
    const assetWorksheet = workbook.getWorksheet(SHEET_NAMES.assets);
    const assetRowsById = sheetRowMaps[SHEET_NAMES.assets] ?? new Map();
    const previewColumn = assetDefinition ? getColumnIndexByKey(assetDefinition.columns, 'previewLink') : 0;
    const sourceColumn = assetDefinition ? getColumnIndexByKey(assetDefinition.columns, 'openSource') : 0;
    const resolvedColumn = assetDefinition ? getColumnIndexByKey(assetDefinition.columns, 'openResolved') : 0;
    const usedByColumn = assetDefinition ? getColumnIndexByKey(assetDefinition.columns, 'usedBy') : 0;

    for (const asset of resolvedAssets) {
        const rowNumber = assetRowsById.get(asset.assetId);
        if (!rowNumber || !assetWorksheet) continue;

        const preview = previewIndex.get(asset.assetId);
        const previewRow = previewRowMap.get(asset.assetId);
        const usageList = assetUsageIndex.get(asset.assetId) ?? [];
        const firstUsage = usageList[0];

        if (sourceColumn && preview?.sourceHref) {
            setLinkedCell(assetWorksheet.getCell(rowNumber, sourceColumn), { text: 'Open source', hyperlink: preview.sourceHref });
            applyChipCellStyle(assetWorksheet.getCell(rowNumber, sourceColumn), getAccentColor('assets'));
        } else if (sourceColumn) {
            assetWorksheet.getCell(rowNumber, sourceColumn).value = 'No source';
        }

        if (resolvedColumn && preview?.resolvedHref) {
            setLinkedCell(assetWorksheet.getCell(rowNumber, resolvedColumn), { text: 'Open resolved', hyperlink: preview.resolvedHref });
            applyChipCellStyle(assetWorksheet.getCell(rowNumber, resolvedColumn), getAccentColor('assets'));
        } else if (resolvedColumn) {
            assetWorksheet.getCell(rowNumber, resolvedColumn).value = 'Unavailable';
        }

        if (usedByColumn) {
            const usedByCell = assetWorksheet.getCell(rowNumber, usedByColumn);
            if (firstUsage) {
                const targetRow = sheetRowMaps[firstUsage.sheetName]?.get(firstUsage.rowKey);
                setLinkedCell(
                    usedByCell,
                    makeInternalLink(
                        firstUsage.sheetName,
                        `A${targetRow}`,
                        usageList.length > 1 ? `${usageList.length} refs | ${firstUsage.label}` : firstUsage.label,
                    ),
                );
            } else {
                usedByCell.value = 'No references';
            }
            usedByCell.fill = GENERATED_FILL;
            usedByCell.border = BORDER_STYLE;
            usedByCell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
        }

        if (previewColumn && previewRow) {
            const previewCell = assetWorksheet.getCell(rowNumber, previewColumn);
            setLinkedCell(previewCell, makeInternalLink(PREVIEW_SHEET, `A${previewRow}`, 'Open preview'));
            applyChipCellStyle(previewCell, getAccentColor('assets'));
        }
    }

    const previewMeta = getDataSheetMeta(PREVIEW_SHEET);
    const previewStartRow = previewMeta.tableStartRow ?? 9;
    for (const asset of resolvedAssets) {
        const rowNumber = previewRowMap.get(asset.assetId);
        const targetRow = assetRowsById.get(asset.assetId);
        if (!rowNumber || !targetRow || !previewSheet) continue;
        setLinkedCell(
            previewSheet.getCell(rowNumber, 1),
            makeInternalLink(SHEET_NAMES.assets, `A${targetRow}`, asset.assetId),
        );
        previewSheet.getCell(rowNumber, 1).fill = REQUIRED_FILL;
        previewSheet.getCell(rowNumber, 1).border = BORDER_STYLE;
        previewSheet.getCell(rowNumber, 1).alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
    }
}

function isHyperlinkValue(value) {
    return Boolean(value && typeof value === 'object' && value.hyperlink);
}

function validateWorkbookPresentation(workbook, sheetDefinitions, resolvedAssets) {
    const visibleSheetOrder = workbook.worksheets
        .filter((worksheet) => worksheet.state !== 'hidden' && worksheet.state !== 'veryHidden')
        .map((worksheet) => worksheet.name);
    const expectedVisibleOrder = [...PRIMARY_SHEET_ORDER, ...ADVANCED_SHEET_ORDER];

    if (visibleSheetOrder.join('|') !== expectedVisibleOrder.join('|')) {
        throw new Error(`Workbook visible sheet order is invalid. Expected ${expectedVisibleOrder.join(' -> ')}.`);
    }

    const lookupSheet = workbook.getWorksheet(LOOKUP_SHEET);
    if (!lookupSheet || lookupSheet.state !== 'veryHidden') {
        throw new Error(`${LOOKUP_SHEET} must exist and remain veryHidden.`);
    }

    for (const worksheetName of [README_SHEET, ...getDataSheetOrder(), PREVIEW_SHEET]) {
        const worksheet = workbook.getWorksheet(worksheetName);
        if (!worksheet) {
            throw new Error(`Expected worksheet "${worksheetName}" to exist.`);
        }

        const homeLinkValue = worksheet.getCell(4, 1).value;
        if (!isHyperlinkValue(homeLinkValue) || !String(homeLinkValue.hyperlink).includes(HOME_SHEET)) {
            throw new Error(`Worksheet "${worksheetName}" is missing the Back to HOME link.`);
        }
    }

    for (const definition of sheetDefinitions) {
        const worksheet = workbook.getWorksheet(definition.name);
        const meta = getDataSheetMeta(definition.name);
        const headerValues = getHeaderValues(worksheet, meta.headerRow ?? 8);
        const expectedHeaders = definition.columns.map((column) => column.header);

        if (headerValues.slice(0, expectedHeaders.length).join('|') !== expectedHeaders.join('|')) {
            throw new Error(`Worksheet "${definition.name}" header row is not in the expected position.`);
        }
    }

    const previewWorksheet = workbook.getWorksheet(PREVIEW_SHEET);
    const previewMeta = getDataSheetMeta(PREVIEW_SHEET);
    const minimumPreviewRows = (previewMeta.tableStartRow ?? 9) + resolvedAssets.length - 1;
    if (previewWorksheet.rowCount < minimumPreviewRows) {
        throw new Error(`${PREVIEW_SHEET} is missing preview rows for one or more assets.`);
    }
}

async function validateWorkbookPresentationFile(workbookPath, sheetDefinitions, resolvedAssets) {
    const workbook = new Workbook();
    await workbook.xlsx.readFile(workbookPath);
    validateWorkbookPresentation(workbook, sheetDefinitions, resolvedAssets);
}

function getSheetDefinitions(masterData, resolvedAssets) {
    const singleRow = (row) => [row];
    const sheetDefinitions = [];

    sheetDefinitions.push({
        name: SHEET_NAMES.navigationConfig,
        singleRow: true,
        rowKey: () => 'singleton',
        rows: singleRow(masterData.navigationConfig),
        columns: [
            { key: 'brandFirst', header: 'brandFirst', width: 18, required: true },
            { key: 'brandLast', header: 'brandLast', width: 18, required: true },
            { key: 'logoIcon', header: 'logoIcon', width: 18, required: true },
            { key: 'terminalButton', header: 'terminalButton', width: 24, required: true },
            { key: 'rowStatus', header: 'rowStatus', width: 20, generated: true },
        ],
    });

    sheetDefinitions.push({
        name: SHEET_NAMES.navigation,
        rowKey: (row) => asString(row.id),
        rows: masterData.navigationEntries,
        columns: [
            { key: 'id', header: 'id', width: 18, required: true },
            { key: 'name', header: 'name', width: 20, required: true },
            { key: 'href', header: 'href', width: 24, required: true },
            { key: 'enabled', header: 'enabled', width: 12, required: true, validation: { lookup: 'booleanValues' } },
            { key: 'order', header: 'order', width: 10, required: true, validation: { type: 'whole', operator: 'greaterThan', formulae: [0] } },
            { key: 'rowStatus', header: 'rowStatus', width: 20, generated: true },
        ],
    });

    sheetDefinitions.push({
        name: SHEET_NAMES.profile,
        singleRow: true,
        rowKey: () => 'singleton',
        rows: singleRow({
            ...masterData.profileEntry,
            testimonialsTitle: masterData.testimonialsSection.title,
            testimonialsSubtitle: masterData.testimonialsSection.subtitle,
        }),
        columns: [
            { key: 'name', header: 'name', width: 28, required: true },
            { key: 'role', header: 'role', width: 32, required: true },
            { key: 'tagline', header: 'tagline', width: 56, required: true, wrap: true },
            { key: 'avatarAssetId', header: 'avatarAssetId', width: 24, required: true, validation: { lookup: 'assetIds' } },
            { key: 'aboutTitle', header: 'aboutTitle', width: 30, required: true, wrap: true },
            { key: 'philosophyLabel', header: 'philosophyLabel', width: 24, required: true },
            { key: 'philosophyQuote', header: 'philosophyQuote', width: 74, required: true, wrap: true },
            { key: 'github', header: 'github', width: 42, required: true },
            { key: 'linkedin', header: 'linkedin', width: 42, required: true },
            { key: 'testimonialsTitle', header: 'testimonialsTitle', width: 30, required: true },
            { key: 'testimonialsSubtitle', header: 'testimonialsSubtitle', width: 54, required: true, wrap: true },
            { key: 'rowStatus', header: 'rowStatus', width: 20, generated: true },
        ],
    });

    sheetDefinitions.push({
        name: SHEET_NAMES.aboutBio,
        rowKey: (row) => asString(row.paragraph_id),
        rows: masterData.aboutBioEntries,
        columns: [
            { key: 'paragraph_id', header: 'paragraph_id', width: 18, required: true },
            { key: 'text', header: 'text', width: 96, required: true, wrap: true },
            { key: 'order', header: 'order', width: 10, required: true, validation: { type: 'whole', operator: 'greaterThan', formulae: [0] } },
            { key: 'rowStatus', header: 'rowStatus', width: 20, generated: true },
        ],
    });

    sheetDefinitions.push({
        name: SHEET_NAMES.aboutStats,
        rowKey: (row) => asString(row.id),
        rows: masterData.aboutStatsEntries,
        columns: [
            { key: 'id', header: 'id', width: 18, required: true },
            { key: 'label', header: 'label', width: 26, required: true },
            { key: 'value', header: 'value', width: 16, required: true },
            { key: 'order', header: 'order', width: 10, required: true, validation: { type: 'whole', operator: 'greaterThan', formulae: [0] } },
            { key: 'rowStatus', header: 'rowStatus', width: 20, generated: true },
        ],
    });

    sheetDefinitions.push({
        name: SHEET_NAMES.hero,
        singleRow: true,
        rowKey: () => 'singleton',
        rows: singleRow(masterData.heroEntry),
        columns: [
            { key: 'priorityLabel', header: 'priorityLabel', width: 28, required: true },
            { key: 'titleWhite', header: 'titleWhite', width: 18, required: true },
            { key: 'titleGreen', header: 'titleGreen', width: 18, required: true },
            { key: 'handle', header: 'handle', width: 22, required: true },
            { key: 'description', header: 'description', width: 76, required: true, wrap: true },
            { key: 'buttonTerminal', header: 'buttonTerminal', width: 24, required: true },
            { key: 'buttonCv', header: 'buttonCv', width: 24, required: true },
            { key: 'buttonCvPending', header: 'buttonCvPending', width: 24, required: true },
            { key: 'buttonCvHref', header: 'buttonCvHref', width: 28, required: true },
            { key: 'rowStatus', header: 'rowStatus', width: 20, generated: true },
        ],
    });

    sheetDefinitions.push({
        name: SHEET_NAMES.heroMetadata,
        rowKey: (_, index) => `hero-meta-${index + 1}`,
        rows: masterData.heroMetadataEntries,
        columns: [
            { key: 'label', header: 'label', width: 24, required: true },
            { key: 'value', header: 'value', width: 32, required: true },
            { key: 'order', header: 'order', width: 10, required: true, validation: { type: 'whole', operator: 'greaterThan', formulae: [0] } },
            { key: 'rowStatus', header: 'rowStatus', width: 20, generated: true },
        ],
    });

    sheetDefinitions.push({
        name: SHEET_NAMES.terminal,
        singleRow: true,
        rowKey: () => 'singleton',
        rows: singleRow(masterData.terminalConfig),
        columns: [
            { key: 'headerTitle', header: 'headerTitle', width: 28, required: true },
            { key: 'welcomeMessage', header: 'welcomeMessage', width: 28, required: true },
            { key: 'tooltipTitle', header: 'tooltipTitle', width: 24, required: true },
            { key: 'tooltipDescription', header: 'tooltipDescription', width: 56, required: true, wrap: true },
            { key: 'tooltipUsage', header: 'tooltipUsage', width: 56, required: true, wrap: true },
            { key: 'rowStatus', header: 'rowStatus', width: 20, generated: true },
        ],
    });

    sheetDefinitions.push({
        name: SHEET_NAMES.terminalLines,
        rowKey: (_, index) => `terminal-line-${index + 1}`,
        rows: masterData.terminalLineEntries,
        columns: [
            { key: 'group', header: 'group', width: 16, required: true, validation: { lookup: 'terminalGroups' } },
            { key: 'text', header: 'text', width: 80, required: true, wrap: true },
            { key: 'color', header: 'color', width: 20, required: true, validation: { lookup: 'terminalColors' } },
            { key: 'order', header: 'order', width: 10, required: true, validation: { type: 'whole', operator: 'greaterThan', formulae: [0] } },
            { key: 'rowStatus', header: 'rowStatus', width: 24, generated: true },
        ],
    });

    sheetDefinitions.push({
        name: SHEET_NAMES.terminalCapabilities,
        rowKey: (_, index) => `terminal-capability-${index + 1}`,
        rows: masterData.terminalCapabilityEntries,
        columns: [
            { key: 'text', header: 'text', width: 80, required: true, wrap: true },
            { key: 'order', header: 'order', width: 10, required: true, validation: { type: 'whole', operator: 'greaterThan', formulae: [0] } },
            { key: 'rowStatus', header: 'rowStatus', width: 20, generated: true },
        ],
    });

    sheetDefinitions.push({
        name: SHEET_NAMES.sectionHeaders,
        rowKey: (row) => asString(row.section_id),
        rows: masterData.sectionHeaderEntries,
        columns: [
            { key: 'section_id', header: 'section_id', width: 18, required: true, validation: { lookup: 'sectionIds' } },
            { key: 'id', header: 'id', width: 18, required: true },
            { key: 'line1', header: 'line1', width: 24, required: true },
            { key: 'line2', header: 'line2', width: 24, required: true },
            { key: 'order', header: 'order', width: 10, required: true, validation: { type: 'whole', operator: 'greaterThan', formulae: [0] } },
            { key: 'rowStatus', header: 'rowStatus', width: 20, generated: true },
        ],
    });

    sheetDefinitions.push({
        name: SHEET_NAMES.skillCategories,
        rowKey: (row) => asString(row.category_id),
        rows: masterData.skillCategoryEntries,
        columns: [
            { key: 'category_id', header: 'category_id', width: 24, required: true },
            { key: 'title', header: 'title', width: 34, required: true },
            { key: 'icon', header: 'icon', width: 18, required: true, validation: { lookup: 'skillIcons' } },
            { key: 'color', header: 'color', width: 20, required: true, validation: { lookup: 'skillColors' } },
            { key: 'order', header: 'order', width: 10, required: true, validation: { type: 'whole', operator: 'greaterThan', formulae: [0] } },
            { key: 'rowStatus', header: 'rowStatus', width: 20, generated: true },
        ],
    });

    sheetDefinitions.push({
        name: SHEET_NAMES.skillItems,
        rowKey: (_, index) => `skill-item-${index + 1}`,
        rows: masterData.skillItemEntries,
        columns: [
            { key: 'category_id', header: 'category_id', width: 24, required: true, validation: { lookup: 'categoryIds' } },
            { key: 'label', header: 'label', width: 28, required: true },
            { key: 'order', header: 'order', width: 10, required: true, validation: { type: 'whole', operator: 'greaterThan', formulae: [0] } },
            { key: 'rowStatus', header: 'rowStatus', width: 20, generated: true },
        ],
    });

    sheetDefinitions.push({
        name: SHEET_NAMES.projects,
        rowKey: (row) => asString(row.id),
        rows: masterData.projectEntries,
        columns: [
            { key: 'id', header: 'id', width: 10, required: true, validation: { type: 'whole', operator: 'greaterThan', formulae: [0] } },
            { key: 'title', header: 'title', width: 28, required: true },
            { key: 'subtitle', header: 'subtitle', width: 34, required: true },
            { key: 'problem', header: 'problem', width: 72, required: true, wrap: true },
            { key: 'solution', header: 'solution', width: 72, required: true, wrap: true },
            { key: 'githubLink', header: 'githubLink', width: 44, required: true },
            { key: 'demoType', header: 'demoType', width: 16, required: true, validation: { lookup: 'demoTypes' } },
            { key: 'videoAssetId', header: 'videoAssetId', width: 24, validation: { lookup: 'assetIds' } },
            { key: 'thumbnailAssetId', header: 'thumbnailAssetId', width: 24, validation: { lookup: 'assetIds' } },
            { key: 'iconAssetId', header: 'iconAssetId', width: 24, validation: { lookup: 'assetIds' } },
            { key: 'iconFit', header: 'iconFit', width: 14, validation: { lookup: 'iconFits' } },
            { key: 'iconScale', header: 'iconScale', width: 14, validation: { type: 'decimal', operator: 'between', formulae: [0, 5] } },
            { key: 'order', header: 'order', width: 10, required: true, validation: { type: 'whole', operator: 'greaterThan', formulae: [0] } },
            { key: 'enabled', header: 'enabled', width: 12, required: true, validation: { lookup: 'booleanValues' } },
            { key: 'rowStatus', header: 'rowStatus', width: 20, generated: true },
        ],
    });

    sheetDefinitions.push({
        name: SHEET_NAMES.projectStack,
        rowKey: (_, index) => `project-stack-${index + 1}`,
        rows: masterData.projectStackEntries,
        columns: [
            { key: 'project_id', header: 'project_id', width: 14, required: true, validation: { lookup: 'projectIds' } },
            { key: 'label', header: 'label', width: 28, required: true },
            { key: 'order', header: 'order', width: 10, required: true, validation: { type: 'whole', operator: 'greaterThan', formulae: [0] } },
            { key: 'rowStatus', header: 'rowStatus', width: 20, generated: true },
        ],
    });

    sheetDefinitions.push({
        name: SHEET_NAMES.projectArch,
        rowKey: (_, index) => `project-arch-${index + 1}`,
        rows: masterData.projectArchEntries,
        columns: [
            { key: 'project_id', header: 'project_id', width: 14, required: true, validation: { lookup: 'projectIds' } },
            { key: 'label', header: 'label', width: 28, required: true },
            { key: 'order', header: 'order', width: 10, required: true, validation: { type: 'whole', operator: 'greaterThan', formulae: [0] } },
            { key: 'rowStatus', header: 'rowStatus', width: 20, generated: true },
        ],
    });

    sheetDefinitions.push({
        name: SHEET_NAMES.testimonialSources,
        rowKey: (row) => asString(row.sourceKey),
        rows: masterData.testimonialSourceEntries,
        columns: [
            { key: 'sourceKey', header: 'sourceKey', width: 18, required: true },
            { key: 'source', header: 'source', width: 18, required: true },
            { key: 'label', header: 'label', width: 30, required: true },
            { key: 'clientName', header: 'clientName', width: 24, required: true },
            { key: 'orderLabel', header: 'orderLabel', width: 34, required: true },
            { key: 'order', header: 'order', width: 10, required: true, validation: { type: 'whole', operator: 'greaterThan', formulae: [0] } },
            { key: 'rowStatus', header: 'rowStatus', width: 20, generated: true },
        ],
    });

    sheetDefinitions.push({
        name: SHEET_NAMES.testimonials,
        rowKey: (row) => asString(row.id),
        rows: masterData.testimonialEntries,
        columns: [
            { key: 'id', header: 'id', width: 28, required: true },
            { key: 'sourceKey', header: 'sourceKey', width: 18, required: true, validation: { lookup: 'sourceKeys' } },
            { key: 'labelOverride', header: 'labelOverride', width: 30 },
            { key: 'clientName', header: 'clientName', width: 24 },
            { key: 'clientType', header: 'clientType', width: 28 },
            { key: 'serviceOverride', header: 'serviceOverride', width: 34 },
            { key: 'review', header: 'review', width: 88, required: true, wrap: true },
            { key: 'starRating', header: 'starRating', width: 14, required: true, validation: { lookup: 'starValues' } },
            { key: 'gigTitle', header: 'gigTitle', width: 48, required: true, wrap: true },
            { key: 'createdAt', header: 'createdAt', width: 24, required: true },
            { key: 'avatarAssetId', header: 'avatarAssetId', width: 24, validation: { lookup: 'assetIds' } },
            { key: 'featured', header: 'featured', width: 12, required: true, validation: { lookup: 'booleanValues' } },
            { key: 'featuredOrder', header: 'featuredOrder', width: 14, validation: { type: 'whole', operator: 'greaterThan', formulae: [0] } },
            { key: 'order', header: 'order', width: 10, required: true, validation: { type: 'whole', operator: 'greaterThan', formulae: [0] } },
            { key: 'rowStatus', header: 'rowStatus', width: 20, generated: true },
        ],
    });

    sheetDefinitions.push({
        name: SHEET_NAMES.contact,
        singleRow: true,
        rowKey: () => 'singleton',
        rows: singleRow(masterData.contactEntry),
        columns: [
            { key: 'label', header: 'label', width: 26, required: true },
            { key: 'titleLine1', header: 'titleLine1', width: 20, required: true },
            { key: 'titleLine2', header: 'titleLine2', width: 20, required: true },
            { key: 'description', header: 'description', width: 72, required: true, wrap: true },
            { key: 'endpointLabel', header: 'endpointLabel', width: 24, required: true },
            { key: 'email', header: 'email', width: 34, required: true },
            { key: 'formNameLabel', header: 'formNameLabel', width: 24, required: true },
            { key: 'formNamePlaceholder', header: 'formNamePlaceholder', width: 28, required: true },
            { key: 'formEmailLabel', header: 'formEmailLabel', width: 24, required: true },
            { key: 'formEmailPlaceholder', header: 'formEmailPlaceholder', width: 28, required: true },
            { key: 'formMessageLabel', header: 'formMessageLabel', width: 26, required: true },
            { key: 'formMessagePlaceholder', header: 'formMessagePlaceholder', width: 36, required: true, wrap: true },
            { key: 'submitIdle', header: 'submitIdle', width: 24, required: true },
            { key: 'submitSending', header: 'submitSending', width: 24, required: true },
            { key: 'submitSuccess', header: 'submitSuccess', width: 24, required: true },
            { key: 'submitError', header: 'submitError', width: 24, required: true },
            { key: 'rowStatus', header: 'rowStatus', width: 20, generated: true },
        ],
    });

    sheetDefinitions.push({
        name: SHEET_NAMES.contactSocial,
        rowKey: (_, index) => `contact-social-${index + 1}`,
        rows: masterData.contactSocialEntries,
        columns: [
            { key: 'name', header: 'name', width: 18, required: true },
            { key: 'url', header: 'url', width: 46, required: true },
            { key: 'icon', header: 'icon', width: 18, required: true, validation: { lookup: 'socialIcons' } },
            { key: 'order', header: 'order', width: 10, required: true, validation: { type: 'whole', operator: 'greaterThan', formulae: [0] } },
            { key: 'enabled', header: 'enabled', width: 12, required: true, validation: { lookup: 'booleanValues' } },
            { key: 'rowStatus', header: 'rowStatus', width: 20, generated: true },
        ],
    });

    sheetDefinitions.push({
        name: SHEET_NAMES.contactMetadata,
        rowKey: (_, index) => `contact-metadata-${index + 1}`,
        rows: masterData.contactMetadataEntries,
        columns: [
            { key: 'label', header: 'label', width: 24, required: true },
            { key: 'value', header: 'value', width: 28, required: true },
            { key: 'activeValue', header: 'activeValue', width: 28 },
            { key: 'order', header: 'order', width: 10, required: true, validation: { type: 'whole', operator: 'greaterThan', formulae: [0] } },
            { key: 'rowStatus', header: 'rowStatus', width: 20, generated: true },
        ],
    });

    sheetDefinitions.push({
        name: SHEET_NAMES.footer,
        singleRow: true,
        rowKey: () => 'singleton',
        rows: singleRow(masterData.footerEntry),
        columns: [
            { key: 'name', header: 'name', width: 28, required: true },
            { key: 'status', header: 'status', width: 48, required: true },
            { key: 'location', header: 'location', width: 24, required: true },
            { key: 'vesselId', header: 'vesselId', width: 24, required: true },
            { key: 'rowStatus', header: 'rowStatus', width: 20, generated: true },
        ],
    });

    sheetDefinitions.push({
        name: SHEET_NAMES.assets,
        rowKey: (row) => asString(row.assetId),
        rows: resolvedAssets.map((asset) => ({
            assetId: asset.assetId,
            kind: asset.kind,
            mode: asset.mode,
            sourceValue: asset.sourceValue,
            targetPublicPath: asset.targetPublicPath,
            alt: asset.alt,
            notes: asset.notes,
            enabled: asset.enabled ? 'TRUE' : 'FALSE',
        })),
        columns: [
            { key: 'assetId', header: 'assetId', width: 28, required: true },
            { key: 'kind', header: 'kind', width: 14, required: true, validation: { lookup: 'assetKinds' } },
            { key: 'mode', header: 'mode', width: 18, required: true, validation: { lookup: 'assetModes' } },
            { key: 'sourceValue', header: 'sourceValue', width: 58, required: true, wrap: true },
            { key: 'targetPublicPath', header: 'targetPublicPath', width: 46, wrap: true },
            { key: 'alt', header: 'alt', width: 32 },
            { key: 'notes', header: 'notes', width: 46, wrap: true },
            { key: 'enabled', header: 'enabled', width: 12, required: true, validation: { lookup: 'booleanValues' } },
            { key: 'openSource', header: 'openSource', width: 18, generated: true },
            { key: 'openResolved', header: 'openResolved', width: 18, generated: true },
            { key: 'usedBy', header: 'usedBy', width: 32, generated: true, wrap: true },
            { key: 'previewLink', header: 'previewLink', width: 18, generated: true },
            { key: 'rowStatus', header: 'rowStatus', width: 32, generated: true },
        ],
    });

    return sheetDefinitions;
}

async function writeWorkbookFromMasterData(masterData, resolvedAssets, workbookPath = WORKBOOK_PATH) {
    const workbook = new Workbook();
    workbook.creator = 'Codex';
    workbook.lastModifiedBy = 'Codex';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.calcProperties.fullCalcOnLoad = true;
    const generatedAt = new Date().toISOString();
    const previewIndex = await buildAssetPreviewIndex(masterData, resolvedAssets, { rootDir });
    const assetUsageIndex = buildAssetUsageIndex(masterData);
    const rowStatusMaps = createRowStatusMaps(masterData, resolvedAssets);
    const sheetDefinitions = getSheetDefinitions(masterData, resolvedAssets);
    const primaryDefinitions = PRIMARY_SHEET_ORDER
        .filter((sheetName) => ![HOME_SHEET, README_SHEET, PREVIEW_SHEET].includes(sheetName))
        .map((sheetName) => sheetDefinitions.find((definition) => definition.name === sheetName))
        .filter(Boolean);
    const advancedDefinitions = ADVANCED_SHEET_ORDER
        .map((sheetName) => sheetDefinitions.find((definition) => definition.name === sheetName))
        .filter(Boolean);

    createHomeSheet(workbook, masterData, generatedAt);
    createReadmeSheet(workbook, generatedAt);

    const lookupValues = getLookupValues(masterData);
    const lookupFormulas = createLookupSheet(workbook, lookupValues);

    primaryDefinitions.forEach((sheetDefinition) => {
        buildDataSheet(workbook, sheetDefinition, lookupFormulas, rowStatusMaps, { generatedAt });
    });

    const sheetRowMaps = Object.fromEntries(
        [...primaryDefinitions, ...advancedDefinitions].map((definition) => [
            definition.name,
            new Map(
                definition.rows.map((row, index) => [
                    definition.rowKey(row, index),
                    (getDataSheetMeta(definition.name).tableStartRow ?? 9) + index,
                ]),
            ),
        ]),
    );

    createPreviewSheet(workbook, resolvedAssets, previewIndex, assetUsageIndex, generatedAt, sheetRowMaps);

    advancedDefinitions.forEach((sheetDefinition) => {
        buildDataSheet(workbook, sheetDefinition, lookupFormulas, rowStatusMaps, { generatedAt });
    });

    applyWorkbookCrossLinks(
        workbook,
        [...primaryDefinitions, ...advancedDefinitions],
        masterData,
        resolvedAssets,
        previewIndex,
        assetUsageIndex,
    );
    validateWorkbookPresentation(workbook, [...primaryDefinitions, ...advancedDefinitions], resolvedAssets);

    await ensureDir(path.dirname(workbookPath));
    try {
        await workbook.xlsx.writeFile(workbookPath);
    } catch (error) {
        if (error?.code === 'EBUSY') {
            throw new Error(`Cannot write ${workbookPath} because the workbook is open in Excel. Close the file and run content:sync again.`);
        }
        throw error;
    }
}

async function writeGeneratedJson(runtimeContent) {
    await ensureDir(path.dirname(GENERATED_JSON_PATH));
    await fs.writeFile(GENERATED_JSON_PATH, `${JSON.stringify(runtimeContent, null, 2)}\n`, 'utf8');
}

async function writeContentReadme() {
    await ensureDir(path.dirname(CONTENT_README_PATH));
    await fs.writeFile(CONTENT_README_PATH, `${CONTENT_README}\n`, 'utf8');
}

function readSheetRowsCompat(workbook, sheetName, expectedHeaders) {
    const worksheet = workbook.getWorksheet(sheetName);
    const meta = getDataSheetMeta(sheetName);
    return getSheetRows(worksheet, {
        headerRow: meta.headerRow ?? 8,
        fallbackHeaderRow: 1,
        expectedHeaders,
    }).map((row) => stripGeneratedFields(row, getGeneratedKeysForSheet(sheetName)));
}

function readSingleSheetRowCompat(workbook, sheetName, expectedHeaders) {
    return expectSingleRow(readSheetRowsCompat(workbook, sheetName, expectedHeaders), sheetName);
}

async function readWorkbookToMasterData(workbookPath = WORKBOOK_PATH) {
    const workbook = new Workbook();
    await workbook.xlsx.readFile(workbookPath);

    const navigationConfigRow = readSingleSheetRowCompat(workbook, SHEET_NAMES.navigationConfig, ['brandFirst', 'brandLast', 'logoIcon', 'terminalButton']);
    const profileRow = readSingleSheetRowCompat(workbook, SHEET_NAMES.profile, ['name', 'role', 'tagline', 'avatarAssetId']);
    const heroRow = readSingleSheetRowCompat(workbook, SHEET_NAMES.hero, ['priorityLabel', 'titleWhite', 'titleGreen']);
    const terminalRow = readSingleSheetRowCompat(workbook, SHEET_NAMES.terminal, ['headerTitle', 'welcomeMessage', 'tooltipTitle']);
    const contactRow = readSingleSheetRowCompat(workbook, SHEET_NAMES.contact, ['label', 'titleLine1', 'titleLine2', 'email']);
    const footerRow = readSingleSheetRowCompat(workbook, SHEET_NAMES.footer, ['name', 'status', 'location', 'vesselId']);

    return {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        navigationConfig: stripGeneratedFields(navigationConfigRow),
        navigationEntries: readSheetRowsCompat(workbook, SHEET_NAMES.navigation, ['id', 'name', 'href', 'enabled', 'order']),
        profileEntry: {
            name: asString(profileRow.name),
            role: asString(profileRow.role),
            tagline: asString(profileRow.tagline),
            avatarAssetId: asString(profileRow.avatarAssetId),
            aboutTitle: asString(profileRow.aboutTitle),
            philosophyLabel: asString(profileRow.philosophyLabel),
            philosophyQuote: asString(profileRow.philosophyQuote),
            github: asString(profileRow.github),
            linkedin: asString(profileRow.linkedin),
        },
        aboutBioEntries: readSheetRowsCompat(workbook, SHEET_NAMES.aboutBio, ['paragraph_id', 'text', 'order']),
        aboutStatsEntries: readSheetRowsCompat(workbook, SHEET_NAMES.aboutStats, ['id', 'label', 'value', 'order']),
        heroEntry: stripGeneratedFields(heroRow),
        heroMetadataEntries: readSheetRowsCompat(workbook, SHEET_NAMES.heroMetadata, ['label', 'value', 'order']),
        terminalConfig: stripGeneratedFields(terminalRow),
        terminalLineEntries: readSheetRowsCompat(workbook, SHEET_NAMES.terminalLines, ['group', 'text', 'color', 'order']),
        terminalCapabilityEntries: readSheetRowsCompat(workbook, SHEET_NAMES.terminalCapabilities, ['text', 'order']),
        sectionHeaderEntries: readSheetRowsCompat(workbook, SHEET_NAMES.sectionHeaders, ['section_id', 'id', 'line1', 'line2', 'order']),
        skillCategoryEntries: readSheetRowsCompat(workbook, SHEET_NAMES.skillCategories, ['category_id', 'title', 'icon', 'color', 'order']),
        skillItemEntries: readSheetRowsCompat(workbook, SHEET_NAMES.skillItems, ['category_id', 'label', 'order']),
        projectEntries: readSheetRowsCompat(workbook, SHEET_NAMES.projects, ['id', 'title', 'subtitle', 'problem', 'solution']),
        projectStackEntries: readSheetRowsCompat(workbook, SHEET_NAMES.projectStack, ['project_id', 'label', 'order']),
        projectArchEntries: readSheetRowsCompat(workbook, SHEET_NAMES.projectArch, ['project_id', 'label', 'order']),
        testimonialSourceEntries: readSheetRowsCompat(workbook, SHEET_NAMES.testimonialSources, ['sourceKey', 'source', 'label', 'clientName']),
        testimonialEntries: readSheetRowsCompat(workbook, SHEET_NAMES.testimonials, ['id', 'sourceKey', 'review', 'gigTitle', 'order']),
        testimonialsSection: {
            title: asString(profileRow.testimonialsTitle, 'Verified Client Feedback'),
            subtitle: asString(profileRow.testimonialsSubtitle, 'Real client feedback collected from completed projects.'),
        },
        contactEntry: stripGeneratedFields(contactRow),
        contactSocialEntries: readSheetRowsCompat(workbook, SHEET_NAMES.contactSocial, ['name', 'url', 'icon', 'order', 'enabled']),
        contactMetadataEntries: readSheetRowsCompat(workbook, SHEET_NAMES.contactMetadata, ['label', 'value', 'activeValue', 'order']),
        footerEntry: stripGeneratedFields(footerRow),
        assetEntries: readSheetRowsCompat(workbook, SHEET_NAMES.assets, ['assetId', 'kind', 'mode', 'sourceValue', 'enabled']),
    };
}

export async function initPortfolioWorkbook() {
    if (await pathExists(WORKBOOK_PATH)) {
        throw new Error(`Workbook already exists at ${WORKBOOK_PATH}. Use "npm run content:sync" instead of reinitializing.`);
    }

    const masterData = await loadCurrentSourceContent();
    const resolvedAssets = await resolveAssets(masterData.assetEntries, { writeAssets: false });
    const runtimeContent = buildRuntimeContent(masterData, resolvedAssets);

    await writeWorkbookFromMasterData(masterData, resolvedAssets);
    await writeGeneratedJson(runtimeContent);
    await writeContentReadme();

    return {
        workbookPath: WORKBOOK_PATH,
        generatedJsonPath: GENERATED_JSON_PATH,
        readmePath: CONTENT_README_PATH,
    };
}

export async function syncPortfolioContent({
    workbookPath = WORKBOOK_PATH,
    outputWorkbookPath = workbookPath,
    writeGeneratedOutput = true,
    writeWorkbookOutput = true,
} = {}) {
    if (!(await pathExists(workbookPath))) {
        throw new Error(`Workbook not found at ${workbookPath}. Run "npm run content:init" first.`);
    }

    const masterData = await readWorkbookToMasterData(workbookPath);
    const resolvedAssets = await resolveAssets(masterData.assetEntries, { writeAssets: true });
    const runtimeContent = buildRuntimeContent(masterData, resolvedAssets);

    if (writeWorkbookOutput) {
        await writeWorkbookFromMasterData(masterData, resolvedAssets, outputWorkbookPath);
    }

    if (writeGeneratedOutput) {
        await writeGeneratedJson(runtimeContent);
        await writeContentReadme();
    }

    return runtimeContent;
}

export async function checkPortfolioContent() {
    if (!(await pathExists(WORKBOOK_PATH))) {
        throw new Error(`Workbook not found at ${WORKBOOK_PATH}. Run "npm run content:init" first.`);
    }

    const masterData = await readWorkbookToMasterData(WORKBOOK_PATH);
    const resolvedAssets = await resolveAssets(masterData.assetEntries, { writeAssets: false });
    await validateWorkbookPresentationFile(WORKBOOK_PATH, getSheetDefinitions(masterData, resolvedAssets), resolvedAssets);
    return buildRuntimeContent(masterData, resolvedAssets);
}

function slugify(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function toArray(value) {
    return Array.isArray(value) ? value : [];
}

function sortByOrder(rows, field = 'order') {
    return [...rows].sort((left, right) => {
        const leftValue = Number(left?.[field] ?? 0);
        const rightValue = Number(right?.[field] ?? 0);
        if (leftValue === rightValue) {
            return String(left?.id ?? '').localeCompare(String(right?.id ?? ''));
        }
        return leftValue - rightValue;
    });
}

function asString(value, fallback = '') {
    if (value === null || value === undefined) return fallback;
    if (value instanceof Date && Number.isFinite(value.valueOf())) {
        return value.toISOString();
    }
    if (typeof value === 'object') {
        if (typeof value.text === 'string') {
            return value.text.trim();
        }
        if (Array.isArray(value.richText)) {
            return value.richText.map((entry) => entry.text ?? '').join('').trim();
        }
        if (typeof value.result === 'string' || typeof value.result === 'number') {
            return String(value.result).trim();
        }
        if (typeof value.hyperlink === 'string' && typeof value.text === 'string') {
            return value.text.trim();
        }
    }
    return String(value).trim();
}

function asNullableString(value) {
    const nextValue = asString(value);
    return nextValue ? nextValue : null;
}

function parseBoolean(value, fallback = false) {
    if (typeof value === 'boolean') return value;
    const normalized = asString(value).toLowerCase();
    if (!normalized) return fallback;
    if (['true', 'yes', '1'].includes(normalized)) return true;
    if (['false', 'no', '0'].includes(normalized)) return false;
    return fallback;
}

function parseOptionalNumber(value) {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function parseRequiredNumber(value, label) {
    const parsed = parseOptionalNumber(value);
    if (parsed === null) {
        throw new Error(`${label} must be a number.`);
    }
    return parsed;
}

function normalizeReview(review) {
    return asString(review).replace(/\s+/g, ' ').trim();
}

function parseStarRating(value) {
    if (value === null || value === undefined || value === '') return null;

    const normalized = String(value).replace('%', '').trim();
    if (!normalized || ['n/a', 'na', 'null', 'none', '-', '--'].includes(normalized.toLowerCase())) {
        return null;
    }

    const numericRating = Number(normalized);
    if (!Number.isFinite(numericRating)) return null;

    if (numericRating <= 5) {
        return Math.max(1, Math.min(5, Math.round(numericRating)));
    }

    return Math.max(1, Math.min(5, Math.round(numericRating / 20)));
}

function ensurePublicPath(inputPath) {
    const normalized = asString(inputPath);
    if (!normalized) return '';
    return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

function isExternalUrl(value) {
    return /^https?:\/\//i.test(asString(value));
}

function resolvePublicFilePath(publicPath) {
    const normalized = ensurePublicPath(publicPath);
    return path.join(rootDir, 'public', normalized.replace(/^\//, ''));
}

async function pathExists(targetPath) {
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

function getServiceProfile(gigTitle) {
    const normalizedTitle = asString(gigTitle).toLowerCase();

    if (normalizedTitle.includes('unity') && normalizedTitle.includes('ui toolkit')) {
        return {
            service: 'Unity UI / Game Systems',
            clientType: 'Game / Unity Client',
            avatarLabel: 'GS',
            avatarGradient: 'linear-gradient(135deg, rgba(15, 255, 153, 0.28) 0%, rgba(102, 252, 241, 0.2) 55%, rgba(11, 12, 16, 0.96) 100%)',
            avatarAccent: 'rgba(15, 255, 153, 0.36)',
        };
    }

    if (normalizedTitle.includes('unity')) {
        return {
            service: 'Unity UI / Editor Tools',
            clientType: 'Game / Unity Client',
            avatarLabel: 'UI',
            avatarGradient: 'linear-gradient(135deg, rgba(102, 252, 241, 0.24) 0%, rgba(15, 255, 153, 0.16) 52%, rgba(11, 12, 16, 0.96) 100%)',
            avatarAccent: 'rgba(102, 252, 241, 0.34)',
        };
    }

    if (normalizedTitle.includes('seo')) {
        return {
            service: 'Automation / SEO Workflow',
            clientType: 'SEO / Content Operations',
            avatarLabel: 'SEO',
            avatarGradient: 'linear-gradient(135deg, rgba(15, 255, 153, 0.26) 0%, rgba(41, 196, 255, 0.14) 48%, rgba(11, 12, 16, 0.96) 100%)',
            avatarAccent: 'rgba(15, 255, 153, 0.28)',
        };
    }

    return {
        service: 'Automation / Metadata Workflow',
        clientType: 'Operations / Media Client',
        avatarLabel: 'OPS',
        avatarGradient: 'linear-gradient(135deg, rgba(102, 252, 241, 0.22) 0%, rgba(15, 255, 153, 0.15) 50%, rgba(11, 12, 16, 0.96) 100%)',
        avatarAccent: 'rgba(102, 252, 241, 0.3)',
    };
}

async function importFreshModule(relativePath) {
    const absolutePath = path.join(rootDir, relativePath);
    return import(`${pathToFileURL(absolutePath).href}?t=${Date.now()}`);
}

function collectVisibleNavigationEntries(ui) {
    const currentNavigationMap = new Map(
        toArray(ui.navigation?.links).map((link) => [link.id, link]),
    );

    return NAVIGATION_BLUEPRINT.map((entry) => {
        const current = currentNavigationMap.get(entry.id);

        return {
            id: entry.id,
            name: current?.name ?? entry.name,
            href: current?.href ?? entry.href,
            enabled: currentNavigationMap.has(entry.id),
            order: entry.order,
        };
    });
}

function createAssetRegistrar() {
    const rows = [];
    const keys = new Set();

    const register = ({ assetId, kind, mode, sourceValue, targetPublicPath, alt = '', notes = '', enabled = true }) => {
        if (!assetId || keys.has(assetId)) return assetId || null;
        rows.push({ assetId, kind, mode, sourceValue, targetPublicPath, alt, notes, enabled });
        keys.add(assetId);
        return assetId;
    };

    return { rows, register };
}

export async function loadCurrentSourceContent() {
    const [profileModule, uiModule, projectSourcesModule, testimonialsModule] = await Promise.all([
        importFreshModule('src/data/profile.js'),
        importFreshModule('src/data/ui.js'),
        importFreshModule('src/data/projectSources.js'),
        importFreshModule('src/data/testimonials.js'),
    ]);

    const profile = cloneJson(profileModule.profile);
    const skills = cloneJson(profileModule.skills);
    const ui = cloneJson(uiModule.ui);
    const projectSources = cloneJson(projectSourcesModule.projectSources);
    const testimonialsSection = cloneJson(testimonialsModule.testimonialsSection);
    const testimonialSourcePresets = cloneJson(testimonialsModule.testimonialSourcePresets);
    const featuredTestimonialIds = cloneJson(testimonialsModule.featuredTestimonialIds);
    const testimonialEntries = cloneJson(testimonialsModule.testimonialEntries);
    const allTestimonials = cloneJson(testimonialsModule.allTestimonials);

    const assetRegistrar = createAssetRegistrar();
    const allTestimonialsById = new Map(allTestimonials.map((entry) => [entry.id, entry]));
    const skillCategoryIdByTitle = new Map();

    const profileAvatarAssetId = assetRegistrar.register({
        assetId: 'profile-avatar',
        kind: 'image',
        mode: isExternalUrl(profile.about.avatarUrl) ? 'external_url' : 'existing_public',
        sourceValue: profile.about.avatarUrl,
        targetPublicPath: isExternalUrl(profile.about.avatarUrl) ? '' : profile.about.avatarUrl,
        alt: `${profile.name} avatar`,
        notes: 'Main profile avatar',
        enabled: true,
    });

    const projectEntries = projectSources.map((project, index) => {
        const videoAssetId = project.videoSource
            ? assetRegistrar.register({
                assetId: `project-${project.id}-video`,
                kind: 'video',
                mode: isExternalUrl(project.videoSource) ? 'external_url' : 'existing_public',
                sourceValue: project.videoSource,
                targetPublicPath: isExternalUrl(project.videoSource) ? '' : project.videoSource,
                alt: `${project.title} demo video`,
                notes: `${project.title} master video source`,
                enabled: true,
            })
            : '';
        const thumbnailAssetId = project.thumbnail
            ? assetRegistrar.register({
                assetId: `project-${project.id}-thumbnail`,
                kind: 'image',
                mode: isExternalUrl(project.thumbnail) ? 'external_url' : 'existing_public',
                sourceValue: project.thumbnail,
                targetPublicPath: isExternalUrl(project.thumbnail) ? '' : project.thumbnail,
                alt: `${project.title} thumbnail`,
                notes: `${project.title} poster image`,
                enabled: true,
            })
            : '';
        const iconAssetId = project.icon
            ? assetRegistrar.register({
                assetId: `project-${project.id}-icon`,
                kind: 'icon',
                mode: isExternalUrl(project.icon) ? 'external_url' : 'existing_public',
                sourceValue: project.icon,
                targetPublicPath: isExternalUrl(project.icon) ? '' : project.icon,
                alt: `${project.title} icon`,
                notes: `${project.title} icon asset`,
                enabled: true,
            })
            : '';

        return {
            id: project.id,
            title: project.title,
            subtitle: project.subtitle,
            problem: project.problem,
            solution: project.solution,
            githubLink: project.githubLink,
            demoType: project.demoType,
            videoAssetId,
            thumbnailAssetId,
            iconAssetId,
            iconFit: project.iconFit ?? '',
            iconScale: project.iconScale ?? '',
            order: index + 1,
            enabled: true,
        };
    });

    const projectStackEntries = projectSources.flatMap((project) =>
        toArray(project.stack).map((label, index) => ({
            project_id: project.id,
            label,
            order: index + 1,
        })),
    );

    const projectArchEntries = projectSources.flatMap((project) =>
        toArray(project.arch).map((label, index) => ({
            project_id: project.id,
            label,
            order: index + 1,
        })),
    );

    const skillCategoryEntries = toArray(skills.categories).map((category, index) => {
        const categoryId = slugify(category.title) || `skill-category-${index + 1}`;
        skillCategoryIdByTitle.set(category.title, categoryId);

        return {
            category_id: categoryId,
            title: category.title,
            icon: category.icon,
            color: category.color,
            order: index + 1,
        };
    });

    const skillItemEntries = toArray(skills.categories).flatMap((category) => {
        const categoryId = skillCategoryIdByTitle.get(category.title);
        return toArray(category.items).map((label, index) => ({
            category_id: categoryId,
            label,
            order: index + 1,
        }));
    });

    const testimonialSourceEntries = Object.entries(testimonialSourcePresets).map(([sourceKey, preset], index) => ({
        sourceKey,
        source: preset.source,
        label: preset.label,
        clientName: preset.clientName,
        orderLabel: preset.orderLabel,
        order: index + 1,
    }));

    const featuredOrderMap = new Map(featuredTestimonialIds.map((id, index) => [id, index + 1]));
    const testimonialRows = testimonialEntries.map((entry, index) => {
        const resolved = allTestimonialsById.get(entry.id);
        let avatarAssetId = '';

        if (resolved?.avatarUrl) {
            const assetSlug = slugify(path.basename(resolved.avatarUrl, path.extname(resolved.avatarUrl)) || entry.id);
            avatarAssetId = assetRegistrar.register({
                assetId: `testimonial-${assetSlug}`,
                kind: 'image',
                mode: isExternalUrl(resolved.avatarUrl) ? 'external_url' : 'existing_public',
                sourceValue: resolved.avatarUrl,
                targetPublicPath: isExternalUrl(resolved.avatarUrl) ? '' : resolved.avatarUrl,
                alt: `${resolved.clientName || 'Client'} avatar`,
                notes: `Avatar used by testimonial ${entry.id}`,
                enabled: true,
            }) || '';
        }

        return {
            id: entry.id,
            sourceKey: entry.sourceKey,
            labelOverride: entry.labelOverride ?? '',
            clientName: entry.clientName ?? '',
            clientType: entry.clientType ?? resolved?.clientType ?? '',
            serviceOverride: entry.serviceOverride ?? resolved?.service ?? '',
            review: entry.review,
            starRating: parseStarRating(entry.starRating ?? resolved?.starRating ?? resolved?.rating) ?? 5,
            gigTitle: entry.gigTitle,
            createdAt: entry.createdAt,
            avatarAssetId,
            featured: featuredOrderMap.has(entry.id),
            featuredOrder: featuredOrderMap.get(entry.id) ?? '',
            order: index + 1,
        };
    });

    return {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        navigationConfig: {
            brandFirst: ui.navigation?.brand?.first ?? '',
            brandLast: ui.navigation?.brand?.last ?? '',
            logoIcon: ui.navigation?.brand?.logoIcon ?? '',
            terminalButton: ui.navigation?.terminalButton ?? '',
        },
        navigationEntries: collectVisibleNavigationEntries(ui),
        profileEntry: {
            name: profile.name,
            role: profile.role,
            tagline: profile.tagline,
            avatarAssetId: profileAvatarAssetId,
            aboutTitle: profile.about?.title ?? '',
            philosophyLabel: profile.about?.philosophy?.label ?? '',
            philosophyQuote: profile.about?.philosophy?.quote ?? '',
            github: profile.social?.github ?? '',
            linkedin: profile.social?.linkedin ?? '',
        },
        aboutBioEntries: toArray(profile.about?.bio).map((text, index) => ({
            paragraph_id: `bio-${index + 1}`,
            text,
            order: index + 1,
        })),
        aboutStatsEntries: toArray(profile.about?.stats).map((stat, index) => ({
            id: stat.id,
            label: stat.label,
            value: stat.value,
            order: index + 1,
        })),
        heroEntry: {
            priorityLabel: ui.hero?.priorityLabel ?? '',
            titleWhite: ui.hero?.title?.white ?? '',
            titleGreen: ui.hero?.title?.green ?? '',
            handle: ui.hero?.handle ?? '',
            description: ui.hero?.description ?? '',
            buttonTerminal: ui.hero?.buttons?.terminal ?? '',
            buttonCv: ui.hero?.buttons?.cv ?? '',
            buttonCvPending: ui.hero?.buttons?.cvPending ?? '',
            buttonCvHref: ui.hero?.buttons?.cvHref ?? '',
        },
        heroMetadataEntries: toArray(ui.hero?.metadata).map((entry, index) => ({
            label: entry.label,
            value: entry.value,
            order: index + 1,
        })),
        terminalConfig: {
            headerTitle: ui.terminal?.headerTitle ?? '',
            welcomeMessage: ui.terminal?.welcomeMessage ?? '',
            tooltipTitle: ui.terminal?.tooltip?.title ?? '',
            tooltipDescription: ui.terminal?.tooltip?.description ?? '',
            tooltipUsage: ui.terminal?.tooltip?.usage ?? '',
        },
        terminalLineEntries: [
            ...toArray(ui.terminal?.initialLines).map((line, index) => ({
                group: 'initial',
                text: line.text,
                color: line.color,
                order: index + 1,
            })),
            ...toArray(ui.terminal?.consoleGretting).map((line, index) => ({
                group: 'greeting',
                text: line.text,
                color: line.color,
                order: index + 1,
            })),
        ],
        terminalCapabilityEntries: toArray(ui.terminal?.tooltip?.capabilities).map((text, index) => ({
            text,
            order: index + 1,
        })),
        sectionHeaderEntries: SECTION_ORDER.map((sectionId, index) => ({
            section_id: sectionId,
            id: ui.sections?.[sectionId]?.id ?? '',
            line1: ui.sections?.[sectionId]?.line1 ?? '',
            line2: ui.sections?.[sectionId]?.line2 ?? '',
            order: index + 1,
        })),
        skillCategoryEntries,
        skillItemEntries,
        projectEntries,
        projectStackEntries,
        projectArchEntries,
        testimonialSourceEntries,
        testimonialEntries: testimonialRows,
        testimonialsSection: {
            title: testimonialsSection.title,
            subtitle: testimonialsSection.subtitle,
        },
        contactEntry: {
            label: ui.contact?.label ?? '',
            titleLine1: ui.contact?.titleLine1 ?? '',
            titleLine2: ui.contact?.titleLine2 ?? '',
            description: ui.contact?.description ?? '',
            endpointLabel: ui.contact?.endpointLabel ?? '',
            email: ui.contact?.email ?? '',
            formNameLabel: ui.contact?.form?.name?.label ?? '',
            formNamePlaceholder: ui.contact?.form?.name?.placeholder ?? '',
            formEmailLabel: ui.contact?.form?.email?.label ?? '',
            formEmailPlaceholder: ui.contact?.form?.email?.placeholder ?? '',
            formMessageLabel: ui.contact?.form?.message?.label ?? '',
            formMessagePlaceholder: ui.contact?.form?.message?.placeholder ?? '',
            submitIdle: ui.contact?.form?.submit?.idle ?? '',
            submitSending: ui.contact?.form?.submit?.sending ?? '',
            submitSuccess: ui.contact?.form?.submit?.success ?? '',
            submitError: ui.contact?.form?.submit?.error ?? '',
        },
        contactSocialEntries: toArray(ui.contact?.social).map((entry, index) => ({
            name: entry.name,
            url: entry.url,
            icon: entry.icon,
            order: index + 1,
            enabled: true,
        })),
        contactMetadataEntries: toArray(ui.contact?.metadata).map((entry, index) => ({
            label: entry.label,
            value: entry.value,
            activeValue: entry.activeValue ?? '',
            order: index + 1,
        })),
        footerEntry: {
            name: ui.footer?.name ?? '',
            status: ui.footer?.status ?? '',
            location: ui.footer?.location ?? '',
            vesselId: ui.footer?.vesselId ?? '',
        },
        assetEntries: assetRegistrar.rows,
    };
}

function rowObject(values, columns) {
    return columns.reduce((acc, column, index) => {
        acc[column] = values[index];
        return acc;
    }, {});
}

function getHeaderValues(worksheet, rowNumber) {
    return worksheet.getRow(rowNumber).values.slice(1).map((value) => asString(value));
}

function getSheetRows(worksheet, { headerRow = 1, fallbackHeaderRow = null, expectedHeaders = [] } = {}) {
    if (!worksheet) {
        throw new Error('Expected worksheet to exist.');
    }

    let resolvedHeaderRow = headerRow;
    let headerValues = getHeaderValues(worksheet, resolvedHeaderRow);
    const hasExpectedHeaders = expectedHeaders.length
        ? expectedHeaders.every((header) => headerValues.includes(header))
        : headerValues.length > 0;

    if ((!hasExpectedHeaders || !headerValues.length) && fallbackHeaderRow !== null) {
        resolvedHeaderRow = fallbackHeaderRow;
        headerValues = getHeaderValues(worksheet, resolvedHeaderRow);
    }

    if (!headerValues.length) {
        return [];
    }

    const rows = [];

    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber <= resolvedHeaderRow) return;

        const values = headerValues.map((_, index) => row.getCell(index + 1).value);
        const object = rowObject(values, headerValues);
        const hasMeaningfulValue = values.some((value) => {
            if (value === null || value === undefined) return false;
            if (typeof value === 'string' && !value.trim()) return false;
            return true;
        });

        if (hasMeaningfulValue) {
            rows.push(object);
        }
    });

    return rows;
}

function expectSingleRow(rows, sheetName) {
    if (rows.length !== 1) {
        throw new Error(`${sheetName} must contain exactly one data row.`);
    }
    return rows[0];
}

function assertRequired(value, label) {
    if (!asString(value)) {
        throw new Error(`${label} is required.`);
    }
}

function assertUniqueIds(rows, key, sheetName) {
    const seen = new Set();
    rows.forEach((row) => {
        const value = asString(row[key]);
        if (!value) {
            throw new Error(`${sheetName}.${key} is required.`);
        }
        if (seen.has(value)) {
            throw new Error(`Duplicate ${key} "${value}" found in ${sheetName}.`);
        }
        seen.add(value);
    });
}

async function resolveAssets(assetEntries, { writeAssets = false } = {}) {
    const assets = [];
    const assetIds = new Set();

    for (const entry of assetEntries) {
        const assetId = asString(entry.assetId);
        const kind = asString(entry.kind);
        const mode = asString(entry.mode);
        const sourceValue = asString(entry.sourceValue);
        const targetPublicPath = asString(entry.targetPublicPath);
        const enabled = parseBoolean(entry.enabled, true);

        if (!assetId) {
            throw new Error('ASSETS.assetId is required.');
        }
        if (assetIds.has(assetId)) {
            throw new Error(`Duplicate assetId "${assetId}" found in ASSETS.`);
        }
        assetIds.add(assetId);

        if (!ASSET_KINDS.includes(kind)) {
            throw new Error(`Asset "${assetId}" uses unsupported kind "${kind}".`);
        }

        if (!ASSET_MODES.includes(mode)) {
            throw new Error(`Asset "${assetId}" uses unsupported mode "${mode}".`);
        }

        let resolvedUrl = '';
        let previewSourcePath = null;

        if (enabled) {
            if (mode === 'external_url') {
                if (!isExternalUrl(sourceValue)) {
                    throw new Error(`Asset "${assetId}" must use an http(s) URL when mode is external_url.`);
                }
                resolvedUrl = sourceValue;
            }

            if (mode === 'existing_public') {
                const publicPath = ensurePublicPath(targetPublicPath || sourceValue);
                if (!publicPath) {
                    throw new Error(`Asset "${assetId}" needs targetPublicPath or sourceValue when mode is existing_public.`);
                }

                const absolutePath = resolvePublicFilePath(publicPath);
                if (!(await pathExists(absolutePath))) {
                    throw new Error(`Asset "${assetId}" points to missing public file "${publicPath}".`);
                }

                resolvedUrl = publicPath;
                previewSourcePath = absolutePath;
            }

            if (mode === 'import_local') {
                if (!sourceValue) {
                    throw new Error(`Asset "${assetId}" needs sourceValue when mode is import_local.`);
                }
                if (!targetPublicPath) {
                    throw new Error(`Asset "${assetId}" needs targetPublicPath when mode is import_local.`);
                }

                const absoluteSourcePath = path.isAbsolute(sourceValue)
                    ? sourceValue
                    : path.resolve(rootDir, sourceValue);

                if (!(await pathExists(absoluteSourcePath))) {
                    throw new Error(`Asset "${assetId}" points to missing local file "${absoluteSourcePath}".`);
                }

                const publicPath = ensurePublicPath(targetPublicPath);
                const absoluteTargetPath = resolvePublicFilePath(publicPath);
                await ensureDir(path.dirname(absoluteTargetPath));

                if (writeAssets) {
                    await fs.copyFile(absoluteSourcePath, absoluteTargetPath);
                }

                resolvedUrl = publicPath;
                previewSourcePath = absoluteSourcePath;
            }
        }

        assets.push({
            assetId,
            kind,
            mode,
            sourceValue,
            targetPublicPath,
            alt: asString(entry.alt),
            notes: asString(entry.notes),
            enabled,
            resolvedUrl,
            status: enabled ? (resolvedUrl ? `READY -> ${resolvedUrl}` : 'READY') : 'DISABLED',
            previewSourcePath,
        });
    }

    return assets;
}

function buildRuntimeContent(masterData, resolvedAssets) {
    assertRequired(masterData.profileEntry.name, 'PROFILE.name');
    assertRequired(masterData.profileEntry.role, 'PROFILE.role');
    assertRequired(masterData.profileEntry.tagline, 'PROFILE.tagline');
    assertRequired(masterData.profileEntry.aboutTitle, 'PROFILE.aboutTitle');
    assertRequired(masterData.heroEntry.priorityLabel, 'HERO.priorityLabel');
    assertRequired(masterData.heroEntry.titleWhite, 'HERO.titleWhite');
    assertRequired(masterData.heroEntry.titleGreen, 'HERO.titleGreen');
    assertRequired(masterData.contactEntry.email, 'CONTACT.email');

    assertUniqueIds(masterData.navigationEntries, 'id', SHEET_NAMES.navigation);
    assertUniqueIds(masterData.aboutStatsEntries, 'id', SHEET_NAMES.aboutStats);
    assertUniqueIds(masterData.skillCategoryEntries, 'category_id', SHEET_NAMES.skillCategories);
    assertUniqueIds(masterData.projectEntries, 'id', SHEET_NAMES.projects);
    assertUniqueIds(masterData.testimonialSourceEntries, 'sourceKey', SHEET_NAMES.testimonialSources);
    assertUniqueIds(masterData.testimonialEntries, 'id', SHEET_NAMES.testimonials);

    const assetsById = new Map(resolvedAssets.map((asset) => [asset.assetId, asset]));
    const skillCategoryIdSet = new Set(masterData.skillCategoryEntries.map((entry) => entry.category_id));
    const projectIdSet = new Set(masterData.projectEntries.map((entry) => String(entry.id)));
    const testimonialSourceKeySet = new Set(masterData.testimonialSourceEntries.map((entry) => entry.sourceKey));

    masterData.skillItemEntries.forEach((entry) => {
        if (!skillCategoryIdSet.has(asString(entry.category_id))) {
            throw new Error(`SKILL_ITEMS references unknown category_id "${entry.category_id}".`);
        }
    });

    masterData.projectStackEntries.forEach((entry) => {
        if (!projectIdSet.has(asString(entry.project_id))) {
            throw new Error(`PROJECT_STACK references unknown project_id "${entry.project_id}".`);
        }
    });

    masterData.projectArchEntries.forEach((entry) => {
        if (!projectIdSet.has(asString(entry.project_id))) {
            throw new Error(`PROJECT_ARCH references unknown project_id "${entry.project_id}".`);
        }
    });

    masterData.terminalLineEntries.forEach((entry) => {
        if (!TERMINAL_COLORS.includes(asString(entry.color))) {
            throw new Error(`TERMINAL_LINES uses unsupported color "${entry.color}".`);
        }
    });

    masterData.skillCategoryEntries.forEach((entry) => {
        if (!SKILL_ICONS.includes(asString(entry.icon))) {
            throw new Error(`SKILL_CATEGORIES uses unsupported icon "${entry.icon}".`);
        }

        if (!SKILL_COLORS.includes(asString(entry.color))) {
            throw new Error(`SKILL_CATEGORIES uses unsupported color "${entry.color}".`);
        }
    });

    masterData.contactSocialEntries.forEach((entry) => {
        if (!SOCIAL_ICONS.includes(asString(entry.icon))) {
            throw new Error(`CONTACT_SOCIAL uses unsupported icon "${entry.icon}".`);
        }
    });

    masterData.testimonialEntries.forEach((entry) => {
        if (!testimonialSourceKeySet.has(asString(entry.sourceKey))) {
            throw new Error(`TESTIMONIALS references unknown sourceKey "${entry.sourceKey}".`);
        }

        if (asString(entry.avatarAssetId) && !assetsById.has(asString(entry.avatarAssetId))) {
            throw new Error(`TESTIMONIALS references unknown avatarAssetId "${entry.avatarAssetId}".`);
        }
    });

    const resolveAssetUrl = (assetId, fieldLabel, { optional = false } = {}) => {
        const normalizedAssetId = asString(assetId);
        if (!normalizedAssetId) {
            if (optional) return '';
            throw new Error(`${fieldLabel} is required.`);
        }

        const asset = assetsById.get(normalizedAssetId);
        if (!asset || !asset.enabled) {
            throw new Error(`${fieldLabel} references unavailable asset "${normalizedAssetId}".`);
        }

        return asset.resolvedUrl;
    };

    const navigationEntries = sortByOrder(masterData.navigationEntries).map((entry) => ({
        id: asString(entry.id),
        name: asString(entry.name),
        href: asString(entry.href),
        enabled: parseBoolean(entry.enabled, true),
        order: parseRequiredNumber(entry.order, `NAVIGATION.order for ${entry.id}`),
    }));

    const enabledNavigationEntries = navigationEntries
        .filter((entry) => entry.enabled)
        .sort((left, right) => left.order - right.order)
        .map((entry, index) => ({
            id: entry.id,
            name: entry.name,
            href: entry.href,
            num: String(index + 1).padStart(2, '0'),
        }));

    const sectionHeaderEntries = sortByOrder(masterData.sectionHeaderEntries).reduce((acc, entry) => {
        acc[asString(entry.section_id)] = {
            id: asString(entry.id),
            line1: asString(entry.line1),
            line2: asString(entry.line2),
        };
        return acc;
    }, {});

    const skillCategories = sortByOrder(masterData.skillCategoryEntries).map((category) => ({
        title: asString(category.title),
        icon: asString(category.icon),
        color: asString(category.color),
        items: sortByOrder(
            masterData.skillItemEntries.filter((entry) => asString(entry.category_id) === asString(category.category_id)),
        ).map((entry) => asString(entry.label)),
    }));

    const projectSources = sortByOrder(masterData.projectEntries)
        .filter((entry) => parseBoolean(entry.enabled, true))
        .map((entry) => {
            const demoType = asString(entry.demoType);
            const iconFit = asNullableString(entry.iconFit);

            if (!DEMO_TYPES.includes(demoType)) {
                throw new Error(`PROJECTS.demoType for "${entry.id}" must be one of: ${DEMO_TYPES.join(', ')}.`);
            }

            if (iconFit && !ICON_FITS.includes(iconFit)) {
                throw new Error(`PROJECTS.iconFit for "${entry.id}" must be one of: ${ICON_FITS.filter(Boolean).join(', ')}.`);
            }

            return {
                id: parseRequiredNumber(entry.id, `PROJECTS.id for ${entry.title}`),
                title: asString(entry.title),
                subtitle: asString(entry.subtitle),
                problem: asString(entry.problem),
                solution: asString(entry.solution),
                stack: sortByOrder(
                    masterData.projectStackEntries.filter((stackEntry) => asString(stackEntry.project_id) === asString(entry.id)),
                ).map((stackEntry) => asString(stackEntry.label)),
                arch: sortByOrder(
                    masterData.projectArchEntries.filter((archEntry) => asString(archEntry.project_id) === asString(entry.id)),
                ).map((archEntry) => asString(archEntry.label)),
                githubLink: asString(entry.githubLink),
                demoType,
                videoSource: resolveAssetUrl(entry.videoAssetId, `PROJECTS.videoAssetId for ${entry.id}`, { optional: true }) || null,
                thumbnail: resolveAssetUrl(entry.thumbnailAssetId, `PROJECTS.thumbnailAssetId for ${entry.id}`, { optional: true }) || null,
                icon: resolveAssetUrl(entry.iconAssetId, `PROJECTS.iconAssetId for ${entry.id}`, { optional: true }) || null,
                iconFit,
                iconScale: parseOptionalNumber(entry.iconScale),
            };
        });

    const testimonialSourcePresets = sortByOrder(masterData.testimonialSourceEntries).reduce((acc, entry) => {
        acc[asString(entry.sourceKey)] = {
            source: asString(entry.source),
            label: asString(entry.label),
            clientName: asString(entry.clientName),
            orderLabel: asString(entry.orderLabel),
        };
        return acc;
    }, {});

    const normalizedTestimonialEntries = sortByOrder(masterData.testimonialEntries)
        .map((entry) => ({
            id: asString(entry.id),
            sourceKey: asString(entry.sourceKey),
            labelOverride: asNullableString(entry.labelOverride),
            clientName: asNullableString(entry.clientName),
            clientType: asNullableString(entry.clientType),
            serviceOverride: asNullableString(entry.serviceOverride),
            review: normalizeReview(entry.review),
            starRating: parseStarRating(entry.starRating) ?? 5,
            gigTitle: asString(entry.gigTitle),
            createdAt: asString(entry.createdAt),
            avatarAssetId: asNullableString(entry.avatarAssetId),
            avatarUrl: resolveAssetUrl(entry.avatarAssetId, `TESTIMONIALS.avatarAssetId for ${entry.id}`, { optional: true }) || null,
            featured: parseBoolean(entry.featured, false),
            featuredOrder: parseOptionalNumber(entry.featuredOrder),
            order: parseRequiredNumber(entry.order, `TESTIMONIALS.order for ${entry.id}`),
        }));

    const normalizedAllTestimonials = normalizedTestimonialEntries
        .map((entry) => {
            const serviceProfile = getServiceProfile(entry.gigTitle);
            const sourcePreset = testimonialSourcePresets[entry.sourceKey];
            const confirmedRating = parseStarRating(entry.starRating);

            return {
                id: entry.id,
                source: sourcePreset.source,
                label: entry.labelOverride ?? sourcePreset.label,
                orderLabel: sourcePreset.orderLabel,
                review: entry.review,
                service: entry.serviceOverride ?? serviceProfile.service,
                clientName: entry.clientName ?? sourcePreset.clientName,
                clientType: entry.clientType ?? serviceProfile.clientType,
                avatarType: entry.avatarUrl ? 'generated-photo' : 'generated',
                avatarUrl: entry.avatarUrl,
                avatarLabel: serviceProfile.avatarLabel,
                avatarGradient: serviceProfile.avatarGradient,
                avatarAccent: serviceProfile.avatarAccent,
                rating: confirmedRating ?? 5,
                hasConfirmedRating: confirmedRating !== null,
                createdAt: entry.createdAt,
                featured: entry.featured,
            };
        })
        .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

    const featuredTestimonialIds = normalizedTestimonialEntries
        .filter((entry) => entry.featured)
        .sort((left, right) => {
            const leftOrder = left.featuredOrder ?? Number.MAX_SAFE_INTEGER;
            const rightOrder = right.featuredOrder ?? Number.MAX_SAFE_INTEGER;
            if (leftOrder === rightOrder) {
                return left.order - right.order;
            }
            return leftOrder - rightOrder;
        })
        .map((entry) => entry.id);

    const featuredTestimonials = featuredTestimonialIds
        .map((testimonialId) => normalizedAllTestimonials.find((entry) => entry.id === testimonialId))
        .filter(Boolean);

    const profile = {
        name: asString(masterData.profileEntry.name),
        role: asString(masterData.profileEntry.role),
        tagline: asString(masterData.profileEntry.tagline),
        about: {
            avatarUrl: resolveAssetUrl(masterData.profileEntry.avatarAssetId, 'PROFILE.avatarAssetId'),
            title: asString(masterData.profileEntry.aboutTitle),
            bio: sortByOrder(masterData.aboutBioEntries).map((entry) => asString(entry.text)),
            philosophy: {
                label: asString(masterData.profileEntry.philosophyLabel),
                quote: asString(masterData.profileEntry.philosophyQuote),
            },
            stats: sortByOrder(masterData.aboutStatsEntries).map((entry) => ({
                label: asString(entry.label),
                value: asString(entry.value),
                id: asString(entry.id),
            })),
            testimonialsSection: cloneJson(masterData.testimonialsSection),
            testimonials: featuredTestimonials,
        },
        social: {
            github: asString(masterData.profileEntry.github),
            linkedin: asString(masterData.profileEntry.linkedin),
        },
    };

    const ui = {
        navigation: {
            brand: {
                first: asString(masterData.navigationConfig.brandFirst),
                last: asString(masterData.navigationConfig.brandLast),
                logoIcon: asString(masterData.navigationConfig.logoIcon),
            },
            links: enabledNavigationEntries,
            terminalButton: asString(masterData.navigationConfig.terminalButton),
        },
        hero: {
            priorityLabel: asString(masterData.heroEntry.priorityLabel),
            title: {
                white: asString(masterData.heroEntry.titleWhite),
                green: asString(masterData.heroEntry.titleGreen),
            },
            handle: asString(masterData.heroEntry.handle),
            description: asString(masterData.heroEntry.description),
            buttons: {
                terminal: asString(masterData.heroEntry.buttonTerminal),
                cv: asString(masterData.heroEntry.buttonCv),
                cvPending: asString(masterData.heroEntry.buttonCvPending),
                cvHref: asString(masterData.heroEntry.buttonCvHref),
            },
            metadata: sortByOrder(masterData.heroMetadataEntries).map((entry) => ({
                label: asString(entry.label),
                value: asString(entry.value),
            })),
        },
        terminal: {
            headerTitle: asString(masterData.terminalConfig.headerTitle),
            welcomeMessage: asString(masterData.terminalConfig.welcomeMessage),
            initialLines: sortByOrder(
                masterData.terminalLineEntries.filter((entry) => asString(entry.group) === 'initial'),
            ).map((entry) => ({
                text: asString(entry.text),
                color: asString(entry.color),
            })),
            consoleGretting: sortByOrder(
                masterData.terminalLineEntries.filter((entry) => asString(entry.group) === 'greeting'),
            ).map((entry) => ({
                text: asString(entry.text),
                color: asString(entry.color),
            })),
            tooltip: {
                title: asString(masterData.terminalConfig.tooltipTitle),
                description: asString(masterData.terminalConfig.tooltipDescription),
                capabilities: sortByOrder(masterData.terminalCapabilityEntries).map((entry) => asString(entry.text)),
                usage: asString(masterData.terminalConfig.tooltipUsage),
            },
        },
        sections: sectionHeaderEntries,
        contact: {
            label: asString(masterData.contactEntry.label),
            titleLine1: asString(masterData.contactEntry.titleLine1),
            titleLine2: asString(masterData.contactEntry.titleLine2),
            description: asString(masterData.contactEntry.description),
            endpointLabel: asString(masterData.contactEntry.endpointLabel),
            email: asString(masterData.contactEntry.email),
            social: sortByOrder(masterData.contactSocialEntries)
                .filter((entry) => parseBoolean(entry.enabled, true))
                .map((entry) => ({
                    name: asString(entry.name),
                    url: asString(entry.url),
                    icon: asString(entry.icon),
                })),
            form: {
                name: {
                    label: asString(masterData.contactEntry.formNameLabel),
                    placeholder: asString(masterData.contactEntry.formNamePlaceholder),
                },
                email: {
                    label: asString(masterData.contactEntry.formEmailLabel),
                    placeholder: asString(masterData.contactEntry.formEmailPlaceholder),
                },
                message: {
                    label: asString(masterData.contactEntry.formMessageLabel),
                    placeholder: asString(masterData.contactEntry.formMessagePlaceholder),
                },
                submit: {
                    idle: asString(masterData.contactEntry.submitIdle),
                    sending: asString(masterData.contactEntry.submitSending),
                    success: asString(masterData.contactEntry.submitSuccess),
                    error: asString(masterData.contactEntry.submitError),
                },
            },
            metadata: sortByOrder(masterData.contactMetadataEntries).map((entry) => ({
                label: asString(entry.label),
                value: asString(entry.value),
                activeValue: asNullableString(entry.activeValue),
            })),
        },
        footer: {
            name: asString(masterData.footerEntry.name),
            status: asString(masterData.footerEntry.status),
            location: asString(masterData.footerEntry.location),
            vesselId: asString(masterData.footerEntry.vesselId),
        },
    };

    const runtime = {
        siteFeatures: {
            architectSection: enabledNavigationEntries.some((entry) => entry.id === 'architect'),
        },
        profile,
        skills: { categories: skillCategories },
        ui,
        projectSources,
        testimonialsSection: cloneJson(masterData.testimonialsSection),
        testimonialSourcePresets,
        featuredTestimonialIds,
        testimonialEntries: normalizedTestimonialEntries,
        allTestimonials: normalizedAllTestimonials,
        featuredTestimonials,
        assets: resolvedAssets.map((asset) => ({
            assetId: asset.assetId,
            kind: asset.kind,
            mode: asset.mode,
            sourceValue: asset.sourceValue,
            targetPublicPath: asset.targetPublicPath,
            alt: asset.alt,
            notes: asset.notes,
            enabled: asset.enabled,
            resolvedUrl: asset.resolvedUrl,
            status: asset.status,
        })),
    };

    return {
        schemaVersion: masterData.schemaVersion ?? 1,
        generatedAt: new Date().toISOString(),
        navigationConfig: cloneJson(masterData.navigationConfig),
        navigationEntries: cloneJson(masterData.navigationEntries),
        profileEntry: cloneJson(masterData.profileEntry),
        aboutBioEntries: cloneJson(masterData.aboutBioEntries),
        aboutStatsEntries: cloneJson(masterData.aboutStatsEntries),
        heroEntry: cloneJson(masterData.heroEntry),
        heroMetadataEntries: cloneJson(masterData.heroMetadataEntries),
        terminalConfig: cloneJson(masterData.terminalConfig),
        terminalLineEntries: cloneJson(masterData.terminalLineEntries),
        terminalCapabilityEntries: cloneJson(masterData.terminalCapabilityEntries),
        sectionHeaderEntries: cloneJson(masterData.sectionHeaderEntries),
        skillCategoryEntries: cloneJson(masterData.skillCategoryEntries),
        skillItemEntries: cloneJson(masterData.skillItemEntries),
        projectEntries: cloneJson(masterData.projectEntries),
        projectStackEntries: cloneJson(masterData.projectStackEntries),
        projectArchEntries: cloneJson(masterData.projectArchEntries),
        testimonialSourceEntries: cloneJson(masterData.testimonialSourceEntries),
        testimonialEntries: cloneJson(masterData.testimonialEntries),
        testimonialsSection: cloneJson(masterData.testimonialsSection),
        contactEntry: cloneJson(masterData.contactEntry),
        contactSocialEntries: cloneJson(masterData.contactSocialEntries),
        contactMetadataEntries: cloneJson(masterData.contactMetadataEntries),
        footerEntry: cloneJson(masterData.footerEntry),
        assetEntries: resolvedAssets.map((asset) => ({
            assetId: asset.assetId,
            kind: asset.kind,
            mode: asset.mode,
            sourceValue: asset.sourceValue,
            targetPublicPath: asset.targetPublicPath,
            alt: asset.alt,
            notes: asset.notes,
            enabled: asset.enabled,
            status: asset.status,
        })),
        runtime,
    };
}
