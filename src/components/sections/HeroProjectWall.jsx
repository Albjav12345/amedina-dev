import React, { useEffect, useMemo, useRef } from 'react';

import portfolioData from '../../data/portfolio';
import useMediaQuery from '../../hooks/useMediaQuery';
import { createHeroMotion } from '../../utils/heroMotion';

const DESKTOP_WALL_CARD_COUNT = 36;
const MOBILE_WALL_CARD_COUNT = 36;
const DESKTOP_COPIES = [0, 1, 2];
const MOBILE_COPIES = [0, 1];
const VIDEO_CARD_INDEXES = new Set([7, 22]);
const WALL_IMAGE_SIZES = '(max-width: 640px) 190px, (max-width: 1023.98px) 225px, (min-width: 2375px) 380px, (min-width: 1469px) 16vw, 235px';

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
                    poster={project.media.wallPoster || project.media.poster || project.thumbnail}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    tabIndex={-1}
                />
            ) : (
                <img
                    className="hero-project-card__media"
                    src={project.media?.wallPoster || project.media?.poster || project.thumbnail}
                    srcSet={project.media?.wallPosterSrcSet}
                    sizes={WALL_IMAGE_SIZES}
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

const HeroProjectWall = ({ isFrozen = false, isAppleTouch = false }) => {
    const wallRef = useRef(null);
    const isFrozenRef = useRef(isFrozen);
    const syncVideoPlaybackRef = useRef(null);
    const motionRef = useRef(null);
    const isWallActiveRef = useRef(false);
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
        const motion = createHeroMotion({
            wall,
            section: wall.closest('.hero-reel-section'),
            isFrozen: () => isFrozenRef.current,
            isAppleTouch,
            onActivityChange: (active) => {
                isWallActiveRef.current = active;
                syncVideoPlaybackRef.current?.();
            },
        });
        motionRef.current = motion;
        return () => {
            motion.destroy();
            motionRef.current = null;
        };
    }, [isAppleTouch]);

    useEffect(() => {
        const wall = wallRef.current;
        if (!wall) return undefined;

        const videos = Array.from(wall.querySelectorAll('video'));
        const visibleVideos = new Set();
        const playback = new Map();

        const syncPlayback = () => {
            const shouldPlay = !document.hidden
                && !isFrozenRef.current
                && isWallActiveRef.current;

            videos.forEach((video) => {
                const playing = shouldPlay && visibleVideos.has(video);
                if (playback.get(video) === playing) return;
                playback.set(video, playing);
                if (playing) {
                    // Repeated copies share the visible preview's playback position.
                    const peer = videos.find(candidate => candidate !== video
                        && candidate.currentSrc === video.currentSrc && !candidate.paused);
                    if (peer && Number.isFinite(video.duration)) video.currentTime = peer.currentTime;
                    video.play()?.catch(() => undefined);
                } else {
                    video.pause();
                }
            });
        };

        // Warm the next preview before it enters the screen. Offscreen repeats
        // should not continuously decode frames and dirty filtered surfaces.
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(({ target, isIntersecting }) => {
                if (isIntersecting) visibleVideos.add(target);
                else visibleVideos.delete(target);
            });
            syncPlayback();
        }, { rootMargin: '180px' });
        videos.forEach(video => observer.observe(video));

        syncVideoPlaybackRef.current = syncPlayback;
        document.addEventListener('visibilitychange', syncPlayback);
        syncPlayback();

        return () => {
            observer.disconnect();
            document.removeEventListener('visibilitychange', syncPlayback);
            syncVideoPlaybackRef.current = null;
            videos.forEach((video) => video.pause());
        };
    }, [isMobileWall, isAppleTouch]);

    useEffect(() => {
        isFrozenRef.current = isFrozen;
        const wall = wallRef.current;
        if (!wall) return;
        motionRef.current?.refresh();
    }, [isFrozen, isAppleTouch]);

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
                                    eager={true}
                                    priority={false}
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
