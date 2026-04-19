import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const defaultQuality = {
    tier: 'mid',
    isDesktopViewport: true,
    isCompactViewport: false,
    useWideProjectModalLayout: true,
    allowBlur: true,
    simplePhysics: false,
    loadHeavyMedia: false,
    glassClass: 'backdrop-blur-xl bg-dark-high/80',
    spring: { type: 'spring', stiffness: 350, damping: 30 },
    modalTransition: { type: 'spring', stiffness: 350, damping: 30 },
    maxPreviewVideos: 0,
    previewRootMarginPx: 320,
    previewIdleDelayMs: 180,
    allowAmbientMotion: true,
    useCompactProjectModal: false,
};

const HardwareQualityContext = createContext(defaultQuality);

function buildQualityState() {
    if (typeof window === 'undefined') {
        return defaultQuality;
    }

    const cores = navigator.hardwareConcurrency || 4;
    const memory = navigator.deviceMemory || 4;
    const ua = navigator.userAgent;
    const isMobile = /Android|iPhone|iPad/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isDesktopViewport = viewportWidth >= 1024;
    const isCompactViewport = viewportWidth < 768;
    const isPortraitTabletViewport = viewportWidth >= 768
        && viewportWidth <= 1100
        && viewportHeight >= 900
        && viewportHeight > viewportWidth;
    const hasCoarsePointer = typeof window.matchMedia === 'function'
        && window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const hasTouchPoints = (navigator.maxTouchPoints || 0) > 0;
    const useCompactProjectModal = (!isDesktopViewport && (isMobile || hasCoarsePointer || hasTouchPoints))
        || isPortraitTabletViewport;
    const useWideProjectModalLayout = isDesktopViewport
        && !isPortraitTabletViewport
        && !hasCoarsePointer
        && viewportWidth >= 1366
        && viewportHeight >= 860;

    let tier = 'high';

    if (isAndroid) {
        if (memory <= 4 || cores <= 6) {
            tier = 'low';
        } else {
            tier = 'mid';
        }
    } else if (isMobile) {
        tier = cores <= 2 ? 'mid' : 'high';
    }

    if (isCompactViewport && tier === 'high') {
        tier = 'mid';
    }

    const allowBlur = !isCompactViewport && (tier === 'high' || (tier === 'mid' && !isAndroid));
    const maxPreviewVideos = !isDesktopViewport
        ? 0
        : tier === 'high'
            ? 6
            : tier === 'mid'
                ? 3
                : 0;
    const compactModalTransition = {
        type: 'tween',
        duration: tier === 'low' ? 0.24 : 0.28,
        ease: [0.16, 1, 0.3, 1],
    };
    const spring = tier === 'low'
        ? { type: 'tween', duration: 0.3, ease: 'circOut' }
        : { type: 'spring', stiffness: 350, damping: 30 };

    return {
        tier,
        isDesktopViewport,
        isCompactViewport,
        useWideProjectModalLayout,
        allowBlur,
        simplePhysics: tier === 'low',
        loadHeavyMedia: tier === 'high' && isDesktopViewport,
        glassClass: allowBlur ? 'backdrop-blur-xl bg-dark-high/80' : 'bg-dark-high',
        spring,
        modalTransition: useCompactProjectModal ? compactModalTransition : spring,
        maxPreviewVideos,
        previewRootMarginPx: isDesktopViewport
            ? (tier === 'high' ? 380 : tier === 'mid' ? 300 : 240)
            : 220,
        previewIdleDelayMs: isDesktopViewport ? 180 : 260,
        allowAmbientMotion: tier !== 'low',
        useCompactProjectModal,
    };
}

function shallowEqualQuality(a, b) {
    return a.tier === b.tier
        && a.isDesktopViewport === b.isDesktopViewport
        && a.isCompactViewport === b.isCompactViewport
        && a.useWideProjectModalLayout === b.useWideProjectModalLayout
        && a.allowBlur === b.allowBlur
        && a.simplePhysics === b.simplePhysics
        && a.loadHeavyMedia === b.loadHeavyMedia
        && a.glassClass === b.glassClass
        && a.maxPreviewVideos === b.maxPreviewVideos
        && a.previewRootMarginPx === b.previewRootMarginPx
        && a.previewIdleDelayMs === b.previewIdleDelayMs
        && a.allowAmbientMotion === b.allowAmbientMotion
        && a.useCompactProjectModal === b.useCompactProjectModal
        && a.spring.type === b.spring.type
        && a.spring.duration === b.spring.duration
        && a.spring.ease === b.spring.ease
        && a.spring.stiffness === b.spring.stiffness
        && a.spring.damping === b.spring.damping
        && a.modalTransition.type === b.modalTransition.type
        && a.modalTransition.duration === b.modalTransition.duration
        && a.modalTransition.ease === b.modalTransition.ease
        && a.modalTransition.stiffness === b.modalTransition.stiffness
        && a.modalTransition.damping === b.modalTransition.damping;
}

export function HardwareQualityProvider({ children }) {
    const [quality, setQuality] = useState(() => buildQualityState());

    useEffect(() => {
        if (typeof window === 'undefined') {
            return undefined;
        }

        const handleResize = () => {
            const nextQuality = buildQualityState();
            setQuality((currentQuality) => shallowEqualQuality(currentQuality, nextQuality) ? currentQuality : nextQuality);
        };

        window.addEventListener('resize', handleResize, { passive: true });

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const value = useMemo(() => quality, [quality]);

    return React.createElement(HardwareQualityContext.Provider, { value }, children);
}

export const useHardwareQuality = () => useContext(HardwareQualityContext) || defaultQuality;
