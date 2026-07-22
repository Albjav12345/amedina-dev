import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Code2, Download, Eye, FileCheck2, LogOut, Plus, RotateCcw, Save, Trash2, X } from 'lucide-react';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import publishedCv from '../../data/cv/published.json';
import { buildCvHtml, buildDefaultCvHtml, CV_ICON_OPTIONS } from '../../../shared/cv/template.js';
import './CvStudio.css';

const DRAFT_KEY = 'amedina.cv-studio.draft.v1';
const SECTIONS = [
    ['identity', 'Identity'],
    ['sidebar', 'Sidebar'],
    ['education', 'Education'],
    ['profile', 'Languages & style'],
    ['experience', 'Experience'],
    ['portfolio', 'Portfolio'],
    ['source', 'Source'],
];

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

function clone(value) {
    return structuredClone(value);
}

function normalizeCvData(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('The CV source must be a JSON object.');
    }
    if (value.schemaVersion !== 1) {
        throw new Error('schemaVersion must be 1.');
    }
    const requiredObjects = ['document', 'assets', 'identity', 'rail', 'education', 'profileStrip', 'experience', 'portfolio'];
    const missingObject = requiredObjects.find((key) => !value[key] || typeof value[key] !== 'object' || Array.isArray(value[key]));
    if (missingObject) {
        throw new Error(`${missingObject} must be an object.`);
    }
    if (!value.identity.firstName || !value.identity.lastName) {
        throw new Error('identity.firstName and identity.lastName are required.');
    }

    const requiredArrays = [
        ['contacts'],
        ['identity', 'intro'],
        ['rail', 'bestFit'],
        ['rail', 'strengths'],
        ['rail', 'extraSections'],
        ['education', 'items'],
        ['profileStrip', 'languages'],
        ['profileStrip', 'workingStyle'],
        ['experience', 'items'],
    ];
    const invalidArray = requiredArrays.find((path) => !Array.isArray(path.reduce((current, key) => current?.[key], value)));
    if (invalidArray) {
        throw new Error(`${invalidArray.join('.')} must be an array.`);
    }

    const next = clone(value);
    delete next.templateOverride;
    return next;
}

function safeNormalizeCvData(value, fallback = publishedCv) {
    try {
        return normalizeCvData(value);
    } catch {
        return clone(fallback);
    }
}

function serializeCvSource(value) {
    return `${JSON.stringify(normalizeCvData(value), null, 2)}\n`;
}

function getAtPath(source, path) {
    return path.reduce((current, key) => current?.[key], source);
}

function setAtPath(source, path, value) {
    const next = clone(source);
    let cursor = next;
    path.slice(0, -1).forEach((key) => {
        cursor = cursor[key];
    });
    cursor[path.at(-1)] = value;
    return next;
}

function newId(prefix) {
    return `${prefix}-${crypto.randomUUID()}`;
}

function Field({ label, value, onChange, multiline = false, hint = '' }) {
    const Component = multiline ? 'textarea' : 'input';
    return (
        <label className="cv-field">
            <span>{label}</span>
            <Component value={value ?? ''} onChange={(event) => onChange(event.target.value)} rows={multiline ? 4 : undefined} />
            {hint ? <small>{hint}</small> : null}
        </label>
    );
}

function ItemActions({ index, length, onMove, onRemove }) {
    return (
        <div className="cv-item-actions">
            <button type="button" onClick={() => onMove(index, -1)} disabled={index === 0} aria-label="Move up"><ArrowUp size={14} /></button>
            <button type="button" onClick={() => onMove(index, 1)} disabled={index === length - 1} aria-label="Move down"><ArrowDown size={14} /></button>
            <button type="button" className="danger" onClick={() => onRemove(index)} aria-label="Remove"><Trash2 size={14} /></button>
        </div>
    );
}

function TextList({ title, values, onChange, placeholder = 'New item' }) {
    const move = (index, direction) => {
        const target = index + direction;
        if (target < 0 || target >= values.length) return;
        const next = [...values];
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
    };
    return (
        <div className="cv-list-block">
            <div className="cv-list-title"><strong>{title}</strong><button type="button" onClick={() => onChange([...values, placeholder])}><Plus size={14} /> Add</button></div>
            {values.map((value, index) => (
                <div className="cv-inline-item" key={`${title}-${index}`}>
                    <input value={value} onChange={(event) => onChange(values.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} />
                    <ItemActions index={index} length={values.length} onMove={move} onRemove={(itemIndex) => onChange(values.filter((_, current) => current !== itemIndex))} />
                </div>
            ))}
        </div>
    );
}

function Card({ title, children }) {
    return <section className="cv-editor-card"><h2>{title}</h2>{children}</section>;
}

function PdfPreviewModal({ url, onClose }) {
    const canvasRef = useRef(null);
    const [renderState, setRenderState] = useState('Rendering the approved PDF…');

    useEffect(() => {
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', closeOnEscape);
        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [onClose]);

    useEffect(() => {
        let disposed = false;
        let loadingTask;
        let renderTask;
        let pdf;

        const renderPdf = async () => {
            try {
                loadingTask = getDocument(url);
                pdf = await loadingTask.promise;
                const page = await pdf.getPage(1);
                if (disposed) return;
                const viewport = page.getViewport({ scale: 1.7 });
                const canvas = canvasRef.current;
                const context = canvas?.getContext('2d', { alpha: false });
                if (!canvas || !context) return;
                canvas.width = Math.ceil(viewport.width);
                canvas.height = Math.ceil(viewport.height);
                renderTask = page.render({ canvas, canvasContext: context, viewport });
                await renderTask.promise;
                if (!disposed) setRenderState('');
            } catch (error) {
                if (!disposed && error?.name !== 'RenderingCancelledException') setRenderState('The embedded preview could not be drawn. Download the PDF to review it.');
            }
        };

        renderPdf();
        return () => {
            disposed = true;
            renderTask?.cancel();
            loadingTask?.destroy();
            pdf?.destroy();
        };
    }, [url]);

    return <div className="cv-pdf-modal" role="dialog" aria-modal="true" aria-label="Authoritative PDF preview">
        <div className="cv-pdf-dialog">
            <div className="cv-pdf-dialog-header"><div><strong>Authoritative PDF preview</strong><span>This is the exact file that will be published.</span></div><div><a href={url} download="Alberto_Medina_CV_2026_preview.pdf"><Download size={15} /> Download</a><button type="button" onClick={onClose} aria-label="Close PDF preview"><X size={17} /></button></div></div>
            <div className="cv-pdf-page">{renderState ? <div className="cv-pdf-loading">{renderState}</div> : null}<canvas ref={canvasRef} /></div>
        </div>
    </div>;
}

function Login({ onAuthenticated }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        setBusy(true);
        setError('');
        try {
            const response = await fetch('/api/cv-admin?action=login', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const payload = await response.json();
            if (!response.ok) throw new Error(payload.message || 'Login failed');
            onAuthenticated(payload);
        } catch (loginError) {
            setError(loginError.message === 'CV_ADMIN_NOT_CONFIGURED'
                ? 'Configure CV_ADMIN_PASSWORD and CV_SESSION_SECRET first.'
                : 'Access denied. Check the password and try again.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <main className="cv-login-shell">
            <form className="cv-login-card" onSubmit={submit}>
                <span className="cv-studio-kicker">PRIVATE TOOL</span>
                <h1>CV Studio</h1>
                <p>Edit, preview and publish Alberto's CV. This route is not linked from the public portfolio.</p>
                <label><span>Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus /></label>
                {error ? <div className="cv-error">{error}</div> : null}
                <button type="submit" disabled={busy || !password}>{busy ? 'Checking…' : 'Unlock editor'}</button>
            </form>
        </main>
    );
}

export default function CvStudio() {
    const [auth, setAuth] = useState({ checking: true, authenticated: false, csrf: '' });
    const [data, setData] = useState(clone(publishedCv));
    const [publishedBaseline, setPublishedBaseline] = useState(clone(publishedCv));
    const [activeSection, setActiveSection] = useState('identity');
    const [status, setStatus] = useState('Checking private session…');
    const [busy, setBusy] = useState('');
    const [previewedFingerprint, setPreviewedFingerprint] = useState('');
    const [fitStatus, setFitStatus] = useState({ rail: true, main: true });
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');
    const [sourceText, setSourceText] = useState(() => serializeCvSource(publishedCv));
    const [sourceError, setSourceError] = useState('');
    const [sourceDirty, setSourceDirty] = useState(false);
    const iframeRef = useRef(null);

    const fingerprint = useMemo(() => JSON.stringify(data), [data]);
    const publishedFingerprint = useMemo(() => JSON.stringify(publishedBaseline), [publishedBaseline]);
    const hasUnpublishedChanges = fingerprint !== publishedFingerprint;
    const isPreviewCurrent = previewedFingerprint === fingerprint;
    const absoluteAsset = (path) => new URL(path, window.location.origin).href;
    const canonicalSource = useMemo(() => serializeCvSource(data), [data]);
    const generatedTemplateHtml = useMemo(() => buildDefaultCvHtml(data, {
        portraitUrl: absoluteAsset(data.assets?.portraitUrl || '/assets/alberto.webp'),
        qrUrl: absoluteAsset('/assets/cv/qr-portfolio.png'),
    }), [data]);
    const previewHtml = useMemo(() => buildCvHtml(data, {
        portraitUrl: absoluteAsset(data.assets?.portraitUrl || '/assets/alberto.webp'),
        qrUrl: absoluteAsset('/assets/cv/qr-portfolio.png'),
    }), [data]);

    const applyAuthenticatedPayload = (payload) => {
        const published = safeNormalizeCvData(payload.data || clone(publishedCv));
        let initial = published;
        try {
            const draft = JSON.parse(localStorage.getItem(DRAFT_KEY));
            if (draft?.schemaVersion === 1) initial = normalizeCvData(draft);
        } catch {
            localStorage.removeItem(DRAFT_KEY);
        }
        setPublishedBaseline(clone(published));
        setData(clone(initial));
        setSourceText(serializeCvSource(initial));
        setSourceError('');
        setSourceDirty(false);
        setAuth({ checking: false, authenticated: true, csrf: payload.csrf });
        setStatus(initial === published ? 'Published version loaded.' : 'Local draft restored.');
    };

    useEffect(() => {
        fetch('/api/cv-admin?action=session', { credentials: 'include' })
            .then(async response => ({ response, payload: await response.json() }))
            .then(({ response, payload }) => {
                if (!response.ok) throw new Error('NO_SESSION');
                applyAuthenticatedPayload(payload);
            })
            .catch(() => setAuth({ checking: false, authenticated: false, csrf: '' }));
    }, []);

    useEffect(() => {
        if (!auth.authenticated) return undefined;
        if (!hasUnpublishedChanges) {
            localStorage.removeItem(DRAFT_KEY);
            return undefined;
        }
        const timeout = window.setTimeout(() => {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
            setStatus('Draft saved locally.');
        }, 450);
        return () => window.clearTimeout(timeout);
    }, [auth.authenticated, data, hasUnpublishedChanges]);

    useEffect(() => () => {
        if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
    }, [pdfPreviewUrl]);

    useEffect(() => {
        if (!sourceDirty) {
            setSourceText(canonicalSource);
            setSourceError('');
        }
    }, [canonicalSource, sourceDirty]);

    const update = (path, value) => {
        setData(current => setAtPath(current, path, value));
        setPreviewedFingerprint('');
    };

    const updateObjectItem = (path, index, key, value) => {
        const values = getAtPath(data, path);
        update(path, values.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
    };

    const moveObjectItem = (path, index, direction) => {
        const values = [...getAtPath(data, path)];
        const target = index + direction;
        if (target < 0 || target >= values.length) return;
        [values[index], values[target]] = [values[target], values[index]];
        update(path, values);
    };

    const removeObjectItem = (path, index) => update(path, getAtPath(data, path).filter((_, itemIndex) => itemIndex !== index));
    const addObjectItem = (path, value) => update(path, [...getAtPath(data, path), value]);

    const updateSourceText = (value) => {
        setSourceText(value);
        setSourceDirty(true);

        try {
            const parsed = normalizeCvData(JSON.parse(value));
            setSourceError('');
            const nextFingerprint = JSON.stringify(parsed);
            if (nextFingerprint !== fingerprint) {
                setData(parsed);
                setPreviewedFingerprint('');
                setStatus('Source synced with the visual editor.');
            }
        } catch (error) {
            setSourceError(error.message);
        }
    };

    const formatSourceText = () => {
        setSourceText(canonicalSource);
        setSourceError('');
        setSourceDirty(false);
        setStatus('Source formatted from the current visual editor data.');
    };

    const discardSourceText = () => {
        setSourceText(canonicalSource);
        setSourceError('');
        setSourceDirty(false);
        setStatus('Source editor reloaded from the current visual editor data.');
    };

    const checkFit = () => {
        const documentRef = iframeRef.current?.contentDocument;
        const rail = documentRef?.querySelector('.rail');
        const main = documentRef?.querySelector('.main');
        if (!rail || !main) return;
        setFitStatus({ rail: rail.scrollHeight <= rail.clientHeight + 1, main: main.scrollHeight <= main.clientHeight + 1 });
    };

    const requestPdfPreview = async () => {
        if (sourceError) {
            setStatus('Fix the source editor error before generating a PDF preview.');
            return;
        }
        setBusy('preview');
        setStatus('Generating the authoritative PDF preview…');
        try {
            const response = await fetch('/api/cv-admin?action=preview', {
                method: 'POST', credentials: 'include',
                headers: { 'Content-Type': 'application/json', 'X-CV-CSRF': auth.csrf },
                body: JSON.stringify({ data }),
            });
            if (!response.ok) throw new Error((await response.json()).message || 'PREVIEW_FAILED');
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setPdfPreviewUrl(current => {
                if (current) URL.revokeObjectURL(current);
                return url;
            });
            setPreviewedFingerprint(fingerprint);
            setStatus('PDF preview generated. Publishing is now unlocked for this exact version.');
        } catch (error) {
            setStatus(`Preview failed: ${error.message}`);
        } finally {
            setBusy('');
        }
    };

    const publish = async () => {
        if (sourceError) {
            setStatus('Fix the source editor error before publishing.');
            return;
        }
        if (!isPreviewCurrent || !window.confirm('Publish this exact preview as the live CV?')) return;
        setBusy('publish');
        setStatus('Publishing the approved revision…');
        try {
            const response = await fetch('/api/cv-admin?action=publish', {
                method: 'POST', credentials: 'include',
                headers: { 'Content-Type': 'application/json', 'X-CV-CSRF': auth.csrf },
                body: JSON.stringify({ data }),
            });
            const payload = await response.json();
            if (!response.ok) throw new Error(payload.details || payload.message || 'PUBLISH_FAILED');
            const next = clone(data);
            next.publication = { revision: payload.revision, updatedAt: payload.updatedAt };
            setData(next);
            setPublishedBaseline(clone(next));
            localStorage.removeItem(DRAFT_KEY);
            setPreviewedFingerprint(JSON.stringify(next));
            setStatus(payload.publication?.mode === 'github'
                ? `Revision ${payload.revision} committed. Vercel will deploy it shortly.`
                : `Revision ${payload.revision} written to the local repository.`);
        } catch (error) {
            setStatus(`Publish failed: ${error.message}`);
        } finally {
            setBusy('');
        }
    };

    const logout = async () => {
        await fetch('/api/cv-admin?action=logout', { method: 'POST', credentials: 'include', headers: { 'X-CV-CSRF': auth.csrf } });
        setAuth({ checking: false, authenticated: false, csrf: '' });
    };

    if (auth.checking) return <main className="cv-login-shell"><div className="cv-login-card"><p>{status}</p></div></main>;
    if (!auth.authenticated) return <Login onAuthenticated={applyAuthenticatedPayload} />;

    const renderEditor = () => {
        if (activeSection === 'identity') return <>
            <Card title="Document"><div className="cv-grid two"><Field label="Version label" value={data.document.versionLabel} onChange={value => update(['document', 'versionLabel'], value)} /><Field label="PDF title" value={data.document.title} onChange={value => update(['document', 'title'], value)} /><Field label="Document language" value={data.document.language} onChange={value => update(['document', 'language'], value)} hint="Use an ISO code such as en or es." /><Field label="Portrait asset" value={data.assets.portraitUrl} onChange={value => update(['assets', 'portraitUrl'], value)} hint="Path inside public, for example /assets/alberto.webp." /><Field label="Portrait description" value={data.assets.portraitAlt} onChange={value => update(['assets', 'portraitAlt'], value)} /><Field label="Footer name" value={data.document.footerName} onChange={value => update(['document', 'footerName'], value)} /><Field label="Footer page" value={data.document.footerPage} onChange={value => update(['document', 'footerPage'], value)} /></div></Card>
            <Card title="Identity"><div className="cv-grid two"><Field label="First name" value={data.identity.firstName} onChange={value => update(['identity', 'firstName'], value)} /><Field label="Last name" value={data.identity.lastName} onChange={value => update(['identity', 'lastName'], value)} /><Field label="Top line" value={data.identity.topline} onChange={value => update(['identity', 'topline'], value)} /><Field label="Availability" value={data.identity.availability} onChange={value => update(['identity', 'availability'], value)} /></div><Field label="Role" value={data.identity.role} onChange={value => update(['identity', 'role'], value)} /><TextList title="Introduction paragraphs" values={data.identity.intro} onChange={value => update(['identity', 'intro'], value)} placeholder="New introduction paragraph" /></Card>
        </>;

        if (activeSection === 'sidebar') return <>
            <Card title="Contacts"><button className="cv-add" type="button" onClick={() => addObjectItem(['contacts'], { id: newId('contact'), icon: 'link', label: 'Label', value: 'Value', href: '' })}><Plus size={14} /> Add contact</button>{data.contacts.map((contact, index) => <div className="cv-object-item" key={contact.id}><ItemActions index={index} length={data.contacts.length} onMove={(itemIndex, direction) => moveObjectItem(['contacts'], itemIndex, direction)} onRemove={itemIndex => removeObjectItem(['contacts'], itemIndex)} /><div className="cv-grid two"><label className="cv-field"><span>Icon</span><select value={contact.icon} onChange={event => updateObjectItem(['contacts'], index, 'icon', event.target.value)}>{CV_ICON_OPTIONS.map(icon => <option key={icon}>{icon}</option>)}</select></label><Field label="Label" value={contact.label} onChange={value => updateObjectItem(['contacts'], index, 'label', value)} /><Field label="Value" value={contact.value} onChange={value => updateObjectItem(['contacts'], index, 'value', value)} /><Field label="Link" value={contact.href} onChange={value => updateObjectItem(['contacts'], index, 'href', value)} /></div></div>)}</Card>
            <Card title="Sidebar copy"><Field label="How I work title" value={data.rail.howIWorkTitle} onChange={value => update(['rail', 'howIWorkTitle'], value)} /><Field label="How I work" value={data.rail.howIWork} multiline onChange={value => update(['rail', 'howIWork'], value)} /><div className="cv-grid two"><Field label="Best fit title" value={data.rail.bestFitTitle} onChange={value => update(['rail', 'bestFitTitle'], value)} /><Field label="Strengths title" value={data.rail.strengthsTitle} onChange={value => update(['rail', 'strengthsTitle'], value)} /></div><TextList title="Best fit" values={data.rail.bestFit} onChange={value => update(['rail', 'bestFit'], value)} /><TextList title="Core strengths" values={data.rail.strengths} onChange={value => update(['rail', 'strengths'], value)} /></Card>
            <Card title="Extra sidebar categories"><button className="cv-add" type="button" onClick={() => addObjectItem(['rail', 'extraSections'], { id: newId('rail'), title: 'New category', type: 'list', text: '', items: ['New item'] })}><Plus size={14} /> Add category</button>{data.rail.extraSections.map((section, index) => <div className="cv-object-item" key={section.id}><ItemActions index={index} length={data.rail.extraSections.length} onMove={(itemIndex, direction) => moveObjectItem(['rail', 'extraSections'], itemIndex, direction)} onRemove={itemIndex => removeObjectItem(['rail', 'extraSections'], itemIndex)} /><div className="cv-grid two"><Field label="Title" value={section.title} onChange={value => updateObjectItem(['rail', 'extraSections'], index, 'title', value)} /><label className="cv-field"><span>Style</span><select value={section.type} onChange={event => updateObjectItem(['rail', 'extraSections'], index, 'type', event.target.value)}><option value="text">Text</option><option value="list">Bullet list</option><option value="pills">Pills</option></select></label></div>{section.type === 'text' ? <Field label="Text" multiline value={section.text} onChange={value => updateObjectItem(['rail', 'extraSections'], index, 'text', value)} /> : <TextList title="Items" values={section.items || []} onChange={value => updateObjectItem(['rail', 'extraSections'], index, 'items', value)} />}</div>)}</Card>
        </>;

        if (activeSection === 'education') return <Card title="Education timeline"><div className="cv-grid two"><Field label="Section number" value={data.education.number} onChange={value => update(['education', 'number'], value)} /><Field label="Section title" value={data.education.title} onChange={value => update(['education', 'title'], value)} /></div><button className="cv-add" type="button" onClick={() => addObjectItem(['education', 'items'], { id: newId('education'), year: 'Year', title: 'New education item', description: 'Description' })}><Plus size={14} /> Add item</button>{data.education.items.map((item, index) => <div className="cv-object-item" key={item.id}><ItemActions index={index} length={data.education.items.length} onMove={(itemIndex, direction) => moveObjectItem(['education', 'items'], itemIndex, direction)} onRemove={itemIndex => removeObjectItem(['education', 'items'], itemIndex)} /><div className="cv-grid two"><Field label="Year" value={item.year} onChange={value => updateObjectItem(['education', 'items'], index, 'year', value)} /><Field label="Title" value={item.title} onChange={value => updateObjectItem(['education', 'items'], index, 'title', value)} /></div><Field label="Description" multiline value={item.description} onChange={value => updateObjectItem(['education', 'items'], index, 'description', value)} /></div>)}</Card>;

        if (activeSection === 'profile') return <><Card title="Languages & working style"><div className="cv-grid two"><Field label="Languages title" value={data.profileStrip.languagesTitle} onChange={value => update(['profileStrip', 'languagesTitle'], value)} /><Field label="Working style title" value={data.profileStrip.workingStyleTitle} onChange={value => update(['profileStrip', 'workingStyleTitle'], value)} /></div><TextList title="Working style" values={data.profileStrip.workingStyle} onChange={value => update(['profileStrip', 'workingStyle'], value)} /><button className="cv-add" type="button" onClick={() => addObjectItem(['profileStrip', 'languages'], { id: newId('language'), name: 'Language', level: 'Level' })}><Plus size={14} /> Add language</button>{data.profileStrip.languages.map((item, index) => <div className="cv-inline-item" key={item.id}><input value={item.name} onChange={event => updateObjectItem(['profileStrip', 'languages'], index, 'name', event.target.value)} /><input value={item.level} onChange={event => updateObjectItem(['profileStrip', 'languages'], index, 'level', event.target.value)} /><ItemActions index={index} length={data.profileStrip.languages.length} onMove={(itemIndex, direction) => moveObjectItem(['profileStrip', 'languages'], itemIndex, direction)} onRemove={itemIndex => removeObjectItem(['profileStrip', 'languages'], itemIndex)} /></div>)}</Card></>;

        if (activeSection === 'experience') return <Card title="Practical experience"><div className="cv-grid two"><Field label="Section number" value={data.experience.number} onChange={value => update(['experience', 'number'], value)} /><Field label="Section title" value={data.experience.title} onChange={value => update(['experience', 'title'], value)} /></div><button className="cv-add" type="button" onClick={() => addObjectItem(['experience', 'items'], { id: newId('experience'), kicker: 'Category', title: 'New experience', date: 'Date', description: 'Description', metrics: [] })}><Plus size={14} /> Add experience</button>{data.experience.items.map((item, index) => <div className="cv-object-item" key={item.id}><ItemActions index={index} length={data.experience.items.length} onMove={(itemIndex, direction) => moveObjectItem(['experience', 'items'], itemIndex, direction)} onRemove={itemIndex => removeObjectItem(['experience', 'items'], itemIndex)} /><div className="cv-grid two"><Field label="Kicker" value={item.kicker} onChange={value => updateObjectItem(['experience', 'items'], index, 'kicker', value)} /><Field label="Date" value={item.date} onChange={value => updateObjectItem(['experience', 'items'], index, 'date', value)} /></div><Field label="Title" value={item.title} onChange={value => updateObjectItem(['experience', 'items'], index, 'title', value)} /><Field label="Description" multiline value={item.description} onChange={value => updateObjectItem(['experience', 'items'], index, 'description', value)} hint="Use **text** for bold." /><TextList title="Metrics (value | label)" values={(item.metrics || []).map(metric => `${metric.value} | ${metric.label}`)} onChange={values => updateObjectItem(['experience', 'items'], index, 'metrics', values.map((value, metricIndex) => { const [metricValue, ...label] = value.split('|'); return { id: item.metrics?.[metricIndex]?.id || newId('metric'), value: metricValue.trim(), label: label.join('|').trim() }; }))} placeholder="Value | Label" /></div>)}</Card>;

        if (activeSection === 'portfolio') return <Card title="Portfolio footer"><Field label="Kicker" value={data.portfolio.kicker} onChange={value => update(['portfolio', 'kicker'], value)} /><Field label="Main line" value={data.portfolio.main} onChange={value => update(['portfolio', 'main'], value)} hint="Use {{text}} for the green highlight." /><Field label="Supporting line" value={data.portfolio.sub} onChange={value => update(['portfolio', 'sub'], value)} /><div className="cv-grid two"><Field label="URL" value={data.portfolio.url} onChange={value => update(['portfolio', 'url'], value)} /><Field label="QR label" value={data.portfolio.label} onChange={value => update(['portfolio', 'label'], value)} /><Field label="Displayed URL" value={data.portfolio.displayUrl} onChange={value => update(['portfolio', 'displayUrl'], value)} /></div></Card>;

        return <Card title="CV source">
            <div className={`cv-code-status ${sourceError ? 'error' : 'active'}`}>
                <Code2 size={16} />
                <div>
                    <strong>{sourceError ? 'Source has a JSON error' : 'Visual editor and source are synced'}</strong>
                    <span>{sourceError ? sourceError : 'Edit this JSON and the visual fields + live PDF preview update as soon as the source is valid.'}</span>
                </div>
            </div>
            <div className="cv-code-actions">
                <button type="button" onClick={formatSourceText} disabled={Boolean(sourceError)}><Code2 size={14} /> Format JSON</button>
                <button type="button" onClick={discardSourceText} disabled={!sourceDirty && !sourceError}>Reload from visual editor</button>
            </div>
            <label className="cv-field cv-code-field">
                <span>Editable CV JSON</span>
                <textarea
                    value={sourceText}
                    onChange={(event) => updateSourceText(event.target.value)}
                    onBlur={() => {
                        if (!sourceError) setSourceDirty(false);
                    }}
                    spellCheck="false"
                    rows={28}
                />
                <small>This is the canonical CV source. Add contacts, metrics, education items, sidebar categories or portfolio lines here, and the visual editor will reflect them.</small>
            </label>
            <details className="cv-generated-html">
                <summary>View generated PDF HTML/CSS</summary>
                <textarea value={generatedTemplateHtml} readOnly spellCheck="false" rows={16} />
                <small>The HTML is generated from the JSON above. It is shown for inspection so the two editors keep one reliable source of truth.</small>
            </details>
        </Card>;
    };

    return (
        <main className="cv-studio">
            <header className="cv-studio-header">
                <div><span className="cv-studio-kicker">PRIVATE TOOL</span><h1>CV Studio</h1><p>{status}</p></div>
                <div className="cv-header-actions">
                    <button type="button" onClick={() => { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); setStatus('Draft saved locally.'); }}><Save size={16} /> Save draft</button>
                    <button type="button" onClick={() => { setData(clone(publishedBaseline)); setSourceText(serializeCvSource(publishedBaseline)); setSourceError(''); setSourceDirty(false); setPreviewedFingerprint(''); localStorage.removeItem(DRAFT_KEY); }}><RotateCcw size={16} /> Reset</button>
                    <button type="button" onClick={logout}><LogOut size={16} /> Lock</button>
                </div>
            </header>
            <div className="cv-studio-grid">
                <aside className="cv-editor-pane">
                    <nav>{SECTIONS.map(([id, label]) => <button type="button" className={activeSection === id ? 'active' : ''} onClick={() => setActiveSection(id)} key={id}>{label}</button>)}</nav>
                    <div className="cv-editor-scroll">{renderEditor()}</div>
                </aside>
                <section className="cv-preview-pane">
                    <div className="cv-preview-toolbar">
                        <div className={`cv-fit ${fitStatus.rail && fitStatus.main ? 'ok' : 'warning'}`}>{fitStatus.rail && fitStatus.main ? 'A4 content fits' : 'Possible overflow - review PDF'}</div>
                        {sourceError ? <div className="cv-fit source-error">Source error</div> : null}
                        <button type="button" onClick={requestPdfPreview} disabled={Boolean(busy) || Boolean(sourceError)}><Eye size={16} /> {busy === 'preview' ? 'Generating…' : 'Generate PDF preview'}</button>
                        <button type="button" className="publish" onClick={publish} disabled={!isPreviewCurrent || Boolean(busy) || Boolean(sourceError)} title={sourceError ? 'Fix the source editor error first' : (!isPreviewCurrent ? 'Generate a fresh PDF preview first' : '')}><FileCheck2 size={16} /> {busy === 'publish' ? 'Publishing…' : 'Publish approved version'}</button>
                    </div>
                    <div className="cv-preview-stage"><iframe ref={iframeRef} title="Live CV preview" srcDoc={previewHtml} onLoad={checkFit} /></div>
                    <div className="cv-preview-note"><Download size={14} /> The live preview updates instantly. The PDF button renders with the same Chromium process used for publication.</div>
                </section>
            </div>
            {pdfPreviewUrl ? <PdfPreviewModal url={pdfPreviewUrl} onClose={() => setPdfPreviewUrl('')} /> : null}
        </main>
    );
}
