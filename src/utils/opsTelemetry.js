const STORAGE_KEY = 'amedina_ops_telemetry_v1';
const MAX_RUNS = 24;

function getDefaultState() {
    return {
        runs: [],
        updatedAt: null,
    };
}

function readRaw() {
    if (typeof window === 'undefined') return getDefaultState();

    try {
        const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
        if (!parsed || !Array.isArray(parsed.runs)) return getDefaultState();
        return {
            runs: parsed.runs.slice(0, MAX_RUNS),
            updatedAt: parsed.updatedAt || null,
        };
    } catch {
        return getDefaultState();
    }
}

function emit(state) {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('ops-telemetry-updated', { detail: state }));
}

function persist(state) {
    if (typeof window === 'undefined') return state;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    emit(state);
    return state;
}

function clampText(value, max = 180) {
    if (typeof value !== 'string') return '';
    return value.trim().replace(/\s+/g, ' ').slice(0, max);
}

export function getOpsTelemetry() {
    return readRaw();
}

export function clearOpsTelemetry() {
    return persist(getDefaultState());
}

export function recordOpsRun(run) {
    const current = readRaw();
    const nextRun = {
        id: run.id || `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
        channel: run.channel || 'session',
        title: run.title || 'Session Run',
        status: run.status || 'success',
        startedAt: run.startedAt || new Date().toISOString(),
        completedAt: run.completedAt || new Date().toISOString(),
        latencyMs: typeof run.latencyMs === 'number' ? run.latencyMs : null,
        inputExcerpt: clampText(run.inputExcerpt || run.input || ''),
        outputExcerpt: clampText(run.outputExcerpt || run.output || ''),
        decision: clampText(run.decision || '', 120),
        approval: clampText(run.approval || '', 120),
        retries: Number.isFinite(run.retries) ? run.retries : 0,
        tools: Array.isArray(run.tools) ? run.tools.slice(0, 6) : [],
        steps: Array.isArray(run.steps) ? run.steps.slice(0, 8) : [],
    };

    return persist({
        runs: [nextRun, ...current.runs].slice(0, MAX_RUNS),
        updatedAt: new Date().toISOString(),
    });
}

export function subscribeOpsTelemetry(callback) {
    if (typeof window === 'undefined') {
        return () => {};
    }

    const handleUpdate = (event) => {
        callback(event.detail || readRaw());
    };

    const handleStorage = (event) => {
        if (event.key === STORAGE_KEY) {
            callback(readRaw());
        }
    };

    window.addEventListener('ops-telemetry-updated', handleUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
        window.removeEventListener('ops-telemetry-updated', handleUpdate);
        window.removeEventListener('storage', handleStorage);
    };
}
