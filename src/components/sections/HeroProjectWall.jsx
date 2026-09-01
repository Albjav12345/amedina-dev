import React, { useEffect, useMemo, useRef } from 'react';

import portfolioData from '../../data/portfolio';
import { subscribeScrollRuntime } from '../../utils/scrollRuntime';

const WALL_CARD_COUNT = 36;
const VIDEO_CARD_INDEXES = new Set([7, 22]);
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const HeroProjectCard = ({ project, slotIndex }) => {
    const useVideo = VIDEO_CARD_INDEXES.has(slotIndex) && Boolean(project.media?.cardPreview);

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
                    loading={slotIndex < 12 ? 'eager' : 'lazy'}
                    decoding="async"
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
    const projects = portfolioData.projects;
    const wallItems = useMemo(() => {
        if (!projects.length) return [];

        return Array.from({ length: WALL_CARD_COUNT }, (_, index) => (
            projects[(index * 2 + Math.floor(index / 5)) % projects.length]
        ));
    }, [projects]);

    useEffect(() => {
        const wall = wallRef.current;
        if (!wall) return undefined;

        const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
        const updateWall = ({ scrollY, height }) => {
            const exitProgress = reduceMotion
                ? (scrollY > height * 0.42 ? 1 : 0)
                : clamp((scrollY - height * 0.08) / Math.max(height * 0.72, 1), 0, 1);

            wall.style.opacity = String(1 - exitProgress);
            wall.style.transform = reduceMotion
                ? 'none'
                : `translate3d(0, ${exitProgress * 8}vh, 0) scale(${1 - exitProgress * 0.025})`;
        };

        wall.style.setProperty(
            '--hero-wall-play-state',
            isFrozen || reduceMotion ? 'paused' : 'running',
        );

        return subscribeScrollRuntime(updateWall);
    }, [isFrozen]);

    if (!projects.length) return null;

    return (
        <div ref={wallRef} className="hero-project-wall" aria-hidden="true">
            <div className="hero-project-wall__plane">
                <div className="hero-project-wall__track">
                    {[0, 1, 2].map((copyIndex) => (
                        <div className="hero-project-wall__grid" key={copyIndex}>
                            {wallItems.map((project, slotIndex) => (
                                <HeroProjectCard
                                    key={`${copyIndex}-${project.id}-${slotIndex}`}
                                    project={project}
                                    slotIndex={slotIndex}
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
