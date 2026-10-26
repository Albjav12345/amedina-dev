import React, { useEffect, useRef } from 'react';
import { isArchitectSectionEnabled } from '../../config/siteFeatures';
import { requestScrollRuntimeFrame, subscribeScrollRuntime } from '../../utils/scrollRuntime';
import { getSectionSceneFrame } from '../../utils/scrollSceneMotion';
import './SectionBackdrops.css';

// Small, already softened local photographs: no live blur or video decoding.
const scenes = [
    { id: 'about', image: 'tech-frontend', position: '58% center', glow: '68% 28%', color: '0 255 153' },
    { id: 'projects', image: 'tech-core', position: '55% center', glow: '80% 40%', color: '102 252 241' },
    { id: 'tech-stack', image: 'tech-infra', position: '58% center', glow: '70% 24%', color: '0 255 153' },
    ...(isArchitectSectionEnabled ? [{ id: 'architect', image: 'tech-core', position: '75% center', glow: '74% 30%', color: '102 252 241' }] : []),
    { id: 'contact', image: 'tech-ai', position: '78% center', glow: '26% 55%', color: '0 255 153' },
];

export default function SectionBackdrops({ isFrozen = false }) {
    const rootRef = useRef(null);
    const frozenRef = useRef(isFrozen);

    useEffect(() => {
        frozenRef.current = isFrozen;
        if (!isFrozen) requestScrollRuntimeFrame();
    }, [isFrozen]);

    useEffect(() => {
        const layers = Array.from(rootRef.current.children);
        const lastFrames = layers.map(() => ({}));
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const coarsePointer = window.matchMedia('(pointer: coarse)');
        const wrappers = scenes.map(scene => document.getElementById(`${scene.id}-wrapper`));
        let measurements = [];
        let needsMeasure = true;
        let viewportWidth = 0;
        let viewportHeight = 1;

        const invalidate = () => {
            needsMeasure = true;
            requestScrollRuntimeFrame();
        };

        const unsubscribe = subscribeScrollRuntime(snapshot => {
            if (frozenRef.current || document.hidden) return;
            if (viewportWidth !== snapshot.width || (!coarsePointer.matches && viewportHeight !== snapshot.height)) {
                viewportWidth = snapshot.width;
                viewportHeight = Math.max(snapshot.height, 1);
                needsMeasure = true;
            }
            if (needsMeasure) {
                // Read layout together, only after lazy content/responsive layout changes.
                measurements = wrappers.map(wrapper => {
                    if (!wrapper) return null;
                    const rect = wrapper.getBoundingClientRect();
                    return { top: rect.top + window.scrollY, bottom: rect.bottom + window.scrollY };
                });
                needsMeasure = false;
            }
            const frames = measurements.map((bounds, index) => bounds ? getSectionSceneFrame({
                ...bounds, scrollY: snapshot.scrollY, height: viewportHeight,
                first: index === 0, reducedMotion: reducedMotion.matches,
            }) : { opacity: 0, transform: 'none' });

            // Update the scene surfaces, never inherited styles on the content tree.
            frames.forEach((frame, index) => {
                const layer = layers[index];
                const lastFrame = lastFrames[index];
                const opacity = frame.opacity.toFixed(4);
                const active = frame.opacity > 0 && !reducedMotion.matches;
                if (lastFrame.opacity !== opacity) layer.style.opacity = opacity;
                if (lastFrame.transform !== frame.transform) layer.style.transform = frame.transform;
                if (lastFrame.active !== active) layer.style.willChange = active ? 'transform, opacity' : 'auto';
                lastFrames[index] = { opacity, transform: frame.transform, active };
            });
        });

        const observer = new ResizeObserver(invalidate);
        [document.getElementById('home'), ...wrappers].filter(Boolean).forEach(element => observer.observe(element));
        reducedMotion.addEventListener('change', invalidate);
        window.addEventListener('pageshow', invalidate);
        return () => {
            unsubscribe();
            observer.disconnect();
            reducedMotion.removeEventListener('change', invalidate);
            window.removeEventListener('pageshow', invalidate);
        };
    }, []);

    return (
        <div ref={rootRef} className="section-backdrops" aria-hidden="true">
            {scenes.map(scene => (
                <div key={scene.id} data-scene={scene.id} className="section-backdrop" style={{
                    '--scene-position': scene.position, '--scene-glow-position': scene.glow, '--scene-glow-color': scene.color,
                }}>
                    <img src={`/assets/stack/${scene.image}.webp`} alt="" width="1600" height="920" loading="lazy" decoding="async" fetchPriority="low" />
                    <div className="section-backdrop__shade" />
                    <div className="section-backdrop__glow" />
                </div>
            ))}
        </div>
    );
}
