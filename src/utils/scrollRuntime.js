const listeners = new Set();

let snapshot = null;
let rafId = null;
let isBound = false;

function readSnapshot() {
    if (typeof window === 'undefined') {
        return {
            scrollY: 0,
            width: 0,
            height: 0,
            documentHeight: 0,
            timestamp: 0,
        };
    }

    return {
        scrollY: window.scrollY,
        width: window.innerWidth,
        height: window.innerHeight,
        documentHeight: document.documentElement.scrollHeight,
        timestamp: performance.now(),
    };
}

function ensureSnapshot() {
    if (!snapshot) {
        snapshot = readSnapshot();
    }

    return snapshot;
}

function flush() {
    rafId = null;
    snapshot = readSnapshot();

    listeners.forEach((listener) => {
        listener(snapshot);
    });
}

function queue() {
    if (typeof window === 'undefined' || rafId !== null) {
        return;
    }

    rafId = window.requestAnimationFrame(flush);
}

function bind() {
    if (typeof window === 'undefined' || isBound) {
        return;
    }

    snapshot = readSnapshot();

    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    document.addEventListener('visibilitychange', queue);

    isBound = true;
}

function unbind() {
    if (!isBound || typeof window === 'undefined' || listeners.size) {
        return;
    }

    window.removeEventListener('scroll', queue);
    window.removeEventListener('resize', queue);
    document.removeEventListener('visibilitychange', queue);

    if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
    }

    isBound = false;
}

export function getScrollRuntimeSnapshot() {
    return ensureSnapshot();
}

export function requestScrollRuntimeFrame() {
    queue();
    return ensureSnapshot();
}

export function subscribeScrollRuntime(listener, { immediate = true } = {}) {
    if (typeof window === 'undefined') {
        return () => {};
    }

    listeners.add(listener);
    bind();

    if (immediate) {
        listener(ensureSnapshot());
    }

    return () => {
        listeners.delete(listener);
        unbind();
    };
}

export function isElementNearViewport(element, runtimeSnapshot, marginPx = 0) {
    if (!element) {
        return false;
    }

    const currentSnapshot = runtimeSnapshot || ensureSnapshot();
    const rect = element.getBoundingClientRect();

    return rect.bottom >= -marginPx && rect.top <= currentSnapshot.height + marginPx;
}
