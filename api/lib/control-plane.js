const MAX_RUNS = 12;
const runtimeStartedAt = Date.now();

const services = new Map([
    ['chat-api', {
        id: 'chat-api',
        label: 'Terminal Agent API',
        category: 'api',
        status: process.env.GROQ_API_KEY ? 'operational' : 'offline',
        latencyMs: null,
        lastEventAt: null,
        note: process.env.GROQ_API_KEY ? 'Edge route armed and ready for terminal orchestration.' : 'Provider key missing. Terminal agent cannot answer.',
    }],
    ['architect-api', {
        id: 'architect-api',
        label: 'Project Architect API',
        category: 'api',
        status: process.env.GROQ_API_KEY ? 'operational' : 'offline',
        latencyMs: null,
        lastEventAt: null,
        note: process.env.GROQ_API_KEY ? 'Architecture generation route is ready for intake requests.' : 'Provider key missing. Architect cannot generate briefs.',
    }],
    ['groq-provider', {
        id: 'groq-provider',
        label: 'Groq Inference Provider',
        category: 'integration',
        status: process.env.GROQ_API_KEY ? 'operational' : 'offline',
        latencyMs: null,
        lastEventAt: null,
        note: process.env.GROQ_API_KEY ? 'Provider credentials loaded. Awaiting live inference traffic.' : 'Provider credentials not configured.',
    }],
    ['github-sync', {
        id: 'github-sync',
        label: 'GitHub Activity Sync',
        category: 'integration',
        status: process.env.GITHUB_TOKEN ? 'operational' : 'degraded',
        latencyMs: null,
        lastEventAt: null,
        note: process.env.GITHUB_TOKEN ? 'Authenticated sync path available for repo telemetry.' : 'Running in public GitHub mode with lower rate-limit headroom.',
    }],
]);

const runs = [];
const counters = {
    total: 0,
    succeeded: 0,
    failed: 0,
};

const RUN_TEMPLATES = {
    terminal: [
        { key: 'ingress', label: 'REQUEST ENTERS', detail: 'Terminal command accepted by the edge function.' },
        { key: 'validation', label: 'VALIDATION', detail: 'Input and recent conversation context are sanitized.' },
        { key: 'context', label: 'CONTEXT HYDRATION', detail: 'Portfolio context and live GitHub activity are assembled.' },
        { key: 'inference', label: 'AGENT REASONING', detail: 'The model decides the response and any UI action.' },
        { key: 'action', label: 'ACTION RESOLUTION', detail: 'The requested scroll or link intent is normalized safely.' },
        { key: 'response', label: 'RESPONSE', detail: 'A final terminal-safe payload is returned to the client.' },
    ],
    architect: [
        { key: 'ingress', label: 'REQUEST ENTERS', detail: 'Architect intake request accepted by the edge function.' },
        { key: 'validation', label: 'VALIDATION', detail: 'Brief and selectors are normalized into safe backend input.' },
        { key: 'context', label: 'INTAKE RESOLUTION', detail: 'Project shape, scope, timeline, and constraints are resolved.' },
        { key: 'inference', label: 'ARCHITECT REASONING', detail: 'The model drafts the architecture brief and delivery strategy.' },
        { key: 'action', label: 'SCHEMA CHECK', detail: 'The response is validated before any output is trusted.' },
        { key: 'response', label: 'RESPONSE', detail: 'A structured architecture brief is returned to the interface.' },
    ],
};

function nowIso() {
    return new Date().toISOString();
}

function clamp(value, max = 160) {
    if (typeof value !== 'string') return '';
    return value.trim().replace(/\s+/g, ' ').slice(0, max);
}

function getRunTemplate(channel) {
    return RUN_TEMPLATES[channel] || RUN_TEMPLATES.terminal;
}

function markNextStepRunning(run, fromIndex) {
    const nextIndex = run.steps.findIndex((step, index) => index > fromIndex && step.state === 'pending');
    if (nextIndex !== -1) {
        run.steps[nextIndex] = {
            ...run.steps[nextIndex],
            state: 'running',
        };
    }
}

export function createRun({ channel, title, input, tools = [] }) {
    const startedAt = nowIso();
    const run = {
        id: `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        channel,
        title,
        status: 'running',
        startedAt,
        completedAt: null,
        latencyMs: null,
        inputExcerpt: clamp(input, 180),
        outputExcerpt: '',
        decision: '',
        approval: '',
        retries: 0,
        tools,
        trace: null,
        steps: getRunTemplate(channel).map((step, index) => ({
            ...step,
            state: index === 0 ? 'running' : 'pending',
            at: index === 0 ? startedAt : null,
        })),
    };

    runs.unshift(run);
    if (runs.length > MAX_RUNS) {
        runs.length = MAX_RUNS;
    }

    counters.total += 1;
    return run.id;
}

export function completeStep(runId, stepKey, detail) {
    const run = runs.find((entry) => entry.id === runId);
    if (!run) return;

    const stepIndex = run.steps.findIndex((step) => step.key === stepKey);
    if (stepIndex === -1) return;

    run.steps[stepIndex] = {
        ...run.steps[stepIndex],
        state: 'complete',
        detail: detail || run.steps[stepIndex].detail,
        at: nowIso(),
    };

    markNextStepRunning(run, stepIndex);
}

export function attachRunTrace(runId, trace) {
    const run = runs.find((entry) => entry.id === runId);
    if (!run) return;
    run.trace = trace || null;
}

export function failRun(runId, { message, decision, retries = 0, approval = 'Failed before approval' } = {}) {
    const run = runs.find((entry) => entry.id === runId);
    if (!run) return;

    const activeIndex = run.steps.findIndex((step) => step.state === 'running');
    if (activeIndex !== -1) {
        run.steps[activeIndex] = {
            ...run.steps[activeIndex],
            state: 'error',
            detail: message || run.steps[activeIndex].detail,
            at: nowIso(),
        };
    }

    run.status = 'error';
    run.completedAt = nowIso();
    run.latencyMs = Math.max(1, Date.parse(run.completedAt) - Date.parse(run.startedAt));
    run.outputExcerpt = clamp(message || 'Request failed before a valid response could be returned.', 180);
    run.decision = decision || 'Runtime failure';
    run.approval = approval;
    run.retries = retries;

    counters.failed += 1;
}

export function finishRun(runId, { output, decision, approval, retries = 0, tools } = {}) {
    const run = runs.find((entry) => entry.id === runId);
    if (!run) return;

    const activeIndex = run.steps.findIndex((step) => step.state === 'running');
    if (activeIndex !== -1) {
        run.steps[activeIndex] = {
            ...run.steps[activeIndex],
            state: 'complete',
            at: nowIso(),
        };
        markNextStepRunning(run, activeIndex);
    }

    const responseStepIndex = run.steps.findIndex((step) => step.key === 'response');
    if (responseStepIndex !== -1) {
        run.steps[responseStepIndex] = {
            ...run.steps[responseStepIndex],
            state: 'complete',
            at: nowIso(),
        };
    }

    run.status = 'success';
    run.completedAt = nowIso();
    run.latencyMs = Math.max(1, Date.parse(run.completedAt) - Date.parse(run.startedAt));
    run.outputExcerpt = clamp(output, 180);
    run.decision = clamp(decision, 120);
    run.approval = clamp(approval, 120);
    run.retries = retries;
    if (Array.isArray(tools) && tools.length) {
        run.tools = tools;
    }

    counters.succeeded += 1;
}

export function recordServiceProbe(serviceId, patch = {}) {
    const previous = services.get(serviceId);
    if (!previous) return;

    services.set(serviceId, {
        ...previous,
        ...patch,
        lastEventAt: patch.lastEventAt || nowIso(),
    });
}

export function getControlPlaneSnapshot() {
    const totalCompleted = counters.succeeded + counters.failed;
    const latestRun = runs[0] || null;
    const latestJobAt = [
        latestRun?.completedAt,
        ...Array.from(services.values()).map((service) => service.lastEventAt),
    ].filter(Boolean).sort().reverse()[0] || null;

    return {
        snapshotAt: nowIso(),
        runtime: {
            workerUptimeMs: Date.now() - runtimeStartedAt,
            totalRuns: counters.total,
            successfulRuns: counters.succeeded,
            failedRuns: counters.failed,
            successRate: totalCompleted ? Math.round((counters.succeeded / totalCompleted) * 100) : 100,
            latestJobAt,
        },
        services: Array.from(services.values()),
        runLogs: runs.map((run) => ({ ...run })),
        latestLifecycle: latestRun?.steps || [],
    };
}
