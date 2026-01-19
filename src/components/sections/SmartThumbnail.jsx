import React, { useRef, useEffect, useState } from 'react';
import { useHardwareQuality } from '../../hooks/useHardwareQuality';

const SmartThumbnail = ({ project }) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const quality = useHardwareQuality();

    // Determine media type: Prefer VIDEO if available (MP4 is hardware accelerated)
    // Priority: previewUrl (New) -> demoUrl (Legacy Video) -> thumbnail (GIF/Img)
    const previewVideo = project.previewUrl && project.previewUrl.endsWith('.mp4') ? project.previewUrl : null;
    const legacyVideo = project.demoType === 'video' || (project.demoUrl && project.demoUrl.endsWith('.mp4')) ? project.demoUrl : null;

    // Base video source
    const baseVideoUrl = previewVideo || legacyVideo;
    const hasVideo = !!baseVideoUrl;

    // Automatic Mobile Optimization Logic
    // If on a lower-tier device OR small screen, try to load the '_mobile' version first.
    // robust check: Tier is low/mid OR width < 768px (Mobile Breakpoint)
    const isMobileTier = quality.tier === 'low' || quality.tier === 'mid' || (typeof window !== 'undefined' && window.innerWidth < 768);
    const mobileVideoUrl = (isMobileTier && hasVideo)
        ? baseVideoUrl.replace('.mp4', '_mobile.mp4')
        : baseVideoUrl;

    const [currentSrc, setCurrentSrc] = useState(mobileVideoUrl);

    // DEBUG: Verify Quality Tier and Video Source
    useEffect(() => {
        if (hasVideo) {
            console.log(`[SmartThumbnail] Project: ${project.title}`);
            console.log(`[SmartThumbnail] Tier: ${quality.tier}, IsMobile: ${isMobileTier}`);
            console.log(`[SmartThumbnail] Loading: ${currentSrc}`);
        }
    }, [quality.tier, currentSrc, project.title]);

    // If base url changes (unlikely but possible), reset source
    useEffect(() => {
        setCurrentSrc(isMobileTier && hasVideo ? baseVideoUrl.replace('.mp4', '_mobile.mp4') : baseVideoUrl);
    }, [baseVideoUrl, isMobileTier, hasVideo]);

    const mediaSource = hasVideo ? currentSrc : project.thumbnail;

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);

                // Hardware Optimization: Pause video when out of view
                if (videoRef.current) {
                    if (entry.isIntersecting) {
                        videoRef.current.play().catch(() => { }); // Catch autoplay rejection
                    } else {
                        videoRef.current.pause();
                    }
                }
            },
            {
                rootMargin: '50px', // Preload/Play slightly before entering viewport
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
            {/* 1. LAYER 0: Static Facade (Always visible initially) */}
            <img
                src={project.thumbnail}
                alt={project.title}
                loading="lazy"
                decoding="async"
                className={`w-full h-full object-cover transition-opacity duration-700 ${isVisible && hasVideo ? 'opacity-0' : 'opacity-80 group-hover:opacity-100'}`}
            />

            {/* 2. LAYER 1: Dynamic Video (Only mounts when looking at it) */}
            {hasVideo && isVisible && (
                <video
                    ref={videoRef}
                    src={currentSrc}
                    poster={project.thumbnail} // Extra fallback
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="none" // Aggressive bandwidth saving
                    className="absolute inset-0 w-full h-full object-cover animate-fadeIn"
                    onLoadedData={() => {
                        // Optional: Fade in logic could go here
                    }}
                    onError={(e) => {
                        if (currentSrc !== baseVideoUrl) {
                            console.log(`[SmartThumbnail] Mobile video missing, reverting to HQ: ${baseVideoUrl}`);
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
