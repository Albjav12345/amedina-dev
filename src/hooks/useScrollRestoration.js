import { useEffect } from 'react';

export const useScrollRestoration = () => {
    useEffect(() => {
        // 1. RESTORE: On mount, read storage and jump
        // We add a small delay to allow initial layout to settle
        const restoreScroll = () => {
            const savedPos = sessionStorage.getItem('scrollPos');
            if (savedPos) {
                const y = parseInt(savedPos, 10);
                if (!isNaN(y)) {
                    window.scrollTo(0, y);
                }
            }
        };

        // Attempt restore immediately and after a short tick
        restoreScroll();
        requestAnimationFrame(restoreScroll);

        // 2. SAVE: On refresh/close, save current position
        const handleUnload = () => {
            sessionStorage.setItem('scrollPos', window.scrollY.toString());
        };

        window.addEventListener('beforeunload', handleUnload);
        return () => window.removeEventListener('beforeunload', handleUnload);
    }, []);
};
