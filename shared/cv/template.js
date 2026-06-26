const ICONS = {
  mail: '<rect x="3.2" y="5.6" width="17.6" height="12.8" rx="1.8"/><path d="m4.2 7.3 7.8 5.4 7.8-5.4"/>',
  location: '<path d="M12 21s6.25-5.1 6.25-11.35a6.25 6.25 0 1 0-12.5 0C5.75 15.9 12 21 12 21Z"/><circle cx="12" cy="9.55" r="2.05"/>',
  code: '<path d="m8.1 8.2-3.8 3.8 3.8 3.8"/><path d="m15.9 8.2 3.8 3.8-3.8 3.8"/><path d="m14.2 5.9-4.4 12.2"/>',
  linkedin: '<rect x="4.5" y="4.5" width="15" height="15" rx="2.15"/><circle cx="8.3" cy="9" r=".75" fill="#c8f05d" stroke="none"/><path d="M8.3 11.75v4.55M11.55 16.3v-4.55M11.55 13.25c.42-1.22 1.4-1.95 2.72-1.95 1.57 0 2.55 1.05 2.55 2.82v2.18"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.8 12h16.4M12 3.5c2.4 2.4 3.5 5.2 3.5 8.5S14.4 18.1 12 20.5C9.6 18.1 8.5 15.3 8.5 12S9.6 5.9 12 3.5Z"/>',
  phone: '<path d="M7.2 3.8 4.7 5.4c-.6.4-.8 1.1-.5 1.8 2.5 5.7 6.9 10.1 12.6 12.6.7.3 1.4.1 1.8-.5l1.6-2.5-4.6-3-1.7 2c-2.5-1.2-4.5-3.2-5.7-5.7l2-1.7-3-4.6Z"/>',
  link: '<path d="M10.1 13.9a4.2 4.2 0 0 0 5.9 0l2.2-2.2a4.2 4.2 0 0 0-5.9-5.9L11 7.1"/><path d="M13.9 10.1a4.2 4.2 0 0 0-5.9 0l-2.2 2.2a4.2 4.2 0 0 0 5.9 5.9l1.3-1.3"/>',
};

export const CV_ICON_OPTIONS = Object.keys(ICONS);
export const CV_TEMPLATE_TOKENS = {
  portraitUrl: '{{CV_PORTRAIT_URL}}',
  qrUrl: '{{CV_QR_URL}}',
  documentTitle: '{{CV_DOCUMENT_TITLE}}',
  language: '{{CV_LANGUAGE}}',
};

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
  return `<svg viewBox="0 0 24 24" fill="none" stroke="#c8f05d" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
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

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${documentTitle}</title>
<style>
  @page { size: A4; margin: 0; }
  :root { --ink:#0d1828; --ink2:#183047; --paper:#f7f8f2; --soft:#eef2ee; --line:#d5dfda; --muted:#667483; --accent:#c8f05d; --accent-blue:#3b82f6; --green:#3b641e; }
  * { box-sizing:border-box; }
  html,body { margin:0; padding:0; background:#d6d8d5; font-family:'Inter','Noto Sans','Arial',sans-serif; color:var(--ink); print-color-adjust:exact; -webkit-print-color-adjust:exact; }
  .page { width:210mm; height:297mm; overflow:hidden; position:relative; background:var(--paper); }
  .layout { display:grid; grid-template-columns:67mm 1fr; height:100%; }
  .rail { position:relative; overflow:hidden; background:var(--ink); color:#f4f8f5; padding:12.5mm 8.2mm 9mm; }
  .rail::before { content:''; position:absolute; width:68mm; height:68mm; border:1px solid rgba(200,240,93,.40); border-radius:50%; left:-37mm; top:-34mm; }
  .rail::after { content:''; position:absolute; width:58mm; height:58mm; border:1px solid rgba(255,255,255,.11); border-radius:50%; left:-25mm; top:-23mm; }
  .eyebrow { position:relative; color:var(--accent); font-size:7.5px; letter-spacing:2px; font-weight:850; text-transform:uppercase; }
  .photo { position:relative; width:49mm; height:59mm; overflow:hidden; border-radius:7mm; margin:6.4mm 0 7.3mm; border:1.15mm solid rgba(255,255,255,.19); background:#bac2bf; box-shadow:0 10px 24px rgba(0,0,0,.22); }
  .photo img { display:block; width:100%; height:100%; object-fit:cover; object-position:50% 30%; }
  .rail-heading { color:var(--accent); font-size:7.2px; letter-spacing:1.7px; line-height:1; font-weight:850; text-transform:uppercase; margin:8.6mm 0 3.2mm; }
  .contact { display:flex; align-items:center; gap:2.65mm; margin:3mm 0; color:#edf3ef; font-size:7.55px; line-height:1.22; }
  .contact-badge { width:6.35mm; height:6.35mm; flex:0 0 auto; display:flex; align-items:center; justify-content:center; border:0.32mm solid rgba(200,240,93,.42); border-radius:50%; background:rgba(200,240,93,.07); }
  .contact-badge svg { width:3.25mm; height:3.25mm; display:block; }
  .contact-label { display:block; margin:0 0 .72mm; color:#91a1a2; font-size:5.9px; line-height:1; letter-spacing:1.12px; font-weight:850; text-transform:uppercase; }
  .contact a { color:inherit; text-decoration:none; border:0; }
  .contact-linkedin a { font-size:7.55px; letter-spacing:0; }
  .rail-copy { margin:0; color:#dce5e2; font-size:8px; line-height:1.46; }
  .pill { display:inline-block; margin:0 1.15mm 1.55mm 0; padding:1.25mm 2.2mm; border:1px solid rgba(200,240,93,.55); border-radius:100px; color:var(--accent); font-size:6.5px; line-height:1; font-weight:800; letter-spacing:.25px; }
  .work-grid { display:grid; gap:2.45mm; }
  .work-line { position:relative; padding-left:3.7mm; font-size:7.65px; line-height:1.3; color:#dce5e2; }
  .work-line::before { content:''; position:absolute; top:.7mm; left:0; width:1.65mm; height:1.65mm; border-radius:50%; background:var(--accent); }
  .rail-footer { position:absolute; left:8.2mm; right:8.2mm; bottom:8.3mm; display:flex; justify-content:space-between; color:#8e9ca4; font-size:6.5px; letter-spacing:1px; text-transform:uppercase; }
  .main { position:relative; display:flex; flex-direction:column; padding:13.1mm 12.3mm 10mm 11mm; overflow:hidden; }
  .main::before { content:''; position:absolute; right:0; top:0; width:34mm; height:3.2mm; background:var(--accent); }
  .topline { display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--line); padding-bottom:3.3mm; margin-bottom:5.1mm; }
  .topline-label { color:var(--muted); font-size:6.9px; font-weight:800; letter-spacing:1.15px; text-transform:uppercase; }
  .availability { display:inline-block; background:#e7f7bd; color:#1d4020; border-radius:100px; padding:1.15mm 2.15mm; font-size:6.75px; line-height:1; font-weight:850; }
  h1 { margin:0; font-size:28.5px; line-height:.97; letter-spacing:-1.25px; font-weight:850; }
  .role { margin:3.1mm 0 3.4mm; color:#315169; font-size:10px; font-weight:750; line-height:1.2; }
  .intro { max-width:113mm; margin:0; color:#2a3c4d; font-size:8.75px; line-height:1.52; }
  .intro + .intro { margin-top:2.35mm; }
  .lead { color:var(--accent-blue); font-weight:850; }
  .hl { color:#183142; font-weight:800; background:linear-gradient(transparent 64%, #dff6a6 0); }
  .rule { height:1px; background:var(--line); margin:4.6mm 0; }
  .section-head { display:flex; align-items:center; gap:2.5mm; margin:0 0 3.15mm; }
  .section-num { width:5.8mm; height:5.8mm; display:flex; align-items:center; justify-content:center; border-radius:50%; background:var(--accent); color:var(--ink); font-size:7.1px; line-height:1; font-weight:900; }
  h2 { margin:0; font-size:10.8px; letter-spacing:-.18px; font-weight:850; }
  .education-section { width:100%; }
  .timeline { position:relative; margin-top:.15mm; padding:.65mm 0 .25mm; }
  .timeline::before { content:''; position:absolute; left:19.75mm; top:4.85mm; bottom:5.65mm; width:1px; background:#ccd7d2; }
  .time-row { position:relative; display:grid; grid-template-columns:17mm 1fr; column-gap:5mm; padding:.25mm 0 4.55mm; }
  .time-row:last-child { padding-bottom:.25mm; }
  .time-row::before { content:''; position:absolute; z-index:1; left:17.525mm; top:.9mm; width:4.45mm; height:4.45mm; border-radius:50%; background:var(--paper); border:1.4px solid var(--accent-blue); box-shadow:0 0 0 1.1mm var(--paper); }
  .year { padding:1.08mm 2.6mm 0 0; color:var(--muted); font-size:6.95px; line-height:1.25; font-weight:800; text-align:right; text-transform:uppercase; white-space:nowrap; }
  .time-content { min-height:9.4mm; padding:.22mm 0 0 1.8mm; }
  .time-title { margin:0 0 .72mm; color:var(--ink); font-size:8.45px; line-height:1.15; font-weight:800; }
  .time-sub { margin:0; color:#526472; font-size:6.95px; line-height:1.37; font-weight:600; }
  .profile-strip { position:relative; display:grid; grid-template-columns:.88fr 1.62fr; gap:0; margin-top:3.5mm; overflow:hidden; border:1px solid #d9e4df; border-radius:3.2mm; background:#f0f4f0; }
  .profile-strip::before { content:''; position:absolute; left:0; top:0; bottom:0; width:1.9mm; background:var(--accent); }
  .profile-panel { min-height:18.3mm; padding:3.15mm 4.1mm 3.05mm 5.2mm; }
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
  .experience-section { margin-top:5.15mm; }
  .experience { position:relative; overflow:hidden; background:#fff; border:1px solid #dce6e1; border-radius:4mm; padding:4.25mm 4.5mm 3.85mm; box-shadow:0 2px 7px rgba(23,41,50,.045); }
  .experience + .experience { margin-top:2.5mm; }
  .experience::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3mm; background:var(--accent); }
  .experience-top { display:flex; justify-content:space-between; align-items:flex-start; gap:4mm; padding-left:1.2mm; }
  .kicker { margin:0 0 1mm; color:#4d7c27; font-size:6.35px; font-weight:850; letter-spacing:.9px; line-height:1; text-transform:uppercase; }
  .experience h3 { margin:0; color:var(--ink); font-size:9.7px; font-weight:850; line-height:1.15; }
  .date-pill { flex:0 0 auto; background:#eaf6cc; border-radius:100px; padding:1mm 1.85mm; color:#365f19; font-size:6.25px; font-weight:850; letter-spacing:.3px; }
  .experience p { margin:2.05mm 0 2.7mm 1.2mm; color:#4f606d; font-size:7.45px; line-height:1.42; }
  .metrics { margin-left:1.2mm; display:grid; grid-template-columns:repeat(3,1fr); gap:2.3mm; border-top:1px solid #e4ebe7; padding-top:2.35mm; }
  .metric strong { display:block; color:#17334a; font-size:10.8px; line-height:1; letter-spacing:-.25px; }
  .metric span { display:block; margin-top:.8mm; color:#697882; font-size:5.8px; line-height:1.22; font-weight:850; letter-spacing:.38px; text-transform:uppercase; }
  .portfolio { position:absolute; left:11mm; right:12.3mm; bottom:10mm; display:flex; align-items:center; justify-content:space-between; gap:4.1mm; min-height:20.2mm; border:1px solid #d9e3de; background:#fff; border-radius:4mm; padding:2.25mm 4.25mm 2.25mm 4.75mm; }
  .portfolio > div { flex:1 1 auto; min-width:0; }
  .portfolio::before { content:''; position:absolute; left:0; top:0; bottom:0; width:2.2mm; background:var(--ink); border-radius:4mm 0 0 4mm; }
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

export function applyCvTemplateTokens(html = '', data = {}, options = {}) {
  const replacements = {
    [CV_TEMPLATE_TOKENS.portraitUrl]: escapeHtml(options.portraitUrl || data.assets?.portraitUrl || '/assets/alberto.webp'),
    [CV_TEMPLATE_TOKENS.qrUrl]: escapeHtml(options.qrUrl || ''),
    [CV_TEMPLATE_TOKENS.documentTitle]: escapeHtml(data.document?.title || 'Curriculum vitae'),
    [CV_TEMPLATE_TOKENS.language]: escapeHtml(data.document?.language || 'en'),
  };

  return Object.entries(replacements).reduce(
    (current, [token, value]) => current.replaceAll(token, value),
    String(html),
  );
}

export function buildCvHtml(data, options = {}) {
  const override = data.templateOverride;
  if (!options.ignoreTemplateOverride && override?.enabled && typeof override.html === 'string' && override.html.trim()) {
    return applyCvTemplateTokens(override.html, data, options);
  }

  return buildDefaultCvHtml(data, options);
}
