import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import ExcelJS from 'exceljs';

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
            (row) => {
                if (!parseBoolean(row.enabled, true)) return 'DISABLED';
                if (parseBoolean(row.featured, false)) return 'FEATURED';
                return 'READY';
            },
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

function buildDataSheet(workbook, config, lookupFormulas, rowStatusMaps) {
    const worksheet = workbook.addWorksheet(config.name, {
        views: [{ state: 'frozen', ySplit: 1 }],
        properties: { defaultRowHeight: 22 },
    });

    worksheet.columns = config.columns.map((column) => ({
        header: column.header,
        key: column.key,
        width: column.width,
        style: {
            alignment: {
                vertical: 'top',
                wrapText: Boolean(column.wrap),
            },
        },
    }));

    const rowStatusMap = rowStatusMaps[config.name] ?? new Map();
    const headers = sheetColumnHeaders(config.columns);

    config.rows.forEach((row, index) => {
        const rowKey = config.rowKey(row, index);
        const rowValues = headers.reduce((acc, headerKey) => {
            acc[headerKey] = headerKey === 'rowStatus'
                ? rowStatusMap.get(rowKey) ?? ''
                : row[headerKey] ?? '';
            return acc;
        }, {});

        const worksheetRow = worksheet.addRow(rowValues);
        const tallContentLength = config.columns.reduce((maxLength, column) => {
            if (!column.wrap || column.key === 'rowStatus') return maxLength;
            return Math.max(maxLength, String(rowValues[column.key] ?? '').length);
        }, 0);

        if (tallContentLength > 280) {
            worksheetRow.height = 94;
        } else if (tallContentLength > 150) {
            worksheetRow.height = 68;
        } else if (tallContentLength > 90) {
            worksheetRow.height = 50;
        }
    });

    const editableRowCount = config.editableRows ?? Math.max(worksheet.rowCount + 40, config.singleRow ? 6 : 220);
    const lastRowToDecorate = Math.max(worksheet.rowCount, editableRowCount);

    config.columns.forEach((column, columnIndex) => {
        const worksheetColumn = worksheet.getColumn(columnIndex + 1);
        const dataFill = column.generated
            ? GENERATED_FILL
            : column.required
                ? REQUIRED_FILL
                : OPTIONAL_FILL;

        worksheet.getCell(1, columnIndex + 1).fill = SHEET_HEADER_FILL;
        worksheet.getCell(1, columnIndex + 1).font = {
            color: { argb: 'FFFFFFFF' },
            bold: true,
            name: 'Consolas',
            size: 11,
        };
        worksheet.getCell(1, columnIndex + 1).border = BORDER_STYLE;
        worksheet.getCell(1, columnIndex + 1).alignment = { vertical: 'middle', horizontal: 'left' };

        for (let rowNumber = 2; rowNumber <= lastRowToDecorate; rowNumber += 1) {
            const cell = worksheet.getCell(rowNumber, columnIndex + 1);
            cell.fill = column.key === 'rowStatus' ? STATUS_FILL : dataFill;
            cell.font = {
                color: { argb: column.key === 'rowStatus' ? 'FF94F1CF' : 'FFE5EEF5' },
                name: 'Consolas',
                size: 10,
            };
            cell.border = BORDER_STYLE;
            cell.alignment = {
                vertical: 'top',
                wrapText: Boolean(column.wrap),
            };
        }

        addValidation(worksheet, columnIndex + 1, 2, editableRowCount, column.validation, lookupFormulas);

        if (column.key === 'rowStatus') {
            worksheetColumn.hidden = false;
        }
    });

    worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: config.columns.length },
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

function createReadmeSheet(workbook) {
    const worksheet = workbook.addWorksheet(README_SHEET, {
        views: [{ showGridLines: false }],
    });

    worksheet.columns = [
        { width: 24 },
        { width: 88 },
    ];

    worksheet.mergeCells('A1:B1');
    worksheet.getCell('A1').value = 'Portfolio Content Workbook';
    worksheet.getCell('A1').font = {
        color: { argb: 'FFFFFFFF' },
        bold: true,
        name: 'Consolas',
        size: 18,
    };
    worksheet.getCell('A1').fill = SHEET_HEADER_FILL;
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'left' };
    worksheet.getRow(1).height = 28;

    const blocks = [
        ['Source of truth', 'Edit this workbook, then run `npm run content:sync` to rebuild the site content JSON.'],
        ['Main commands', 'content:init -> bootstrap workbook from current site data\ncontent:check -> validate workbook only\ncontent:sync -> validate, sync assets, regenerate JSON, refresh previews'],
        ['Adding a project', '1. Add a row in PROJECTS.\n2. Add related rows in PROJECT_STACK and PROJECT_ARCH.\n3. Point media through ASSETS using assetId references.\n4. Run content:sync.'],
        ['Adding a testimonial', '1. Add a row in TESTIMONIALS.\n2. Pick a sourceKey from TESTIMONIAL_SOURCES.\n3. Mark featured = TRUE to surface it in the marquee.\n4. Run content:sync.'],
        ['Asset modes', 'existing_public -> reuse a file already inside public/\nimport_local -> copy a local file into public/\nexternal_url -> use a remote URL directly'],
        ['Good habits', 'Keep ids stable. Use order columns to sort repeated rows. Avoid deleting lookup rows unless the related content was removed too.'],
    ];

    let currentRow = 3;
    blocks.forEach(([label, value]) => {
        const labelCell = worksheet.getCell(currentRow, 1);
        const valueCell = worksheet.getCell(currentRow, 2);

        labelCell.value = label;
        labelCell.font = {
            color: { argb: 'FF18F2B1' },
            bold: true,
            name: 'Consolas',
            size: 11,
        };
        labelCell.fill = REQUIRED_FILL;
        labelCell.border = BORDER_STYLE;
        labelCell.alignment = { vertical: 'top', wrapText: true };

        valueCell.value = value;
        valueCell.font = {
            color: { argb: 'FFE5EEF5' },
            name: 'Consolas',
            size: 10,
        };
        valueCell.fill = OPTIONAL_FILL;
        valueCell.border = BORDER_STYLE;
        valueCell.alignment = { vertical: 'top', wrapText: true };

        const lineCount = String(value).split('\n').length;
        worksheet.getRow(currentRow).height = Math.max(28, 18 * lineCount);
        currentRow += 2;
    });

    return worksheet;
}

function createPreviewSheet(workbook, resolvedAssets) {
    const worksheet = workbook.addWorksheet(PREVIEW_SHEET, {
        views: [{ state: 'frozen', ySplit: 1 }],
        properties: { defaultRowHeight: 24 },
    });

    worksheet.columns = [
        { header: 'assetId', key: 'assetId', width: 28 },
        { header: 'kind', key: 'kind', width: 14 },
        { header: 'resolvedUrl', key: 'resolvedUrl', width: 48 },
        { header: 'rowStatus', key: 'rowStatus', width: 24 },
        { header: 'preview', key: 'preview', width: 16 },
        { header: 'notes', key: 'notes', width: 42 },
    ];

    worksheet.getRow(1).eachCell((cell) => {
        cell.fill = SHEET_HEADER_FILL;
        cell.font = {
            color: { argb: 'FFFFFFFF' },
            bold: true,
            name: 'Consolas',
            size: 11,
        };
        cell.border = BORDER_STYLE;
    });

    resolvedAssets.forEach((asset) => {
        const row = worksheet.addRow({
            assetId: asset.assetId,
            kind: asset.kind,
            resolvedUrl: asset.resolvedUrl,
            rowStatus: asset.status,
            preview: '',
            notes: asset.notes,
        });

        row.height = 64;
        row.eachCell((cell, columnNumber) => {
            cell.border = BORDER_STYLE;
            cell.fill = columnNumber === 4 ? STATUS_FILL : OPTIONAL_FILL;
            cell.font = {
                color: { argb: columnNumber === 4 ? 'FF94F1CF' : 'FFE5EEF5' },
                name: 'Consolas',
                size: 10,
            };
            cell.alignment = { vertical: 'top', wrapText: true };
        });

        const extension = path.extname(asset.previewSourcePath ?? '').toLowerCase();
        if (asset.previewSourcePath && PREVIEWABLE_EXTENSIONS.has(extension)) {
            const imageId = workbook.addImage({
                filename: asset.previewSourcePath,
                extension: extension.replace('.', '') === 'jpg' ? 'jpeg' : extension.replace('.', ''),
            });

            worksheet.addImage(imageId, {
                tl: { col: 4.15, row: row.number - 0.84 },
                ext: { width: 72, height: 72 },
                editAs: 'oneCell',
            });
        } else {
            worksheet.getCell(row.number, 5).value = asset.kind === 'video'
                ? 'Preview omitted for video'
                : asset.resolvedUrl
                    ? 'No local preview'
                    : 'Unavailable';
        }
    });

    worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: worksheet.columns.length },
    };

    return worksheet;
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
            { key: 'starRating', header: 'starRating', width: 14 },
            { key: 'gigTitle', header: 'gigTitle', width: 48, required: true, wrap: true },
            { key: 'createdAt', header: 'createdAt', width: 24, required: true },
            { key: 'avatarAssetId', header: 'avatarAssetId', width: 24, validation: { lookup: 'assetIds' } },
            { key: 'featured', header: 'featured', width: 12, required: true, validation: { lookup: 'booleanValues' } },
            { key: 'featuredOrder', header: 'featuredOrder', width: 14, validation: { type: 'whole', operator: 'greaterThan', formulae: [0] } },
            { key: 'enabled', header: 'enabled', width: 12, required: true, validation: { lookup: 'booleanValues' } },
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
            { key: 'rowStatus', header: 'rowStatus', width: 32, generated: true },
        ],
    });

    return sheetDefinitions;
}

async function writeWorkbookFromMasterData(masterData, resolvedAssets) {
    const workbook = new Workbook();
    workbook.creator = 'Codex';
    workbook.lastModifiedBy = 'Codex';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.calcProperties.fullCalcOnLoad = true;

    createReadmeSheet(workbook);

    const lookupValues = getLookupValues(masterData);
    const lookupFormulas = createLookupSheet(workbook, lookupValues);
    const rowStatusMaps = createRowStatusMaps(masterData, resolvedAssets);
    const sheetDefinitions = getSheetDefinitions(masterData, resolvedAssets);

    sheetDefinitions.forEach((sheetDefinition) => {
        buildDataSheet(workbook, sheetDefinition, lookupFormulas, rowStatusMaps);
    });

    createPreviewSheet(workbook, resolvedAssets);

    await ensureDir(path.dirname(WORKBOOK_PATH));
    await workbook.xlsx.writeFile(WORKBOOK_PATH);
}

async function writeGeneratedJson(runtimeContent) {
    await ensureDir(path.dirname(GENERATED_JSON_PATH));
    await fs.writeFile(GENERATED_JSON_PATH, `${JSON.stringify(runtimeContent, null, 2)}\n`, 'utf8');
}

async function writeContentReadme() {
    await ensureDir(path.dirname(CONTENT_README_PATH));
    await fs.writeFile(CONTENT_README_PATH, `${CONTENT_README}\n`, 'utf8');
}

async function readWorkbookToMasterData(workbookPath = WORKBOOK_PATH) {
    const workbook = new Workbook();
    await workbook.xlsx.readFile(workbookPath);

    const navigationConfigRow = expectSingleRow(getSheetRows(workbook.getWorksheet(SHEET_NAMES.navigationConfig)), SHEET_NAMES.navigationConfig);
    const profileRow = expectSingleRow(getSheetRows(workbook.getWorksheet(SHEET_NAMES.profile)), SHEET_NAMES.profile);
    const heroRow = expectSingleRow(getSheetRows(workbook.getWorksheet(SHEET_NAMES.hero)), SHEET_NAMES.hero);
    const terminalRow = expectSingleRow(getSheetRows(workbook.getWorksheet(SHEET_NAMES.terminal)), SHEET_NAMES.terminal);
    const contactRow = expectSingleRow(getSheetRows(workbook.getWorksheet(SHEET_NAMES.contact)), SHEET_NAMES.contact);
    const footerRow = expectSingleRow(getSheetRows(workbook.getWorksheet(SHEET_NAMES.footer)), SHEET_NAMES.footer);

    return {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        navigationConfig: stripGeneratedFields(navigationConfigRow),
        navigationEntries: getSheetRows(workbook.getWorksheet(SHEET_NAMES.navigation)).map((row) => stripGeneratedFields(row)),
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
        aboutBioEntries: getSheetRows(workbook.getWorksheet(SHEET_NAMES.aboutBio)).map((row) => stripGeneratedFields(row)),
        aboutStatsEntries: getSheetRows(workbook.getWorksheet(SHEET_NAMES.aboutStats)).map((row) => stripGeneratedFields(row)),
        heroEntry: stripGeneratedFields(heroRow),
        heroMetadataEntries: getSheetRows(workbook.getWorksheet(SHEET_NAMES.heroMetadata)).map((row) => stripGeneratedFields(row)),
        terminalConfig: stripGeneratedFields(terminalRow),
        terminalLineEntries: getSheetRows(workbook.getWorksheet(SHEET_NAMES.terminalLines)).map((row) => stripGeneratedFields(row)),
        terminalCapabilityEntries: getSheetRows(workbook.getWorksheet(SHEET_NAMES.terminalCapabilities)).map((row) => stripGeneratedFields(row)),
        sectionHeaderEntries: getSheetRows(workbook.getWorksheet(SHEET_NAMES.sectionHeaders)).map((row) => stripGeneratedFields(row)),
        skillCategoryEntries: getSheetRows(workbook.getWorksheet(SHEET_NAMES.skillCategories)).map((row) => stripGeneratedFields(row)),
        skillItemEntries: getSheetRows(workbook.getWorksheet(SHEET_NAMES.skillItems)).map((row) => stripGeneratedFields(row)),
        projectEntries: getSheetRows(workbook.getWorksheet(SHEET_NAMES.projects)).map((row) => stripGeneratedFields(row)),
        projectStackEntries: getSheetRows(workbook.getWorksheet(SHEET_NAMES.projectStack)).map((row) => stripGeneratedFields(row)),
        projectArchEntries: getSheetRows(workbook.getWorksheet(SHEET_NAMES.projectArch)).map((row) => stripGeneratedFields(row)),
        testimonialSourceEntries: getSheetRows(workbook.getWorksheet(SHEET_NAMES.testimonialSources)).map((row) => stripGeneratedFields(row)),
        testimonialEntries: getSheetRows(workbook.getWorksheet(SHEET_NAMES.testimonials)).map((row) => stripGeneratedFields(row)),
        testimonialsSection: {
            title: asString(profileRow.testimonialsTitle, 'Verified Client Feedback'),
            subtitle: asString(profileRow.testimonialsSubtitle, 'Real client feedback collected from completed projects.'),
        },
        contactEntry: stripGeneratedFields(contactRow),
        contactSocialEntries: getSheetRows(workbook.getWorksheet(SHEET_NAMES.contactSocial)).map((row) => stripGeneratedFields(row)),
        contactMetadataEntries: getSheetRows(workbook.getWorksheet(SHEET_NAMES.contactMetadata)).map((row) => stripGeneratedFields(row)),
        footerEntry: stripGeneratedFields(footerRow),
        assetEntries: getSheetRows(workbook.getWorksheet(SHEET_NAMES.assets)).map((row) => stripGeneratedFields(row)),
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

export async function syncPortfolioContent() {
    if (!(await pathExists(WORKBOOK_PATH))) {
        throw new Error(`Workbook not found at ${WORKBOOK_PATH}. Run "npm run content:init" first.`);
    }

    const masterData = await readWorkbookToMasterData(WORKBOOK_PATH);
    const resolvedAssets = await resolveAssets(masterData.assetEntries, { writeAssets: true });
    const runtimeContent = buildRuntimeContent(masterData, resolvedAssets);

    await writeGeneratedJson(runtimeContent);
    await writeWorkbookFromMasterData(masterData, resolvedAssets);
    await writeContentReadme();

    return runtimeContent;
}

export async function checkPortfolioContent() {
    if (!(await pathExists(WORKBOOK_PATH))) {
        throw new Error(`Workbook not found at ${WORKBOOK_PATH}. Run "npm run content:init" first.`);
    }

    const masterData = await readWorkbookToMasterData(WORKBOOK_PATH);
    const resolvedAssets = await resolveAssets(masterData.assetEntries, { writeAssets: false });
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
            starRating: entry.starRating ?? '',
            gigTitle: entry.gigTitle,
            createdAt: entry.createdAt,
            avatarAssetId,
            featured: featuredOrderMap.has(entry.id),
            featuredOrder: featuredOrderMap.get(entry.id) ?? '',
            enabled: true,
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

function getSheetRows(worksheet) {
    if (!worksheet) {
        throw new Error('Expected worksheet to exist.');
    }

    const headerValues = worksheet.getRow(1).values.slice(1).map((value) => asString(value));
    if (!headerValues.length) {
        return [];
    }

    const rows = [];

    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;

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

        if (parseBoolean(entry.featured, false) && !parseBoolean(entry.enabled, true)) {
            throw new Error(`Testimonial "${entry.id}" cannot be featured while disabled.`);
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
        .filter((entry) => parseBoolean(entry.enabled, true))
        .map((entry) => ({
            id: asString(entry.id),
            sourceKey: asString(entry.sourceKey),
            labelOverride: asNullableString(entry.labelOverride),
            clientName: asNullableString(entry.clientName),
            clientType: asNullableString(entry.clientType),
            serviceOverride: asNullableString(entry.serviceOverride),
            review: normalizeReview(entry.review),
            starRating: entry.starRating === '' ? null : entry.starRating,
            gigTitle: asString(entry.gigTitle),
            createdAt: asString(entry.createdAt),
            avatarAssetId: asNullableString(entry.avatarAssetId),
            avatarUrl: resolveAssetUrl(entry.avatarAssetId, `TESTIMONIALS.avatarAssetId for ${entry.id}`, { optional: true }) || null,
            featured: parseBoolean(entry.featured, false),
            featuredOrder: parseOptionalNumber(entry.featuredOrder),
            enabled: true,
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
