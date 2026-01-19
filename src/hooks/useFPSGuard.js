import { useState, useEffect, useRef } from 'react';

/**
 * useFPSGuard: Real-time performance monitor.
 * Detects if the device is struggling to maintain 60FPS.
 * 
 * Logic:
 * - Samples frame duration every second.
 * - If average FPS < 28 for 2 consecutive samples, isStruggling = true.
 * - If average FPS > 50 for 5 consecutive samples, isStruggling = false.
 */
export const useFPSGuard = (enabled = true) => {
    const [isStruggling, setIsStruggling] = useState(false);
    const lowFpsCount = useRef(0);
    const highFpsCount = useRef(0);
    const framesRef = useRef(0);
    const lastTimeRef = useRef(performance.now());
    const requestRef = useRef();

    useEffect(() => {
        if (!enabled) return;

        const checkFps = (time) => {
            framesRef.current++;

            const delta = time - lastTimeRef.current;

            // Check performance every 1 second
            if (delta >= 1000) {
                const fps = Math.round((framesRef.current * 1000) / delta);

                if (fps < 28) {
                    lowFpsCount.current++;
                    highFpsCount.current = 0;
                } else if (fps > 50) {
                    highFpsCount.current++;
                    lowFpsCount.current = 0;
                }

                // If we hit 2 consecutive low-FPS readings, we are struggling
                if (lowFpsCount.current >= 2 && !isStruggling) {
                    setIsStruggling(true);
                }

                // If we hit 5 consecutive high-FPS readings, we've recovered
                if (highFpsCount.current >= 5 && isStruggling) {
                    setIsStruggling(false);
                }

                framesRef.current = 0;
                lastTimeRef.current = time;
            }

            requestRef.current = requestAnimationFrame(checkFps);
        };

        requestRef.current = requestAnimationFrame(checkFps);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [enabled, isStruggling]);

    return isStruggling;
};
