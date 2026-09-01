import React, { useEffect, useMemo, useRef } from 'react';

import portfolioData from '../../data/portfolio';
import useMediaQuery from '../../hooks/useMediaQuery';
import { DEFAULT_SECTION_ID, getSectionIdFromPathname } from '../../utils/sectionRouting';
import { subscribeScrollRuntime } from '../../utils/scrollRuntime';

const DESKTOP_WALL_CARD_COUNT = 36;
const MOBILE_WALL_CARD_COUNT = 36;
const DESKTOP_COPIES = [0, 1, 2];
const MOBILE_COPIES = [0, 1];
const VIDEO_CARD_INDEXES = new Set([7, 22]);
const ENTRY_TRANSITION_MS = 900;
const MEDIA_READY_TIMEOUT_MS = 900;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const waitForImage = (image) => {
    if (image.complete) {
        return typeof image.decode === 'function'
            ? image.decode().catch(() => undefined)
            : Promise.resolve();
    }

    return new Promise((resolve) => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
    });
};

const HeroProjectCard = ({ project, slotIndex, allowVideo, eager, priority }) => {
    const useVideo = allowVideo
        && VIDEO_CARD_INDEXES.has(slotIndex)
        && Boolean(project.media?.cardPreview);

    return (
        <div className={`hero-project-card hero-project-card--tone-${slotIndex % 5}`}>
            {useVideo ? (
                <video
                    className="hero-project-card__media"
                    src={project.media.cardPreview}
                    poster={project.media.poster || project.thumbnail}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    tabIndex={-1}
                />
            ) : (
                <img
                    className="hero-project-card__media"
                    src={project.media?.poster || project.thumbnail}
                    alt=""
                    loading={eager ? 'eager' : 'lazy'}
                    decoding="async"
                    fetchPriority={priority ? 'high' : 'low'}
                />
            )}

            <div className="hero-project-card__shade" />
            <div className="hero-project-card__meta">
                <strong>{project.title}</strong>
                <span>{project.stack?.[0] || 'SYSTEM'}</span>
            </div>
        </div>
    );
};

const HeroProjectWall = ({ isFrozen = false }) => {
    const wallRef = useRef(null);
    const isFrozenRef = useRef(isFrozen);
    const isMobileWall = useMediaQuery('(max-width: 1023.98px)');
    const projects = portfolioData.projects;
    const wallCardCount = isMobileWall ? MOBILE_WALL_CARD_COUNT : DESKTOP_WALL_CARD_COUNT;
    const wallCopies = isMobileWall ? MOBILE_COPIES : DESKTOP_COPIES;
    const wallItems = useMemo(() => {
        if (!projects.length) return [];

        return Array.from({ length: wallCardCount }, (_, index) => (
            projects[(index * 2 + Math.floor(index / 5)) % projects.length]
        ));
    }, [projects, wallCardCount]);

    useEffect(() => {
        const wall = wallRef.current;
        if (!wall) return undefined;
        const section = wall.closest('.hero-reel-section');
        const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
        const previewImages = Array.from(wall.querySelectorAll('img')).slice(0, 12);
        let latestSnapshot = null;
        let mediaReady = false;
        let entryEnabled = false;
        let entryFrameId = null;
        let entryTimerId = null;
        let mediaTimerId = null;
        let disposed = false;

        const isHomeRoute = () => (
            getSectionIdFromPathname(window.location.pathname) === DEFAULT_SECTION_ID
        );

        const setVisualOpacity = (visualOpacity) => {
            const nextOpacity = entryEnabled ? visualOpacity : 0;

            wall.style.opacity = String(nextOpacity);
            section?.style.setProperty('--hero-backdrop-opacity', String(nextOpacity));
            section?.style.setProperty('--hero-noise-opacity', String(nextOpacity * 0.18));
        };

        const enableEntryIfReady = () => {
            if (disposed || entryEnabled || !mediaReady || !isHomeRoute()) return;

            entryEnabled = true;
            wall.style.visibility = 'visible';

            if (reduceMotion) {
                if (latestSnapshot) updateWall(latestSnapshot);
                return;
            }

            wall.classList.add('hero-project-wall--visuals-entering');
            section?.classList.add('hero-reel-section--visuals-entering');
            entryFrameId = window.requestAnimationFrame(() => {
                entryFrameId = null;
                if (latestSnapshot) updateWall(latestSnapshot);
            });
            entryTimerId = window.setTimeout(() => {
                entryTimerId = null;
                wall.classList.remove('hero-project-wall--visuals-entering');
                section?.classList.remove('hero-reel-section--visuals-entering');
            }, ENTRY_TRANSITION_MS + 80);
        };

        function updateWall({ scrollY, height, ...runtimeSnapshot }) {
            latestSnapshot = { scrollY, height, ...runtimeSnapshot };
            enableEntryIfReady();

            const exitProgress = reduceMotion
                ? (scrollY > height * 0.42 ? 1 : 0)
                : clamp((scrollY - height * 0.08) / Math.max(height * 0.72, 1), 0, 1);
            const visualOpacity = 1 - exitProgress;

            setVisualOpacity(visualOpacity);
            wall.style.transform = reduceMotion
                ? 'none'
                : `translate3d(0, ${exitProgress * 8}vh, 0) scale(${1 - exitProgress * 0.025})`;
            wall.style.visibility = entryEnabled && exitProgress < 1 ? 'visible' : 'hidden';
            wall.style.setProperty(
                '--hero-wall-play-state',
                isFrozenRef.current || reduceMotion || !entryEnabled || exitProgress >= 1 ? 'paused' : 'running',
            );
        }

        wall.style.opacity = '0';
        wall.style.visibility = 'hidden';
        wall.style.setProperty('--hero-wall-play-state', 'paused');
        section?.style.setProperty('--hero-backdrop-opacity', '0');
        section?.style.setProperty('--hero-noise-opacity', '0');

        const unsubscribe = subscribeScrollRuntime(updateWall);
        const mediaReadyPromise = previewImages.length
            ? Promise.allSettled(previewImages.map(waitForImage))
            : Promise.resolve();
        const mediaTimeoutPromise = new Promise((resolve) => {
            mediaTimerId = window.setTimeout(resolve, MEDIA_READY_TIMEOUT_MS);
        });

        Promise.race([mediaReadyPromise, mediaTimeoutPromise]).then(() => {
            if (disposed) return;
            if (mediaTimerId !== null) {
                window.clearTimeout(mediaTimerId);
                mediaTimerId = null;
            }
            mediaReady = true;
            enableEntryIfReady();
        });

        return () => {
            disposed = true;
            if (entryFrameId !== null) window.cancelAnimationFrame(entryFrameId);
            if (entryTimerId !== null) window.clearTimeout(entryTimerId);
            if (mediaTimerId !== null) window.clearTimeout(mediaTimerId);
            wall.classList.remove('hero-project-wall--visuals-entering');
            section?.classList.remove('hero-reel-section--visuals-entering');
            section?.style.removeProperty('--hero-backdrop-opacity');
            section?.style.removeProperty('--hero-noise-opacity');
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        isFrozenRef.current = isFrozen;
        const wall = wallRef.current;
        if (!wall) return;

        const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
        const isHidden = wall.style.visibility === 'hidden';
        wall.style.setProperty(
            '--hero-wall-play-state',
            isFrozen || reduceMotion || isHidden ? 'paused' : 'running',
        );
    }, [isFrozen]);

    if (!projects.length) return null;

    return (
        <div
            ref={wallRef}
            className="hero-project-wall"
            aria-hidden="true"
            style={{
                '--hero-wall-loop-x': isMobileWall ? '-50%' : '-33.333333%',
                '--hero-wall-row-count': 6,
            }}
        >
            <div className="hero-project-wall__plane">
                <div className="hero-project-wall__track">
                    {wallCopies.map((copyIndex) => (
                        <div className="hero-project-wall__grid" key={copyIndex}>
                            {wallItems.map((project, slotIndex) => (
                                <HeroProjectCard
                                    key={`${copyIndex}-${project.id}-${slotIndex}`}
                                    project={project}
                                    slotIndex={slotIndex}
                                    allowVideo={!isMobileWall}
                                    eager={isMobileWall || (copyIndex === 0 && slotIndex < 12)}
                                    priority={copyIndex === 0 && slotIndex < 12}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <div className="hero-project-wall__tint" />
            <div className="hero-project-wall__vignette" />
        </div>
    );
};

export default HeroProjectWall;
