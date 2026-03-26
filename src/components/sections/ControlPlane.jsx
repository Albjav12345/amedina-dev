import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion';
import {
    Activity,
    BrainCircuit,
    CheckCircle2,
    Clock3,
    RefreshCw,
    ShieldCheck,
    Sparkles,
    TerminalSquare,
    Trash2,
    Waves,
    Workflow,
    X,
    XCircle,
} from 'lucide-react';
import { containWheelOnOverflow } from '../../utils/scrolling';
import { clearOpsTelemetry, getOpsTelemetry, subscribeOpsTelemetry } from '../../utils/opsTelemetry';

const statusMap = {
    operational: { label: 'Operational', className: 'border-electric-green/25 bg-electric-green/10 text-electric-green', icon: CheckCircle2 },
    degraded: { label: 'Degraded', className: 'border-amber-400/25 bg-amber-400/10 text-amber-300', icon: Clock3 },
    offline: { label: 'Offline', className: 'border-red-400/20 bg-red-500/10 text-red-200', icon: XCircle },
    success: { label: 'Success', className: 'border-electric-green/25 bg-electric-green/10 text-electric-green', icon: CheckCircle2 },
    error: { label: 'Error', className: 'border-red-400/20 bg-red-500/10 text-red-200', icon: XCircle },
    idle: { label: 'Idle', className: 'border-white/10 bg-white/[0.04] text-gray-300', icon: Clock3 },
};

const channelMeta = {
    terminal: { label: 'Terminal Agent', icon: TerminalSquare },
    architect: { label: 'Project Architect', icon: BrainCircuit },
    contact: { label: 'Contact Relay', icon: ShieldCheck },
};

const serviceIcons = {
    'chat-api': TerminalSquare,
    'architect-api': BrainCircuit,
    'groq-provider': Sparkles,
    'github-sync': Activity,
    'contact-relay': ShieldCheck,
};

const serviceRunChannels = {
    'chat-api': ['terminal'],
    'architect-api': ['architect'],
    'groq-provider': ['terminal', 'architect'],
    'contact-relay': ['contact'],
};

const serviceOrder = ['chat-api', 'architect-api', 'groq-provider', 'github-sync', 'contact-relay'];

function getStatus(status) {
    return statusMap[status] || statusMap.idle;
}

function formatRelative(iso) {
    if (!iso) return 'No event yet';
    const seconds = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

function formatMs(ms) {
    if (!ms && ms !== 0) return 'Awaiting traffic';
    if (ms < 1000) return `${Math.round(ms)} ms`;
    return `${(ms / 1000).toFixed(1)} s`;
}

function formatUptime(ms) {
    if (!ms) return 'Cold start';
    const total = Math.floor(ms / 1000);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    if (hours) return `${hours}h ${minutes}m`;
    if (minutes) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
}

function getRunsForChannels(runs, channels = []) {
    return runs.filter((run) => channels.includes(run.channel));
}

function getAverageLatency(runs) {
    const values = runs
        .map((run) => run.latencyMs)
        .filter((value) => typeof value === 'number' && Number.isFinite(value));

    if (!values.length) return null;
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function getServiceStatus(baseStatus, latestRun) {
    if (baseStatus === 'offline') return 'offline';
    if (!latestRun) return baseStatus || 'idle';
    return latestRun.status === 'error' ? 'degraded' : 'operational';
}

function getServiceNote(serviceId, latestRun, runCount, fallback) {
    if (!latestRun) return fallback;

    if (serviceId === 'groq-provider') {
        return latestRun.status === 'error'
            ? `Last inference attempt failed during ${latestRun.channel} orchestration. ${latestRun.decision || 'Provider degradation observed.'}`
            : `Inference provider served ${runCount} recent AI request${runCount === 1 ? '' : 's'} successfully.`;
    }

    if (serviceId === 'contact-relay') {
        return latestRun.status === 'error'
            ? 'The latest contact submission failed before relay confirmation.'
            : 'Outbound contact relay accepted the latest message successfully.';
    }

    return latestRun.status === 'error'
        ? `Last ${latestRun.channel} execution failed. ${latestRun.decision || 'Session telemetry captured a runtime issue.'}`
        : `Last ${latestRun.channel} execution completed successfully. ${latestRun.decision || 'Live session telemetry captured a clean signal.'}`;
}

function buildDisplayServices(backend, runs) {
    const serviceMap = new Map((backend?.services || []).map((service) => [service.id, { ...service }]));
    const contactCapability = (backend?.capabilities || []).find((item) => item.id === 'contact-relay');

    if (contactCapability && !serviceMap.has('contact-relay')) {
        serviceMap.set('contact-relay', {
            id: 'contact-relay',
            label: 'Contact Relay',
            category: 'integration',
            status: 'idle',
            latencyMs: null,
            lastEventAt: null,
            note: contactCapability.detail,
        });
    }

    Object.entries(serviceRunChannels).forEach(([serviceId, channels]) => {
        const relatedRuns = getRunsForChannels(runs, channels);
        if (!relatedRuns.length && !serviceMap.has(serviceId)) return;

        const latestRun = relatedRuns[0] || null;
        const base = serviceMap.get(serviceId) || {
            id: serviceId,
            label: serviceId,
            category: 'integration',
            status: 'idle',
            latencyMs: null,
            lastEventAt: null,
            note: 'Awaiting first event.',
        };

        serviceMap.set(serviceId, {
            ...base,
            status: getServiceStatus(base.status, latestRun),
            latencyMs: latestRun?.latencyMs ?? getAverageLatency(relatedRuns) ?? base.latencyMs,
            lastEventAt: latestRun?.completedAt || latestRun?.startedAt || base.lastEventAt,
            note: getServiceNote(serviceId, latestRun, relatedRuns.length, base.note),
            activityCount: relatedRuns.length,
            feedLabel: relatedRuns.length ? 'Session + backend' : 'Backend probe',
        });
    });

    return serviceOrder
        .map((serviceId) => serviceMap.get(serviceId))
        .filter(Boolean)
        .concat(Array.from(serviceMap.values()).filter((service) => !serviceOrder.includes(service.id)));
}

function buildLatencySeries(runs, services) {
    const sessionItems = runs
        .filter((run) => typeof run.latencyMs === 'number' && Number.isFinite(run.latencyMs))
        .slice(0, 8)
        .reverse()
        .map((run) => ({
            id: run.id,
            value: run.latencyMs,
            label: (channelMeta[run.channel]?.label || run.channel).split(' ')[0],
            detail: run.title,
            status: run.status,
        }));

    if (sessionItems.length) {
        return {
            sourceLabel: 'Session traffic',
            items: sessionItems,
        };
    }

    const probeItems = services
        .filter((service) => typeof service.latencyMs === 'number' && Number.isFinite(service.latencyMs))
        .slice(0, 8)
        .map((service) => ({
            id: service.id,
            value: service.latencyMs,
            label: service.label.split(' ')[0],
            detail: service.note,
            status: service.status === 'offline'
                ? 'offline'
                : service.status === 'degraded'
                    ? 'degraded'
                    : 'operational',
        }));

    return {
        sourceLabel: probeItems.length ? 'Backend probes' : 'Idle',
        items: probeItems,
    };
}

function BlockSkeleton({ title, minHeight = 320 }) {
    return (
        <div
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
            style={{ minHeight }}
        >
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-electric-cyan/80">{title}</div>
            <div className="mt-3 h-8 w-48 rounded-lg bg-white/[0.05]" />
            <div className="mt-6 space-y-4">
                <div className="h-24 rounded-2xl border border-white/8 bg-black/20" />
                <div className="h-24 rounded-2xl border border-white/8 bg-black/20" />
                <div className="h-20 rounded-2xl border border-white/8 bg-black/20" />
            </div>
        </div>
    );
}

function LazyPanelBlock({ root, eager = false, minHeight = 320, skeleton, children }) {
    const [isVisible, setIsVisible] = useState(eager);
    const containerRef = useRef(null);

    useEffect(() => {
        if (eager || isVisible) return undefined;
        if (typeof IntersectionObserver === 'undefined') {
            setIsVisible(true);
            return undefined;
        }

        const node = containerRef.current;
        if (!node || !root) return undefined;

        const observer = new IntersectionObserver(([entry]) => {
            if (!entry?.isIntersecting) return;
            setIsVisible(true);
            observer.disconnect();
        }, {
            root,
            rootMargin: '240px 0px 240px 0px',
            threshold: 0.01,
        });

        observer.observe(node);
        return () => observer.disconnect();
    }, [eager, isVisible, root]);

    return (
        <div
            ref={containerRef}
            className="min-w-0"
            style={{ minHeight: isVisible ? undefined : minHeight }}
        >
            {isVisible ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                >
                    {children}
                </motion.div>
            ) : (
                skeleton || <BlockSkeleton title="Loading block" minHeight={minHeight} />
            )}
        </div>
    );
}

function ControlPlane({ isOpen, onOpen, onClose }) {
    const [backend, setBackend] = useState(null);
    const [session, setSession] = useState(() => getOpsTelemetry());
    const [selectedRunId, setSelectedRunId] = useState('');
    const [error, setError] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isContentReady, setIsContentReady] = useState(false);
    const [isBodyVisible, setIsBodyVisible] = useState(false);
    const [isMobileSheet, setIsMobileSheet] = useState(false);
    const [isClosingFromDrag, setIsClosingFromDrag] = useState(false);
    const [isDraggingSheet, setIsDraggingSheet] = useState(false);
    const [isLauncherPressed, setIsLauncherPressed] = useState(false);
    const [scrollRoot, setScrollRoot] = useState(null);
    const sheetY = useMotionValue(0);
    const overlayOpacity = useTransform(sheetY, [0, 260], [1, 0]);
    const sheetAnimationRef = useRef(null);
    const dragCleanupRef = useRef(null);
    const dragFrameRef = useRef(0);
    const pendingSheetYRef = useRef(0);
    const launcherPressRef = useRef({ pointerId: null, startX: 0, startY: 0, moved: false });
    const lastLauncherOpenRef = useRef(0);

    useEffect(() => subscribeOpsTelemetry(setSession), []);

    const stopSheetAnimation = () => {
        sheetAnimationRef.current?.stop?.();
        sheetAnimationRef.current = null;
    };

    const runSheetAnimation = (target, options) => {
        stopSheetAnimation();
        const controls = animate(sheetY, target, options);
        sheetAnimationRef.current = controls;
        return controls;
    };

    const clearHeaderDrag = () => {
        dragCleanupRef.current?.();
        dragCleanupRef.current = null;
        if (dragFrameRef.current) {
            window.cancelAnimationFrame(dragFrameRef.current);
            dragFrameRef.current = 0;
        }
    };

    useEffect(() => {
        const syncViewport = () => {
            if (typeof window === 'undefined') return;
            setIsMobileSheet(window.innerWidth < 640);
        };

        syncViewport();
        window.addEventListener('resize', syncViewport);

        return () => window.removeEventListener('resize', syncViewport);
    }, []);

    useEffect(() => {
        if (!isOpen) return undefined;

        setIsClosingFromDrag(false);
        setIsDraggingSheet(false);

        if (!isMobileSheet) {
            sheetY.set(0);
            return undefined;
        }

        const entryOffset = Math.min(window.innerHeight * 0.09, 84);
        sheetY.set(entryOffset);
        const controls = runSheetAnimation(0, {
            duration: 0.22,
            ease: [0.22, 1, 0.36, 1],
        });

        return () => controls.stop();
    }, [isMobileSheet, isOpen, sheetY]);

    useEffect(() => {
        if (!isOpen) {
            setIsContentReady(false);
            setIsBodyVisible(false);
            return undefined;
        }

        let frameA = 0;
        let frameB = 0;
        setIsContentReady(false);
        setIsBodyVisible(false);

        frameA = window.requestAnimationFrame(() => {
            frameB = window.requestAnimationFrame(() => {
                setIsContentReady(true);
            });
        });

        return () => {
            window.cancelAnimationFrame(frameA);
            window.cancelAnimationFrame(frameB);
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            setIsBodyVisible(false);
            return undefined;
        }

        const revealTimeout = window.setTimeout(() => {
            setIsBodyVisible(true);
        }, isMobileSheet ? 90 : 70);

        return () => window.clearTimeout(revealTimeout);
    }, [isMobileSheet, isOpen]);

    useEffect(() => () => {
        stopSheetAnimation();
        clearHeaderDrag();
    }, []);

    useEffect(() => {
        if (!isOpen) return undefined;
        const previousBodyOverflow = document.body.style.overflow;
        const previousBodyOverscroll = document.body.style.overscrollBehaviorY;
        const previousHtmlOverscroll = document.documentElement.style.overscrollBehaviorY;

        document.body.style.overflow = 'hidden';
        document.body.style.overscrollBehaviorY = 'none';
        document.documentElement.style.overscrollBehaviorY = 'none';

        return () => {
            document.body.style.overflow = previousBodyOverflow;
            document.body.style.overscrollBehaviorY = previousBodyOverscroll;
            document.documentElement.style.overscrollBehaviorY = previousHtmlOverscroll;
        };
    }, [isOpen]);

    async function refreshBackend({ silent = false } = {}) {
        if (!silent) setIsRefreshing(true);

        try {
            const response = await fetch('/api/control-plane');
            const payload = await response.json();
            if (!response.ok) throw new Error(payload?.message || 'CONTROL_PLANE_REQUEST_FAILED');
            setBackend(payload);
            setError('');
        } catch {
            setError('Runtime probes could not be refreshed.');
        } finally {
            setIsRefreshing(false);
        }
    }

    useEffect(() => {
        if (!isOpen) return undefined;

        const initialRefreshId = window.setTimeout(() => {
            refreshBackend({ silent: true });
        }, isMobileSheet ? 140 : 90);

        const intervalId = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                refreshBackend({ silent: true });
            }
        }, 15000);

        return () => {
            clearTimeout(initialRefreshId);
            clearInterval(intervalId);
        };
    }, [isMobileSheet, isOpen]);

    const runs = useMemo(() => {
        const merged = [];
        const seen = new Set();

        [...(session.runs || []), ...(backend?.runLogs || [])].forEach((run) => {
            if (!run?.id || seen.has(run.id)) return;
            seen.add(run.id);
            merged.push(run);
        });

        return merged;
    }, [session.runs, backend?.runLogs]);

    const selectedRun = useMemo(() => runs.find((run) => run.id === selectedRunId) || runs[0] || null, [runs, selectedRunId]);
    const services = useMemo(() => buildDisplayServices(backend, runs), [backend, runs]);
    const latencyTrace = useMemo(() => buildLatencySeries(runs, services), [runs, services]);

    useEffect(() => {
        if (runs.length && !runs.some((run) => run.id === selectedRunId)) {
            setSelectedRunId(runs[0].id);
        }

        if (!runs.length && selectedRunId) {
            setSelectedRunId('');
        }
    }, [runs, selectedRunId]);

    const successCount = runs.filter((run) => run.status === 'success').length;
    const avgLatency = runs.length
        ? Math.round(runs.reduce((sum, run) => sum + (run.latencyMs || 0), 0) / runs.length)
        : null;
    const maxLatency = Math.max(...latencyTrace.items.map((item) => item.value || 0), 1);
    const latestLatencyPoint = latencyTrace.items[latencyTrace.items.length - 1] || null;
    const hottestLatencyPoint = latencyTrace.items.reduce((highest, item) => (
        !highest || item.value > highest.value ? item : highest
    ), null);

    const displayJobs = useMemo(() => {
        const latestTerminalRun = runs.find((run) => run.channel === 'terminal') || null;
        const latestArchitectRun = runs.find((run) => run.channel === 'architect') || null;
        const latestContactRun = runs.find((run) => run.channel === 'contact') || null;
        const githubJob = (backend?.jobs || []).find((job) => job.id === 'github-job') || null;

        return [
            {
                id: 'terminal-job',
                label: 'Last terminal orchestration',
                status: latestTerminalRun?.status || 'idle',
                at: latestTerminalRun?.completedAt || latestTerminalRun?.startedAt || null,
                detail: latestTerminalRun?.decision || 'Awaiting the next terminal command.',
            },
            {
                id: 'architect-job',
                label: 'Last architect brief',
                status: latestArchitectRun?.status || 'idle',
                at: latestArchitectRun?.completedAt || latestArchitectRun?.startedAt || null,
                detail: latestArchitectRun?.outputExcerpt || 'No architecture brief generated in this browser session yet.',
            },
            {
                id: 'contact-job',
                label: 'Last contact relay',
                status: latestContactRun?.status || 'idle',
                at: latestContactRun?.completedAt || latestContactRun?.startedAt || null,
                detail: latestContactRun?.decision || 'Awaiting the next contact submission.',
            },
            githubJob,
        ].filter(Boolean);
    }, [backend?.jobs, runs]);

    const summary = [
        { label: 'Worker Uptime', value: formatUptime(backend?.runtime?.workerUptimeMs), detail: 'Current runtime window for the control-plane function.' },
        { label: 'Session Runs', value: String(runs.length), detail: 'Terminal, architect, and contact activity captured in this browser session.' },
        { label: 'Success Rate', value: `${runs.length ? Math.round((successCount / runs.length) * 100) : 100}%`, detail: `${successCount} successful / ${runs.length} total session runs` },
        { label: 'Avg Latency', value: formatMs(avgLatency), detail: backend?.runtime?.latestJobAt ? `Last backend probe ${formatRelative(backend.runtime.latestJobAt)}` : 'Awaiting first backend probe' },
    ];

    const requestClose = async () => {
        clearHeaderDrag();
        setIsDraggingSheet(false);

        if (isMobileSheet) {
            setIsClosingFromDrag(true);
            await runSheetAnimation(window.innerHeight, {
                duration: 0.16,
                ease: [0.22, 1, 0.36, 1],
            });
        }

        onClose();
    };

    const handleHeaderDragRelease = async (velocity = 0, offset = sheetY.get()) => {
        const shouldClose = offset > 96 || velocity > 700;

        if (shouldClose) {
            await requestClose();
            return;
        }

        setIsClosingFromDrag(false);
        setIsDraggingSheet(false);
        runSheetAnimation(0, {
            type: 'spring',
            stiffness: 420,
            damping: 36,
        });
    };

    const startHeaderDrag = (event) => {
        if (!isMobileSheet) return;
        if (event.pointerType === 'mouse' && event.button !== 0) return;

        stopSheetAnimation();
        setIsClosingFromDrag(false);
        setIsDraggingSheet(true);

        const dragState = {
            pointerId: event.pointerId,
            startY: event.clientY,
            lastY: event.clientY,
            lastTime: performance.now(),
            velocity: 0,
        };

        clearHeaderDrag();

        const handlePointerMove = (moveEvent) => {
            if (moveEvent.pointerId !== dragState.pointerId) return;

            const offset = Math.max(0, moveEvent.clientY - dragState.startY);
            const now = performance.now();
            const elapsed = Math.max(now - dragState.lastTime, 1);

            dragState.velocity = ((moveEvent.clientY - dragState.lastY) / elapsed) * 1000;
            dragState.lastY = moveEvent.clientY;
            dragState.lastTime = now;

            pendingSheetYRef.current = offset;
            if (!dragFrameRef.current) {
                dragFrameRef.current = window.requestAnimationFrame(() => {
                    sheetY.set(pendingSheetYRef.current);
                    dragFrameRef.current = 0;
                });
            }
            moveEvent.preventDefault();
        };

        const handlePointerEnd = async (endEvent) => {
            if (endEvent.pointerId !== dragState.pointerId) return;

            const offset = Math.max(0, endEvent.clientY - dragState.startY);
            clearHeaderDrag();
            await handleHeaderDragRelease(dragState.velocity, offset);
        };

        dragCleanupRef.current = () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerEnd);
            window.removeEventListener('pointercancel', handlePointerEnd);
        };

        window.addEventListener('pointermove', handlePointerMove, { passive: false });
        window.addEventListener('pointerup', handlePointerEnd);
        window.addEventListener('pointercancel', handlePointerEnd);
        event.currentTarget.setPointerCapture?.(event.pointerId);
        event.preventDefault();
    };

    const handleMobileHeaderPointerDown = (event) => {
        if (!isMobileSheet) return;

        const target = event.target;
        if (target instanceof Element && target.closest('button, a, input, textarea, select, [data-no-drag="true"]')) {
            return;
        }

        startHeaderDrag(event);
    };

    const warmBackendSnapshot = () => {
        if (backend || isRefreshing) return;
        void refreshBackend({ silent: true });
    };

    const openLauncherPanel = () => {
        const now = Date.now();
        if (isOpen || now - lastLauncherOpenRef.current < 320) return;
        lastLauncherOpenRef.current = now;
        setIsLauncherPressed(false);
        onOpen();
    };

    const handleLauncherPointerDown = (event) => {
        setIsLauncherPressed(true);
        warmBackendSnapshot();

        launcherPressRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            moved: false,
        };
    };

    const handleLauncherPointerMove = (event) => {
        const press = launcherPressRef.current;
        if (press.pointerId !== event.pointerId || press.moved) return;

        if (Math.abs(event.clientX - press.startX) > 14 || Math.abs(event.clientY - press.startY) > 14) {
            launcherPressRef.current = { ...press, moved: true };
            setIsLauncherPressed(false);
        }
    };

    const handleLauncherPointerUp = (event) => {
        const press = launcherPressRef.current;
        setIsLauncherPressed(false);

        if (press.pointerId !== event.pointerId) return;
        launcherPressRef.current = { pointerId: null, startX: 0, startY: 0, moved: false };

        if ((event.pointerType === 'touch' || event.pointerType === 'pen') && !press.moved) {
            openLauncherPanel();
        }
    };

    const handleLauncherPointerCancel = () => {
        launcherPressRef.current = { pointerId: null, startX: 0, startY: 0, moved: false };
        setIsLauncherPressed(false);
    };

    const asideInitial = isMobileSheet
        ? { y: 0 }
        : { opacity: 0, y: 18 };

    const asideAnimate = isMobileSheet
        ? { y: 0 }
        : { opacity: 1, y: 0 };

    const asideExit = isMobileSheet
        ? (isClosingFromDrag ? { opacity: 1 } : { y: 0 })
        : { opacity: 0, y: 8 };

    const asideTransition = isMobileSheet
        ? { duration: 0.18, ease: [0.22, 1, 0.36, 1] }
        : { duration: 0.18, ease: [0.22, 1, 0.36, 1] };

    return (
        <>
            <button
                type="button"
                onClick={openLauncherPanel}
                onMouseEnter={warmBackendSnapshot}
                onFocus={warmBackendSnapshot}
                onPointerDown={handleLauncherPointerDown}
                onPointerMove={handleLauncherPointerMove}
                onPointerUp={handleLauncherPointerUp}
                onPointerCancel={handleLauncherPointerCancel}
                onPointerLeave={() => setIsLauncherPressed(false)}
                className={`fixed bottom-5 right-5 z-[90] rounded-full border px-4 py-3 text-[10px] font-mono uppercase tracking-[0.2em] backdrop-blur-xl transition-[border-color,color,box-shadow,background-color,transform,opacity] duration-120 cursor-pointer ${isLauncherPressed ? 'scale-[0.985] border-electric-cyan/32 bg-white/[0.07] text-electric-cyan shadow-[0_12px_28px_rgba(0,0,0,0.38)]' : 'border-electric-green/25 bg-[#0b0d11]/90 text-electric-green shadow-[0_18px_40px_rgba(0,0,0,0.45)] hover:border-electric-cyan/35 hover:text-electric-cyan'}`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
            >
                <span className="inline-flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-electric-green opacity-60 animate-ping" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-electric-green" />
                    </span>
                    SYS PANEL
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { void requestClose(); }}
                            className={`fixed inset-0 z-[95] ${isMobileSheet ? 'bg-black/68' : 'bg-black/52 backdrop-blur-sm'}`}
                            style={isMobileSheet ? { opacity: overlayOpacity, willChange: 'opacity' } : undefined}
                        />

                        <motion.aside
                            initial={asideInitial}
                            animate={asideAnimate}
                            exit={asideExit}
                            transition={asideTransition}
                            className={`fixed inset-x-2 bottom-2 top-4 z-[100] mx-auto max-w-7xl transform-gpu rounded-[24px] border border-white/10 ${isMobileSheet ? (isDraggingSheet ? 'bg-[#0b0d11]/98 shadow-[0_12px_28px_rgba(0,0,0,0.28)]' : 'bg-[#0b0d11]/98 shadow-[0_20px_70px_rgba(0,0,0,0.42)]') : 'bg-[#0b0d11]/94 shadow-[0_24px_80px_rgba(0,0,0,0.45)]'} sm:inset-x-4 sm:bottom-4 sm:top-16 sm:rounded-[28px] md:top-20`}
                            data-lenis-prevent
                            data-lenis-prevent-touch
                            style={isMobileSheet ? { y: sheetY, touchAction: 'auto', willChange: 'transform', backfaceVisibility: 'hidden' } : undefined}
                        >
                            <div className="flex h-full flex-col overflow-hidden rounded-[24px] sm:rounded-[28px]">
                                <div
                                    className="touch-none border-b border-white/10 px-4 py-4 sm:px-6 sm:py-5 sm:touch-auto md:px-8"
                                    onPointerDown={handleMobileHeaderPointerDown}
                                >
                                    <div className="mb-3 flex justify-center sm:hidden">
                                        <button
                                            type="button"
                                            onPointerDown={startHeaderDrag}
                                            className="touch-none cursor-grab active:cursor-grabbing"
                                            aria-label="Drag down to close observability panel"
                                        >
                                            <div className="h-1.5 w-16 rounded-full bg-white/10" />
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div>
                                            <div className="inline-flex items-center gap-2 rounded-full border border-electric-green/20 bg-electric-green/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-electric-green">
                                                <Activity className="h-3 w-3" />
                                                Live System Control
                                            </div>
                                            <h2 className="mt-4 text-[2.15rem] font-bold leading-[0.95] tracking-tight text-white sm:text-3xl md:text-4xl">Observability panel</h2>
                                            <p className="mt-3 text-sm leading-relaxed text-gray-400 sm:hidden">
                                                Live probes, session telemetry, and request flow for the systems behind the site.
                                            </p>
                                            <p className="mt-3 hidden max-w-3xl text-sm leading-relaxed text-gray-400 md:text-base sm:block">
                                                Real backend probes, current integration modes, session telemetry, and request lifecycle for the systems that actually drive the site.
                                            </p>
                                        </div>
                                        <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                                            <button
                                                type="button"
                                                onClick={() => { void requestClose(); }}
                                                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-gray-300 transition-colors hover:border-white/20 hover:text-white cursor-pointer sm:hidden"
                                                aria-label="Close observability panel"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>

                                            <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-none sm:justify-end sm:gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        clearOpsTelemetry();
                                                        setSelectedRunId('');
                                                    }}
                                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-3 text-[10px] font-mono uppercase tracking-[0.16em] text-gray-300 transition-colors hover:border-red-400/35 hover:text-red-200 cursor-pointer sm:px-5 sm:text-xs sm:tracking-[0.18em]"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="hidden sm:inline">Clear Session</span>
                                                    <span className="sm:hidden">Clear</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => refreshBackend()}
                                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-3 text-[10px] font-mono uppercase tracking-[0.16em] text-gray-300 transition-colors hover:border-electric-cyan/35 hover:text-electric-cyan cursor-pointer sm:px-5 sm:text-xs sm:tracking-[0.18em]"
                                                >
                                                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                                    <span className="hidden sm:inline">Refresh</span>
                                                    <span className="sm:hidden">Reload</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <motion.div
                                    initial={false}
                                    animate={isBodyVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                                    transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                                    className="panel-scrollbar flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 md:px-8"
                                    data-lenis-prevent
                                    data-lenis-prevent-touch
                                    style={{
                                        WebkitOverflowScrolling: 'touch',
                                        overscrollBehaviorY: 'contain',
                                        touchAction: isMobileSheet ? 'pan-y' : 'auto',
                                    }}
                                    ref={setScrollRoot}
                                    onWheelCapture={containWheelOnOverflow}
                                >
                                    {!isContentReady ? (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                                                {summary.map((item) => (
                                                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                                        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">{item.label}</div>
                                                        <div className="mt-4 h-9 w-24 rounded-lg bg-white/[0.05]" />
                                                        <div className="mt-3 h-4 w-full rounded bg-white/[0.04]" />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                                                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric-green">Runtime Hydration</div>
                                                <div className="mt-3 text-xl font-bold text-white">Mounting live systems view</div>
                                                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-400">
                                                    Loading backend probes, session telemetry, lifecycle traces, and live integration cards.
                                                </p>
                                                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    {[0, 1, 2, 3].map((index) => (
                                                        <div key={index} className="rounded-2xl border border-white/10 bg-black/25 p-5">
                                                            <div className="h-4 w-32 rounded bg-white/[0.06]" />
                                                            <div className="mt-5 h-8 w-40 rounded bg-white/[0.05]" />
                                                            <div className="mt-4 space-y-3">
                                                                <div className="h-3 w-full rounded bg-white/[0.04]" />
                                                                <div className="h-3 w-5/6 rounded bg-white/[0.04]" />
                                                                <div className="h-3 w-2/3 rounded bg-white/[0.04]" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                                                {summary.map((item) => (
                                                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                                        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">{item.label}</div>
                                                        <div className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">{item.value}</div>
                                                        <p className="mt-3 text-xs leading-relaxed text-gray-400 sm:text-sm">{item.detail}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                                                <div className="space-y-6">
                                                    <LazyPanelBlock
                                                        root={scrollRoot}
                                                        eager
                                                        minHeight={620}
                                                        skeleton={<BlockSkeleton title="Backend signals" minHeight={620} />}
                                                    >
                                                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div>
                                                        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric-green">Backend Signals</div>
                                                        <h3 className="mt-2 text-2xl font-bold text-white">Live probes and integrations</h3>
                                                    </div>
                                                    <div className="inline-flex items-center gap-2 rounded-full border border-electric-cyan/20 bg-electric-cyan/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-electric-cyan">
                                                        <ShieldCheck className="h-3 w-3" />
                                                        Merged Signal Feed
                                                    </div>
                                                </div>
                                                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    {services.map((service) => {
                                                        const meta = getStatus(service.status);
                                                        const Icon = serviceIcons[service.id] || Sparkles;
                                                        const StatusIcon = meta.icon;

                                                        return (
                                                            <div key={service.id} className="min-h-[200px] rounded-2xl border border-white/10 bg-black/25 p-4 sm:min-h-[216px] sm:p-5">
                                                                <div className="flex items-start justify-between gap-4">
                                                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                                                                        <Icon className="h-5 w-5 text-electric-green" />
                                                                    </div>
                                                                    <div className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] ${meta.className}`}>
                                                                        <StatusIcon className="h-3 w-3" />
                                                                        {meta.label}
                                                                    </div>
                                                                </div>
                                                                <div className="mt-5 text-lg font-semibold text-white">{service.label}</div>
                                                                <div className="mt-4 grid grid-cols-2 gap-4">
                                                                    <div className="min-w-0">
                                                                        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">Latency</div>
                                                                        <div className="mt-2 min-w-0 break-words text-sm leading-snug text-white">{formatMs(service.latencyMs)}</div>
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">Last Event</div>
                                                                        <div className="mt-2 min-w-0 break-words text-sm leading-snug text-white">{formatRelative(service.lastEventAt)}</div>
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">Activity</div>
                                                                        <div className="mt-2 min-w-0 break-words text-sm leading-snug text-white">
                                                                            {service.activityCount ? `${service.activityCount} recent run${service.activityCount === 1 ? '' : 's'}` : 'Awaiting traffic'}
                                                                        </div>
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">Signal Feed</div>
                                                                        <div className="mt-2 min-w-0 break-words text-sm leading-snug text-white">{service.feedLabel || 'Backend probe'}</div>
                                                                    </div>
                                                                </div>
                                                                <p className="mt-4 text-sm leading-relaxed text-gray-400">{service.note}</p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                                    </LazyPanelBlock>

                                                    <LazyPanelBlock
                                                        root={scrollRoot}
                                                        eager={!isMobileSheet}
                                                        minHeight={900}
                                                        skeleton={<BlockSkeleton title="Session pulse + control notes" minHeight={900} />}
                                                    >
                                            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                                                <div className="space-y-6">
                                                    <div className="self-start rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div>
                                                                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric-cyan">Session Pulse</div>
                                                                <h3 className="mt-2 text-2xl font-bold text-white">Latency trace</h3>
                                                            </div>
                                                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-gray-300">
                                                                <Waves className="h-3 w-3 text-electric-cyan" />
                                                                {latencyTrace.sourceLabel}
                                                            </div>
                                                        </div>

                                                        <div className="mt-5 grid grid-cols-1 gap-4 min-[460px]:grid-cols-2">
                                                            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                                                                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">Latest sample</div>
                                                                <div className="mt-3 break-words text-[1.9rem] font-semibold leading-[1.02] text-white sm:text-2xl">{formatMs(latestLatencyPoint?.value ?? null)}</div>
                                                                <div className="mt-2 text-sm leading-relaxed text-gray-400">{latestLatencyPoint?.detail || 'Waiting for traffic or a fresh probe sample.'}</div>
                                                            </div>
                                                            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                                                                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">Peak observed</div>
                                                                <div className="mt-3 break-words text-[1.9rem] font-semibold leading-[1.02] text-white sm:text-2xl">{formatMs(hottestLatencyPoint?.value ?? null)}</div>
                                                                <div className="mt-2 text-sm leading-relaxed text-gray-400">{hottestLatencyPoint?.detail || 'No measurable latency signal has been captured yet.'}</div>
                                                            </div>
                                                        </div>

                                                        <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4">
                                                            {latencyTrace.items.length ? (
                                                                <>
                                                                    <div className="mb-4 flex items-center justify-between gap-3 text-[10px] font-mono uppercase tracking-[0.18em] text-gray-500">
                                                                        <span>Recent signal distribution</span>
                                                                        <span>Max {formatMs(maxLatency)}</span>
                                                                    </div>
                                                                    <div className="relative">
                                                                        <div className="pointer-events-none absolute inset-0 grid grid-rows-4">
                                                                            {[0, 1, 2, 3].map((row) => (
                                                                                <div key={row} className="border-t border-white/[0.05]" />
                                                                            ))}
                                                                        </div>
                                                                        <div className="relative flex h-36 items-end gap-3">
                                                                            {latencyTrace.items.map((item) => {
                                                                                const height = Math.max(18, Math.round((item.value / maxLatency) * 100));
                                                                                const meta = getStatus(item.status);

                                                                                return (
                                                                                    <div key={item.id} className="flex flex-1 flex-col items-center gap-3">
                                                                                    <div
                                                                                        className={`w-full rounded-t-xl border ${meta.className}`}
                                                                                        style={{ height: `${height}%` }}
                                                                                    />
                                                                                        <div className="text-[9px] font-mono uppercase tracking-[0.16em] text-gray-500">
                                                                                            {item.label}
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm leading-relaxed text-gray-500">
                                                                    No request or probe latency has been captured yet. As soon as the terminal, architect, contact relay, or GitHub probe reports activity, the trace will start drawing live samples here.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                                                        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-electric-cyan">Recent jobs and probes</div>
                                                        <div className="mt-4 space-y-3">
                                                            {displayJobs.map((job) => {
                                                                const meta = getStatus(job.status);

                                                                return (
                                                                    <div key={job.id} className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                                                                        <div className="flex min-w-0 flex-col items-start gap-2">
                                                                            <div className="min-w-0 break-words text-sm font-semibold leading-snug text-white">{job.label}</div>
                                                                            <div className={`inline-flex w-fit shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] ${meta.className}`}>
                                                                                {meta.label}
                                                                            </div>
                                                                        </div>
                                                                        <div className="mt-3 text-[10px] font-mono uppercase tracking-[0.18em] text-gray-500">{formatRelative(job.at)}</div>
                                                                        <div className="mt-2 break-words text-sm leading-relaxed text-gray-400">{job.detail}</div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                                                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric-green">Control Notes</div>
                                                    <h3 className="mt-2 text-2xl font-bold text-white">What is active right now</h3>
                                                    <div className="mt-6 space-y-4">
                                                        {(backend?.capabilities || []).map((item) => (
                                                            <div key={item.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                                                                <div className="flex flex-col items-start gap-2">
                                                                    <div className="text-sm font-semibold leading-snug text-white">{item.label}</div>
                                                                    <div className="inline-flex max-w-full rounded-full border border-electric-cyan/20 bg-electric-cyan/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-electric-cyan">
                                                                        {item.value}
                                                                    </div>
                                                                </div>
                                                                <div className="mt-3 text-sm leading-relaxed text-gray-400">{item.detail}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                                    </LazyPanelBlock>
                                                </div>

                                        <div className="space-y-6">
                                            <LazyPanelBlock
                                                root={scrollRoot}
                                                eager={!isMobileSheet}
                                                minHeight={420}
                                                skeleton={<BlockSkeleton title="Session runs" minHeight={420} />}
                                            >
                                            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div>
                                                        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric-green">Session Runs</div>
                                                        <h3 className="mt-2 text-2xl font-bold text-white">Observed executions</h3>
                                                    </div>
                                                    <div className="inline-flex items-center gap-2 rounded-full border border-electric-green/20 bg-electric-green/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-electric-green">
                                                        <Waves className="h-3 w-3" />
                                                        Browser Telemetry
                                                    </div>
                                                </div>
                                                <div className="mt-6 space-y-3">
                                                    {runs.length ? runs.map((run) => {
                                                        const meta = getStatus(run.status);
                                                        const Icon = channelMeta[run.channel]?.icon || Sparkles;

                                                        return (
                                                            <button
                                                                key={run.id}
                                                                type="button"
                                                                onClick={() => setSelectedRunId(run.id)}
                                                                className={`w-full rounded-2xl border p-4 text-left transition-colors cursor-pointer ${selectedRun?.id === run.id ? 'border-electric-green/35 bg-electric-green/[0.08]' : 'border-white/10 bg-black/25 hover:border-electric-cyan/25 hover:bg-white/[0.04]'}`}
                                                            >
                                                                <div className="flex items-start justify-between gap-4">
                                                                    <div className="flex min-w-0 gap-3">
                                                                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                                                                            <Icon className="h-4 w-4 text-electric-cyan" />
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <div className="text-base font-semibold text-white">{run.title}</div>
                                                                            <div className="mt-1 text-sm leading-relaxed text-gray-400">{run.inputExcerpt || run.outputExcerpt}</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] ${meta.className}`}>
                                                                        {meta.label}
                                                                    </div>
                                                                </div>
                                                                <div className="mt-4 flex flex-wrap gap-2">
                                                                    {(run.tools || []).map((tool) => (
                                                                        <span key={tool} className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] font-mono uppercase tracking-[0.16em] text-gray-300">
                                                                            {tool}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </button>
                                                        );
                                                    }) : (
                                                        <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-5 text-sm leading-relaxed text-gray-500">
                                                            The session log will populate as soon as someone uses the terminal, generates an architect brief, or sends the contact form.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            </LazyPanelBlock>

                                            <LazyPanelBlock
                                                root={scrollRoot}
                                                eager={false}
                                                minHeight={520}
                                                skeleton={<BlockSkeleton title="Request lifecycle" minHeight={520} />}
                                            >
                                            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div>
                                                        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric-cyan">Request Lifecycle</div>
                                                        <h3 className="mt-2 text-2xl font-bold text-white">Step-by-step flow</h3>
                                                    </div>
                                                    <Workflow className="h-5 w-5 text-electric-cyan" />
                                                </div>
                                                {selectedRun ? (
                                                    <>
                                                        <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-5">
                                                            <div className="text-base font-semibold text-white">{selectedRun.title}</div>
                                                            <div className="mt-2 text-sm leading-relaxed text-gray-400">{selectedRun.decision || selectedRun.outputExcerpt || 'Awaiting details.'}</div>
                                                            <div className="mt-4 flex flex-wrap gap-4 text-[10px] font-mono uppercase tracking-[0.18em] text-gray-500">
                                                                <span>{channelMeta[selectedRun.channel]?.label || selectedRun.channel}</span>
                                                                <span>{formatMs(selectedRun.latencyMs)}</span>
                                                                <span>{formatRelative(selectedRun.completedAt || selectedRun.startedAt)}</span>
                                                            </div>
                                                        </div>
                                                        <div className="mt-6 space-y-4">
                                                            {(selectedRun.steps || []).map((step, index) => (
                                                                <div key={`${selectedRun.id}-${step.key}`} className="flex gap-4">
                                                                    <div className="flex flex-col items-center pt-1">
                                                                        <div className={`h-3 w-3 rounded-full ${step.state === 'complete' ? 'bg-electric-green shadow-[0_0_14px_rgba(0,255,153,0.35)]' : step.state === 'error' ? 'bg-red-400' : 'bg-electric-cyan shadow-[0_0_14px_rgba(0,224,255,0.35)]'}`} />
                                                                        {index < selectedRun.steps.length - 1 && <div className="mt-2 w-px flex-1 bg-white/10" />}
                                                                    </div>
                                                                    <div className="pb-4">
                                                                        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">{step.label}</div>
                                                                        <div className="mt-2 text-sm leading-relaxed text-white">{step.detail}</div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-black/20 p-5 text-sm text-gray-500">
                                                        Select a session run to inspect its lifecycle.
                                                    </div>
                                                )}
                                            </div>
                                            </LazyPanelBlock>
                                        </div>
                                    </div>
                                        </>
                                    )}

                                    {error && (
                                        <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-5 py-4 text-sm text-amber-100">
                                            {error}
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

export { ControlPlane };
