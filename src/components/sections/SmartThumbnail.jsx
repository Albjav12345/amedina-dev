import React, { useEffect, useRef, useState } from 'react';

const VIDEO_RELEASE_MS = 260;

const SmartThumbnail = ({ project, isAllowedToPlay = false, stagger = 0 }) => {
    const videoRef = useRef(null);
    const [shouldMount, setShouldMount] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isVideoVisible, setIsVideoVisible] = useState(false);

    const previewSource = project.media?.cardPreview || null;
    const posterSource = project.media?.poster || project.thumbnail;
    const hasVideo = Boolean(previewSource);

    useEffect(() => {
        let timeoutId;
        let visibilityFrameId;
        let releaseTimeoutId;

        if (hasVideo && isAllowedToPlay) {
            const delay = Math.max(0, stagger) * 120;
            timeoutId = window.setTimeout(() => {
                setShouldMount(true);
                visibilityFrameId = window.requestAnimationFrame(() => {
                    setIsVideoVisible(true);
                });
            }, delay);
        } else {
            setIsVideoVisible(false);

            releaseTimeoutId = window.setTimeout(() => {
                const currentVideo = videoRef.current;
                if (currentVideo) {
                    currentVideo.pause();
                }
                setShouldMount(false);
                setIsLoaded(false);
            }, VIDEO_RELEASE_MS);
        }

        return () => {
            if (timeoutId) {
                window.clearTimeout(timeoutId);
            }
            if (visibilityFrameId) {
                window.cancelAnimationFrame(visibilityFrameId);
            }
            if (releaseTimeoutId) {
                window.clearTimeout(releaseTimeoutId);
            }
        };
    }, [hasVideo, isAllowedToPlay, stagger]);

    useEffect(() => {
        const currentVideo = videoRef.current;

        if (!currentVideo) {
            return undefined;
        }

        if (!isAllowedToPlay || !shouldMount) {
            return undefined;
        }

        const playPromise = currentVideo.play?.();
        if (playPromise?.catch) {
            playPromise.catch(() => {});
        }

        return () => {
            currentVideo.pause();
        };
    }, [isAllowedToPlay, shouldMount]);

    return (
        <div className="w-full h-full relative group bg-dark-high/50">
            <img
                src={posterSource}
                alt={project.title}
                loading="lazy"
                decoding="async"
                className={`w-full h-full object-cover transition-all duration-700 ease-out ${
                    isLoaded && isVideoVisible
                        ? 'opacity-0 scale-110'
                        : 'opacity-80 scale-100 group-hover:opacity-100 group-hover:scale-105'
                }`}
            />

            {hasVideo && shouldMount && (
                <video
                    ref={videoRef}
                    src={previewSource}
                    poster={posterSource}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    onLoadedData={() => {
                        setIsLoaded(true);
                    }}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
                        isLoaded && isVideoVisible
                            ? 'opacity-70 group-hover:opacity-100 group-hover:scale-105'
                            : 'opacity-0 scale-100'
                    }`}
                />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-dark-void/90 via-dark-void/20 to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none" />
        </div>
    );
};

export default SmartThumbnail;
