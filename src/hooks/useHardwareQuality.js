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
        const memory = (navigator).deviceMemory; // Can be undefined (Safari/Firefox)

        // 1. BRAND-AGNOSTIC PERFORMANCE SCORING
        // We calculate a score based on raw technical metadata
        let perfScore = 0;

        // Core Contribution (Scale: 0-40) - Lowered as cores are often "weak" in budget phones
        if (cores >= 12) perfScore += 40;
        else if (cores >= 8) perfScore += 30;
        else if (cores >= 6) perfScore += 25;
        else if (cores >= 4) perfScore += 15;
        else perfScore += 5;

        // Memory Contribution (Scale: 0-60) - Memory is a better indicator of throughput
        if (memory !== undefined) {
            if (memory >= 12) perfScore += 60;
            else if (memory >= 8) perfScore += 50;
            else if (memory >= 4) perfScore += 35;
            else perfScore += 10;
        } else {
            // Safari/iOS Compensation: Stronger boost for high core counts on Safari
            if (cores >= 6) perfScore += 40; // High-end Apple Silicon
            else if (cores >= 4) perfScore += 30; // Mid-range mobile
            else perfScore += 5;
        }

        // TIER ASSIGNMENT (Tightened Thresholds)
        let tier = 'low';
        if (perfScore >= 85) tier = 'high';
        else if (perfScore >= 65) tier = 'mid';

        const ua = navigator.userAgent;
        const isAndroid = /Android/i.test(ua);

        // Tier characteristics
        return {
            tier,
            // Blur is the #1 FPS killer on Android. Disable it on Low/Mid Androids.
            allowBlur: tier === 'high' || (tier === 'mid' && !isAndroid),

            // Low tier gets simple opacity fades instead of complex layout projection
            simplePhysics: tier === 'low',

            // Load HQ videos vs Static Images - ALLOWED ON MID/HIGH TIERS
            loadHeavyMedia: tier !== 'low',

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
