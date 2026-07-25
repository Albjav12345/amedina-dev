const ICONS = {
  mail: '<rect x="3.2" y="5.6" width="17.6" height="12.8" rx="1.8"/><path d="m4.2 7.3 7.8 5.4 7.8-5.4"/>',
  location: '<path d="M12 21s6.25-5.1 6.25-11.35a6.25 6.25 0 1 0-12.5 0C5.75 15.9 12 21 12 21Z"/><circle cx="12" cy="9.55" r="2.05"/>',
  code: '<path d="m8.1 8.2-3.8 3.8 3.8 3.8"/><path d="m15.9 8.2 3.8 3.8-3.8 3.8"/><path d="m14.2 5.9-4.4 12.2"/>',
  linkedin: '<rect x="4.5" y="4.5" width="15" height="15" rx="2.15"/><circle cx="8.3" cy="9" r=".75" fill="currentColor" stroke="none"/><path d="M8.3 11.75v4.55M11.55 16.3v-4.55M11.55 13.25c.42-1.22 1.4-1.95 2.72-1.95 1.57 0 2.55 1.05 2.55 2.82v2.18"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.8 12h16.4M12 3.5c2.4 2.4 3.5 5.2 3.5 8.5S14.4 18.1 12 20.5C9.6 18.1 8.5 15.3 8.5 12S9.6 5.9 12 3.5Z"/>',
  phone: '<path d="M7.2 3.8 4.7 5.4c-.6.4-.8 1.1-.5 1.8 2.5 5.7 6.9 10.1 12.6 12.6.7.3 1.4.1 1.8-.5l1.6-2.5-4.6-3-1.7 2c-2.5-1.2-4.5-3.2-5.7-5.7l2-1.7-3-4.6Z"/>',
  link: '<path d="M10.1 13.9a4.2 4.2 0 0 0 5.9 0l2.2-2.2a4.2 4.2 0 0 0-5.9-5.9L11 7.1"/><path d="M13.9 10.1a4.2 4.2 0 0 0-5.9 0l-2.2 2.2a4.2 4.2 0 0 0 5.9 5.9l1.3-1.3"/>',
};

export const CV_ICON_OPTIONS = Object.keys(ICONS);

export const CV_DESIGN_PRESETS = {
  original: {
    label: 'Original',
    description: 'The current CV palette.',
    colors: {
      ink: '#0d1828',
      paper: '#f7f8f2',
      accent: '#c8f05d',
      secondary: '#3b82f6',
      line: '#d5dfda',
      muted: '#667483',
    },
  },
  ocean: {
    label: 'Ocean',
    description: 'Technical and fresh.',
    colors: {
      ink: '#0b2033',
      paper: '#f5f9f8',
      accent: '#58e6b0',
      secondary: '#2684ff',
      line: '#cfdfdb',
      muted: '#5d7180',
    },
  },
  graphite: {
    label: 'Graphite',
    description: 'Neutral and understated.',
    colors: {
      ink: '#17191e',
      paper: '#faf9f5',
      accent: '#d6ff68',
      secondary: '#64748b',
      line: '#dcded9',
      muted: '#697078',
    },
  },
  garnet: {
    label: 'Garnet',
    description: 'Warm and distinctive.',
    colors: {
      ink: '#28151d',
      paper: '#faf7f2',
      accent: '#f0ca67',
      secondary: '#ad4f6b',
      line: '#e2d8d3',
      muted: '#786a6c',
    },
  },
  forest: {
    label: 'Forest',
    description: 'Natural and confident.',
    colors: {
      ink: '#10261f',
      paper: '#f6f8f3',
      accent: '#9de25b',
      secondary: '#23a89a',
      line: '#d3ded4',
      muted: '#64736a',
    },
  },
  cobalt: {
    label: 'Cobalt',
    description: 'Precise and energetic.',
    colors: {
      ink: '#0b1739',
      paper: '#f6f7fb',
      accent: '#ffd166',
      secondary: '#476df5',
      line: '#d8ddea',
      muted: '#65708a',
    },
  },
  plum: {
    label: 'Plum',
    description: 'Creative and refined.',
    colors: {
      ink: '#241831',
      paper: '#faf6fb',
      accent: '#d8f06a',
      secondary: '#9b6cff',
      line: '#e0d8e4',
      muted: '#74687a',
    },
  },
  terracotta: {
    label: 'Terracotta',
    description: 'Warm and approachable.',
    colors: {
      ink: '#2c1b18',
      paper: '#fbf6ef',
      accent: '#f3c969',
      secondary: '#dc6b4f',
      line: '#e6d8ce',
      muted: '#7b6a62',
    },
  },
  nordic: {
    label: 'Nordic',
    description: 'Calm and spacious.',
    colors: {
      ink: '#163038',
      paper: '#f4f8f6',
      accent: '#a5f3d0',
      secondary: '#5ea8c7',
      line: '#d3e2de',
      muted: '#62767a',
    },
  },
  signal: {
    label: 'Signal',
    description: 'Bold digital contrast.',
    colors: {
      ink: '#111827',
      paper: '#f8fafc',
      accent: '#fb7185',
      secondary: '#38bdf8',
      line: '#d9e1ea',
      muted: '#64748b',
    },
  },
};

export const CV_COMPOSITION_PRESETS = {
  original: {
    label: 'Original',
    description: 'Your current proportions.',
    typography: { family: 'inter', headingFamily: 'inherit', scale: 100, headingScale: 100, headingWeight: 850, lineHeight: 100 },
    layout: { sidebarWidth: 67, spacing: 100, mainGutter: 100, corners: 100 },
    blocks: { alignment: 'left', topLineWidth: 100, topLineHeight: 100, profileWidth: 100, profileHeight: 100, profileSplit: 35.2, experienceWidth: 100, experienceHeight: 100, portfolioWidth: 100, portfolioHeight: 100, accentThickness: 100, topAccentWidth: 34, badgeScale: 100 },
    portrait: { positionX: 50, positionY: 30, width: 49, height: 59, radius: 7, border: 1.15 },
  },
  compact: {
    label: 'Compact',
    description: 'More room for experience.',
    typography: { family: 'inter', headingFamily: 'inherit', scale: 95, headingScale: 98, headingWeight: 850, lineHeight: 96 },
    layout: { sidebarWidth: 64, spacing: 88, mainGutter: 92, corners: 78 },
    blocks: { alignment: 'left', topLineWidth: 100, topLineHeight: 85, profileWidth: 100, profileHeight: 84, profileSplit: 34, experienceWidth: 100, experienceHeight: 82, portfolioWidth: 100, portfolioHeight: 82, accentThickness: 85, topAccentWidth: 28, badgeScale: 92 },
    portrait: { positionX: 50, positionY: 30, width: 47, height: 55, radius: 5, border: 1 },
  },
  executive: {
    label: 'Executive',
    description: 'Restrained and structured.',
    typography: { family: 'humanist', headingFamily: 'humanist', scale: 98, headingScale: 102, headingWeight: 800, lineHeight: 102 },
    layout: { sidebarWidth: 63, spacing: 96, mainGutter: 108, corners: 55 },
    blocks: { alignment: 'center', topLineWidth: 100, topLineHeight: 92, profileWidth: 96, profileHeight: 94, profileSplit: 37, experienceWidth: 96, experienceHeight: 92, portfolioWidth: 96, portfolioHeight: 90, accentThickness: 72, topAccentWidth: 24, badgeScale: 92 },
    portrait: { positionX: 50, positionY: 30, width: 47, height: 57, radius: 3.5, border: .8 },
  },
  editorial: {
    label: 'Editorial',
    description: 'Expressive hierarchy.',
    typography: { family: 'humanist', headingFamily: 'editorial', scale: 99, headingScale: 110, headingWeight: 750, lineHeight: 105 },
    layout: { sidebarWidth: 65, spacing: 104, mainGutter: 108, corners: 110 },
    blocks: { alignment: 'center', topLineWidth: 94, topLineHeight: 100, profileWidth: 94, profileHeight: 102, profileSplit: 38, experienceWidth: 94, experienceHeight: 104, portfolioWidth: 94, portfolioHeight: 100, accentThickness: 105, topAccentWidth: 40, badgeScale: 105 },
    portrait: { positionX: 50, positionY: 30, width: 48, height: 60, radius: 9, border: 1 },
  },
  showcase: {
    label: 'Showcase',
    description: 'Bold, visual and rounded.',
    typography: { family: 'geometric', headingFamily: 'geometric', scale: 98, headingScale: 108, headingWeight: 850, lineHeight: 100 },
    layout: { sidebarWidth: 70, spacing: 100, mainGutter: 94, corners: 135 },
    blocks: { alignment: 'center', topLineWidth: 96, topLineHeight: 105, profileWidth: 96, profileHeight: 108, profileSplit: 34, experienceWidth: 96, experienceHeight: 110, portfolioWidth: 96, portfolioHeight: 105, accentThickness: 135, topAccentWidth: 46, badgeScale: 112 },
    portrait: { positionX: 50, positionY: 30, width: 52, height: 62, radius: 12, border: 1.3 },
  },
};

export const DEFAULT_CV_DESIGN = {
  preset: 'original',
  compositionPreset: 'original',
  colors: { ...CV_DESIGN_PRESETS.original.colors },
  typography: { ...CV_COMPOSITION_PRESETS.original.typography },
  layout: { ...CV_COMPOSITION_PRESETS.original.layout },
  blocks: { ...CV_COMPOSITION_PRESETS.original.blocks },
  portrait: { ...CV_COMPOSITION_PRESETS.original.portrait },
};

const FONT_STACKS = {
  inter: "'Inter','Noto Sans','Arial',sans-serif",
  humanist: "'Segoe UI','Trebuchet MS','Arial',sans-serif",
  editorial: "'Georgia','Times New Roman',serif",
  geometric: "'Century Gothic','Aptos Display','Arial',sans-serif",
};

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

function safeColor(value, fallback) {
  const color = String(value || '').trim();
  return /^#[0-9a-f]{6}$/i.test(color) ? color.toLowerCase() : fallback;
}

function mixWithWhite(hex, amount) {
  const value = hex.slice(1);
  const channels = [0, 2, 4].map((index) => Number.parseInt(value.slice(index, index + 2), 16));
  const mixed = channels.map((channel) => Math.round(channel * amount + 255 * (1 - amount)).toString(16).padStart(2, '0'));
  return `#${mixed.join('')}`;
}

function alignedOffset(width, alignment) {
  const free = Math.max(0, 100 - width);
  if (alignment === 'right') return free;
  if (alignment === 'center') return free / 2;
  return 0;
}

export function normalizeCvDesign(value = {}) {
  const preset = value?.preset == null
    ? DEFAULT_CV_DESIGN.preset
    : (Object.hasOwn(CV_DESIGN_PRESETS, value.preset) ? value.preset : 'custom');
  const colors = value?.colors || {};
  const typography = value?.typography || {};
  const layout = value?.layout || {};
  const blocks = value?.blocks || {};
  const portrait = value?.portrait || {};
  const compositionPreset = value?.compositionPreset == null
    ? DEFAULT_CV_DESIGN.compositionPreset
    : (Object.hasOwn(CV_COMPOSITION_PRESETS, value.compositionPreset) ? value.compositionPreset : 'custom');

  return {
    preset,
    compositionPreset,
    colors: {
      ink: safeColor(colors.ink, DEFAULT_CV_DESIGN.colors.ink),
      paper: safeColor(colors.paper, DEFAULT_CV_DESIGN.colors.paper),
      accent: safeColor(colors.accent, DEFAULT_CV_DESIGN.colors.accent),
      secondary: safeColor(colors.secondary, DEFAULT_CV_DESIGN.colors.secondary),
      line: safeColor(colors.line, DEFAULT_CV_DESIGN.colors.line),
      muted: safeColor(colors.muted, DEFAULT_CV_DESIGN.colors.muted),
    },
    typography: {
      family: Object.hasOwn(FONT_STACKS, typography.family) ? typography.family : DEFAULT_CV_DESIGN.typography.family,
      headingFamily: typography.headingFamily === 'inherit' || Object.hasOwn(FONT_STACKS, typography.headingFamily) ? typography.headingFamily : DEFAULT_CV_DESIGN.typography.headingFamily,
      scale: clampNumber(typography.scale, 88, 112, DEFAULT_CV_DESIGN.typography.scale),
      headingScale: clampNumber(typography.headingScale, 88, 120, DEFAULT_CV_DESIGN.typography.headingScale),
      headingWeight: clampNumber(typography.headingWeight, 650, 900, DEFAULT_CV_DESIGN.typography.headingWeight),
      lineHeight: clampNumber(typography.lineHeight, 90, 115, DEFAULT_CV_DESIGN.typography.lineHeight),
    },
    layout: {
      sidebarWidth: clampNumber(layout.sidebarWidth, 58, 76, DEFAULT_CV_DESIGN.layout.sidebarWidth),
      spacing: clampNumber(layout.spacing, 85, 115, DEFAULT_CV_DESIGN.layout.spacing),
      mainGutter: clampNumber(layout.mainGutter, 86, 116, DEFAULT_CV_DESIGN.layout.mainGutter),
      corners: clampNumber(layout.corners, 40, 150, DEFAULT_CV_DESIGN.layout.corners),
    },
    blocks: {
      alignment: ['left', 'center', 'right'].includes(blocks.alignment) ? blocks.alignment : DEFAULT_CV_DESIGN.blocks.alignment,
      topLineWidth: clampNumber(blocks.topLineWidth, 70, 100, DEFAULT_CV_DESIGN.blocks.topLineWidth),
      topLineHeight: clampNumber(blocks.topLineHeight, 70, 150, DEFAULT_CV_DESIGN.blocks.topLineHeight),
      profileWidth: clampNumber(blocks.profileWidth, 70, 100, DEFAULT_CV_DESIGN.blocks.profileWidth),
      profileHeight: clampNumber(blocks.profileHeight, 70, 150, DEFAULT_CV_DESIGN.blocks.profileHeight),
      profileSplit: clampNumber(blocks.profileSplit, 26, 50, DEFAULT_CV_DESIGN.blocks.profileSplit),
      experienceWidth: clampNumber(blocks.experienceWidth, 70, 100, DEFAULT_CV_DESIGN.blocks.experienceWidth),
      experienceHeight: clampNumber(blocks.experienceHeight, 70, 150, DEFAULT_CV_DESIGN.blocks.experienceHeight),
      portfolioWidth: clampNumber(blocks.portfolioWidth, 70, 100, DEFAULT_CV_DESIGN.blocks.portfolioWidth),
      portfolioHeight: clampNumber(blocks.portfolioHeight, 70, 150, DEFAULT_CV_DESIGN.blocks.portfolioHeight),
      accentThickness: clampNumber(blocks.accentThickness, 45, 180, DEFAULT_CV_DESIGN.blocks.accentThickness),
      topAccentWidth: clampNumber(blocks.topAccentWidth, 16, 58, DEFAULT_CV_DESIGN.blocks.topAccentWidth),
      badgeScale: clampNumber(blocks.badgeScale, 75, 140, DEFAULT_CV_DESIGN.blocks.badgeScale),
    },
    portrait: {
      positionX: clampNumber(portrait.positionX, 0, 100, DEFAULT_CV_DESIGN.portrait.positionX),
      positionY: clampNumber(portrait.positionY, 0, 100, DEFAULT_CV_DESIGN.portrait.positionY),
      width: clampNumber(portrait.width, 40, 54, DEFAULT_CV_DESIGN.portrait.width),
      height: clampNumber(portrait.height, 48, 68, DEFAULT_CV_DESIGN.portrait.height),
      radius: clampNumber(portrait.radius, 0, 14, DEFAULT_CV_DESIGN.portrait.radius),
      border: clampNumber(portrait.border, 0, 2.5, DEFAULT_CV_DESIGN.portrait.border),
    },
  };
}

export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function safeHref(value = '') {
  const href = String(value).trim();
  if (!href) return '';
  if (href.startsWith('mailto:') || href.startsWith('tel:')) return escapeHtml(href);
  try {
    const parsed = new URL(href);
    return ['https:', 'http:'].includes(parsed.protocol) ? escapeHtml(parsed.toString()) : '';
  } catch {
    return '';
  }
}

function inlineMarkup(value = '') {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[\[(.+?)\]\]/g, '<span class="lead">$1</span>')
    .replace(/\{\{(.+?)\}\}/g, '<span class="hl">$1</span>');
}

function iconSvg(name) {
  const paths = ICONS[name] || ICONS.link;
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

function renderContacts(contacts = []) {
  return contacts.map((contact) => {
    const href = safeHref(contact.href);
    const value = escapeHtml(contact.value);
    return `<div class="contact${contact.icon === 'linkedin' ? ' contact-linkedin' : ''}">
      <span class="contact-badge" aria-hidden="true">${iconSvg(contact.icon)}</span>
      <span><span class="contact-label">${escapeHtml(contact.label)}</span>${href ? `<a href="${href}">${value}</a>` : value}</span>
    </div>`;
  }).join('');
}

function renderEducation(items = []) {
  return items.map((item) => `<div class="time-row">
    <div class="year">${escapeHtml(item.year)}</div>
    <div class="time-content">
      <p class="time-title">${escapeHtml(item.title)}</p>
      <p class="time-sub">${escapeHtml(item.description)}</p>
    </div>
  </div>`).join('');
}

function renderExtraRailSections(sections = []) {
  return sections.map((section) => {
    const heading = `<div class="rail-heading">${escapeHtml(section.title)}</div>`;
    if (section.type === 'pills') {
      return `${heading}${(section.items || []).map((item) => `<span class="pill">${escapeHtml(item)}</span>`).join('')}`;
    }
    if (section.type === 'list') {
      return `${heading}<div class="work-grid">${(section.items || []).map((item) => `<div class="work-line">${escapeHtml(item)}</div>`).join('')}</div>`;
    }
    return `${heading}<p class="rail-copy">${escapeHtml(section.text)}</p>`;
  }).join('');
}

function renderExperience(items = []) {
  return items.map((item) => `<div class="experience">
    <div class="experience-top">
      <div><div class="kicker">${escapeHtml(item.kicker)}</div><h3>${escapeHtml(item.title)}</h3></div>
      <span class="date-pill">${escapeHtml(item.date)}</span>
    </div>
    <p>${inlineMarkup(item.description)}</p>
    <div class="metrics">${(item.metrics || []).map((metric) => `<div class="metric"><strong>${escapeHtml(metric.value)}</strong><span>${escapeHtml(metric.label)}</span></div>`).join('')}</div>
  </div>`).join('');
}

export function buildDefaultCvHtml(data, options = {}) {
  const portraitUrl = escapeHtml(options.portraitUrl || data.assets?.portraitUrl || '/assets/alberto.webp');
  const qrUrl = escapeHtml(options.qrUrl || '');
  const documentTitle = escapeHtml(data.document?.title || 'Curriculum vitae');
  const lang = escapeHtml(data.document?.language || 'en');
  const design = normalizeCvDesign(data.design);
  const fontStack = FONT_STACKS[design.typography.family];
  const headingStack = design.typography.headingFamily === 'inherit' ? fontStack : FONT_STACKS[design.typography.headingFamily];
  const typeScale = design.typography.scale / 100;
  const headingScale = design.typography.headingScale / 100;
  const lineHeightScale = design.typography.lineHeight / 100;
  const spacingScale = design.layout.spacing / 100;
  const gutterScale = design.layout.mainGutter / 100;
  const cornerScale = design.layout.corners / 100;
  const topLineScale = design.blocks.topLineHeight / 100;
  const profileScale = design.blocks.profileHeight / 100;
  const experienceScale = design.blocks.experienceHeight / 100;
  const portfolioScale = design.blocks.portfolioHeight / 100;
  const accentScale = design.blocks.accentThickness / 100;
  const badgeScale = design.blocks.badgeScale / 100;
  const topLineOffset = alignedOffset(design.blocks.topLineWidth, design.blocks.alignment);
  const profileOffset = alignedOffset(design.blocks.profileWidth, design.blocks.alignment);
  const experienceOffset = alignedOffset(design.blocks.experienceWidth, design.blocks.alignment);
  const portfolioOffset = alignedOffset(design.blocks.portfolioWidth, design.blocks.alignment);
  const portfolioRightOffset = Math.max(0, 100 - design.blocks.portfolioWidth - portfolioOffset);
  const accentSoft = design.colors.accent === DEFAULT_CV_DESIGN.colors.accent ? '#e7f7bd' : mixWithWhite(design.colors.accent, .35);
  const accentSoftCard = design.colors.accent === DEFAULT_CV_DESIGN.colors.accent ? '#eaf6cc' : mixWithWhite(design.colors.accent, .28);
  const accentText = design.colors.accent === DEFAULT_CV_DESIGN.colors.accent ? '#1d4020' : design.colors.ink;
  const accentCardText = design.colors.accent === DEFAULT_CV_DESIGN.colors.accent ? '#365f19' : design.colors.ink;

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${documentTitle}</title>
<style>
  @page { size: A4; margin: 0; }
  :root { --ink:${design.colors.ink}; --ink2:#183047; --paper:${design.colors.paper}; --soft:#eef2ee; --line:${design.colors.line}; --muted:${design.colors.muted}; --accent:${design.colors.accent}; --accent-blue:${design.colors.secondary}; --accent-soft:${accentSoft}; --accent-soft-card:${accentSoftCard}; --accent-text:${accentText}; --accent-card-text:${accentCardText}; --green:#3b641e; --type-scale:${typeScale}; --heading-scale:${headingScale}; --line-height-scale:${lineHeightScale}; --spacing-scale:${spacingScale}; --gutter-scale:${gutterScale}; --corner-scale:${cornerScale}; --topline-scale:${topLineScale}; --profile-scale:${profileScale}; --experience-scale:${experienceScale}; --portfolio-scale:${portfolioScale}; --accent-scale:${accentScale}; --badge-scale:${badgeScale}; }
  * { box-sizing:border-box; }
  html,body { margin:0; padding:0; background:#d6d8d5; font-family:${fontStack}; color:var(--ink); print-color-adjust:exact; -webkit-print-color-adjust:exact; }
  .page { width:210mm; height:297mm; overflow:hidden; position:relative; background:var(--paper); }
  .layout { display:grid; grid-template-columns:${design.layout.sidebarWidth}mm 1fr; height:100%; }
  .rail { position:relative; overflow:hidden; background:var(--ink); color:#f4f8f5; padding:calc(12.5mm * var(--spacing-scale)) 8.2mm 9mm; }
  .rail::before { content:''; position:absolute; width:68mm; height:68mm; border:1px solid rgba(200,240,93,.40); border-radius:50%; left:-37mm; top:-34mm; }
  .rail::after { content:''; position:absolute; width:58mm; height:58mm; border:1px solid rgba(255,255,255,.11); border-radius:50%; left:-25mm; top:-23mm; }
  .eyebrow { position:relative; color:var(--accent); font-size:7.5px; letter-spacing:2px; font-weight:850; text-transform:uppercase; }
  .photo { position:relative; width:${design.portrait.width}mm; max-width:100%; height:${design.portrait.height}mm; overflow:hidden; border-radius:${design.portrait.radius}mm; margin:calc(6.4mm * var(--spacing-scale)) 0 calc(7.3mm * var(--spacing-scale)); border:${design.portrait.border}mm solid rgba(255,255,255,.19); background:#bac2bf; box-shadow:0 10px 24px rgba(0,0,0,.22); }
  .photo img { display:block; width:100%; height:100%; object-fit:cover; object-position:${design.portrait.positionX}% ${design.portrait.positionY}%; }
  .rail-heading { color:var(--accent); font-size:calc(7.2px * var(--type-scale)); letter-spacing:1.7px; line-height:1; font-weight:850; text-transform:uppercase; margin:calc(8.6mm * var(--spacing-scale)) 0 calc(3.2mm * var(--spacing-scale)); }
  .contact { display:flex; align-items:center; gap:2.65mm; margin:calc(3mm * var(--spacing-scale)) 0; color:#edf3ef; font-size:calc(7.55px * var(--type-scale)); line-height:1.22; }
  .contact-badge { width:6.35mm; height:6.35mm; flex:0 0 auto; display:flex; align-items:center; justify-content:center; border:0.32mm solid rgba(200,240,93,.42); border-radius:50%; background:rgba(200,240,93,.07); }
  .contact-badge svg { width:3.25mm; height:3.25mm; display:block; color:var(--accent); }
  .contact-label { display:block; margin:0 0 .72mm; color:#91a1a2; font-size:5.9px; line-height:1; letter-spacing:1.12px; font-weight:850; text-transform:uppercase; }
  .contact a { color:inherit; text-decoration:none; border:0; }
  .contact-linkedin a { font-size:7.55px; letter-spacing:0; }
  .rail-copy { margin:0; color:#dce5e2; font-size:calc(8px * var(--type-scale)); line-height:calc(1.46 * var(--line-height-scale)); }
  .pill { display:inline-block; margin:0 1.15mm calc(1.55mm * var(--spacing-scale)) 0; padding:1.25mm 2.2mm; border:1px solid color-mix(in srgb,var(--accent) 55%,transparent); border-radius:100px; color:var(--accent); font-size:calc(6.5px * var(--type-scale)); line-height:1; font-weight:800; letter-spacing:.25px; }
  .work-grid { display:grid; gap:2.45mm; }
  .work-line { position:relative; padding-left:3.7mm; font-size:calc(7.65px * var(--type-scale)); line-height:calc(1.3 * var(--line-height-scale)); color:#dce5e2; }
  .work-line::before { content:''; position:absolute; top:.7mm; left:0; width:1.65mm; height:1.65mm; border-radius:50%; background:var(--accent); }
  .rail-footer { position:absolute; left:8.2mm; right:8.2mm; bottom:8.3mm; display:flex; justify-content:space-between; color:#8e9ca4; font-size:6.5px; letter-spacing:1px; text-transform:uppercase; }
  .main { position:relative; display:flex; flex-direction:column; padding:13.1mm calc(12.3mm * var(--gutter-scale)) 10mm calc(11mm * var(--gutter-scale)); overflow:hidden; }
  .main::before { content:''; position:absolute; right:0; top:0; width:${design.blocks.topAccentWidth}mm; height:calc(3.2mm * var(--accent-scale)); background:var(--accent); }
  .topline { width:${design.blocks.topLineWidth}%; margin-left:${topLineOffset}%; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--line); padding-bottom:calc(3.3mm * var(--topline-scale)); margin-bottom:calc(5.1mm * var(--topline-scale)); }
  .topline-label { color:var(--muted); font-size:6.9px; font-weight:800; letter-spacing:1.15px; text-transform:uppercase; }
  .availability { display:inline-block; background:var(--accent-soft); color:var(--accent-text); border-radius:100px; padding:1.15mm 2.15mm; font-size:calc(6.75px * var(--type-scale)); line-height:1; font-weight:850; }
  h1,h2,.experience h3 { font-family:${headingStack}; font-weight:${design.typography.headingWeight}; }
  h1 { margin:0; font-size:calc(28.5px * var(--type-scale) * var(--heading-scale)); line-height:.97; letter-spacing:-1.25px; }
  .role { margin:calc(3.1mm * var(--spacing-scale)) 0 calc(3.4mm * var(--spacing-scale)); color:#315169; font-size:calc(10px * var(--type-scale)); font-weight:750; line-height:1.2; }
  .intro { max-width:113mm; margin:0; color:#2a3c4d; font-size:calc(8.75px * var(--type-scale)); line-height:calc(1.52 * var(--line-height-scale)); }
  .intro + .intro { margin-top:2.35mm; }
  .lead { color:var(--accent-blue); font-weight:850; }
  .hl { color:#183142; font-weight:800; background:linear-gradient(transparent 64%, #dff6a6 0); }
  .rule { height:1px; background:var(--line); margin:calc(4.6mm * var(--spacing-scale)) 0; }
  .section-head { display:flex; align-items:center; gap:2.5mm; margin:0 0 calc(3.15mm * var(--spacing-scale)); }
  .section-num { width:calc(5.8mm * var(--badge-scale)); height:calc(5.8mm * var(--badge-scale)); display:flex; align-items:center; justify-content:center; border-radius:50%; background:var(--accent); color:var(--ink); font-size:calc(7.1px * var(--badge-scale)); line-height:1; font-weight:900; }
  h2 { margin:0; font-size:calc(10.8px * var(--type-scale) * var(--heading-scale)); letter-spacing:-.18px; }
  .education-section { width:100%; }
  .timeline { position:relative; margin-top:.15mm; padding:.65mm 0 .25mm; }
  .timeline::before { content:''; position:absolute; left:19.75mm; top:4.85mm; bottom:5.65mm; width:1px; background:#ccd7d2; }
  .time-row { position:relative; display:grid; grid-template-columns:17mm 1fr; column-gap:5mm; padding:.25mm 0 calc(4.55mm * var(--spacing-scale)); }
  .time-row:last-child { padding-bottom:.25mm; }
  .time-row::before { content:''; position:absolute; z-index:1; left:17.525mm; top:.9mm; width:4.45mm; height:4.45mm; border-radius:50%; background:var(--paper); border:1.4px solid var(--accent-blue); box-shadow:0 0 0 1.1mm var(--paper); }
  .year { padding:1.08mm 2.6mm 0 0; color:var(--muted); font-size:6.95px; line-height:1.25; font-weight:800; text-align:right; text-transform:uppercase; white-space:nowrap; }
  .time-content { min-height:9.4mm; padding:.22mm 0 0 1.8mm; }
  .time-title { margin:0 0 .72mm; color:var(--ink); font-size:calc(8.45px * var(--type-scale)); line-height:1.15; font-weight:800; }
  .time-sub { margin:0; color:#526472; font-size:calc(6.95px * var(--type-scale)); line-height:calc(1.37 * var(--line-height-scale)); font-weight:600; }
  .profile-strip { position:relative; width:${design.blocks.profileWidth}%; margin-left:${profileOffset}%; display:grid; grid-template-columns:${design.blocks.profileSplit}fr ${100 - design.blocks.profileSplit}fr; gap:0; margin-top:calc(3.5mm * var(--spacing-scale)); overflow:hidden; border:1px solid #d9e4df; border-radius:calc(3.2mm * var(--corner-scale)); background:#f0f4f0; }
  .profile-strip::before { content:''; position:absolute; left:0; top:0; bottom:0; width:calc(1.9mm * var(--accent-scale)); background:var(--accent); }
  .profile-panel { min-height:calc(18.3mm * var(--profile-scale)); padding:calc(3.15mm * var(--profile-scale)) 4.1mm calc(3.05mm * var(--profile-scale)) 5.2mm; }
  .profile-panel + .profile-panel { border-left:1px solid #d6e0db; padding-left:4.7mm; }
  .profile-kicker { margin:0 0 1.65mm; color:#456a2a; font-size:5.85px; line-height:1; letter-spacing:1.05px; font-weight:850; text-transform:uppercase; }
  .language-stack { display:grid; gap:1.25mm; }
  .language-item { display:flex; align-items:baseline; gap:1.9mm; color:#526472; font-size:7px; line-height:1.25; }
  .language-item::before { content:''; flex:0 0 auto; width:1.5mm; height:1.5mm; border-radius:50%; background:var(--accent); transform:translateY(.15mm); }
  .language-item b { min-width:10.8mm; color:#17334a; font-size:7.1px; font-weight:850; }
  .language-item span { color:#456d2c; font-size:6.85px; font-weight:800; }
  .work-style { display:grid; grid-template-columns:1fr 1fr; column-gap:3.6mm; row-gap:1.2mm; margin:0; padding:0; list-style:none; }
  .work-style li { position:relative; padding-left:2.7mm; color:#4b5e6d; font-size:6.65px; line-height:1.27; }
  .work-style li::before { content:''; position:absolute; left:0; top:.48mm; width:1.3mm; height:1.3mm; border-radius:50%; background:var(--accent); }
  .experience-section { margin-top:calc(5.15mm * var(--spacing-scale)); }
  .experience { position:relative; width:${design.blocks.experienceWidth}%; margin-left:${experienceOffset}%; overflow:hidden; background:#fff; border:1px solid #dce6e1; border-radius:calc(4mm * var(--corner-scale)); padding:calc(4.25mm * var(--experience-scale)) 4.5mm calc(3.85mm * var(--experience-scale)); box-shadow:0 2px 7px rgba(23,41,50,.045); }
  .experience + .experience { margin-top:calc(2.5mm * var(--spacing-scale)); }
  .experience::before { content:''; position:absolute; left:0; top:0; bottom:0; width:calc(3mm * var(--accent-scale)); background:var(--accent); }
  .experience-top { display:flex; justify-content:space-between; align-items:flex-start; gap:4mm; padding-left:1.2mm; }
  .kicker { margin:0 0 1mm; color:#4d7c27; font-size:6.35px; font-weight:850; letter-spacing:.9px; line-height:1; text-transform:uppercase; }
  .experience h3 { margin:0; color:var(--ink); font-size:calc(9.7px * var(--type-scale) * var(--heading-scale)); line-height:1.15; }
  .date-pill { flex:0 0 auto; background:var(--accent-soft-card); border-radius:100px; padding:1mm 1.85mm; color:var(--accent-card-text); font-size:calc(6.25px * var(--type-scale)); font-weight:850; letter-spacing:.3px; }
  .experience p { margin:calc(2.05mm * var(--spacing-scale)) 0 calc(2.7mm * var(--spacing-scale)) 1.2mm; color:#4f606d; font-size:calc(7.45px * var(--type-scale)); line-height:calc(1.42 * var(--line-height-scale)); }
  .metrics { margin-left:1.2mm; display:grid; grid-template-columns:repeat(3,1fr); gap:2.3mm; border-top:1px solid #e4ebe7; padding-top:2.35mm; }
  .metric strong { display:block; color:#17334a; font-size:10.8px; line-height:1; letter-spacing:-.25px; }
  .metric span { display:block; margin-top:.8mm; color:#697882; font-size:5.8px; line-height:1.22; font-weight:850; letter-spacing:.38px; text-transform:uppercase; }
  .portfolio { position:absolute; left:calc(11mm * var(--gutter-scale) + ${portfolioOffset}%); right:calc(12.3mm * var(--gutter-scale) + ${portfolioRightOffset}%); bottom:10mm; display:flex; align-items:center; justify-content:space-between; gap:4.1mm; min-height:calc(20.2mm * var(--portfolio-scale)); border:1px solid #d9e3de; background:#fff; border-radius:calc(4mm * var(--corner-scale)); padding:calc(2.25mm * var(--portfolio-scale)) 4.25mm calc(2.25mm * var(--portfolio-scale)) 4.75mm; }
  .portfolio > div { flex:1 1 auto; min-width:0; }
  .portfolio::before { content:''; position:absolute; left:0; top:0; bottom:0; width:calc(2.2mm * var(--accent-scale)); background:var(--ink); border-radius:4mm 0 0 4mm; }
  .portfolio-kicker { margin:0 0 .55mm; color:#5a7f32; font-size:6.05px; line-height:1; letter-spacing:.95px; font-weight:800; text-transform:uppercase; }
  .portfolio-main { max-width:79mm; margin:0; color:#17334a; font-size:7.75px; line-height:1.18; font-weight:800; }
  .portfolio-sub { margin:.55mm 0 0; color:#5a6b78; font-size:6.15px; line-height:1.2; }
  .qr-box { flex:0 0 35.5mm; display:flex; align-items:center; justify-content:flex-end; gap:1.9mm; color:inherit; text-decoration:none; }
  .qr-box img { width:14.7mm; height:14.7mm; padding:.6mm; border:1px solid #d4dfd9; border-radius:1.45mm; background:#fafcf8; }
  .qr-text { color:#506571; font-size:5.75px; line-height:1.16; }
  .qr-text strong { display:block; color:#193950; font-size:6.55px; }
  @media print { html,body { background:transparent; } }
</style>
</head>
<body>
<section class="page">
  <div class="layout">
    <aside class="rail">
      <div class="eyebrow">${escapeHtml(data.document?.versionLabel)}</div>
      <div class="photo"><img src="${portraitUrl}" alt="${escapeHtml(data.assets?.portraitAlt)}"></div>
      <div class="rail-heading">Contact</div>
      ${renderContacts(data.contacts)}
      <div class="rail-heading">${escapeHtml(data.rail?.howIWorkTitle)}</div>
      <p class="rail-copy">${escapeHtml(data.rail?.howIWork)}</p>
      <div class="rail-heading">${escapeHtml(data.rail?.bestFitTitle)}</div>
      ${(data.rail?.bestFit || []).map((item) => `<span class="pill">${escapeHtml(item)}</span>`).join('')}
      <div class="rail-heading">${escapeHtml(data.rail?.strengthsTitle)}</div>
      <div class="work-grid">${(data.rail?.strengths || []).map((item) => `<div class="work-line">${escapeHtml(item)}</div>`).join('')}</div>
      ${renderExtraRailSections(data.rail?.extraSections)}
      <div class="rail-footer"><span>${escapeHtml(data.document?.footerName)}</span><span>${escapeHtml(data.document?.footerPage)}</span></div>
    </aside>
    <main class="main">
      <div class="topline"><span class="topline-label">${escapeHtml(data.identity?.topline)}</span><span class="availability">${escapeHtml(data.identity?.availability)}</span></div>
      <h1>${escapeHtml(data.identity?.firstName)}<br>${escapeHtml(data.identity?.lastName)}</h1>
      <div class="role">${escapeHtml(data.identity?.role)}</div>
      ${(data.identity?.intro || []).map((paragraph) => `<p class="intro">${inlineMarkup(paragraph)}</p>`).join('')}
      <div class="rule"></div>
      <section class="education-section">
        <div class="section-head"><span class="section-num">${escapeHtml(data.education?.number)}</span><h2>${escapeHtml(data.education?.title)}</h2></div>
        <div class="timeline">${renderEducation(data.education?.items)}</div>
        <div class="profile-strip">
          <div class="profile-panel"><p class="profile-kicker">${escapeHtml(data.profileStrip?.languagesTitle)}</p><div class="language-stack">${(data.profileStrip?.languages || []).map((item) => `<div class="language-item"><b>${escapeHtml(item.name)}</b><span>${escapeHtml(item.level)}</span></div>`).join('')}</div></div>
          <div class="profile-panel"><p class="profile-kicker">${escapeHtml(data.profileStrip?.workingStyleTitle)}</p><ul class="work-style">${(data.profileStrip?.workingStyle || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>
        </div>
      </section>
      <section class="experience-section">
        <div class="section-head"><span class="section-num">${escapeHtml(data.experience?.number)}</span><h2>${escapeHtml(data.experience?.title)}</h2></div>
        ${renderExperience(data.experience?.items)}
      </section>
      <div class="portfolio">
        <div><p class="portfolio-kicker">${escapeHtml(data.portfolio?.kicker)}</p><p class="portfolio-main">${inlineMarkup(data.portfolio?.main)}</p><p class="portfolio-sub">${escapeHtml(data.portfolio?.sub)}</p></div>
        <a class="qr-box" href="${safeHref(data.portfolio?.url)}">${qrUrl ? `<img src="${qrUrl}" alt="QR code linking to ${escapeHtml(data.portfolio?.displayUrl)}">` : ''}<span class="qr-text"><strong>${escapeHtml(data.portfolio?.label)}</strong>${escapeHtml(data.portfolio?.displayUrl)}</span></a>
      </div>
    </main>
  </div>
</section>
</body>
</html>`;
}

export function buildCvHtml(data, options = {}) {
  return buildDefaultCvHtml(data, options);
}
