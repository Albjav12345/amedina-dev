import React, { useRef, useEffect, useState } from 'react';
import { useHardwareQuality } from '../../hooks/useHardwareQuality';

const SmartThumbnail = ({ project, isAllowedToPlay = false, stagger = 0 }) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const quality = useHardwareQuality();
    const [shouldMount, setShouldMount] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Determine media sources
    const previewVideo = project.previewUrl && project.previewUrl.endsWith('.mp4') ? project.previewUrl : null;
    const legacyVideo = project.demoType === 'video' || (project.demoUrl && project.demoUrl.endsWith('.mp4')) ? project.demoUrl : null;
    const baseVideoUrl = previewVideo || legacyVideo;
    const hasVideo = !!baseVideoUrl;

    const isMobileTier = quality.tier === 'low' || quality.tier === 'mid' || (typeof window !== 'undefined' && window.innerWidth < 768);
    const mobileVideoUrl = (isMobileTier && hasVideo) ? baseVideoUrl.replace('.mp4', '_mobile.mp4') : baseVideoUrl;

    const [currentSrc, setCurrentSrc] = useState(mobileVideoUrl);

    // STAGGERED MOUNTING LOGIC
    useEffect(() => {
        let timeout;
        if (isAllowedToPlay) {
            const delay = stagger * 150;
            timeout = setTimeout(() => {
                setShouldMount(true);
            }, delay);
        } else {
            setShouldMount(false);
            setIsLoaded(false);
        }
        return () => clearTimeout(timeout);
    }, [isAllowedToPlay, stagger]);

    // Update source if base changes
    useEffect(() => {
        setCurrentSrc(isMobileTier && hasVideo ? baseVideoUrl.replace('.mp4', '_mobile.mp4') : baseVideoUrl);
    }, [baseVideoUrl, isMobileTier, hasVideo]);

    return (
        <div ref={containerRef} className="w-full h-full relative group bg-dark-high/50">
            {/* 1. LAYER 0: Static Facade (Always visible initially) */}
            <img
                src={project.thumbnail}
                alt={project.title}
                loading="lazy"
                decoding="async"
                className={`w-full h-full object-cover transition-all duration-700 ease-out ${isLoaded ? 'opacity-0 scale-110' : 'opacity-80 scale-100 group-hover:opacity-100 group-hover:scale-105'}`}
            />

            {/* 2. LAYER 1: Dynamic Video (Only mounts when allowed by Orchestrator) */}
            {hasVideo && shouldMount && (
                <video
                    ref={videoRef}
                    src={currentSrc}
                    poster={project.thumbnail}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    onLoadedData={() => {
                        setIsLoaded(true);
                    }}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${isLoaded ? 'opacity-70 group-hover:opacity-100 group-hover:scale-105' : 'opacity-0 scale-100'}`}
                    onError={() => {
                        if (currentSrc !== baseVideoUrl) {
                            setCurrentSrc(baseVideoUrl);
                        }
                    }}
                >
                    <track kind="captions" src="" label="English" default />
                </video>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-dark-void/90 via-dark-void/20 to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none" />
        </div>
    );
};

export default SmartThumbnail;
