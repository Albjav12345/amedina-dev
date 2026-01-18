import React, { useRef, useEffect, useState } from 'react';
import { useHardwareQuality } from '../../hooks/useHardwareQuality';

const SmartThumbnail = ({ project }) => {
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

    // If base url changes (unlikely but possible), reset source
    useEffect(() => {
        setCurrentSrc(isMobileTier && hasVideo ? baseVideoUrl.replace('.mp4', '_mobile.mp4') : baseVideoUrl);
    }, [baseVideoUrl, isMobileTier, hasVideo]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
                // Note: We don't need manual play/pause anymore because we unmount the video tag when off-screen.
                // This releases the GPU video decoder immediately.
            },
            {
                rootMargin: '200px', // Pre-load video 200px before it enters viewport
                threshold: 0.01      // Trigger as soon as 1% is visible (virtually)
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
        <div ref={containerRef} className="w-full h-full relative bg-dark-high/50">
            {/* Always render Static Thumbnail (Placeholder) - Instant Load */}
            <img
                src={project.thumbnail}
                alt={project.title}
                loading="lazy"
                decoding="async"
                className={`w-full h-full object-cover transition-opacity duration-500 scale-105 group-hover:scale-100 transition-transform ${isVisible && hasVideo ? 'opacity-0' : 'opacity-60 group-hover:opacity-90'}`}
            />

            {/* Lazy Video Mount - Only exists in DOM when visible */}
            {hasVideo && isVisible && (
                <video
                    src={currentSrc}
                    poster={project.thumbnail}
                    autoPlay
                    muted
                    loop
                    playsInline
                    onError={(e) => {
                        if (currentSrc !== baseVideoUrl) {
                            console.log(`Mobile optimized video not found for ${project.title}, reverting to HQ.`);
                            setCurrentSrc(baseVideoUrl);
                        }
                    }}
                    className="absolute inset-0 w-full h-full object-cover animate-fadeIn"
                />
            )}
        </div>
    );
};

export default SmartThumbnail;
