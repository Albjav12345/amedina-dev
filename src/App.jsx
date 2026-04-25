import React, { useEffect, useLayoutEffect, Suspense, useRef, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import Lenis from 'lenis'
import { isArchitectSectionEnabled } from './config/siteFeatures'
import portfolioData from './data/portfolio'

// Eagerly loaded critical components for instant LCP/FCP
import Hero from './components/sections/Hero'
import Navbar from './components/layout/Navbar'
import ParallaxGrid from './components/common/ParallaxGrid'
import {
    DEFAULT_SECTION_ID,
    SECTION_IDS,
    SECTION_NAVIGATION_EVENT,
    dispatchSectionActiveLock,
    dispatchVisibleSection,
    getActiveSectionId,
    getSectionElement,
    getPathnameForSection,
    getSectionIdFromPathname,
    getSectionScrollY,
    isSectionId,
    normalizePathname,
} from './utils/sectionRouting'
import { subscribeScrollRuntime } from './utils/scrollRuntime'

// Safe Lazy Loading for Named Exports
// Pattern: React.lazy(() => import('path').then(module => ({ default: module.ComponentByName })))

const loadAboutModule = () => import('./components/sections/About')
const loadFeaturedProjectsModule = () => import('./components/sections/FeaturedProjects')
const loadTechStackModule = () => import('./components/sections/TechStack')
const loadContactModule = () => import('./components/sections/Contact')
const loadProjectArchitectModule = () => import('./components/sections/ProjectArchitect')

const About = React.lazy(() =>
    loadAboutModule().then(module => ({ default: module.About }))
)

const FeaturedProjects = React.lazy(() =>
    loadFeaturedProjectsModule().then(module => ({ default: module.FeaturedProjects }))
)

const TechStack = React.lazy(() =>
    loadTechStackModule().then(module => ({ default: module.TechStack }))
)

const Contact = React.lazy(() =>
    loadContactModule().then(module => ({ default: module.Contact }))
)

const ProjectArchitect = isArchitectSectionEnabled
    ? React.lazy(() =>
        loadProjectArchitectModule().then(module => ({ default: module.ProjectArchitect }))
    )
    : null

const ControlPlane = React.lazy(() =>
    import('./components/sections/ControlPlane').then(module => ({ default: module.ControlPlane }))
)

const Footer = React.lazy(() =>
    import('./components/layout/Footer').then(module => ({ default: module.Footer }))
)

const SECTION_HEIGHT_CACHE_KEY = 'amedina.section-heights.v2'
const ROUTE_RESTORE_DEADLINE_MS = 2400
const ROUTE_RESTORE_LAYOUT_SETTLE_MS = 140

const DEFAULT_SECTION_WRAPPER_HEIGHTS = {
    desktop: {
        about: 1460,
        projects: 1480,
        'tech-stack': 1180,
        architect: 1720,
        contact: 980,
    },
    mobile: {
        about: 1980,
        projects: 1180,
        'tech-stack': 1560,
        architect: 2180,
        contact: 1260,
    },
}

const SECTION_WRAPPER_IDS = SECTION_IDS.filter((sectionId) => sectionId !== DEFAULT_SECTION_ID)

function createInactiveNavigationLock() {
    return {
        active: false,
        targetId: DEFAULT_SECTION_ID,
        targetY: 0,
        expiresAt: 0,
    }
}

function createIdleRouteRestoreState() {
    return {
        active: false,
        targetId: DEFAULT_SECTION_ID,
        startedAt: 0,
        deadline: 0,
        lastChangeAt: 0,
        lastTargetY: null,
        rafId: null,
        observer: null,
    }
}

function isEditableTarget(target) {
    return target instanceof HTMLElement
        && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
}

function isScrollCancelKey(event) {
    return [' ', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(event.key)
}

function getViewportBucket() {
    if (typeof window === 'undefined') {
        return 'desktop'
    }

    return window.innerWidth >= 1024 ? 'desktop' : 'mobile'
}

function readSectionHeightCache(bucket) {
    if (typeof window === 'undefined') {
        return DEFAULT_SECTION_WRAPPER_HEIGHTS[bucket]
    }

    try {
        const raw = window.sessionStorage.getItem(SECTION_HEIGHT_CACHE_KEY)
        if (!raw) {
            return DEFAULT_SECTION_WRAPPER_HEIGHTS[bucket]
        }

        const parsed = JSON.parse(raw)
        return {
            ...DEFAULT_SECTION_WRAPPER_HEIGHTS[bucket],
            ...(parsed?.[bucket] || {}),
        }
    } catch {
        return DEFAULT_SECTION_WRAPPER_HEIGHTS[bucket]
    }
}

function writeSectionHeightCache(bucket, nextHeights) {
    if (typeof window === 'undefined') {
        return
    }

    try {
        const raw = window.sessionStorage.getItem(SECTION_HEIGHT_CACHE_KEY)
        const parsed = raw ? JSON.parse(raw) : {}
        const nextCache = {
            ...parsed,
            [bucket]: nextHeights,
        }

        window.sessionStorage.setItem(SECTION_HEIGHT_CACHE_KEY, JSON.stringify(nextCache))
    } catch {
        // Ignore storage write failures.
    }
}

function getSectionMeasurementElement(sectionId) {
    if (typeof document === 'undefined') {
        return null
    }

    return document.getElementById(sectionId) || getSectionElement(sectionId)
}

function isSectionContentReady(sectionId) {
    if (typeof document === 'undefined') {
        return false
    }

    const sectionElement = document.getElementById(sectionId)
    if (!sectionElement) {
        return false
    }

    return sectionElement.getBoundingClientRect().height > 48
}

function performWindowScroll(top, { instant = false } = {}) {
    if (typeof window === 'undefined') {
        return
    }

    if (!instant) {
        window.scrollTo({
            top,
            behavior: 'smooth',
        })
        return
    }

    const html = document.documentElement
    const body = document.body
    const previousHtmlBehavior = html.style.scrollBehavior
    const previousBodyBehavior = body.style.scrollBehavior

    html.style.scrollBehavior = 'auto'
    body.style.scrollBehavior = 'auto'
    window.scrollTo(0, top)

    window.requestAnimationFrame(() => {
        html.style.scrollBehavior = previousHtmlBehavior
        body.style.scrollBehavior = previousBodyBehavior
    })
}


function App() {
    const initialViewportBucket = getViewportBucket()
    const initialSectionId = (
        typeof window !== 'undefined'
            ? (getSectionIdFromPathname(window.location.pathname) || DEFAULT_SECTION_ID)
            : DEFAULT_SECTION_ID
    )
    const initialSectionIdRef = useRef(
        initialSectionId,
    )
    const [isControlOpen, setIsControlOpen] = useState(false);
    const [isControlUiLocked, setIsControlUiLocked] = useState(false);
    const [viewportBucket, setViewportBucket] = useState(initialViewportBucket)
    const [sectionWrapperHeights, setSectionWrapperHeights] = useState(() => readSectionHeightCache(initialViewportBucket))
    const [mountedSectionMap, setMountedSectionMap] = useState(() =>
        SECTION_WRAPPER_IDS.reduce((acc, sectionId) => {
            acc[sectionId] = typeof document !== 'undefined' && Boolean(document.getElementById(sectionId))
            return acc
        }, {}),
    )
    const lenisRef = useRef(null);
    const lenisRafRef = useRef(null);
    const isControlOpenRef = useRef(false);
    const activeSectionRef = useRef(DEFAULT_SECTION_ID);
    const navigationLockRef = useRef(createInactiveNavigationLock());
    const routeRestoreRef = useRef(createIdleRouteRestoreState());
    const currentRuntimeGeneratedAtRef = useRef(portfolioData.meta.generatedAt ?? null)

    const syncPathname = (sectionId, historyMode = 'replace') => {
        if (typeof window === 'undefined' || historyMode === 'preserve' || !isSectionId(sectionId)) {
            return;
        }

        const nextPathname = getPathnameForSection(sectionId);
        const currentPathname = normalizePathname(window.location.pathname);

        if (currentPathname === nextPathname) {
            return;
        }

        const nextState = {
            ...(window.history.state || {}),
            sectionId,
        };

        if (historyMode === 'push') {
            window.history.pushState(nextState, '', nextPathname);
            return;
        }

        window.history.replaceState(nextState, '', nextPathname);
    };

    const commitActiveSection = (sectionId, historyMode = 'replace') => {
        if (!isSectionId(sectionId)) {
            return;
        }

        const previousSectionId = activeSectionRef.current;
        activeSectionRef.current = sectionId;
        syncPathname(sectionId, historyMode);

        if (previousSectionId !== sectionId) {
            dispatchVisibleSection(sectionId);
        }
    };

    const navigateToSection = (sectionId, { historyMode = 'push', behavior = 'smooth' } = {}) => {
        const targetSectionId = isSectionId(sectionId) ? sectionId : DEFAULT_SECTION_ID;
        const targetY = getSectionScrollY(targetSectionId);

        if (targetY === null) {
            return;
        }

        const isImmediate = behavior === 'instant';

        navigationLockRef.current = {
            active: true,
            targetId: targetSectionId,
            targetY,
            expiresAt: Date.now() + (isImmediate ? 650 : 1800),
        };

        commitActiveSection(targetSectionId, historyMode);

        if (lenisRef.current) {
            lenisRef.current.scrollTo(targetY, {
                immediate: isImmediate,
                duration: isImmediate ? undefined : 1.35,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                force: true,
            });
            return;
        }

        performWindowScroll(targetY, { instant: isImmediate });
    };

    const openControlPanel = () => {
        setIsControlUiLocked(true)
        setIsControlOpen(true)
    }

    const closeControlPanel = () => {
        setIsControlOpen(false)
    }

    const handleControlPanelExitComplete = () => {
        setIsControlUiLocked(false)
    }

    const clearNavigationLock = () => {
        navigationLockRef.current = createInactiveNavigationLock()
    }

    const shouldRestoreSectionRoute = (sectionId, behavior = 'instant') => {
        if (!isSectionId(sectionId) || sectionId === DEFAULT_SECTION_ID) {
            return false
        }

        return behavior === 'instant' || !isSectionContentReady(sectionId)
    }

    const stopRouteRestore = () => {
        const pendingRestore = routeRestoreRef.current;

        if (pendingRestore.rafId !== null) {
            window.cancelAnimationFrame(pendingRestore.rafId);
        }

        pendingRestore.observer?.disconnect?.();

        if (pendingRestore.active) {
            dispatchSectionActiveLock(pendingRestore.targetId, false);
        }

        routeRestoreRef.current = createIdleRouteRestoreState();
    };

    const startRouteRestore = (sectionId) => {
        stopRouteRestore();
        dispatchSectionActiveLock(sectionId, true);

        const now = performance.now();

        routeRestoreRef.current = {
            active: true,
            targetId: sectionId,
            startedAt: now,
            deadline: now + ROUTE_RESTORE_DEADLINE_MS,
            lastChangeAt: now,
            lastTargetY: null,
            rafId: null,
            observer: null,
        };

        if (typeof ResizeObserver !== 'undefined') {
            const targetIndex = Math.max(0, SECTION_IDS.indexOf(sectionId));
            const observedElements = SECTION_IDS
                .slice(0, targetIndex + 1)
                .map((id) => getSectionElement(id))
                .filter(Boolean);

            const observer = new ResizeObserver(() => {
                if (!routeRestoreRef.current.active) {
                    return;
                }

                routeRestoreRef.current.lastChangeAt = performance.now();
            });

            const uniqueElements = new Set(observedElements);
            uniqueElements.forEach((element) => observer.observe(element));
            routeRestoreRef.current.observer = observer;
        }

        const tick = () => {
            const pendingRestore = routeRestoreRef.current;

            if (!pendingRestore.active) {
                return;
            }

            const targetY = getSectionScrollY(pendingRestore.targetId);
            const now = performance.now();

            if (targetY !== null) {
                const visibleSectionId = getActiveSectionId(SECTION_IDS);
                const isAligned = Math.abs(window.scrollY - targetY) <= 6;
                const isTargetActive = visibleSectionId === pendingRestore.targetId;
                const targetShifted = pendingRestore.lastTargetY === null || Math.abs(pendingRestore.lastTargetY - targetY) > 1;

                if (targetShifted) {
                    pendingRestore.lastChangeAt = now;
                }

                if (!isAligned || targetShifted || !isTargetActive) {
                    navigationLockRef.current = {
                        active: true,
                        targetId: pendingRestore.targetId,
                        targetY,
                        expiresAt: Date.now() + 500,
                    };
                    commitActiveSection(pendingRestore.targetId, 'replace');

                    if (lenisRef.current) {
                        lenisRef.current.scrollTo(targetY, {
                            immediate: true,
                            force: true,
                        });
                    } else {
                        performWindowScroll(targetY, { instant: true });
                    }
                }

                pendingRestore.lastTargetY = targetY;

                const targetContentReady = isSectionContentReady(pendingRestore.targetId);
                const layoutSettled = now - pendingRestore.lastChangeAt >= ROUTE_RESTORE_LAYOUT_SETTLE_MS;

                if (targetContentReady && layoutSettled && isAligned && isTargetActive) {
                    stopRouteRestore();
                    return;
                }
            }

            if (now >= pendingRestore.deadline) {
                stopRouteRestore();
                return;
            }

            pendingRestore.rafId = window.requestAnimationFrame(tick);
        };

        routeRestoreRef.current.rafId = window.requestAnimationFrame(tick);
    };

    useEffect(() => {
        const cancelPendingAutoScroll = () => {
            if (!routeRestoreRef.current.active && !navigationLockRef.current.active) {
                return
            }

            stopRouteRestore()
            clearNavigationLock()
        }

        const handleKeyDown = (event) => {
            if (isEditableTarget(event.target) || !isScrollCancelKey(event)) {
                return
            }

            cancelPendingAutoScroll()
        }

        window.addEventListener('wheel', cancelPendingAutoScroll, { passive: true })
        window.addEventListener('touchstart', cancelPendingAutoScroll, { passive: true })
        window.addEventListener('touchmove', cancelPendingAutoScroll, { passive: true })
        window.addEventListener('pointerdown', cancelPendingAutoScroll, { passive: true })
        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('wheel', cancelPendingAutoScroll)
            window.removeEventListener('touchstart', cancelPendingAutoScroll)
            window.removeEventListener('touchmove', cancelPendingAutoScroll)
            window.removeEventListener('pointerdown', cancelPendingAutoScroll)
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    useEffect(() => {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
            || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const isCoarsePointer = window.matchMedia?.('(pointer: coarse)')?.matches;
        const isDesktopViewport = window.innerWidth >= 1024;
        const shouldPreferNativeTouchScroll = isIOS || (isCoarsePointer && !isDesktopViewport);

        // Keep premium smooth scroll on desktop, even on touch-capable Windows hardware.
        if (!shouldPreferNativeTouchScroll) {
            const lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                orientation: 'vertical',
                gestureOrientation: 'vertical',
                smoothWheel: true,
                wheelMultiplier: 1,
                smoothTouch: false,
                touchMultiplier: 2,
                infinite: false,
            })

            lenisRef.current = lenis;
            window.lenis = lenis;

            function raf(time) {
                if (lenisRef.current && !isControlOpenRef.current) {
                    lenisRef.current.raf(time)
                }
                lenisRafRef.current = requestAnimationFrame(raf)
            }

            lenisRafRef.current = requestAnimationFrame(raf)

            return () => {
                if (lenisRafRef.current) {
                    cancelAnimationFrame(lenisRafRef.current);
                }
                lenis.destroy()
                lenisRef.current = null;
                window.lenis = null;
                document.documentElement.style.overflowY = '';
                document.documentElement.style.webkitOverflowScrolling = '';
            }
        } else {
            // Mobile/touch-first devices: keep native hardware-accelerated scrolling.
            document.documentElement.style.overflowY = 'auto';
            document.documentElement.style.webkitOverflowScrolling = 'touch';
            window.lenis = null; // Ensure lenis is not available

            return () => {
                document.documentElement.style.overflowY = '';
                document.documentElement.style.webkitOverflowScrolling = '';
            }
        }
    }, [viewportBucket])

    useEffect(() => {
        let frameId = null
        let timeoutId = null
        let attempts = 0

        const syncMountedSections = () => {
            let allMounted = true

            SECTION_WRAPPER_IDS.forEach((sectionId) => {
                if (!document.getElementById(sectionId)) {
                    allMounted = false
                }
            })

            setMountedSectionMap((currentMap) => {
                let didChange = false
                const nextMap = { ...currentMap }

                SECTION_WRAPPER_IDS.forEach((sectionId) => {
                    const isMounted = Boolean(document.getElementById(sectionId))
                    if (nextMap[sectionId] !== isMounted) {
                        nextMap[sectionId] = isMounted
                        didChange = true
                    }
                })

                return didChange ? nextMap : currentMap
            })

            if (!allMounted && attempts < 30) {
                attempts += 1
                timeoutId = window.setTimeout(() => {
                    frameId = window.requestAnimationFrame(syncMountedSections)
                }, 80)
            }
        }

        frameId = window.requestAnimationFrame(syncMountedSections)

        return () => {
            if (frameId !== null) {
                window.cancelAnimationFrame(frameId)
            }
            if (timeoutId !== null) {
                window.clearTimeout(timeoutId)
            }
        }
    }, [])

    useLayoutEffect(() => {
        if (typeof window === 'undefined') {
            return undefined
        }

        const previousScrollRestoration = window.history.scrollRestoration
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual'
        }

        const initialSectionId = initialSectionIdRef.current;
        commitActiveSection(initialSectionId, 'replace');
        if (shouldRestoreSectionRoute(initialSectionId, 'instant')) {
            startRouteRestore(initialSectionId);
        } else {
            stopRouteRestore();
        }
        navigateToSection(initialSectionId, {
            historyMode: 'replace',
            behavior: 'instant',
        });

        return () => {
            if ('scrollRestoration' in window.history) {
                window.history.scrollRestoration = previousScrollRestoration
            }
        };
    }, []);

    useEffect(() => {
        const preloadSections = () => {
            loadAboutModule()
            loadFeaturedProjectsModule()
            loadTechStackModule()
            if (isArchitectSectionEnabled) {
                loadProjectArchitectModule()
            }
            loadContactModule()
        }

        if (typeof window.requestIdleCallback === 'function') {
            const idleId = window.requestIdleCallback(preloadSections, { timeout: 1200 })

            return () => {
                window.cancelIdleCallback?.(idleId)
            }
        }

        const timeoutId = window.setTimeout(preloadSections, 250)
        return () => {
            window.clearTimeout(timeoutId)
        }
    }, [])

    useEffect(() => {
        isControlOpenRef.current = isControlOpen;

        if (!lenisRef.current) return;

        if (isControlOpen) {
            lenisRef.current.stop?.();
        } else {
            lenisRef.current.start?.();
        }
    }, [isControlOpen]);

    useEffect(() => {
        const openPanel = () => openControlPanel();
        const closePanel = () => closeControlPanel();

        window.addEventListener('open-control-panel', openPanel);
        window.addEventListener('close-control-panel', closePanel);

        return () => {
            window.removeEventListener('open-control-panel', openPanel);
            window.removeEventListener('close-control-panel', closePanel);
        };
    }, []);

    useEffect(() => {
        if (!import.meta.env.DEV) {
            return undefined
        }

        let disposed = false
        let inFlight = false

        const pollLocalContentStatus = async () => {
            if (disposed || inFlight) {
                return
            }

            inFlight = true

            try {
                const response = await fetch('/__dev/content-status', {
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache',
                    },
                })

                if (!response.ok) {
                    return
                }

                const payload = await response.json()
                if (disposed || !payload?.generatedAt) {
                    return
                }

                const currentGeneratedAt = currentRuntimeGeneratedAtRef.current

                if (currentGeneratedAt && payload.generatedAt !== currentGeneratedAt) {
                    window.location.reload()
                    return
                }

                currentRuntimeGeneratedAtRef.current = payload.generatedAt
            } catch {
                // Ignore transient local dev polling failures.
            } finally {
                inFlight = false
            }
        }

        const intervalId = window.setInterval(pollLocalContentStatus, 1500)
        pollLocalContentStatus()

        return () => {
            disposed = true
            window.clearInterval(intervalId)
        }
    }, [])

    useEffect(() => {
        const syncViewportBucket = () => {
            const nextBucket = window.innerWidth >= 1024 ? 'desktop' : 'mobile'

            setViewportBucket((currentBucket) => (
                currentBucket === nextBucket ? currentBucket : nextBucket
            ))
        }

        syncViewportBucket()
        window.addEventListener('resize', syncViewportBucket, { passive: true })

        return () => {
            window.removeEventListener('resize', syncViewportBucket)
        }
    }, [])

    useEffect(() => {
        setSectionWrapperHeights(readSectionHeightCache(viewportBucket))
    }, [viewportBucket])

    useEffect(() => {
        if (typeof ResizeObserver === 'undefined') {
            return undefined
        }

        let frameId = null
        let syncFrameId = null
        let syncTimeoutId = null
        let syncAttempts = 0
        const latestHeights = { ...sectionWrapperHeights }
        const observedElements = new Map()

        const flushHeights = () => {
            frameId = null
            const nextHeights = { ...latestHeights }

            setSectionWrapperHeights(nextHeights)
            writeSectionHeightCache(viewportBucket, nextHeights)
        }

        const getSectionIdForElement = (element) => {
            for (const [sectionId, observedElement] of observedElements.entries()) {
                if (observedElement === element) {
                    return sectionId
                }
            }

            return null
        }

        const observer = new ResizeObserver((entries) => {
            let didChange = false

            entries.forEach((entry) => {
                const sectionId = getSectionIdForElement(entry.target)
                if (!sectionId) {
                    return
                }

                const nextHeight = Math.round(entry.target.getBoundingClientRect().height)
                if (!nextHeight) {
                    return
                }

                if (Math.abs((latestHeights[sectionId] || 0) - nextHeight) <= 8) {
                    return
                }

                latestHeights[sectionId] = nextHeight
                didChange = true
            })

            if (!didChange || frameId !== null) {
                return
            }

            frameId = window.requestAnimationFrame(flushHeights)
        })

        const syncObservedElements = () => {
            let allSectionsObserved = true

            SECTION_WRAPPER_IDS.forEach((sectionId) => {
                const nextElement = getSectionMeasurementElement(sectionId)
                const currentElement = observedElements.get(sectionId)

                if (!document.getElementById(sectionId)) {
                    allSectionsObserved = false
                }

                if (currentElement === nextElement) {
                    return
                }

                if (currentElement) {
                    observer.unobserve(currentElement)
                }

                if (nextElement) {
                    observer.observe(nextElement)
                    observedElements.set(sectionId, nextElement)
                } else {
                    observedElements.delete(sectionId)
                }
            })

            if (!allSectionsObserved && syncAttempts < 30) {
                syncAttempts += 1
                syncTimeoutId = window.setTimeout(() => {
                    syncFrameId = window.requestAnimationFrame(syncObservedElements)
                }, 80)
            }
        }

        syncFrameId = window.requestAnimationFrame(syncObservedElements)

        return () => {
            if (frameId !== null) {
                window.cancelAnimationFrame(frameId)
            }
            if (syncFrameId !== null) {
                window.cancelAnimationFrame(syncFrameId)
            }
            if (syncTimeoutId !== null) {
                window.clearTimeout(syncTimeoutId)
            }
            observer.disconnect()
        }
    }, [sectionWrapperHeights, viewportBucket])

    useEffect(() => {
        const syncRouteFromPathname = () => {
            const sectionId = getSectionIdFromPathname(window.location.pathname) || DEFAULT_SECTION_ID;
            const pendingRestore = routeRestoreRef.current;

            if (pendingRestore.active && pendingRestore.targetId === sectionId) {
                return;
            }

            commitActiveSection(sectionId, 'preserve');
            if (shouldRestoreSectionRoute(sectionId, 'instant')) {
                startRouteRestore(sectionId);
            } else {
                stopRouteRestore();
            }
            navigateToSection(sectionId, {
                historyMode: 'preserve',
                behavior: 'instant',
            });
        };

        const handleSectionNavigation = (event) => {
            const { sectionId, historyMode = 'push', behavior = 'smooth', skipScroll = false } = event.detail || {};

            if (!sectionId) {
                return;
            }

            closeControlPanel();
            document.body.style.overflow = '';
            document.body.style.overscrollBehaviorY = '';
            document.documentElement.style.overscrollBehaviorY = '';
            window.dispatchEvent(new CustomEvent('close-project-modal'));

            if (skipScroll) {
                stopRouteRestore();
                commitActiveSection(sectionId, historyMode);
                return;
            }

            const shouldRestoreTarget = shouldRestoreSectionRoute(sectionId, behavior);

            if (shouldRestoreTarget) {
                startRouteRestore(sectionId);
            } else {
                stopRouteRestore();
            }

            navigateToSection(sectionId, {
                historyMode,
                behavior: shouldRestoreTarget ? 'instant' : behavior,
            });
        };

        const handlePopState = () => {
            syncRouteFromPathname();
        };

        window.addEventListener(SECTION_NAVIGATION_EVENT, handleSectionNavigation);
        window.addEventListener('popstate', handlePopState);
        window.addEventListener('pageshow', syncRouteFromPathname);

        return () => {
            window.removeEventListener(SECTION_NAVIGATION_EVENT, handleSectionNavigation);
            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener('pageshow', syncRouteFromPathname);
        };
    }, []);

    useEffect(() => {
        const syncVisibleSection = () => {
            const pendingRestore = routeRestoreRef.current;
            if (pendingRestore.active) {
                commitActiveSection(pendingRestore.targetId, 'replace');
                return;
            }

            const lock = navigationLockRef.current;
            if (lock.active) {
                const latestTargetY = getSectionScrollY(lock.targetId) ?? lock.targetY;
                const hasReachedTarget = Math.abs(window.scrollY - latestTargetY) <= 28;
                const lockExpired = Date.now() >= lock.expiresAt;

                if (!hasReachedTarget && !lockExpired) {
                    commitActiveSection(lock.targetId, 'replace');
                    return;
                }

                clearNavigationLock()
            }

            const visibleSectionId = getActiveSectionId(SECTION_IDS);

            if (visibleSectionId !== activeSectionRef.current) {
                commitActiveSection(visibleSectionId, 'replace');
            }
        };

        return subscribeScrollRuntime(syncVisibleSection);
    }, []);

    useEffect(() => {
        return () => {
            stopRouteRestore();
        };
    }, []);

    return (
        <div className="min-h-screen selection:bg-electric-green selection:text-dark-void overflow-x-hidden">
            <ParallaxGrid isFrozen={isControlOpen} />
            <Navbar isUiObscured={isControlUiLocked} />
            <div>
                <main>
                    <Hero isUiFrozen={isControlOpen} />

                    {/* wrapper renders IMMEDIATELY -> Document has height -> Scroll is restored */}
                    <div id="about-wrapper" style={{ minHeight: mountedSectionMap.about ? undefined : `${sectionWrapperHeights.about}px` }}>
                        <Suspense fallback={null}>
                            <About isUiFrozen={isControlOpen} />
                        </Suspense>
                    </div>

                    <div id="projects-wrapper" style={{ minHeight: mountedSectionMap.projects ? undefined : `${sectionWrapperHeights.projects}px` }}>
                        <Suspense fallback={null}>
                            <FeaturedProjects />
                        </Suspense>
                    </div>

                    <div id="tech-stack-wrapper" style={{ minHeight: mountedSectionMap['tech-stack'] ? undefined : `${sectionWrapperHeights['tech-stack']}px` }}>
                        <Suspense fallback={null}>
                            <TechStack />
                        </Suspense>
                    </div>

                    {isArchitectSectionEnabled && ProjectArchitect && (
                        <div id="architect-wrapper" style={{ minHeight: mountedSectionMap.architect ? undefined : `${sectionWrapperHeights.architect}px` }}>
                            <Suspense fallback={null}>
                                <ProjectArchitect />
                            </Suspense>
                        </div>
                    )}

                    <div id="contact-wrapper" style={{ minHeight: mountedSectionMap.contact ? undefined : `${sectionWrapperHeights.contact}px` }}>
                        <Suspense fallback={null}>
                            <Contact />
                        </Suspense>
                    </div>
                </main>
                <Suspense fallback={null}>
                    <Footer onOpenControlPanel={openControlPanel} />
                </Suspense>
                <Suspense fallback={null}>
                    <ControlPlane
                        isOpen={isControlOpen}
                        onOpen={openControlPanel}
                        onClose={closeControlPanel}
                        onExitComplete={handleControlPanelExitComplete}
                    />
                </Suspense>
            </div>
            <Analytics />
            <SpeedInsights />
        </div>
    )
}

export default App
