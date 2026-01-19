import React, { useRef, useEffect, useState } from 'react';
import { usePerformance } from '../../context/PerformanceContext';

const SmartThumbnail = ({ project, index = 0 }) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const { config } = usePerformance();

    // Determine media type: Prefer VIDEO if available (MP4 is hardware accelerated)
    // Priority: previewUrl (New) -> demoUrl (Legacy Video) -> thumbnail (GIF/Img)
    const previewVideo = project.previewUrl && project.previewUrl.endsWith('.mp4') ? project.previewUrl : null;
    const legacyVideo = project.demoType === 'video' || (project.demoUrl && project.demoUrl.endsWith('.mp4')) ? project.demoUrl : null;

    // Base video source
    const baseVideoUrl = previewVideo || legacyVideo;
    const hasVideo = !!baseVideoUrl;

    // Automatic Mobile Optimization Logic
    // If on a lower-tier device OR small screen, try to load the '_mobile' version first.
    // For new tier system: Tier 1-3 should use mobile versions
    const isMobileTier = (typeof window !== 'undefined' && window.innerWidth < 768);
    const mobileVideoUrl = (isMobileTier && hasVideo)
        ? baseVideoUrl.replace('.mp4', '_mobile.mp4')
        : baseVideoUrl;

    const [currentSrc, setCurrentSrc] = useState(mobileVideoUrl);

    // DEBUG: Verify Tier and Video Source
    useEffect(() => {
        if (hasVideo && config.enableVideos) {
            console.log(`[SmartThumbnail] Project: ${project.title}`);
            console.log(`[SmartThumbnail] Tier: ${config.name}, IsMobile: ${isMobileTier}`);
            console.log(`[SmartThumbnail] Loading: ${currentSrc}`);
        }
    }, [config, currentSrc, project.title, hasVideo, isMobileTier]);

    // If base url changes (unlikely but possible), reset source
    useEffect(() => {
        setCurrentSrc(isMobileTier && hasVideo ? baseVideoUrl.replace('.mp4', '_mobile.mp4') : baseVideoUrl);
    }, [baseVideoUrl, isMobileTier, hasVideo]);

    const [shouldMount, setShouldMount] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        let timer;
        if (isVisible && config.enableVideos) {
            // STAGGERED DWELL PLAY: Cascade video loading to prevent simultaneous CPU spikes
            // More pronounced delay (250ms per index) for a visible "one-by-one" cascade
            const staggerDelay = Math.min(index * 250, 1500);
            const totalDelay = 500 + staggerDelay;

            timer = setTimeout(() => {
                setShouldMount(true);
            }, totalDelay);
        } else {
            setShouldMount(false);
            setIsLoaded(false);
        }
        return () => clearTimeout(timer);
    }, [isVisible, config.enableVideos, index]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);

                // Hardware Optimization: Pause video when out of view
                if (videoRef.current) {
                    if (entry.isIntersecting) {
                        videoRef.current.play().catch(() => { });
                    } else {
                        videoRef.current.pause();
                    }
                }
            },
            {
                rootMargin: '100px', // Increased margin for smoother transitions
                threshold: 0.1
            }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
        };
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full relative group bg-dark-high/50">
            {/* 1. LAYER 0: Static Facade (Visible until video is READY) */}
            <img
                src={project.thumbnail}
                alt={project.title}
                loading="lazy"
                decoding="async"
                className={`w-full h-full object-cover transition-opacity duration-700 ${isLoaded ? 'opacity-0' : 'opacity-80 group-hover:opacity-100'}`}
            />

            {/* 2. LAYER 1: Dynamic Video (Mounts ONLY after dwell delay) */}
            {hasVideo && shouldMount && (
                <video
                    ref={videoRef}
                    src={currentSrc}
                    poster={project.thumbnail}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto" // Preload for faster transition once mounted
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoadedData={() => setIsLoaded(true)}
                    onError={(e) => {
                        if (currentSrc !== baseVideoUrl) {
                            setCurrentSrc(baseVideoUrl);
                        }
                    }}
                >
                    <track kind="captions" src="" label="English" default />
                </video>
            )}

            {/* Overlay Gradient for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-void/90 via-dark-void/20 to-transparent opacity-60 pointer-events-none" />
        </div>
    );
};


export default SmartThumbnail;
