import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TIER_CONFIG } from '../config/tierConfig';

const PerformanceContext = createContext();

export const PerformanceProvider = ({ children }) => {
    const [manualOverride, setManualOverride] = useState(null); // null | 1-5
    const [detectedTier, setDetectedTier] = useState(3); // Auto-detected
    const [fps, setFps] = useState(60);
    const [isWatchdogActive, setWatchdogActive] = useState(true);

    // Automatic Hardware Detection (5-Tier Logic)
    const calculateHardwareTier = useCallback(() => {
        if (typeof window === 'undefined') return 3;

        const cores = navigator.hardwareConcurrency || 4;
        const memory = (navigator).deviceMemory || 4;
        const ua = navigator.userAgent;
        const isAndroid = /Android/i.test(ua);
        const isMobile = /Android|iPhone|iPad/i.test(ua);

        // RANK FROM HIGHEST TO LOWEST (Ultra -> Potato)
        if (memory >= 16 && cores >= 12) return 5; // 💎 Ultra
        if (memory >= 8 && cores >= 8) return 4;   // 🚀 High
        if (isMobile) {
            if (isAndroid && (memory <= 4 || cores <= 4)) return 2;
            return 3;
        }
        if (memory <= 2 || cores <= 4) return 1;   // 🥔 Potato
        if (memory <= 4) return 2;                 // 📱 Low

        return 3; // Fallback to Mid
    }, []);

    // Initialize detected tier on mount
    useEffect(() => {
        const detected = calculateHardwareTier();
        setDetectedTier(detected);
    }, [calculateHardwareTier]);

    // FPS Watchdog (Self-Healing Downgrade System)
    useEffect(() => {
        if (!isWatchdogActive || manualOverride !== null) return;

        let frameCount = 0;
        let lastTime = performance.now();
        let fpsCheckInterval = 0;
        let rafId;

        const measureFPS = () => {
            frameCount++;
            const now = performance.now();

            if (now >= lastTime + 1000) {
                const currentFPS = Math.round((frameCount * 1000) / (now - lastTime));
                setFps(currentFPS);

                // Auto-downgrade if FPS drops below 24 (check every 3 seconds to avoid false positives)
                fpsCheckInterval++;
                if (fpsCheckInterval >= 3 && currentFPS < 24 && detectedTier > 1) {
                    console.warn(`[Watchdog] FPS dropped to ${currentFPS}, downgrading tier ${detectedTier} → ${detectedTier - 1}`);
                    setDetectedTier(prev => Math.max(1, prev - 1));
                    fpsCheckInterval = 0;
                }

                frameCount = 0;
                lastTime = now;
            }
            rafId = requestAnimationFrame(measureFPS);
        };

        rafId = requestAnimationFrame(measureFPS);
        return () => cancelAnimationFrame(rafId);
    }, [detectedTier, isWatchdogActive, manualOverride]);

    const activeTier = Math.min(5, Math.max(1, manualOverride ?? detectedTier));
    const config = TIER_CONFIG[activeTier] || TIER_CONFIG[3];

    const value = {
        tier: activeTier,
        fps,
        manualOverride,
        setManualOverride,
        detectedTier,
        isWatchdogActive,
        setWatchdogActive,
        config
    };

    return (
        <PerformanceContext.Provider value={value}>
            {children}
        </PerformanceContext.Provider>
    );
};

export const usePerformance = () => {
    const context = useContext(PerformanceContext);
    if (!context) {
        throw new Error('usePerformance must be used within PerformanceProvider');
    }
    return context;
};
