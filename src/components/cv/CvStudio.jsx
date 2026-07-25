import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Check, Code2, Download, Eye, FileCheck2, Hand, LogOut, Maximize2, Palette, Plus, RotateCcw, Save, SlidersHorizontal, Trash2, X, ZoomIn, ZoomOut } from 'lucide-react';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import publishedCv from '../../data/cv/published.json';
import { buildCvHtml, buildDefaultCvHtml, CV_COMPOSITION_PRESETS, CV_DESIGN_PRESETS, CV_ICON_OPTIONS, DEFAULT_CV_DESIGN, normalizeCvDesign } from '../../../shared/cv/template.js';
import './CvStudio.css';

const DRAFT_KEY = 'amedina.cv-studio.draft.v1';
const STUDIO_LAYOUT_KEY = 'amedina.cv-studio.layout.v1';
const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;
const ZOOM_MIN = 0.35;
const ZOOM_MAX = 2.5;
const SECTIONS = [
    ['identity', 'Identity'],
    ['design', 'Design'],
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

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function roundedZoom(value) {
    return Math.round(clamp(value, ZOOM_MIN, ZOOM_MAX) * 20) / 20;
}

function defaultStudioLayout() {
    const viewportWidth = typeof window === 'undefined' ? 1440 : window.innerWidth;
    return {
        navigationWidth: 118,
        editorWidth: Math.round(clamp(viewportWidth * .36, 500, 820)),
    };
}

function normalizeStudioLayout(value, viewportWidth = (typeof window === 'undefined' ? 1440 : window.innerWidth)) {
    const fallback = defaultStudioLayout();
    const navigationWidth = clamp(Number(value?.navigationWidth) || fallback.navigationWidth, 92, 220);
    const minimumEditorWidth = Math.max(470, navigationWidth + 330);
    const maximumEditorWidth = Math.max(minimumEditorWidth, Math.min(980, viewportWidth - 390));
    return {
        navigationWidth: Math.round(navigationWidth),
        editorWidth: Math.round(clamp(Number(value?.editorWidth) || fallback.editorWidth, minimumEditorWidth, maximumEditorWidth)),
    };
}

function loadStudioLayout() {
    if (typeof window === 'undefined') return defaultStudioLayout();
    try {
        return normalizeStudioLayout(JSON.parse(localStorage.getItem(STUDIO_LAYOUT_KEY)));
    } catch {
        return defaultStudioLayout();
    }
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
    next.design = normalizeCvDesign(next.design);
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

function RangeField({ label, value, min, max, step = 1, unit = '%', onChange, hint = '', defaultValue }) {
    const [numberDraft, setNumberDraft] = useState(String(value));
    const progress = ((Number(value) - min) / (max - min)) * 100;
    const precision = String(step).includes('.') ? String(step).split('.')[1].length : 0;

    useEffect(() => setNumberDraft(String(value)), [value]);

    const updateValue = (next) => {
        const numeric = Number(next);
        if (Number.isFinite(numeric)) onChange(clamp(numeric, min, max));
    };

    const updateNumberDraft = (next) => {
        setNumberDraft(next);
        const numeric = Number(next);
        if (next !== '' && Number.isFinite(numeric) && numeric >= min && numeric <= max) onChange(numeric);
    };

    const commitNumberDraft = (candidate = numberDraft) => {
        const numeric = Number(candidate);
        if (candidate !== '' && Number.isFinite(numeric)) {
            const next = clamp(numeric, min, max);
            onChange(next);
            setNumberDraft(String(next));
        } else {
            setNumberDraft(String(value));
        }
    };

    const nudgeValue = (direction) => {
        const next = clamp(Number((Number(value) + direction * step).toFixed(precision)), min, max);
        onChange(next);
        setNumberDraft(String(next));
    };

    return (
        <div className="cv-field cv-range-field" role="group" aria-label={label}>
            <span>
                <span>{label}</span>
                {defaultValue !== undefined && value !== defaultValue ? <button type="button" onClick={() => onChange(defaultValue)} title={`Reset ${label}`} aria-label={`Reset ${label}`}><RotateCcw size={11} /></button> : null}
            </span>
            <span className="cv-range-control">
                <input aria-label={`${label} slider`} type="range" min={min} max={max} step={step} value={value} style={{ '--cv-range-progress': `${clamp(progress, 0, 100)}%` }} onChange={(event) => updateValue(event.target.value)} onDoubleClick={() => { if (defaultValue !== undefined) onChange(defaultValue); }} />
                <span className="cv-range-number">
                    <button type="button" onClick={() => nudgeValue(-1)} disabled={Number(value) <= min} aria-label={`Decrease ${label}`} title={`Decrease ${label}`}>−</button>
                    <span className="cv-range-value"><input aria-label={`${label} value`} type="number" min={min} max={max} step={step} value={numberDraft} onChange={(event) => updateNumberDraft(event.target.value)} onBlur={(event) => commitNumberDraft(event.currentTarget.value)} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); if (event.key === 'Escape') setNumberDraft(String(value)); }} />{unit.trim() ? <span>{unit.trim()}</span> : null}</span>
                    <button type="button" onClick={() => nudgeValue(1)} disabled={Number(value) >= max} aria-label={`Increase ${label}`} title={`Increase ${label}`}>+</button>
                </span>
            </span>
            {hint ? <small>{hint}</small> : null}
        </div>
    );
}

function ColorField({ label, value, onChange }) {
    const [draft, setDraft] = useState(value);
    const valid = /^#[0-9a-f]{6}$/i.test(draft);

    useEffect(() => setDraft(value), [value]);

    const updateDraft = (next) => {
        setDraft(next);
        if (/^#[0-9a-f]{6}$/i.test(next)) onChange(next.toLowerCase());
    };

    return (
        <label className="cv-field cv-color-field">
            <span>{label}</span>
            <span className="cv-color-control">
                <input type="color" value={value} onChange={(event) => updateDraft(event.target.value)} />
                <input className={valid ? '' : 'invalid'} value={draft} maxLength={7} spellCheck="false" aria-invalid={!valid} onChange={(event) => updateDraft(event.target.value)} onBlur={() => { if (!valid) setDraft(value); }} />
            </span>
        </label>
    );
}

function ZoomControls({ zoom, onZoomOut, onZoomIn, onActualSize, onFit, label = 'Preview zoom' }) {
    return (
        <div className="cv-zoom-controls" role="group" aria-label={label}>
            <button type="button" onClick={onZoomOut} aria-label="Zoom out" title="Zoom out"><ZoomOut size={15} /></button>
            <button type="button" className="cv-zoom-value" onClick={onActualSize} title="Show at 100%">{Math.round(zoom * 100)}%</button>
            <button type="button" onClick={onZoomIn} aria-label="Zoom in" title="Zoom in"><ZoomIn size={15} /></button>
            <button type="button" onClick={onFit} aria-label="Fit page" title="Fit page"><Maximize2 size={15} /></button>
        </div>
    );
}

function BlockSizeControl({ label, description, width, height, onWidth, onHeight, widthDefault = 100, heightDefault = 100 }) {
    return (
        <div className="cv-block-control">
            <div className="cv-block-control-head"><div><strong>{label}</strong><span>{description}</span></div><output>{Math.round(width)}% × {Math.round(height)}%</output></div>
            <RangeField label={`${label} width`} value={width} min={70} max={100} onChange={onWidth} defaultValue={widthDefault} />
            <RangeField label={`${label} height`} value={height} min={70} max={150} onChange={onHeight} defaultValue={heightDefault} />
        </div>
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
    const stageRef = useRef(null);
    const pageRef = useRef(null);
    const panRef = useRef(null);
    const zoomModeRef = useRef('fit');
    const [renderState, setRenderState] = useState('Rendering the approved PDF…');
    const [zoom, setZoom] = useState(0.75);
    const [isPanning, setIsPanning] = useState(false);

    const fitPage = () => {
        const stage = stageRef.current;
        if (!stage) return;
        const next = Math.min((stage.clientWidth - 52) / PAGE_WIDTH, (stage.clientHeight - 52) / PAGE_HEIGHT, 1.15);
        setZoom(roundedZoom(next));
        zoomModeRef.current = 'fit';
        stage.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    };

    const updateZoom = (value) => {
        setZoom(roundedZoom(value));
        zoomModeRef.current = 'custom';
    };

    const zoomAtPoint = (nextZoom, clientX, clientY) => {
        const stage = stageRef.current;
        const page = pageRef.current;
        if (!stage || !page) {
            updateZoom(nextZoom);
            return;
        }
        const rect = page.getBoundingClientRect();
        const anchorX = (clientX - rect.left) / zoom;
        const anchorY = (clientY - rect.top) / zoom;
        const next = roundedZoom(nextZoom);
        setZoom(next);
        zoomModeRef.current = 'custom';
        requestAnimationFrame(() => {
            const nextRect = pageRef.current?.getBoundingClientRect();
            if (!nextRect) return;
            stage.scrollLeft += nextRect.left + anchorX * next - clientX;
            stage.scrollTop += nextRect.top + anchorY * next - clientY;
        });
    };

    useEffect(() => {
        const handleKeyboard = (event) => {
            if (event.key === 'Escape') onClose();
            if ((event.ctrlKey || event.metaKey) && ['+', '='].includes(event.key)) {
                event.preventDefault();
                updateZoom(zoom + .1);
            }
            if ((event.ctrlKey || event.metaKey) && event.key === '-') {
                event.preventDefault();
                updateZoom(zoom - .1);
            }
            if ((event.ctrlKey || event.metaKey) && event.key === '0') {
                event.preventDefault();
                updateZoom(1);
            }
        };
        window.addEventListener('keydown', handleKeyboard);
        return () => window.removeEventListener('keydown', handleKeyboard);
    }, [onClose, zoom]);

    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return undefined;
        const handleWheel = (event) => {
            if (!event.ctrlKey && !event.metaKey) return;
            event.preventDefault();
            event.stopPropagation();
            const intensity = Math.min(0.18, Math.max(0.05, Math.abs(event.deltaY) / 800));
            zoomAtPoint(zoom * (event.deltaY < 0 ? 1 + intensity : 1 - intensity), event.clientX, event.clientY);
        };
        stage.addEventListener('wheel', handleWheel, { passive: false });
        return () => stage.removeEventListener('wheel', handleWheel);
    }, [zoom]);

    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return undefined;
        const observer = new ResizeObserver(() => {
            if (zoomModeRef.current === 'fit') fitPage();
        });
        observer.observe(stage);
        requestAnimationFrame(fitPage);
        return () => observer.disconnect();
    }, []);

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
                const viewport = page.getViewport({ scale: 3.35 });
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

    const startPan = (event) => {
        if (event.button !== 0) return;
        const stage = stageRef.current;
        if (!stage) return;
        panRef.current = { x: event.clientX, y: event.clientY, left: stage.scrollLeft, top: stage.scrollTop };
        stage.setPointerCapture(event.pointerId);
        setIsPanning(true);
    };

    const movePan = (event) => {
        const stage = stageRef.current;
        const pan = panRef.current;
        if (!stage || !pan) return;
        stage.scrollLeft = pan.left - (event.clientX - pan.x);
        stage.scrollTop = pan.top - (event.clientY - pan.y);
    };

    const stopPan = (event) => {
        panRef.current = null;
        setIsPanning(false);
        if (stageRef.current?.hasPointerCapture(event.pointerId)) stageRef.current.releasePointerCapture(event.pointerId);
    };

    return <div className="cv-pdf-modal" role="dialog" aria-modal="true" aria-label="Authoritative PDF preview">
        <div className="cv-pdf-dialog">
            <div className="cv-pdf-dialog-header">
                <div><strong>Authoritative PDF preview</strong><span>This is the exact file that will be published.</span></div>
                <div>
                    <ZoomControls zoom={zoom} onZoomOut={() => updateZoom(zoom - .1)} onZoomIn={() => updateZoom(zoom + .1)} onActualSize={() => updateZoom(1)} onFit={fitPage} label="PDF zoom" />
                    <a href={url} download="Alberto_Medina_CV_2026_preview.pdf"><Download size={15} /> Download</a>
                    <button type="button" onClick={onClose} aria-label="Close PDF preview"><X size={17} /></button>
                </div>
            </div>
            <div
                ref={stageRef}
                className={`cv-pdf-page ${isPanning ? 'is-panning' : ''}`}
                onPointerDown={startPan}
                onPointerMove={movePan}
                onPointerUp={stopPan}
                onPointerCancel={stopPan}
            >
                {renderState ? <div className="cv-pdf-loading">{renderState}</div> : null}
                <div ref={pageRef} className="cv-pdf-canvas-shell" style={{ width: PAGE_WIDTH * zoom, height: PAGE_HEIGHT * zoom }}>
                    <canvas ref={canvasRef} />
                </div>
            </div>
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
    const [previewZoom, setPreviewZoom] = useState(0.75);
    const [isPreviewPanning, setIsPreviewPanning] = useState(false);
    const [studioLayout, setStudioLayout] = useState(loadStudioLayout);
    const [activeLayoutResize, setActiveLayoutResize] = useState('');
    const iframeRef = useRef(null);
    const studioGridRef = useRef(null);
    const editorPaneRef = useRef(null);
    const activeLayoutResizeRef = useRef('');
    const previewStageRef = useRef(null);
    const previewPageRef = useRef(null);
    const previewPanRef = useRef(null);
    const previewZoomModeRef = useRef('fit');

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

    useEffect(() => {
        localStorage.setItem(STUDIO_LAYOUT_KEY, JSON.stringify(studioLayout));
    }, [studioLayout]);

    useEffect(() => {
        const handleResize = () => setStudioLayout(current => normalizeStudioLayout(current));
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fitLivePreview = () => {
        const stage = previewStageRef.current;
        if (!stage) return;
        const next = Math.min((stage.clientWidth - 48) / PAGE_WIDTH, (stage.clientHeight - 48) / PAGE_HEIGHT, 1);
        setPreviewZoom(roundedZoom(next));
        previewZoomModeRef.current = 'fit';
        stage.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    };

    const updatePreviewZoom = (value) => {
        setPreviewZoom(roundedZoom(value));
        previewZoomModeRef.current = 'custom';
    };

    const zoomLivePreviewAtPoint = (nextZoom, clientX, clientY) => {
        const stage = previewStageRef.current;
        const page = previewPageRef.current;
        if (!stage || !page) {
            updatePreviewZoom(nextZoom);
            return;
        }
        const rect = page.getBoundingClientRect();
        const anchorX = (clientX - rect.left) / previewZoom;
        const anchorY = (clientY - rect.top) / previewZoom;
        const next = roundedZoom(nextZoom);
        setPreviewZoom(next);
        previewZoomModeRef.current = 'custom';
        requestAnimationFrame(() => {
            const nextRect = previewPageRef.current?.getBoundingClientRect();
            if (!nextRect) return;
            stage.scrollLeft += nextRect.left + anchorX * next - clientX;
            stage.scrollTop += nextRect.top + anchorY * next - clientY;
        });
    };

    useEffect(() => {
        if (!auth.authenticated) return undefined;
        const stage = previewStageRef.current;
        if (!stage) return undefined;
        const handleWheel = (event) => {
            if (!event.ctrlKey && !event.metaKey) return;
            event.preventDefault();
            event.stopPropagation();
            const intensity = Math.min(0.18, Math.max(0.05, Math.abs(event.deltaY) / 800));
            zoomLivePreviewAtPoint(previewZoom * (event.deltaY < 0 ? 1 + intensity : 1 - intensity), event.clientX, event.clientY);
        };
        stage.addEventListener('wheel', handleWheel, { passive: false });
        return () => stage.removeEventListener('wheel', handleWheel);
    }, [auth.authenticated, previewZoom]);

    useEffect(() => {
        if (!auth.authenticated) return undefined;
        const stage = previewStageRef.current;
        if (!stage) return undefined;
        const observer = new ResizeObserver(() => {
            if (previewZoomModeRef.current === 'fit') fitLivePreview();
        });
        observer.observe(stage);
        requestAnimationFrame(fitLivePreview);
        return () => observer.disconnect();
    }, [auth.authenticated]);

    const update = (path, value) => {
        setData(current => setAtPath(current, path, value));
        setPreviewedFingerprint('');
    };

    const updateDesign = (path, value) => {
        setData(current => {
            const next = setAtPath(current, ['design', ...path], value);
            if (path[0] === 'colors') next.design.preset = 'custom';
            if (['typography', 'layout', 'blocks', 'portrait'].includes(path[0])) next.design.compositionPreset = 'custom';
            return next;
        });
        setPreviewedFingerprint('');
    };

    const applyDesignPreset = (presetId) => {
        const preset = CV_DESIGN_PRESETS[presetId];
        if (!preset) return;
        setData(current => ({
            ...current,
            design: {
                ...normalizeCvDesign(current.design),
                preset: presetId,
                colors: { ...preset.colors },
            },
        }));
        setPreviewedFingerprint('');
        setStatus(`${preset.label} palette applied. The rest of your layout is unchanged.`);
    };

    const applyCompositionPreset = (presetId) => {
        const preset = CV_COMPOSITION_PRESETS[presetId];
        if (!preset) return;
        setData(current => ({
            ...current,
            design: {
                ...normalizeCvDesign(current.design),
                compositionPreset: presetId,
                typography: clone(preset.typography),
                layout: clone(preset.layout),
                blocks: clone(preset.blocks),
                portrait: clone(preset.portrait),
            },
        }));
        setPreviewedFingerprint('');
        setStatus(`${preset.label} composition applied. Your palette and content are unchanged.`);
    };

    const restoreOriginalDesign = () => {
        setData(current => ({ ...current, design: clone(DEFAULT_CV_DESIGN) }));
        setPreviewedFingerprint('');
        setStatus('Original CV design restored.');
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

    const resizeStudioLayout = (part, clientX) => {
        setStudioLayout(current => {
            if (part === 'editor') {
                const grid = studioGridRef.current;
                if (!grid) return current;
                return normalizeStudioLayout({ ...current, editorWidth: clientX - grid.getBoundingClientRect().left });
            }
            const editor = editorPaneRef.current;
            if (!editor) return current;
            const maximumNavigationWidth = Math.min(220, current.editorWidth - 330);
            return normalizeStudioLayout({
                ...current,
                navigationWidth: clamp(clientX - editor.getBoundingClientRect().left, 92, maximumNavigationWidth),
            });
        });
    };

    const startLayoutResize = (part, event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        activeLayoutResizeRef.current = part;
        setActiveLayoutResize(part);
        resizeStudioLayout(part, event.clientX);
    };

    const stopLayoutResize = (event) => {
        activeLayoutResizeRef.current = '';
        setActiveLayoutResize('');
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    };

    const cancelLayoutResize = () => {
        activeLayoutResizeRef.current = '';
        setActiveLayoutResize('');
    };

    const resetLayoutWidth = (part) => {
        const defaults = defaultStudioLayout();
        setStudioLayout(current => normalizeStudioLayout({
            ...current,
            [part === 'editor' ? 'editorWidth' : 'navigationWidth']: part === 'editor' ? defaults.editorWidth : defaults.navigationWidth,
        }));
    };

    const handleLayoutResizeKey = (part, event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'Home') {
            resetLayoutWidth(part);
            return;
        }
        const amount = (event.shiftKey ? 32 : 12) * (event.key === 'ArrowRight' ? 1 : -1);
        setStudioLayout(current => normalizeStudioLayout({
            ...current,
            [part === 'editor' ? 'editorWidth' : 'navigationWidth']: current[part === 'editor' ? 'editorWidth' : 'navigationWidth'] + amount,
        }));
    };

    useEffect(() => {
        const handlePointerMove = (event) => {
            if (activeLayoutResizeRef.current) resizeStudioLayout(activeLayoutResizeRef.current, event.clientX);
        };
        const handlePointerEnd = () => cancelLayoutResize();
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerEnd);
        window.addEventListener('pointercancel', handlePointerEnd);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerEnd);
            window.removeEventListener('pointercancel', handlePointerEnd);
        };
    }, []);

    if (auth.checking) return <main className="cv-login-shell"><div className="cv-login-card"><p>{status}</p></div></main>;
    if (!auth.authenticated) return <Login onAuthenticated={applyAuthenticatedPayload} />;

    const renderEditor = () => {
        if (activeSection === 'identity') return <>
            <Card title="Document"><div className="cv-grid two"><Field label="Version label" value={data.document.versionLabel} onChange={value => update(['document', 'versionLabel'], value)} /><Field label="PDF title" value={data.document.title} onChange={value => update(['document', 'title'], value)} /><Field label="Document language" value={data.document.language} onChange={value => update(['document', 'language'], value)} hint="Use an ISO code such as en or es." /><Field label="Portrait asset" value={data.assets.portraitUrl} onChange={value => update(['assets', 'portraitUrl'], value)} hint="Path inside public, for example /assets/alberto.webp." /><Field label="Portrait description" value={data.assets.portraitAlt} onChange={value => update(['assets', 'portraitAlt'], value)} /><Field label="Footer name" value={data.document.footerName} onChange={value => update(['document', 'footerName'], value)} /><Field label="Footer page" value={data.document.footerPage} onChange={value => update(['document', 'footerPage'], value)} /></div></Card>
            <Card title="Identity"><div className="cv-grid two"><Field label="First name" value={data.identity.firstName} onChange={value => update(['identity', 'firstName'], value)} /><Field label="Last name" value={data.identity.lastName} onChange={value => update(['identity', 'lastName'], value)} /><Field label="Top line" value={data.identity.topline} onChange={value => update(['identity', 'topline'], value)} /><Field label="Availability" value={data.identity.availability} onChange={value => update(['identity', 'availability'], value)} /></div><Field label="Role" value={data.identity.role} onChange={value => update(['identity', 'role'], value)} /><TextList title="Introduction paragraphs" values={data.identity.intro} onChange={value => update(['identity', 'intro'], value)} placeholder="New introduction paragraph" /></Card>
        </>;

        if (activeSection === 'design') return <>
            <Card title="Visual direction">
                <div className="cv-design-intro">
                    <span><Palette size={16} /></span>
                    <div><strong>Personalise without rebuilding</strong><p>Combine any palette with any composition. Every control updates the live A4 preview and the final PDF.</p></div>
                </div>
                <h3 className="cv-design-subtitle">Colour palettes</h3>
                <div className="cv-preset-grid">
                    {Object.entries(CV_DESIGN_PRESETS).map(([id, preset]) => (
                        <button type="button" className={data.design.preset === id ? 'active' : ''} aria-pressed={data.design.preset === id} onClick={() => applyDesignPreset(id)} key={id}>
                            <span className="cv-preset-swatch" style={{ background: preset.colors.paper }}>
                                <i style={{ background: preset.colors.ink }} />
                                <i style={{ background: preset.colors.accent }} />
                                <i style={{ background: preset.colors.secondary }} />
                            </span>
                            <span><strong>{preset.label}</strong><small>{preset.description}</small></span>
                            {data.design.preset === id ? <Check size={14} /> : null}
                        </button>
                    ))}
                </div>
                <h3 className="cv-design-subtitle">Composition recipes</h3>
                <div className="cv-composition-grid">
                    {Object.entries(CV_COMPOSITION_PRESETS).map(([id, preset]) => (
                        <button type="button" className={data.design.compositionPreset === id ? 'active' : ''} aria-pressed={data.design.compositionPreset === id} onClick={() => applyCompositionPreset(id)} key={id}>
                            <span className={`cv-composition-icon ${id}`}><i /><i /><i /></span>
                            <span><strong>{preset.label}</strong><small>{preset.description}</small></span>
                            {data.design.compositionPreset === id ? <Check size={14} /> : null}
                        </button>
                    ))}
                </div>
            </Card>
            <Card title="Palette">
                <div className="cv-grid two">
                    <ColorField label="Sidebar & headings" value={data.design.colors.ink} onChange={value => updateDesign(['colors', 'ink'], value)} />
                    <ColorField label="Paper" value={data.design.colors.paper} onChange={value => updateDesign(['colors', 'paper'], value)} />
                    <ColorField label="Primary accent" value={data.design.colors.accent} onChange={value => updateDesign(['colors', 'accent'], value)} />
                    <ColorField label="Secondary accent" value={data.design.colors.secondary} onChange={value => updateDesign(['colors', 'secondary'], value)} />
                    <ColorField label="Dividers" value={data.design.colors.line} onChange={value => updateDesign(['colors', 'line'], value)} />
                    <ColorField label="Muted text" value={data.design.colors.muted} onChange={value => updateDesign(['colors', 'muted'], value)} />
                </div>
            </Card>
            <Card title="Typography & layout">
                <div className="cv-grid two">
                    <label className="cv-field">
                        <span>Body typeface</span>
                        <select value={data.design.typography.family} onChange={(event) => updateDesign(['typography', 'family'], event.target.value)}>
                            <option value="inter">Inter / neutral sans</option>
                            <option value="humanist">Humanist / friendly sans</option>
                            <option value="editorial">Editorial / serif</option>
                            <option value="geometric">Geometric / modern sans</option>
                        </select>
                    </label>
                    <label className="cv-field">
                        <span>Heading typeface</span>
                        <select value={data.design.typography.headingFamily} onChange={(event) => updateDesign(['typography', 'headingFamily'], event.target.value)}>
                            <option value="inherit">Same as body</option>
                            <option value="inter">Inter / neutral sans</option>
                            <option value="humanist">Humanist / friendly sans</option>
                            <option value="editorial">Editorial / serif</option>
                            <option value="geometric">Geometric / modern sans</option>
                        </select>
                    </label>
                </div>
                <RangeField label="Text scale" value={data.design.typography.scale} min={88} max={112} onChange={value => updateDesign(['typography', 'scale'], value)} defaultValue={100} hint="Small adjustments affect the complete hierarchy. Watch the A4 fit badge." />
                <RangeField label="Heading scale" value={data.design.typography.headingScale} min={88} max={120} onChange={value => updateDesign(['typography', 'headingScale'], value)} defaultValue={100} />
                <RangeField label="Heading weight" value={data.design.typography.headingWeight} min={650} max={900} step={50} unit="" onChange={value => updateDesign(['typography', 'headingWeight'], value)} defaultValue={850} />
                <RangeField label="Text line height" value={data.design.typography.lineHeight} min={90} max={115} onChange={value => updateDesign(['typography', 'lineHeight'], value)} defaultValue={100} />
                <RangeField label="Sidebar width" value={data.design.layout.sidebarWidth} min={58} max={76} unit=" mm" onChange={value => updateDesign(['layout', 'sidebarWidth'], value)} defaultValue={67} />
                <RangeField label="Vertical rhythm" value={data.design.layout.spacing} min={85} max={115} onChange={value => updateDesign(['layout', 'spacing'], value)} defaultValue={100} />
                <RangeField label="Main page gutters" value={data.design.layout.mainGutter} min={86} max={116} onChange={value => updateDesign(['layout', 'mainGutter'], value)} defaultValue={100} />
                <RangeField label="Card roundness" value={data.design.layout.corners} min={40} max={150} onChange={value => updateDesign(['layout', 'corners'], value)} defaultValue={100} />
            </Card>
            <Card title="Content block sizing">
                <div className="cv-block-sizing-intro"><SlidersHorizontal size={15} /><span>Each content bar can be resized independently. Use the number field for exact values, arrow keys for fine adjustments or double-click a slider to reset it.</span></div>
                <label className="cv-field">
                    <span>Block alignment</span>
                    <select value={data.design.blocks.alignment} onChange={(event) => updateDesign(['blocks', 'alignment'], event.target.value)}>
                        <option value="left">Align left</option>
                        <option value="center">Align centre</option>
                        <option value="right">Align right</option>
                    </select>
                </label>
                <BlockSizeControl label="Top information bar" description="Client work and availability." width={data.design.blocks.topLineWidth} height={data.design.blocks.topLineHeight} onWidth={value => updateDesign(['blocks', 'topLineWidth'], value)} onHeight={value => updateDesign(['blocks', 'topLineHeight'], value)} />
                <BlockSizeControl label="Languages bar" description="Languages and working style." width={data.design.blocks.profileWidth} height={data.design.blocks.profileHeight} onWidth={value => updateDesign(['blocks', 'profileWidth'], value)} onHeight={value => updateDesign(['blocks', 'profileHeight'], value)} />
                <RangeField label="Languages column split" value={data.design.blocks.profileSplit} min={26} max={50} step={0.5} onChange={value => updateDesign(['blocks', 'profileSplit'], value)} defaultValue={35.2} hint="Controls how much width is reserved for the languages column." />
                <BlockSizeControl label="Experience cards" description="Every practical-experience card." width={data.design.blocks.experienceWidth} height={data.design.blocks.experienceHeight} onWidth={value => updateDesign(['blocks', 'experienceWidth'], value)} onHeight={value => updateDesign(['blocks', 'experienceHeight'], value)} />
                <BlockSizeControl label="Portfolio bar" description="The bottom call-to-action and QR." width={data.design.blocks.portfolioWidth} height={data.design.blocks.portfolioHeight} onWidth={value => updateDesign(['blocks', 'portfolioWidth'], value)} onHeight={value => updateDesign(['blocks', 'portfolioHeight'], value)} />
                <RangeField label="Accent stripe thickness" value={data.design.blocks.accentThickness} min={45} max={180} onChange={value => updateDesign(['blocks', 'accentThickness'], value)} defaultValue={100} />
                <RangeField label="Top accent bar width" value={data.design.blocks.topAccentWidth} min={16} max={58} unit=" mm" onChange={value => updateDesign(['blocks', 'topAccentWidth'], value)} defaultValue={34} />
                <RangeField label="Section number size" value={data.design.blocks.badgeScale} min={75} max={140} onChange={value => updateDesign(['blocks', 'badgeScale'], value)} defaultValue={100} />
            </Card>
            <Card title="Portrait treatment">
                <RangeField label="Portrait width" value={data.design.portrait.width} min={40} max={54} step={0.5} unit=" mm" onChange={value => updateDesign(['portrait', 'width'], value)} defaultValue={49} />
                <RangeField label="Portrait height" value={data.design.portrait.height} min={48} max={68} step={0.5} unit=" mm" onChange={value => updateDesign(['portrait', 'height'], value)} defaultValue={59} />
                <RangeField label="Horizontal crop position" value={data.design.portrait.positionX} min={0} max={100} onChange={value => updateDesign(['portrait', 'positionX'], value)} defaultValue={50} />
                <RangeField label="Vertical crop position" value={data.design.portrait.positionY} min={0} max={100} onChange={value => updateDesign(['portrait', 'positionY'], value)} defaultValue={30} hint="Move the image inside its frame without editing the original asset." />
                <RangeField label="Corner radius" value={data.design.portrait.radius} min={0} max={14} step={0.5} unit=" mm" onChange={value => updateDesign(['portrait', 'radius'], value)} defaultValue={7} />
                <RangeField label="Frame border" value={data.design.portrait.border} min={0} max={2.5} step={0.05} unit=" mm" onChange={value => updateDesign(['portrait', 'border'], value)} defaultValue={1.15} />
            </Card>
            <Card title="Design safety">
                <div className={`cv-design-fit ${fitStatus.rail && fitStatus.main ? 'ok' : 'warning'}`}>
                    <strong>{fitStatus.rail && fitStatus.main ? 'Everything still fits on one A4 page' : 'The current styling may overflow'}</strong>
                    <span>{fitStatus.rail && fitStatus.main ? 'You can keep refining or generate the authoritative PDF.' : 'Reduce text scale, vertical rhythm, block height or content before publishing.'}</span>
                </div>
                <button className="cv-restore-design" type="button" onClick={restoreOriginalDesign}><RotateCcw size={14} /> Restore original design</button>
            </Card>
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

    const startPreviewPan = (event) => {
        if (event.button !== 0) return;
        const stage = previewStageRef.current;
        if (!stage) return;
        previewPanRef.current = { x: event.clientX, y: event.clientY, left: stage.scrollLeft, top: stage.scrollTop };
        stage.setPointerCapture(event.pointerId);
        setIsPreviewPanning(true);
    };

    const movePreviewPan = (event) => {
        const stage = previewStageRef.current;
        const pan = previewPanRef.current;
        if (!stage || !pan) return;
        stage.scrollLeft = pan.left - (event.clientX - pan.x);
        stage.scrollTop = pan.top - (event.clientY - pan.y);
    };

    const stopPreviewPan = (event) => {
        previewPanRef.current = null;
        setIsPreviewPanning(false);
        if (previewStageRef.current?.hasPointerCapture(event.pointerId)) previewStageRef.current.releasePointerCapture(event.pointerId);
    };

    return (
        <main className={`cv-studio ${activeLayoutResize ? 'is-resizing-layout' : ''}`}>
            <header className="cv-studio-header">
                <div><span className="cv-studio-kicker">PRIVATE TOOL</span><h1>CV Studio</h1><p>{status}</p></div>
                <div className="cv-header-actions">
                    <button type="button" onClick={() => { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); setStatus('Draft saved locally.'); }}><Save size={16} /> Save draft</button>
                    <button type="button" onClick={() => { setData(clone(publishedBaseline)); setSourceText(serializeCvSource(publishedBaseline)); setSourceError(''); setSourceDirty(false); setPreviewedFingerprint(''); localStorage.removeItem(DRAFT_KEY); }}><RotateCcw size={16} /> Reset</button>
                    <button type="button" onClick={logout}><LogOut size={16} /> Lock</button>
                </div>
            </header>
            <div ref={studioGridRef} className="cv-studio-grid" style={{ '--cv-editor-width': `${studioLayout.editorWidth}px` }}>
                <aside ref={editorPaneRef} className="cv-editor-pane" style={{ '--cv-navigation-width': `${studioLayout.navigationWidth}px` }}>
                    <nav>{SECTIONS.map(([id, label]) => <button type="button" className={activeSection === id ? 'active' : ''} onClick={() => setActiveSection(id)} key={id}>{label}</button>)}</nav>
                    <div
                        className={`cv-pane-resizer cv-navigation-resizer ${activeLayoutResize === 'navigation' ? 'active' : ''}`}
                        role="separator"
                        aria-label="Resize section navigation"
                        aria-orientation="vertical"
                        aria-valuemin={92}
                        aria-valuemax={220}
                        aria-valuenow={studioLayout.navigationWidth}
                        aria-valuetext={`${studioLayout.navigationWidth} pixels`}
                        tabIndex={0}
                        title="Drag to resize the section menu · double-click to reset"
                        onPointerDown={(event) => startLayoutResize('navigation', event)}
                        onPointerUp={stopLayoutResize}
                        onPointerCancel={stopLayoutResize}
                        onLostPointerCapture={cancelLayoutResize}
                        onDoubleClick={() => resetLayoutWidth('navigation')}
                        onKeyDown={(event) => handleLayoutResizeKey('navigation', event)}
                    ><span /></div>
                    <div className="cv-editor-scroll">{renderEditor()}</div>
                </aside>
                <div
                    className={`cv-pane-resizer cv-editor-resizer ${activeLayoutResize === 'editor' ? 'active' : ''}`}
                    role="separator"
                    aria-label="Resize editor and preview"
                    aria-orientation="vertical"
                    aria-valuemin={470}
                    aria-valuemax={980}
                    aria-valuenow={studioLayout.editorWidth}
                    aria-valuetext={`${studioLayout.editorWidth} pixels`}
                    tabIndex={0}
                    title="Drag to resize the editor and PDF preview · double-click to reset"
                    onPointerDown={(event) => startLayoutResize('editor', event)}
                    onPointerUp={stopLayoutResize}
                    onPointerCancel={stopLayoutResize}
                    onLostPointerCapture={cancelLayoutResize}
                    onDoubleClick={() => resetLayoutWidth('editor')}
                    onKeyDown={(event) => handleLayoutResizeKey('editor', event)}
                ><span /></div>
                <section className="cv-preview-pane">
                    <div className="cv-preview-toolbar">
                        <div className={`cv-fit ${fitStatus.rail && fitStatus.main ? 'ok' : 'warning'}`}>{fitStatus.rail && fitStatus.main ? 'A4 content fits' : 'Possible overflow - review PDF'}</div>
                        {sourceError ? <div className="cv-fit source-error">Source error</div> : null}
                        <ZoomControls zoom={previewZoom} onZoomOut={() => updatePreviewZoom(previewZoom - .1)} onZoomIn={() => updatePreviewZoom(previewZoom + .1)} onActualSize={() => updatePreviewZoom(1)} onFit={fitLivePreview} />
                        <button type="button" onClick={requestPdfPreview} disabled={Boolean(busy) || Boolean(sourceError)}><Eye size={16} /> {busy === 'preview' ? 'Generating…' : 'Generate PDF preview'}</button>
                        <button type="button" className="publish" onClick={publish} disabled={!isPreviewCurrent || Boolean(busy) || Boolean(sourceError)} title={sourceError ? 'Fix the source editor error first' : (!isPreviewCurrent ? 'Generate a fresh PDF preview first' : '')}><FileCheck2 size={16} /> {busy === 'publish' ? 'Publishing…' : 'Publish approved version'}</button>
                    </div>
                    <div
                        ref={previewStageRef}
                        className={`cv-preview-stage ${isPreviewPanning ? 'is-panning' : ''}`}
                        onPointerDown={startPreviewPan}
                        onPointerMove={movePreviewPan}
                        onPointerUp={stopPreviewPan}
                        onPointerCancel={stopPreviewPan}
                    >
                        <div ref={previewPageRef} className="cv-preview-page" style={{ width: PAGE_WIDTH * previewZoom, height: PAGE_HEIGHT * previewZoom }}>
                            <iframe ref={iframeRef} title="Live CV preview" srcDoc={previewHtml} onLoad={checkFit} style={{ transform: `scale(${previewZoom})` }} />
                        </div>
                    </div>
                    <div className="cv-preview-note"><Hand size={14} /> Ctrl + wheel to zoom · drag to move · click the percentage for 100%</div>
                </section>
            </div>
            {pdfPreviewUrl ? <PdfPreviewModal url={pdfPreviewUrl} onClose={() => setPdfPreviewUrl('')} /> : null}
        </main>
    );
}
