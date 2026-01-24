import { useMemo } from 'react';

/**
 * Heuristic-based hardware quality detection.
 * Tiers: 
 * - low: Slow Android, low RAM, or <= 4 cores. Optimized for stability.
 * - mid: Standard modern phones. Balanced.
 * - high: Desktop, iPhone 14+, high-end Android. Full effects.
 */
export const useHardwareQuality = () => {
    return useMemo(() => {
        if (typeof window === 'undefined') return { tier: 'mid', allowBlur: true };

        const cores = navigator.hardwareConcurrency || 4;
        // navigator.deviceMemory is generic, often 8 for high end, 4 or 2 for low.
        // It's non-standard, but supported in Chrome/Android.
        const memory = (navigator).deviceMemory || 4;
        const ua = navigator.userAgent;
        const isMobile = /Android|iPhone|iPad/i.test(ua);
        const isAndroid = /Android/i.test(ua);

        // Strict check for "Low End"
        // Most < 2023 mid-range Androids have < 6GB usable heap or limited GPU bandwidth.
        // We treat any Android with <= 4GB RAM or <= 6 cores as 'low'.
        // Also, if deviceMemory is unknown, we assume 'mid' unless cores are low.

        let tier = 'high';

        if (isAndroid) {
            if (memory <= 4 || cores <= 6) {
                tier = 'low';
            } else {
                tier = 'mid'; // Even high-end Androids struggle with massive blur + scroll
            }
        } else if (isMobile) {
            // FORCE MID TIER FOR ALL iPHONES to disable heavy backdrop-blur (FPS Killer on Retina)
            // Even iPhone 15 Pro struggles with massive CSS blurs + scroll + JS animations simultaneously.
            if (/iPhone|iPad/i.test(ua)) {
                tier = 'mid'; // Checks 'allowBlur' below -> disables blur for mid if isAndroid, let's allow blur for iPhone but carefully?
                // Actually, let's treat iPhones as 'mid' but we need to ensure 'allowBlur' logic handles it.
            }
        }

        // Tier characteristics
        return {
            tier,
            // Blur is the #1 FPS killer. Disable on Low/Mid Androids AND ensure iPhones are careful.
            // Let's only allow full blurs on Desktop High.
            allowBlur: tier === 'high' && !isMobile,

            // Low tier gets simple opacity fades instead of complex layout projection
            simplePhysics: tier === 'low',

            // Load HQ videos vs Static Images - STRICT: Only Desktop gets heavy GIFs/Videos by default
            loadHeavyMedia: tier === 'high' && !isMobile,

            // CSS Classes for dynamic usage
            glassClass: (tier === 'low' || (tier === 'mid' && isAndroid))
                ? 'bg-dark-high' // Solid color (fastest) - No opacity to avoid blending cost if possible, or 95%
                : 'backdrop-blur-xl bg-dark-high/80', // Premium glass

            // Spring Physics
            spring: tier === 'low'
                ? { type: "tween", duration: 0.3, ease: "circOut" } // Tween is cheaper than Spring calculation
                : { type: "spring", stiffness: 350, damping: 30 }    // Pro spring
        };
    }, []);
};
