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
    // If on a lower-tier device, try to load the '_mobile' version first.
    // Example: 'project.mp4' -> 'project_mobile.mp4'
    const isMobileTier = quality.tier === 'low' || quality.tier === 'mid';
    const mobileVideoUrl = (isMobileTier && hasVideo)
        ? baseVideoUrl.replace('.mp4', '_mobile.mp4')
        : baseVideoUrl;

    const [currentSrc, setCurrentSrc] = useState(mobileVideoUrl);

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

    // Optimized Video Player
    if (hasVideo) {
        return (
            <div ref={containerRef} className="w-full h-full relative">
                <video
                    ref={videoRef}
                    src={currentSrc}
                    muted
                    loop
                    playsInline
                    preload="metadata" // Don't download full file until needed
                    onError={(e) => {
                        // Fallback: If _mobile.mp4 doesn't exist, revert to standard file
                        if (currentSrc !== baseVideoUrl) {
                            console.log(`Mobile optimized video not found for ${project.title}, reverting to HQ.`);
                            setCurrentSrc(baseVideoUrl);
                        }
                    }}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity duration-500 scale-105 group-hover:scale-100 transition-transform"
                />
            </div>
        );
    }

    // Fallback GIF Player (Legacy or No Video)
    // Optimizing purely GIF is hard, but we can lazy load it via 'loading="lazy"' 
    // and rely on browser handling.
    return (
        <div ref={containerRef} className="w-full h-full relative">
            {/* 
               Advanced Optimization for Low-End using GIFs:
               technically standard <img> GIFs play always. 
               If performance is still bad on Twitch project, we might need a static placeholder.
            */}
            <img
                src={mediaSource}
                alt={project.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity duration-500 scale-105 group-hover:scale-100 transition-transform"
            />
        </div>
    );
};

export default SmartThumbnail;
