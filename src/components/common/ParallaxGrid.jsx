import React, { useEffect, useRef } from 'react';

import { subscribeScrollRuntime } from '../../utils/scrollRuntime';

const ParallaxGrid = ({ isFrozen = false }) => {
    const gridLayerRef = useRef(null);
    const lastOffsetRef = useRef(0);

    useEffect(() => {
        const node = gridLayerRef.current;
        if (!node) {
            return undefined;
        }

        const prefersStaticGrid = window.matchMedia?.('(pointer: coarse)')?.matches
            || window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

        if (isFrozen || prefersStaticGrid) {
            node.style.willChange = 'auto';
            node.style.transform = 'translate3d(0, 0px, 0)';
            return undefined;
        }

        node.style.willChange = 'transform';

        const unsubscribe = subscribeScrollRuntime((runtimeSnapshot) => {
            const nextOffset = Math.round(-((runtimeSnapshot.scrollY * 0.15) % 50));

            if (nextOffset === lastOffsetRef.current) {
                return;
            }

            lastOffsetRef.current = nextOffset;
            node.style.transform = `translate3d(0, ${nextOffset}px, 0)`;
        });

        return () => {
            node.style.willChange = 'auto';
            unsubscribe();
        };
    }, [isFrozen]);

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-dark-void">
            <div
                ref={gridLayerRef}
                className="absolute -top-[50px] -left-[50px] w-[calc(100%+100px)] h-[calc(100vh+100px)]"
                style={{ transform: 'translate3d(0, 0px, 0)' }}
            >
                <div
                    className="w-full h-full"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(0, 255, 153, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0, 255, 153, 0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '50px 50px',
                        backgroundRepeat: 'repeat'
                    }}
                />
            </div>

            <div
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at 50% 50%, transparent 40%, #0b0c10 100%)'
                }}
            />
        </div>
    );
};

export default ParallaxGrid;
