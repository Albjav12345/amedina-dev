import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
};

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

function ControlPlane({ isOpen, onOpen, onClose }) {
    const [backend, setBackend] = useState(null);
    const [session, setSession] = useState(() => getOpsTelemetry());
    const [selectedRunId, setSelectedRunId] = useState('');
    const [error, setError] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => subscribeOpsTelemetry(setSession), []);

    useEffect(() => {
        if (!isOpen) return undefined;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    useEffect(() => {
        let alive = true;
        let intervalId = null;

        const load = async ({ silent = false } = {}) => {
            if (!silent) setIsRefreshing(true);
            try {
                const response = await fetch('/api/control-plane');
                const payload = await response.json();
                if (!response.ok) throw new Error(payload?.message || 'CONTROL_PLANE_REQUEST_FAILED');
                if (!alive) return;
                setBackend(payload);
                setError('');
            } catch {
                if (alive) setError('Runtime probes could not be refreshed.');
            } finally {
                if (alive) setIsRefreshing(false);
            }
        };

        load();
        intervalId = window.setInterval(() => {
            if (document.visibilityState === 'visible') load({ silent: true });
        }, 30000);

        return () => {
            alive = false;
            if (intervalId) clearInterval(intervalId);
        };
    }, []);

    const runs = session.runs || [];
    const selectedRun = useMemo(() => runs.find((run) => run.id === selectedRunId) || runs[0] || null, [runs, selectedRunId]);

    useEffect(() => {
        if (runs.length && !runs.some((run) => run.id === selectedRunId)) {
            setSelectedRunId(runs[0].id);
        }
    }, [runs, selectedRunId]);

    const successCount = runs.filter((run) => run.status === 'success').length;
    const avgLatency = runs.length
        ? Math.round(runs.reduce((sum, run) => sum + (run.latencyMs || 0), 0) / runs.length)
        : null;
    const latencySeries = runs.slice(0, 8).reverse();
    const maxLatency = Math.max(...latencySeries.map((run) => run.latencyMs || 0), 1);

    const summary = [
        { label: 'Worker Uptime', value: formatUptime(backend?.runtime?.workerUptimeMs), detail: 'Current runtime window for the control-plane function.' },
        { label: 'Session Runs', value: String(runs.length), detail: 'Terminal, architect, and contact activity captured in this browser session.' },
        { label: 'Success Rate', value: `${runs.length ? Math.round((successCount / runs.length) * 100) : 100}%`, detail: `${successCount} successful / ${runs.length} total session runs` },
        { label: 'Avg Latency', value: formatMs(avgLatency), detail: backend?.runtime?.latestJobAt ? `Last backend probe ${formatRelative(backend.runtime.latestJobAt)}` : 'Awaiting first backend probe' },
    ];

    return (
        <>
            <button
                type="button"
                onClick={onOpen}
                className="fixed bottom-5 right-5 z-[90] rounded-full border border-electric-green/25 bg-[#0b0d11]/90 px-4 py-3 text-[10px] font-mono uppercase tracking-[0.2em] text-electric-green shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-colors hover:border-electric-cyan/35 hover:text-electric-cyan cursor-pointer"
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
                            onClick={onClose}
                            className="fixed inset-0 z-[95] bg-black/55 backdrop-blur-md"
                        />

                        <motion.aside
                            initial={{ opacity: 0, y: 24, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 16, scale: 0.99 }}
                            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                            className="fixed inset-x-4 bottom-4 top-20 z-[100] mx-auto max-w-7xl rounded-[28px] border border-white/10 bg-[#0b0d11]/92 shadow-[0_35px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
                        >
                            <div className="flex h-full flex-col overflow-hidden rounded-[28px]">
                                <div className="border-b border-white/10 px-6 py-5 md:px-8">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div>
                                            <div className="inline-flex items-center gap-2 rounded-full border border-electric-green/20 bg-electric-green/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-electric-green">
                                                <Activity className="h-3 w-3" />
                                                Live System Control
                                            </div>
                                            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">Observability panel</h2>
                                            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-400 md:text-base">
                                                Real backend probes, current integration modes, session telemetry, and request lifecycle for the systems that actually drive the site.
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            <button type="button" onClick={() => clearOpsTelemetry()} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-mono uppercase tracking-[0.18em] text-gray-300 transition-colors hover:border-red-400/35 hover:text-red-200 cursor-pointer inline-flex items-center gap-2">
                                                <Trash2 className="h-4 w-4" />
                                                Clear Session
                                            </button>
                                            <button type="button" onClick={async () => {
                                                setIsRefreshing(true);
                                                try {
                                                    const response = await fetch('/api/control-plane');
                                                    const payload = await response.json();
                                                    if (!response.ok) throw new Error();
                                                    setBackend(payload);
                                                    setError('');
                                                } catch {
                                                    setError('Runtime probes could not be refreshed.');
                                                } finally {
                                                    setIsRefreshing(false);
                                                }
                                            }} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-mono uppercase tracking-[0.18em] text-gray-300 transition-colors hover:border-electric-cyan/35 hover:text-electric-cyan cursor-pointer inline-flex items-center gap-2">
                                                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                                Refresh
                                            </button>
                                            <button type="button" onClick={onClose} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-gray-300 transition-colors hover:border-white/20 hover:text-white cursor-pointer">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8 panel-scrollbar" onWheelCapture={containWheelOnOverflow}>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                                        {summary.map((item) => (
                                            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">{item.label}</div>
                                                <div className="mt-4 text-3xl font-bold tracking-tight text-white">{item.value}</div>
                                                <p className="mt-3 text-sm leading-relaxed text-gray-400">{item.detail}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                                        <div className="space-y-6">
                                            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div>
                                                        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric-green">Backend Signals</div>
                                                        <h3 className="mt-2 text-2xl font-bold text-white">Live probes and integrations</h3>
                                                    </div>
                                                    <div className="inline-flex items-center gap-2 rounded-full border border-electric-cyan/20 bg-electric-cyan/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-electric-cyan">
                                                        <ShieldCheck className="h-3 w-3" />
                                                        Server Probes
                                                    </div>
                                                </div>
                                                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    {(backend?.services || []).map((service) => {
                                                        const meta = getStatus(service.status);
                                                        const Icon = serviceIcons[service.id] || Sparkles;
                                                        const StatusIcon = meta.icon;
                                                        return (
                                                            <div key={service.id} className="min-h-[184px] rounded-2xl border border-white/10 bg-black/25 p-5">
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
                                                                    <div>
                                                                        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">Latency</div>
                                                                        <div className="mt-2 text-sm text-white">{formatMs(service.latencyMs)}</div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">Last Event</div>
                                                                        <div className="mt-2 text-sm text-white">{formatRelative(service.lastEventAt)}</div>
                                                                    </div>
                                                                </div>
                                                                <p className="mt-4 text-sm leading-relaxed text-gray-400">{service.note}</p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                                                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                                                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric-cyan">Session Pulse</div>
                                                    <h3 className="mt-2 text-2xl font-bold text-white">Latency trace</h3>
                                                    <div className="mt-6 flex h-40 items-end gap-3">
                                                        {latencySeries.length ? latencySeries.map((run) => {
                                                            const height = Math.max(12, Math.round(((run.latencyMs || 0) / maxLatency) * 100));
                                                            const meta = getStatus(run.status);
                                                            return (
                                                                <div key={run.id} className="flex flex-1 flex-col items-center gap-3">
                                                                    <motion.div initial={{ height: 0 }} animate={{ height: `${height}%` }} className={`w-full rounded-t-xl border ${meta.className}`} />
                                                                    <div className="text-[9px] font-mono uppercase tracking-[0.16em] text-gray-500">
                                                                        {channelMeta[run.channel]?.label?.split(' ')[0] || run.channel}
                                                                    </div>
                                                                </div>
                                                            );
                                                        }) : (
                                                            <div className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-gray-500">
                                                                No live session data yet.
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                                                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric-green">Control Notes</div>
                                                    <h3 className="mt-2 text-2xl font-bold text-white">What is active right now</h3>
                                                    <div className="mt-6 space-y-4">
                                                        {(backend?.capabilities || []).map((item) => (
                                                            <div key={item.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                                                                <div className="flex items-center justify-between gap-3">
                                                                    <div className="text-sm font-semibold text-white">{item.label}</div>
                                                                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-electric-cyan">{item.value}</div>
                                                                </div>
                                                                <div className="mt-3 text-sm leading-relaxed text-gray-400">{item.detail}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4">
                                                        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-electric-cyan">Recent backend jobs</div>
                                                        <div className="mt-4 space-y-3">
                                                            {(backend?.jobs || []).map((job) => (
                                                                <div key={job.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                                                                    <div className="flex items-center justify-between gap-3">
                                                                        <div className="text-sm font-semibold text-white">{job.label}</div>
                                                                        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-gray-500">{formatRelative(job.at)}</div>
                                                                    </div>
                                                                    <div className="mt-2 text-sm leading-relaxed text-gray-400">{job.detail}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
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
                                                            <button key={run.id} type="button" onClick={() => setSelectedRunId(run.id)} className={`w-full rounded-2xl border p-4 text-left transition-colors cursor-pointer ${selectedRun?.id === run.id ? 'border-electric-green/35 bg-electric-green/[0.08]' : 'border-white/10 bg-black/25 hover:border-electric-cyan/25 hover:bg-white/[0.04]'}`}>
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
                                                                    {run.tools.map((tool) => (
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
                                                            {selectedRun.steps.map((step, index) => (
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
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-5 py-4 text-sm text-amber-100">
                                            {error}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

export { ControlPlane };
