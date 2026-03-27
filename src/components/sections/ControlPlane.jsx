import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion';
import {
    Activity,
    BrainCircuit,
    CheckCircle2,
    ChevronRight,
    Clock3,
    Copy,
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
import { containWheelOnOverflow, translateWheelToHorizontalScroll } from '../../utils/scrolling';
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

function prettyPrint(value) {
    if (typeof value === 'string') return value;
    if (value == null) return '';

    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
}

function TraceCodeBlock({ label, value, emptyMessage = 'No trace captured for this block yet.', fillHeight = false }) {
    const [copied, setCopied] = useState(false);
    const formatted = prettyPrint(value);

    const handleCopy = async () => {
        if (!formatted) return;

        try {
            await navigator.clipboard.writeText(formatted);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
        } catch {
            setCopied(false);
        }
    };

    return (
        <div className={`min-w-0 rounded-2xl border border-white/10 bg-black/20 p-4 ${fillHeight ? 'flex h-full min-h-0 flex-col' : ''}`}>
            <div className="flex items-center justify-between gap-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-electric-cyan">{label}</div>
                <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!formatted}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.16em] text-gray-300 transition-colors hover:border-electric-cyan/35 hover:text-electric-cyan disabled:cursor-default disabled:opacity-40 cursor-pointer"
                >
                    <Copy className="h-3 w-3" />
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>
            {formatted ? (
                <pre className={`panel-scrollbar mt-4 overflow-y-auto overflow-x-hidden rounded-2xl border border-white/10 bg-[#0a0b0f] px-4 py-4 text-[12px] leading-6 text-gray-300 whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${fillHeight ? 'min-h-0 flex-1' : 'max-h-[24rem]'}`}>
                    {formatted}
                </pre>
            ) : (
                <div className={`mt-4 rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-5 text-sm leading-relaxed text-gray-500 ${fillHeight ? 'min-h-0 flex-1' : ''}`}>
                    {emptyMessage}
                </div>
            )}
        </div>
    );
}

function RunTracePanel({ run, isMobile = false }) {
    const [activeTab, setActiveTab] = useState(() => (isMobile ? 'summary' : 'messages'));
    const trace = run?.trace || null;
    const tabClassName = (isActive) => `inline-flex items-center justify-center rounded-full border px-3 py-2 text-[10px] font-mono uppercase tracking-[0.16em] transition-colors ${isActive
        ? 'border-electric-green/30 bg-electric-green/10 text-electric-green'
        : 'border-white/10 bg-white/[0.04] text-gray-400 hover:border-electric-cyan/30 hover:text-electric-cyan'
        }`;

    if (!run) {
        return (
            <div className="flex h-full min-h-0 items-center rounded-2xl border border-dashed border-white/10 bg-black/20 p-5 text-sm text-gray-500">
                Select a session run to inspect its prompt envelope and raw model output.
            </div>
        );
    }

    if (!trace) {
        return (
            <div className="flex h-full min-h-0 items-center rounded-2xl border border-dashed border-white/10 bg-black/20 p-5 text-sm leading-relaxed text-gray-500">
                This execution does not include an AI inference trace. Terminal and Project Architect requests will populate this area automatically with full model messages, raw output, and parsed payloads.
            </div>
        );
    }

    const visibleActions = Array.isArray(trace.availableActions) ? trace.availableActions.filter(Boolean) : [];
    const requestMessages = Array.isArray(trace.requestMessages) ? trace.requestMessages : [];

    if (isMobile) {
        return (
            <div className="flex h-full min-h-0 flex-col gap-3">
                <div className="grid grid-cols-3 gap-2">
                        {[
                            ['summary', 'Summary'],
                            ['messages', 'Messages'],
                            ['raw', 'Raw'],
                            ['parsed', 'Parsed'],
                            ['payload', 'Request'],
                        ].map(([key, label]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setActiveTab(key)}
                                className={`${tabClassName(activeTab === key)} min-w-0 px-3 py-2.5 text-[9px] whitespace-nowrap`}
                            >
                                {label}
                            </button>
                        ))}
                </div>

                <div className="min-h-0 flex-1 rounded-2xl border border-white/10 bg-black/20 p-2.5 overflow-hidden">
                    {activeTab === 'summary' && (
                        <div className="panel-scrollbar h-full overflow-y-auto overflow-x-hidden pr-1">
                            <div className="grid h-full min-h-0 grid-cols-2 gap-2.5">
                                <div className="rounded-2xl border border-white/10 bg-[#0a0b0f] p-3">
                                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">Provider</div>
                                    <div className="mt-2 text-sm font-semibold text-white break-words">{trace.provider || 'Unknown'}</div>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-[#0a0b0f] p-3">
                                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">Model</div>
                                    <div className="mt-2 text-sm font-semibold text-white break-words">{trace.model || 'Awaiting model response'}</div>
                                </div>
                                <div className="col-span-2 rounded-2xl border border-white/10 bg-[#0a0b0f] p-3">
                                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">User Prompt</div>
                                    <div className="mt-2 text-[13px] leading-5 text-white whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                                        {trace.userInput || run.inputExcerpt || 'No user input recorded.'}
                                    </div>
                                </div>
                                <div className="col-span-2 min-h-0 rounded-2xl border border-white/10 bg-[#0a0b0f] p-3 flex flex-col">
                                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-electric-cyan">Available Actions</div>
                                    <div className="panel-scrollbar mt-3 min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1">
                                        <div className="flex flex-wrap gap-2">
                                            {visibleActions.length ? visibleActions.map((action) => (
                                                <span key={action} className="rounded-full border border-electric-cyan/20 bg-electric-cyan/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.16em] text-electric-cyan">
                                                    {action}
                                                </span>
                                            )) : (
                                                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.16em] text-gray-400">
                                                    No explicit actions exposed
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'messages' && (
                        <>
                            {requestMessages.length ? (
                                <div className="panel-scrollbar h-full overflow-y-auto overflow-x-hidden pr-1">
                                    <div className="space-y-3">
                                        {requestMessages.map((message, index) => (
                                            <div key={`${message.role || 'message'}-${index}`} className="rounded-2xl border border-white/10 bg-[#0a0b0f] p-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-electric-green">{message.role || `message_${index + 1}`}</div>
                                                    <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-gray-500">
                                                        Block {index + 1}
                                                    </div>
                                                </div>
                                                <pre className="panel-scrollbar mt-2.5 max-h-[10rem] overflow-y-auto overflow-x-hidden rounded-2xl border border-white/10 bg-black/25 px-3 py-2.5 text-[12px] leading-5 text-gray-300 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                                                    {typeof message.content === 'string' ? message.content : prettyPrint(message.content)}
                                                </pre>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <TraceCodeBlock label="Prompt Messages" value="" emptyMessage="The selected run did not capture model messages." fillHeight />
                            )}
                        </>
                    )}

                    {activeTab === 'raw' && (
                        <TraceCodeBlock
                            label="Raw Model Output"
                            value={trace.rawModelResponse}
                            emptyMessage="No raw model output was captured for this execution."
                            fillHeight
                        />
                    )}

                    {activeTab === 'parsed' && (
                        <TraceCodeBlock
                            label="Parsed Payload"
                            value={trace.parsedResponse}
                            emptyMessage="No parsed payload was captured for this execution."
                            fillHeight
                        />
                    )}

                    {activeTab === 'payload' && (
                        <TraceCodeBlock
                            label="Request Payload"
                            value={trace.requestPayload}
                            emptyMessage="No request payload snapshot was captured for this execution."
                            fillHeight
                        />
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-col gap-2">
            <div className={`grid min-h-0 flex-1 gap-3 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-[292px_minmax(0,1fr)]'}`}>
                <div className="min-w-0 rounded-2xl border border-white/10 bg-black/25 p-3 flex min-h-0 flex-col overflow-hidden">
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-electric-green">Trace Summary</div>
                    <div className="panel-scrollbar mt-3 min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                            <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">Provider</div>
                                <div className="mt-2 text-sm font-semibold text-white break-words">{trace.provider || 'Unknown'}</div>
                            </div>
                            <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">Model</div>
                                <div className="mt-2 text-sm font-semibold text-white break-words">{trace.model || 'Awaiting model response'}</div>
                            </div>
                            <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:col-span-2 lg:col-span-1">
                                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">User Prompt</div>
                                <div className="mt-2 text-[13px] leading-5 text-white whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                                    {trace.userInput || run.inputExcerpt || 'No user input recorded.'}
                                </div>
                            </div>
                            <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:col-span-2 lg:col-span-1">
                                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-electric-cyan">Available Actions</div>
                                <div className="panel-scrollbar mt-2 max-h-[6.5rem] overflow-y-auto overflow-x-hidden pr-1">
                                    <div className="flex flex-wrap gap-2">
                                        {visibleActions.length ? visibleActions.map((action) => (
                                            <span key={action} className="rounded-full border border-electric-cyan/20 bg-electric-cyan/10 px-2 py-1 text-[10px] font-mono uppercase tracking-[0.16em] text-electric-cyan">
                                                {action}
                                            </span>
                                        )) : (
                                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-mono uppercase tracking-[0.16em] text-gray-400">
                                                No explicit actions exposed
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="min-w-0 rounded-2xl border border-white/10 bg-black/25 p-3 flex min-h-0 flex-col overflow-hidden">
                    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                        {[
                            ['messages', 'Prompt Messages'],
                            ['raw', 'Raw Model Output'],
                            ['parsed', 'Parsed Payload'],
                            ['payload', 'Request Payload'],
                        ].map(([key, label]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setActiveTab(key)}
                                className={`${tabClassName(activeTab === key)} min-w-0 text-center`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="mt-2 min-h-0 flex-1 overflow-hidden">
                        {activeTab === 'messages' && (
                            <div className="min-w-0 rounded-2xl border border-white/10 bg-black/20 p-3 h-full min-h-0">
                                {requestMessages.length ? (
                                    <div className="panel-scrollbar h-full min-h-0 overflow-y-auto overflow-x-hidden pr-1">
                                        <div className="space-y-2.5">
                                            {requestMessages.map((message, index) => (
                                                <div key={`${message.role || 'message'}-${index}`} className="min-w-0 rounded-2xl border border-white/10 bg-[#0a0b0f] p-2.5">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-electric-green">{message.role || `message_${index + 1}`}</div>
                                                        <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-gray-500">
                                                            Block {index + 1}
                                                        </div>
                                                    </div>
                                                    <pre className="panel-scrollbar mt-2.5 max-h-[8.5rem] overflow-y-auto overflow-x-hidden rounded-2xl border border-white/10 bg-black/25 px-3 py-2.5 text-[12px] leading-5 text-gray-300 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                                                        {typeof message.content === 'string' ? message.content : prettyPrint(message.content)}
                                                    </pre>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <TraceCodeBlock label="Prompt Messages" value="" emptyMessage="The selected run did not capture model messages." fillHeight />
                                )}
                            </div>
                        )}

                        {activeTab === 'raw' && (
                            <TraceCodeBlock
                                label="Raw Model Output"
                                value={trace.rawModelResponse}
                                emptyMessage="No raw model output was captured for this execution."
                                fillHeight
                            />
                        )}

                        {activeTab === 'parsed' && (
                            <TraceCodeBlock
                                label="Parsed Payload"
                                value={trace.parsedResponse}
                                emptyMessage="No parsed payload was captured for this execution."
                                fillHeight
                            />
                        )}

                        {activeTab === 'payload' && (
                            <TraceCodeBlock
                                label="Request Payload"
                                value={trace.requestPayload}
                                emptyMessage="No request payload snapshot was captured for this execution."
                                fillHeight
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
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

function PanelPillButton({ active, onClick, children, className = '' }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center justify-center rounded-full border px-3 py-2 text-[10px] font-mono uppercase tracking-[0.16em] transition-colors cursor-pointer ${active
                ? 'border-electric-green/30 bg-electric-green/10 text-electric-green'
                : 'border-white/10 bg-white/[0.04] text-gray-400 hover:border-electric-cyan/30 hover:text-electric-cyan'} ${className}`}
        >
            {children}
        </button>
    );
}

function ControlPanelSummaryStrip({ summary }) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {summary.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">{item.label}</div>
                    <div className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">{item.value}</div>
                    <p className="mt-3 text-xs leading-relaxed text-gray-400 sm:text-sm">{item.detail}</p>
                </div>
            ))}
        </div>
    );
}

function ServiceGridPanel({ services, isMobile = false }) {
    const scrollerRef = useRef(null);

    useEffect(() => {
        const node = scrollerRef.current;

        if (!(node instanceof HTMLElement)) {
            return undefined;
        }

        const handleWheel = (event) => {
            const dominantDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;

            if (!dominantDelta) {
                return;
            }

            const maxScrollLeft = node.scrollWidth - node.clientWidth;
            const canScrollLeft = dominantDelta < 0 && node.scrollLeft > 0;
            const canScrollRight = dominantDelta > 0 && node.scrollLeft < maxScrollLeft - 1;

            if (canScrollLeft || canScrollRight) {
                event.preventDefault();
                event.stopPropagation();
                node.scrollLeft = Math.max(0, Math.min(maxScrollLeft, node.scrollLeft + dominantDelta));
            }
        };

        node.addEventListener('wheel', handleWheel, { passive: false });
        return () => node.removeEventListener('wheel', handleWheel);
    }, []);

    return (
        <div className={`rounded-3xl border border-white/10 bg-white/[0.03] p-6 flex flex-col overflow-hidden ${isMobile ? 'h-[476px]' : 'h-[440px]'}`}>
            <div className={`flex gap-4 ${isMobile ? 'flex-col items-start' : 'items-center justify-between'}`}>
                <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric-green">Backend Signals</div>
                    <h3 className={`mt-2 font-bold text-white ${isMobile ? 'max-w-[13.25rem] text-[1.72rem] leading-[0.98]' : 'text-2xl'}`}>Live probes and integrations</h3>
                </div>
                <div className={`inline-flex items-center gap-2 rounded-full border border-electric-cyan/20 bg-electric-cyan/10 font-mono uppercase tracking-[0.18em] text-electric-cyan ${isMobile ? 'self-start px-2.5 py-1 text-[9px]' : 'px-3 py-1 text-[10px]'}`}>
                    <ShieldCheck className="h-3 w-3" />
                    Merged Signal Feed
                </div>
            </div>
            <div className={`mt-3 flex items-center justify-between gap-3 font-mono uppercase tracking-[0.18em] text-gray-500 ${isMobile ? 'text-[8px]' : 'text-[10px]'}`}>
                <span>{isMobile ? 'Swipe through live cards' : 'Swipe or scroll sideways through the live service cards'}</span>
                <span>{services.length} systems</span>
            </div>
            <div
                ref={scrollerRef}
                className="panel-scrollbar mt-3 min-h-0 flex-1 overflow-x-auto overflow-y-hidden pb-2"
                data-wheel-axis="x"
                onWheelCapture={translateWheelToHorizontalScroll}
                onWheel={translateWheelToHorizontalScroll}
                style={{ overscrollBehaviorX: 'contain' }}
            >
                <div className={`flex h-full items-stretch gap-3 ${isMobile ? 'snap-x snap-mandatory pr-1' : 'pr-1'}`}>
                    {services.map((service) => {
                        const meta = getStatus(service.status);
                        const Icon = serviceIcons[service.id] || Sparkles;
                        const StatusIcon = meta.icon;

                        return (
                            <div
                                key={service.id}
                                className={`min-h-0 shrink-0 rounded-2xl border border-white/10 bg-black/25 flex flex-col overflow-hidden ${isMobile ? 'w-[68vw] max-w-[14.5rem] snap-start p-2.5' : 'w-[min(25rem,calc(50vw-5rem))] xl:w-[23.5rem] p-4'}`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                                        <Icon className="h-4 w-4 text-electric-green" />
                                    </div>
                                    <div className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[8px] font-mono uppercase tracking-[0.14em] ${meta.className}`}>
                                        <StatusIcon className="h-2.5 w-2.5" />
                                        {meta.label}
                                    </div>
                                </div>
                                <div
                                    className={`mt-3 font-semibold text-white ${isMobile ? 'text-[0.88rem] leading-[1.12]' : 'text-base'}`}
                                    style={isMobile ? {
                                        display: '-webkit-box',
                                        WebkitLineClamp: 1,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    } : undefined}
                                >
                                    {service.label}
                                </div>
                                <div className={`mt-3 grid grid-cols-2 ${isMobile ? 'gap-1.5' : 'gap-3'}`}>
                                    <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] px-2 py-1.5">
                                        <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-gray-500">Latency</div>
                                        <div className="mt-1 text-[12px] leading-[1.15] text-white break-words">{formatMs(service.latencyMs)}</div>
                                    </div>
                                    <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] px-2 py-1.5">
                                        <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-gray-500">Last Event</div>
                                        <div className="mt-1 text-[12px] leading-[1.15] text-white break-words">{formatRelative(service.lastEventAt)}</div>
                                    </div>
                                    <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] px-2 py-1.5">
                                        <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-gray-500">Activity</div>
                                        <div className="mt-1 text-[12px] leading-[1.15] text-white break-words [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden min-h-[1.65rem]">
                                            {service.activityCount ? `${service.activityCount} recent run${service.activityCount === 1 ? '' : 's'}` : 'Awaiting traffic'}
                                        </div>
                                    </div>
                                    <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] px-2 py-1.5">
                                        <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-gray-500">Feed</div>
                                        <div className="mt-1 text-[12px] leading-[1.15] text-white break-words [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden min-h-[1.65rem]">{service.feedLabel || 'Backend probe'}</div>
                                    </div>
                                </div>
                                <p
                                    className={`mt-2.5 text-[10px] leading-relaxed text-gray-400 break-words ${isMobile ? 'min-h-[1rem]' : ''}`}
                                    style={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: isMobile ? 1 : 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {service.note}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function RuntimeActivityPanel({
    isMobile = false,
    activeTab,
    onTabChange,
    latencyTrace,
    latestLatencyPoint,
    hottestLatencyPoint,
    maxLatency,
    displayJobs,
    capabilities,
}) {
    return (
        <div className={`rounded-3xl border border-white/10 bg-white/[0.03] p-6 flex flex-col overflow-hidden ${isMobile ? 'h-[470px]' : 'h-[620px]'}`}>
            <div className={`flex items-start gap-4 ${isMobile ? 'flex-col' : 'justify-between'}`}>
                <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric-cyan">Runtime Activity</div>
                    <h3 className={`mt-2 font-bold text-white ${isMobile ? 'text-[1.72rem] leading-[0.98]' : 'text-2xl'}`}>Session pulse</h3>
                </div>
                <div className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 font-mono uppercase tracking-[0.18em] text-gray-300 ${isMobile ? 'px-2.5 py-1 text-[9px]' : 'px-3 py-1 text-[10px]'}`}>
                    <Waves className="h-3 w-3 text-electric-cyan" />
                    {latencyTrace.sourceLabel}
                </div>
            </div>

            <div className={`grid grid-cols-3 gap-2 ${isMobile ? 'mt-4' : 'mt-5'}`}>
                <PanelPillButton active={activeTab === 'latency'} onClick={() => onTabChange('latency')}>Latency</PanelPillButton>
                <PanelPillButton active={activeTab === 'notes'} onClick={() => onTabChange('notes')}>Notes</PanelPillButton>
                <PanelPillButton active={activeTab === 'jobs'} onClick={() => onTabChange('jobs')}>Recent Jobs</PanelPillButton>
            </div>

            <div className={`${isMobile ? 'mt-4' : 'mt-5'} min-h-0 flex-1`}>
                {activeTab === 'latency' && (
                    <div className="flex h-full min-h-0 flex-col">
                        <div className="grid grid-cols-2 gap-3 shrink-0">
                            <div className={`rounded-2xl border border-white/10 bg-black/25 ${isMobile ? 'p-3.5' : 'p-4'}`}>
                                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">Latest Sample</div>
                                <div className={`mt-3 break-words font-semibold leading-[1.02] text-white ${isMobile ? 'text-[1.55rem]' : 'text-[1.85rem] sm:text-2xl'}`}>{formatMs(latestLatencyPoint?.value ?? null)}</div>
                                <div className={`mt-2 leading-relaxed text-gray-400 ${isMobile ? 'text-[12px]' : 'text-sm'}`}>{latestLatencyPoint?.detail || 'Waiting for traffic or a fresh probe sample.'}</div>
                            </div>
                            <div className={`rounded-2xl border border-white/10 bg-black/25 ${isMobile ? 'p-3.5' : 'p-4'}`}>
                                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">Peak Observed</div>
                                <div className={`mt-3 break-words font-semibold leading-[1.02] text-white ${isMobile ? 'text-[1.55rem]' : 'text-[1.85rem] sm:text-2xl'}`}>{formatMs(hottestLatencyPoint?.value ?? null)}</div>
                                <div className={`mt-2 leading-relaxed text-gray-400 ${isMobile ? 'text-[12px]' : 'text-sm'}`}>{hottestLatencyPoint?.detail || 'No measurable latency signal has been captured yet.'}</div>
                            </div>
                        </div>

                        <div className={`min-h-0 flex-1 rounded-2xl border border-white/10 bg-black/25 ${isMobile ? 'mt-3 p-3' : 'mt-4 p-4'}`}>
                            {latencyTrace.items.length ? (
                                <div className="flex h-full min-h-0 flex-col">
                                    <div className={`flex items-center justify-between gap-3 text-[10px] font-mono uppercase tracking-[0.18em] text-gray-500 ${isMobile ? 'mb-2.5' : 'mb-4'}`}>
                                        <span>Recent signal distribution</span>
                                        <span>Max {formatMs(maxLatency)}</span>
                                    </div>
                                    <div className="relative min-h-0 flex-1">
                                        <div className="pointer-events-none absolute inset-0 grid grid-rows-4">
                                            {[0, 1, 2, 3].map((row) => (
                                                <div key={row} className="border-t border-white/[0.05]" />
                                            ))}
                                        </div>
                                        <div className="relative flex h-full items-end gap-2 sm:gap-3">
                                            {latencyTrace.items.map((item) => {
                                                const height = Math.max(18, Math.round((item.value / maxLatency) * 100));
                                                const meta = getStatus(item.status);

                                                return (
                                                    <div key={item.id} className="flex flex-1 flex-col items-center gap-2">
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
                                </div>
                            ) : (
                                <div className="flex h-full items-center rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm leading-relaxed text-gray-500">
                                    No request or probe latency has been captured yet. As soon as the terminal, architect, contact relay, or GitHub probe reports activity, the trace will start drawing live samples here.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'notes' && (
                    <div className="panel-scrollbar h-full overflow-y-auto overflow-x-hidden pr-1 space-y-3">
                        {capabilities.map((item) => (
                            <div key={item.id} className={`rounded-2xl border border-white/10 bg-black/25 ${isMobile ? 'p-3.5' : 'p-4'}`}>
                                <div className="flex flex-col items-start gap-2">
                                    <div className="text-sm font-semibold leading-snug text-white">{item.label}</div>
                                    <div className="inline-flex max-w-full rounded-full border border-electric-cyan/20 bg-electric-cyan/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-electric-cyan">
                                        {item.value}
                                    </div>
                                </div>
                                <div className={`mt-3 leading-relaxed text-gray-400 break-words ${isMobile ? 'text-[12px]' : 'text-sm'}`}>{item.detail}</div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'jobs' && (
                    <div className="panel-scrollbar h-full overflow-y-auto overflow-x-hidden pr-1 space-y-3">
                        {displayJobs.map((job) => {
                            const meta = getStatus(job.status);

                            return (
                                <div key={job.id} className={`min-w-0 rounded-2xl border border-white/10 bg-black/25 ${isMobile ? 'p-3.5' : 'p-4'}`}>
                                    <div className="flex min-w-0 flex-col items-start gap-2">
                                        <div className="min-w-0 break-words text-sm font-semibold leading-snug text-white">{job.label}</div>
                                        <div className={`inline-flex w-fit shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] ${meta.className}`}>
                                            {meta.label}
                                        </div>
                                    </div>
                                    <div className="mt-3 text-[10px] font-mono uppercase tracking-[0.18em] text-gray-500">{formatRelative(job.at)}</div>
                                    <div className={`mt-2 break-words leading-relaxed text-gray-400 ${isMobile ? 'text-[12px]' : 'text-sm'}`}>{job.detail}</div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function ExecutionInspectorPanel({ runs, selectedRun, onSelectRun, isMobile = false }) {
    const [activeTab, setActiveTab] = useState('queue');

    return (
        <div className={`rounded-3xl border border-white/10 bg-white/[0.03] p-6 flex flex-col overflow-hidden ${isMobile ? 'h-[584px]' : 'h-[620px]'}`}>
            <div className={`flex gap-4 ${isMobile ? 'flex-col items-start' : 'items-center justify-between'}`}>
                <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric-green">Execution Inspector</div>
                    <h3 className={`mt-2 font-bold text-white ${isMobile ? 'max-w-[10rem] text-[1.72rem] leading-[0.98]' : 'text-2xl'}`}>Observed executions</h3>
                </div>
                <div className={`inline-flex items-center gap-2 rounded-full border border-electric-green/20 bg-electric-green/10 font-mono uppercase tracking-[0.18em] text-electric-green ${isMobile ? 'self-start px-2.5 py-1 text-[9px]' : 'px-3 py-1 text-[10px]'}`}>
                    <Waves className="h-3 w-3" />
                    Browser Telemetry
                </div>
            </div>

            <div className={`grid grid-cols-2 gap-2 ${isMobile ? 'mt-4' : 'mt-5'}`}>
                <PanelPillButton active={activeTab === 'queue'} onClick={() => setActiveTab('queue')}>Run Queue</PanelPillButton>
                <PanelPillButton active={activeTab === 'lifecycle'} onClick={() => setActiveTab('lifecycle')}>Lifecycle</PanelPillButton>
            </div>

            <div className={`${isMobile ? 'mt-4' : 'mt-5'} min-h-0 flex-1`}>
                {activeTab === 'queue' && (
                    <div className={`min-h-0 h-full rounded-2xl border border-white/10 bg-black/25 flex flex-col overflow-hidden ${isMobile ? 'p-3.5' : 'p-4'}`}>
                        <div className="flex items-center justify-between gap-3">
                            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-electric-cyan">Run Queue</div>
                            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-gray-500">{runs.length} observed</div>
                        </div>
                        <div className={`flex items-center justify-between gap-3 border-b border-white/10 pb-2 ${isMobile ? 'mt-2' : 'mt-3'}`}>
                            <div className="min-w-0 text-xs leading-relaxed text-electric-cyan">
                                {isMobile ? 'Tap any run card to inspect it.' : 'Click a run here. Then open Lifecycle or inspect the trace below.'}
                            </div>
                            <div className="shrink-0 rounded-full border border-electric-cyan/20 bg-electric-cyan/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.16em] text-electric-cyan">
                                Interactive
                            </div>
                        </div>
                        <div className={`panel-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden ${isMobile ? 'mt-2.5 pl-1 pr-2.5' : 'mt-4 pr-1'} space-y-2.5`}>
                            {runs.length ? runs.map((run) => {
                                const meta = getStatus(run.status);
                                const Icon = channelMeta[run.channel]?.icon || Sparkles;
                                const isActive = selectedRun?.id === run.id;

                                return (
                                    <button
                                        key={run.id}
                                        type="button"
                                        onClick={() => onSelectRun(run.id)}
                                        aria-pressed={isActive}
                                        className={`w-full rounded-2xl border text-left transition-[border-color,background-color,transform,box-shadow] cursor-pointer ${isMobile ? 'p-2.5' : 'p-4'} ${isActive
                                            ? 'border-electric-green/35 bg-electric-green/[0.08] shadow-[0_0_0_1px_rgba(0,255,153,0.08)]'
                                            : 'border-white/10 bg-black/30 hover:border-electric-cyan/25 hover:bg-white/[0.04]'}`}
                                    >
                                        {isMobile ? (
                                            <div className="flex min-w-0 gap-2.5">
                                                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                                                    <Icon className="h-3.5 w-3.5 text-electric-cyan" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0 flex-1">
                                                            <div
                                                                className="text-[0.92rem] font-semibold leading-[1.12] text-white"
                                                                style={{
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 2,
                                                                    WebkitBoxOrient: 'vertical',
                                                                    overflow: 'hidden',
                                                                }}
                                                            >
                                                                {run.title}
                                                            </div>
                                                        </div>
                                                        <div className="flex shrink-0 items-center gap-1.5">
                                                            <div className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[8px] font-mono uppercase tracking-[0.14em] ${meta.className}`}>
                                                                {meta.label}
                                                            </div>
                                                            <ChevronRight className={`h-3 w-3 transition-transform ${isActive ? 'translate-x-0 text-electric-green' : 'text-gray-500'}`} />
                                                        </div>
                                                    </div>
                                                    <div className="mt-1.5 flex items-center justify-between gap-2">
                                                        <div className="min-w-0 text-[8px] font-mono uppercase tracking-[0.16em] text-gray-500">
                                                            {channelMeta[run.channel]?.label || run.channel}
                                                        </div>
                                                        {isActive && <span className="shrink-0 text-[8px] font-mono uppercase tracking-[0.16em] text-electric-green">Selected</span>}
                                                    </div>
                                                    <div
                                                        className="mt-2 text-[12px] leading-[1.25] text-gray-300 break-words"
                                                        style={{
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 1,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                        }}
                                                    >
                                                        {run.inputExcerpt || run.outputExcerpt || 'No preview captured.'}
                                                    </div>
                                                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[8px] font-mono uppercase tracking-[0.14em] text-gray-500">
                                                        <span>{formatMs(run.latencyMs)}</span>
                                                        <span>{formatRelative(run.completedAt || run.startedAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex min-w-0 flex-1 gap-2.5">
                                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                                                        <Icon className="h-3.5 w-3.5 text-electric-cyan" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <div className="text-base font-semibold text-white">
                                                                    {run.title}
                                                                </div>
                                                                <div className="mt-1 text-[9px] font-mono uppercase tracking-[0.16em] text-gray-500">
                                                                    {channelMeta[run.channel]?.label || run.channel}
                                                                </div>
                                                            </div>
                                                            <div className="flex shrink-0 items-center gap-2">
                                                                <div className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[9px] font-mono uppercase tracking-[0.16em] ${meta.className}`}>
                                                                    {meta.label}
                                                                </div>
                                                                <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isActive ? 'translate-x-0 text-electric-green' : 'text-gray-500'}`} />
                                                            </div>
                                                        </div>
                                                        <div
                                                            className="mt-2.5 text-sm leading-relaxed text-gray-300 break-words"
                                                            style={{
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: 'vertical',
                                                                overflow: 'hidden',
                                                            }}
                                                        >
                                                            {run.inputExcerpt || run.outputExcerpt || 'No preview captured.'}
                                                        </div>
                                                        <div className="mt-2.5 flex flex-wrap items-center gap-2.5 text-[9px] font-mono uppercase tracking-[0.16em] text-gray-500">
                                                            <span>{formatMs(run.latencyMs)}</span>
                                                            <span>{formatRelative(run.completedAt || run.startedAt)}</span>
                                                            {isActive && <span className="text-electric-green">Selected</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                );
                            }) : (
                                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-5 text-sm leading-relaxed text-gray-500">
                                    The session log will populate as soon as someone uses the terminal, generates an architect brief, or sends the contact form.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'lifecycle' && (
                    <div className={`min-h-0 h-full rounded-2xl border border-white/10 bg-black/25 flex flex-col overflow-hidden ${isMobile ? 'p-3.5' : 'p-4'}`}>
                        <div className="flex items-center justify-between gap-3">
                            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-electric-cyan">Request Lifecycle</div>
                            <Workflow className="h-4 w-4 text-electric-cyan" />
                        </div>

                        {selectedRun ? (
                            <>
                                <div className={`shrink-0 rounded-2xl border border-white/10 bg-[#0a0b0f] ${isMobile ? 'mt-3 p-3.5' : 'mt-4 p-4'}`}>
                                    <div className="text-base font-semibold text-white">{selectedRun.title}</div>
                                    <div className={`mt-2 leading-relaxed text-gray-400 break-words ${isMobile ? 'text-[13px]' : 'text-sm'}`}>{selectedRun.decision || selectedRun.outputExcerpt || 'Awaiting details.'}</div>
                                    <div className="mt-4 flex flex-wrap gap-4 text-[10px] font-mono uppercase tracking-[0.18em] text-gray-500">
                                        <span>{channelMeta[selectedRun.channel]?.label || selectedRun.channel}</span>
                                        <span>{formatMs(selectedRun.latencyMs)}</span>
                                        <span>{formatRelative(selectedRun.completedAt || selectedRun.startedAt)}</span>
                                    </div>
                                </div>
                                <div className={`panel-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1 space-y-4 ${isMobile ? 'mt-3' : 'mt-4'}`}>
                                    {(selectedRun.steps || []).map((step, index) => (
                                        <div key={`${selectedRun.id}-${step.key}`} className="flex gap-4">
                                            <div className="flex flex-col items-center pt-1">
                                                <div className={`h-3 w-3 rounded-full ${step.state === 'complete' ? 'bg-electric-green shadow-[0_0_14px_rgba(0,255,153,0.35)]' : step.state === 'error' ? 'bg-red-400' : 'bg-electric-cyan shadow-[0_0_14px_rgba(0,224,255,0.35)]'}`} />
                                                {index < selectedRun.steps.length - 1 && <div className="mt-2 w-px flex-1 bg-white/10" />}
                                            </div>
                                            <div className="pb-4 min-w-0">
                                                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">{step.label}</div>
                                                <div className={`mt-2 leading-relaxed text-white break-words ${isMobile ? 'text-[13px]' : 'text-sm'}`}>{step.detail}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className={`flex min-h-0 flex-1 items-center rounded-2xl border border-dashed border-white/10 bg-black/20 text-gray-500 ${isMobile ? 'mt-3 p-4 text-[13px]' : 'mt-4 p-5 text-sm'}`}>
                                Select a session run in Run Queue to inspect its lifecycle here.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function AgentTracePanel({ selectedRun, isMobile = false }) {
    return (
        <div className={`rounded-3xl border border-white/10 bg-white/[0.03] p-5 flex flex-col overflow-hidden ${isMobile ? 'h-[680px]' : 'h-[560px]'}`}>
            <div className="flex items-center justify-between gap-4">
                <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric-green">Agent Trace</div>
                    <h3 className="mt-1.5 text-2xl font-bold text-white">Prompt and raw output</h3>
                </div>
                <Sparkles className="h-5 w-5 text-electric-green" />
            </div>
            <div className="mt-3 min-h-0 flex-1">
                <RunTracePanel run={selectedRun} isMobile={isMobile} />
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
    const [runtimeTab, setRuntimeTab] = useState('latency');
    const [mobileView, setMobileView] = useState('overview');
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

    useEffect(() => {
        if (!isOpen) return;
        setRuntimeTab('latency');
        if (isMobileSheet) {
            setMobileView('overview');
        }
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
                                            {isMobileSheet && (
                                                <div className="grid grid-cols-3 gap-2">
                                                    <PanelPillButton active={mobileView === 'overview'} onClick={() => setMobileView('overview')}>Overview</PanelPillButton>
                                                    <PanelPillButton active={mobileView === 'runs'} onClick={() => setMobileView('runs')}>Runs</PanelPillButton>
                                                    <PanelPillButton active={mobileView === 'trace'} onClick={() => setMobileView('trace')}>Trace</PanelPillButton>
                                                </div>
                                            )}

                                            <div className={isMobileSheet ? 'mt-6 space-y-6' : 'space-y-6'}>
                                                {(!isMobileSheet || mobileView === 'overview') && (
                                                    <ControlPanelSummaryStrip summary={summary} />
                                                )}

                                                {!isMobileSheet ? (
                                                    <>
                                                        <LazyPanelBlock
                                                            root={scrollRoot}
                                                            eager
                                                            minHeight={440}
                                                            skeleton={<BlockSkeleton title="Backend signals" minHeight={440} />}
                                                        >
                                                            <ServiceGridPanel services={services} />
                                                        </LazyPanelBlock>

                                                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(320px,0.92fr)_minmax(0,1.08fr)] xl:items-start">
                                                            <LazyPanelBlock
                                                                root={scrollRoot}
                                                                eager
                                                                minHeight={620}
                                                                skeleton={<BlockSkeleton title="Runtime activity" minHeight={620} />}
                                                            >
                                                                <RuntimeActivityPanel
                                                                    activeTab={runtimeTab}
                                                                    onTabChange={setRuntimeTab}
                                                                    latencyTrace={latencyTrace}
                                                                    latestLatencyPoint={latestLatencyPoint}
                                                                    hottestLatencyPoint={hottestLatencyPoint}
                                                                    maxLatency={maxLatency}
                                                                    displayJobs={displayJobs}
                                                                    capabilities={backend?.capabilities || []}
                                                                />
                                                            </LazyPanelBlock>

                                                            <LazyPanelBlock
                                                                root={scrollRoot}
                                                                eager
                                                                minHeight={620}
                                                                skeleton={<BlockSkeleton title="Execution inspector" minHeight={620} />}
                                                            >
                                                                <ExecutionInspectorPanel
                                                                    runs={runs}
                                                                    selectedRun={selectedRun}
                                                                    onSelectRun={setSelectedRunId}
                                                                />
                                                            </LazyPanelBlock>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        {mobileView === 'overview' && (
                                                            <>
                                                                <LazyPanelBlock
                                                                    root={scrollRoot}
                                                                    eager
                                                                    minHeight={476}
                                                                    skeleton={<BlockSkeleton title="Backend signals" minHeight={476} />}
                                                                >
                                                                    <ServiceGridPanel services={services} isMobile />
                                                                </LazyPanelBlock>

                                                                <LazyPanelBlock
                                                                    root={scrollRoot}
                                                                    eager
                                                                    minHeight={470}
                                                                    skeleton={<BlockSkeleton title="Runtime activity" minHeight={470} />}
                                                                >
                                                                    <RuntimeActivityPanel
                                                                        isMobile
                                                                        activeTab={runtimeTab}
                                                                        onTabChange={setRuntimeTab}
                                                                        latencyTrace={latencyTrace}
                                                                        latestLatencyPoint={latestLatencyPoint}
                                                                        hottestLatencyPoint={hottestLatencyPoint}
                                                                        maxLatency={maxLatency}
                                                                        displayJobs={displayJobs}
                                                                        capabilities={backend?.capabilities || []}
                                                                    />
                                                                </LazyPanelBlock>
                                                            </>
                                                        )}

                                                        {mobileView === 'runs' && (
                                                            <LazyPanelBlock
                                                                root={scrollRoot}
                                                                eager
                                                                minHeight={584}
                                                                skeleton={<BlockSkeleton title="Execution inspector" minHeight={584} />}
                                                            >
                                                                <ExecutionInspectorPanel
                                                                    runs={runs}
                                                                    selectedRun={selectedRun}
                                                                    onSelectRun={setSelectedRunId}
                                                                    isMobile
                                                                />
                                                            </LazyPanelBlock>
                                                        )}
                                                    </>
                                                )}

                                                {(!isMobileSheet || mobileView === 'trace') && (
                                                    <LazyPanelBlock
                                                        root={scrollRoot}
                                                        eager={isMobileSheet}
                                                        minHeight={isMobileSheet ? 680 : 560}
                                                        skeleton={<BlockSkeleton title="Agent trace" minHeight={isMobileSheet ? 680 : 560} />}
                                                    >
                                                        <AgentTracePanel selectedRun={selectedRun} isMobile={isMobileSheet} />
                                                    </LazyPanelBlock>
                                                )}
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
