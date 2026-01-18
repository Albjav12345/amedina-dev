import { useMemo } from 'react';

/**
 * Senior Performance Engineering: Hardware Tiering Logic
 * 
 * Tiers:
 * - high: Desktop, iPhone 14 Pro+, High-end Android. (Full Blur, Physics, Autoplay)
 * - mid: Standard modern phones. (No Blur, Normal Physics, Autoplay)
 * - low: Budget Android / Old models. (No Blur, Simple Physics, No Autoplay)
 */
export const useHardwareQuality = () => {
    return useMemo(() => {
        if (typeof window === 'undefined' || typeof navigator === 'undefined') {
            return { tier: 'mid', allowBlur: false, autoplayVideos: true };
        }

        const cores = navigator.hardwareConcurrency || 4;

        // RAM Detection (Not supported in iOS Safari)
        const memory = (navigator).deviceMemory;

        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

        let tier = 'high';

        if (memory) {
            // Chrome / Android route
            if (memory <= 4 || cores <= 4) {
                tier = memory <= 2 || cores <= 2 ? 'low' : 'mid';
            }
        } else {
            // iOS / Safari route (Heuristic based on cores)
            // Even modern iPhones have 6 cores, but older/budget ones have 4 or less.
            if (isIOS) {
                tier = cores <= 4 ? 'mid' : 'high';
            } else {
                tier = 'mid'; // Default fallback
            }
        }

        return {
            tier,
            allowBlur: tier === 'high', // Blur is a GPU killer on mid/low mobiles
            autoplayVideos: tier !== 'low', // Save bandwidth/CPU on low tier
            physics: tier === 'low'
                ? { stiffness: 200, damping: 25 }
                : { stiffness: 350, damping: 30 },
            deferredDelay: tier === 'low' ? 0.4 : 0.15
        };
    }, []);
};
