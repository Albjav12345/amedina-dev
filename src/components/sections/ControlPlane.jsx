import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Activity,
    AlertTriangle,
    BrainCircuit,
    CheckCircle2,
    Clock3,
    Github,
    RefreshCw,
    Server,
    ShieldCheck,
    Sparkles,
    Workflow,
    XCircle,
} from 'lucide-react';
import { fadeInUp, scaleIn, viewportConfig } from '../../utils/animations';
import { useHardwareQuality } from '../../hooks/useHardwareQuality';
import portfolioData from '../../data/portfolio';

const statusStyles = {
    operational: { badge: 'border-electric-green/25 bg-electric-green/10 text-electric-green', text: 'Operational', icon: CheckCircle2 },
    degraded: { badge: 'border-amber-400/25 bg-amber-400/10 text-amber-300', text: 'Degraded', icon: AlertTriangle },
    offline: { badge: 'border-red-400/20 bg-red-500/10 text-red-200', text: 'Offline', icon: XCircle },
    running: { badge: 'border-electric-cyan/25 bg-electric-cyan/10 text-electric-cyan', text: 'Running', icon: Activity },
    success: { badge: 'border-electric-green/25 bg-electric-green/10 text-electric-green', text: 'Success', icon: CheckCircle2 },
    error: { badge: 'border-red-400/20 bg-red-500/10 text-red-200', text: 'Error', icon: XCircle },
    idle: { badge: 'border-white/10 bg-white/[0.04] text-gray-300', text: 'Idle', icon: Clock3 },
};

const serviceIcons = {
    'chat-api': Activity,
    'architect-api': BrainCircuit,
    'groq-provider': Sparkles,
    'github-sync': Github,
};

const channelLabels = {
    terminal: 'Terminal Agent',
    architect: 'Project Architect',
};

function formatDuration(ms) {
    if (!ms || Number.isNaN(ms)) return 'Awaiting traffic';
    if (ms < 1000) return `${Math.round(ms)} ms`;
    const seconds = ms / 1000;
    if (seconds < 60) return `${seconds.toFixed(1)} s`;
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.floor(seconds % 60);
    return `${minutes}m ${remainder}s`;
}

function formatWorkerUptime(ms) {
    if (!ms || Number.isNaN(ms)) return 'Cold start';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
}

function formatAbsoluteTime(isoString) {
    if (!isoString) return 'No runtime event yet';
    return new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: 'short',
    }).format(new Date(isoString));
}

function formatRelativeTime(isoString) {
    if (!isoString) return 'Awaiting first event';
    const deltaMs = Date.now() - new Date(isoString).getTime();
    const seconds = Math.max(1, Math.floor(deltaMs / 1000));
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

function getStatusMeta(status) {
    return statusStyles[status] || statusStyles.idle;
}

function ControlPlane() {
    const quality = useHardwareQuality();
    const { control } = portfolioData.ui.sections;
    const [snapshot, setSnapshot] = useState(null);
    const [requestState, setRequestState] = useState('loading');
    const [error, setError] = useState('');
    const [selectedRunId, setSelectedRunId] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        let isMounted = true;
        let intervalId = null;

        const loadSnapshot = async ({ silent = false } = {}) => {
            if (silent) {
                setIsRefreshing(true);
            } else {
                setRequestState((prev) => (prev === 'ready' ? prev : 'loading'));
            }

            try {
                const response = await fetch('/api/control-plane');
                const payload = await response.json();
                if (!response.ok) throw new Error(payload?.message || 'CONTROL_PLANE_REQUEST_FAILED');
                if (!isMounted) return;
                setSnapshot(payload);
                setError('');
                setRequestState('ready');
                setSelectedRunId((prev) => payload.runLogs.some((run) => run.id === prev) ? prev : (payload.runLogs[0]?.id || ''));
            } catch {
                if (!isMounted) return;
                setRequestState('error');
                setError('Live runtime telemetry could not be loaded right now.');
            } finally {
                if (isMounted) setIsRefreshing(false);
            }
        };

        loadSnapshot();
        intervalId = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                loadSnapshot({ silent: true });
            }
        }, 25000);

        return () => {
            isMounted = false;
            if (intervalId) clearInterval(intervalId);
        };
    }, []);

    const selectedRun = useMemo(() => {
        if (!snapshot?.runLogs?.length) return null;
        return snapshot.runLogs.find((run) => run.id === selectedRunId) || snapshot.runLogs[0];
    }, [selectedRunId, snapshot]);

    const summaryCards = snapshot ? [
        { label: 'Worker_Uptime', value: formatWorkerUptime(snapshot.runtime.workerUptimeMs), detail: 'Current live function runtime window.' },
        { label: 'Run_Success_Rate', value: `${snapshot.runtime.successRate}%`, detail: `${snapshot.runtime.successfulRuns} successful / ${snapshot.runtime.totalRuns} total runs` },
        { label: 'Requests_Handled', value: String(snapshot.runtime.totalRuns), detail: 'Terminal + architect requests observed in this runtime.' },
        { label: 'Last_Job_Execution', value: formatRelativeTime(snapshot.runtime.latestJobAt), detail: formatAbsoluteTime(snapshot.runtime.latestJobAt) },
    ] : [];

    return (
        <section id="control" className="py-20 md:py-32 relative overflow-hidden render-optimize">
            {!quality.simplePhysics && (
                <div
                    className="absolute top-[24%] right-0 w-[600px] h-[600px] md:w-[1000px] md:h-[1000px] pointer-events-none opacity-40 translate-x-1/2"
                    style={{ background: 'radial-gradient(circle, rgba(0, 255, 153, 0.13) 0%, transparent 70%)' }}
                />
            )}

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={viewportConfig}
                    className="mb-16"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <span className="font-mono text-xs text-electric-green bg-electric-green/10 border border-electric-green/20 px-2 py-1 rounded">
                            {control.id}
                        </span>
                        <div className="h-px flex-grow bg-gradient-to-r from-electric-green/30 to-transparent" />
                    </div>
                    <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
                        <div>
                            <h2 className="text-5xl font-bold font-mono tracking-tighter uppercase text-white">
                                {control.line1} <br />
                                <span className="text-electric-green">{control.line2}</span>
                            </h2>
                            <p className="mt-5 max-w-2xl text-gray-400 text-lg leading-relaxed">
                                Live runtime telemetry for the portfolio itself. This block exposes API health, recent backend executions, integration probes, and the actual request lifecycle running behind the UI.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={async () => {
                                setIsRefreshing(true);
                                try {
                                    const response = await fetch('/api/control-plane');
                                    const payload = await response.json();
                                    if (!response.ok) throw new Error(payload?.message || 'CONTROL_PLANE_REQUEST_FAILED');
                                    setSnapshot(payload);
                                    setSelectedRunId((prev) => payload.runLogs.some((run) => run.id === prev) ? prev : (payload.runLogs[0]?.id || ''));
                                    setError('');
                                    setRequestState('ready');
                                } catch {
                                    setError('Live runtime telemetry could not be refreshed.');
                                } finally {
                                    setIsRefreshing(false);
                                }
                            }}
                            className="px-4 py-3 rounded-xl border border-white/10 bg-white/[0.04] hover:border-electric-cyan/40 hover:bg-electric-cyan/10 text-xs font-mono uppercase tracking-[0.18em] text-gray-300 transition-colors cursor-pointer inline-flex items-center gap-3 self-start xl:self-auto"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-electric-cyan' : ''}`} />
                            Refresh Runtime
                        </button>
                    </div>
                </motion.div>

                {requestState === 'error' && !snapshot && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-6 py-5 text-sm text-red-200">
                        {error}
                    </div>
                )}

                {snapshot && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                            {summaryCards.map((card) => (
                                <motion.div
                                    key={card.label}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={viewportConfig}
                                    variants={fadeInUp}
                                    className={`rounded-2xl border border-white/10 p-5 ${quality.glassClass}`}
                                >
                                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-gray-500">{card.label}</div>
                                    <div className="mt-4 text-3xl font-bold tracking-tight text-white">{card.value}</div>
                                    <p className="mt-3 text-sm leading-relaxed text-gray-400">{card.detail}</p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
                            {snapshot.services.map((service) => {
                                const statusMeta = getStatusMeta(service.status);
                                const Icon = serviceIcons[service.id] || Server;
                                const StatusIcon = statusMeta.icon;

                                return (
                                    <motion.div
                                        key={service.id}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={viewportConfig}
                                        variants={scaleIn}
                                        className="rounded-2xl border border-white/10 bg-black/25 p-5"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="w-11 h-11 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
                                                <Icon className="w-5 h-5 text-electric-green" />
                                            </div>
                                            <div className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] ${statusMeta.badge}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {statusMeta.text}
                                            </div>
                                        </div>
                                        <div className="mt-5">
                                            <div className="text-lg font-semibold text-white">{service.label}</div>
                                            <div className="mt-3 grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">Latency</div>
                                                    <div className="mt-2 text-sm text-white">{formatDuration(service.latencyMs)}</div>
                                                </div>
                                                <div>
                                                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">Last event</div>
                                                    <div className="mt-2 text-sm text-white">{formatRelativeTime(service.lastEventAt)}</div>
                                                </div>
                                            </div>
                                            <p className="mt-4 text-sm leading-relaxed text-gray-400">{service.note}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-8 items-start">
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={viewportConfig}
                                variants={fadeInUp}
                                className={`rounded-2xl border border-white/10 p-6 md:p-8 ${quality.glassClass}`}
                            >
                                <div className="flex items-start justify-between gap-4 mb-6">
                                    <div>
                                        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-electric-green">Agent_Run_Logs</div>
                                        <h3 className="mt-2 text-2xl font-bold text-white">Recent backend executions</h3>
                                    </div>
                                    <div className="inline-flex items-center gap-2 rounded-full border border-electric-cyan/20 bg-electric-cyan/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-electric-cyan">
                                        <ShieldCheck className="w-3 h-3" />
                                        Live Session Telemetry
                                    </div>
                                </div>

                                {snapshot.runLogs.length === 0 ? (
                                    <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-sm leading-relaxed text-gray-400">
                                        No backend run has been captured in the current runtime yet. Use the terminal agent or generate a new architecture brief to populate live logs automatically.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {snapshot.runLogs.map((run) => {
                                            const statusMeta = getStatusMeta(run.status);
                                            const StatusIcon = statusMeta.icon;
                                            const isActive = selectedRun?.id === run.id;

                                            return (
                                                <button
                                                    key={run.id}
                                                    type="button"
                                                    onClick={() => setSelectedRunId(run.id)}
                                                    className={`w-full rounded-2xl border px-5 py-5 text-left transition-all cursor-pointer ${isActive ? 'border-electric-green/35 bg-electric-green/[0.07]' : 'border-white/10 bg-white/[0.03] hover:border-electric-cyan/30 hover:bg-white/[0.05]'}`}
                                                >
                                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                                        <div className="space-y-3">
                                                            <div className="flex flex-wrap items-center gap-3">
                                                                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric-cyan">
                                                                    {channelLabels[run.channel] || run.channel}
                                                                </span>
                                                                <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] ${statusMeta.badge}`}>
                                                                    <StatusIcon className="w-3 h-3" />
                                                                    {statusMeta.text}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <div className="text-lg font-semibold text-white">{run.title}</div>
                                                                <p className="mt-2 text-sm leading-relaxed text-gray-400">{run.inputExcerpt || 'No input excerpt available.'}</p>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {run.tools.map((tool) => (
                                                                    <span key={tool} className="px-2.5 py-1 rounded-md border border-white/10 bg-black/20 text-[10px] font-mono uppercase tracking-[0.16em] text-gray-300">
                                                                        {tool}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4 shrink-0 lg:min-w-[220px]">
                                                            <div>
                                                                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">Latency</div>
                                                                <div className="mt-2 text-sm text-white">{formatDuration(run.latencyMs)}</div>
                                                            </div>
                                                            <div>
                                                                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">Completed</div>
                                                                <div className="mt-2 text-sm text-white">{formatRelativeTime(run.completedAt || run.startedAt)}</div>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">Decision</div>
                                                                <div className="mt-2 text-sm text-gray-300">{run.decision || 'Awaiting final decision.'}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </motion.div>

                            <div className="space-y-8">
                                <motion.div
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={viewportConfig}
                                    variants={scaleIn}
                                    className={`rounded-2xl border border-white/10 p-6 md:p-8 ${quality.glassClass}`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-electric-cyan">System_Timeline</div>
                                            <h3 className="mt-2 text-2xl font-bold text-white">Request lifecycle</h3>
                                        </div>
                                        <div className="w-11 h-11 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
                                            <Workflow className="w-5 h-5 text-electric-cyan" />
                                        </div>
                                    </div>

                                    {selectedRun ? (
                                        <>
                                            <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-5">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-electric-green">
                                                        {channelLabels[selectedRun.channel] || selectedRun.channel}
                                                    </span>
                                                    <span className="text-sm text-gray-400">{formatAbsoluteTime(selectedRun.startedAt)}</span>
                                                </div>
                                                <div className="mt-3 text-base font-semibold text-white">{selectedRun.title}</div>
                                                <p className="mt-2 text-sm leading-relaxed text-gray-400">{selectedRun.outputExcerpt || selectedRun.inputExcerpt}</p>
                                            </div>

                                            <div className="mt-6 space-y-4">
                                                {selectedRun.steps.map((step, index) => {
                                                    const isComplete = step.state === 'complete';
                                                    const isError = step.state === 'error';
                                                    const isRunning = step.state === 'running';

                                                    return (
                                                        <div key={step.key} className="flex gap-4">
                                                            <div className="flex flex-col items-center pt-1">
                                                                <div className={`w-3 h-3 rounded-full ${isComplete ? 'bg-electric-green shadow-[0_0_14px_rgba(0,255,153,0.35)]' : isError ? 'bg-red-400' : isRunning ? 'bg-electric-cyan shadow-[0_0_14px_rgba(0,224,255,0.35)]' : 'bg-white/10'}`} />
                                                                {index < selectedRun.steps.length - 1 && <div className={`mt-2 w-px flex-1 ${isComplete ? 'bg-electric-green/25' : 'bg-white/10'}`} />}
                                                            </div>
                                                            <div className="pb-5">
                                                                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">{step.label}</div>
                                                                <div className="mt-2 text-sm text-white">{step.detail}</div>
                                                                <div className="mt-2 text-[11px] text-gray-500">{step.at ? formatAbsoluteTime(step.at) : 'Pending execution'}</div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">Approval_Path</div>
                                                    <div className="mt-3 text-sm leading-relaxed text-white">{selectedRun.approval || 'No approval metadata recorded for this run.'}</div>
                                                </div>
                                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">Retry_Policy</div>
                                                    <div className="mt-3 text-sm leading-relaxed text-white">{selectedRun.retries > 0 ? `${selectedRun.retries} retry attempts recorded.` : 'No retry was required for this execution.'}</div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-5 text-sm leading-relaxed text-gray-400">
                                            The lifecycle view will activate after the first live backend run is captured.
                                        </div>
                                    )}
                                </motion.div>

                                <motion.div
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={viewportConfig}
                                    variants={fadeInUp}
                                    className={`rounded-2xl border border-white/10 p-6 md:p-8 ${quality.glassClass}`}
                                >
                                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-electric-green">Recent_Jobs</div>
                                    <h3 className="mt-2 text-2xl font-bold text-white">Latest probes and executions</h3>
                                    <div className="mt-6 space-y-4">
                                        {snapshot.jobs.map((job) => {
                                            const statusMeta = getStatusMeta(job.status);
                                            const StatusIcon = statusMeta.icon;

                                            return (
                                                <div key={job.id} className="rounded-2xl border border-white/10 bg-black/25 p-5">
                                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                                        <div className="text-base font-semibold text-white">{job.label}</div>
                                                        <div className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] ${statusMeta.badge}`}>
                                                            <StatusIcon className="w-3 h-3" />
                                                            {statusMeta.text}
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 text-sm leading-relaxed text-gray-400">{job.detail}</div>
                                                    <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">
                                                        {job.at ? `${formatRelativeTime(job.at)} - ${formatAbsoluteTime(job.at)}` : 'No timestamp yet'}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {error && (
                            <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-5 py-4 text-sm text-amber-100">
                                {error}
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}

export { ControlPlane };
