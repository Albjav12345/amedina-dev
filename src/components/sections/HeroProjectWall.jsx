import React, { useEffect, useMemo, useRef } from 'react';

import portfolioData from '../../data/portfolio';
import useMediaQuery from '../../hooks/useMediaQuery';
import { subscribeScrollRuntime } from '../../utils/scrollRuntime';

const DESKTOP_WALL_CARD_COUNT = 36;
const MOBILE_WALL_CARD_COUNT = 36;
const DESKTOP_COPIES = [0, 1, 2];
const MOBILE_COPIES = [0, 1];
const VIDEO_CARD_INDEXES = new Set([7, 22]);
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

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
    const isMobileWall = useMediaQuery('(max-width: 900px)');
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
        const updateWall = ({ scrollY, height }) => {
            const exitProgress = reduceMotion
                ? (scrollY > height * 0.42 ? 1 : 0)
                : clamp((scrollY - height * 0.08) / Math.max(height * 0.72, 1), 0, 1);
            const visualOpacity = 1 - exitProgress;

            wall.style.opacity = String(visualOpacity);
            wall.style.transform = reduceMotion
                ? 'none'
                : `translate3d(0, ${exitProgress * 8}vh, 0) scale(${1 - exitProgress * 0.025})`;
            wall.style.visibility = exitProgress >= 1 ? 'hidden' : 'visible';
            wall.style.setProperty(
                '--hero-wall-play-state',
                isFrozen || reduceMotion || exitProgress >= 1 ? 'paused' : 'running',
            );
            section?.style.setProperty(
                '--hero-backdrop-opacity',
                String(visualOpacity),
            );
            section?.style.setProperty(
                '--hero-noise-opacity',
                String(visualOpacity * 0.18),
            );
        };

        wall.style.setProperty(
            '--hero-wall-play-state',
            isFrozen || reduceMotion ? 'paused' : 'running',
        );

        const unsubscribe = subscribeScrollRuntime(updateWall);

        return () => {
            section?.style.removeProperty('--hero-backdrop-opacity');
            section?.style.removeProperty('--hero-noise-opacity');
            unsubscribe();
        };
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
