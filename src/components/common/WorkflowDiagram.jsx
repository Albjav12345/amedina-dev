import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WorkflowDiagram = ({ steps = [], className = "" }) => {
    const scrollRef = useRef(null);
    const hoverRef = useRef(false);
    const syncScrollRef = useRef(null);
    const resumeTimeoutRef = useRef(null);
    
    // We duplicate the steps to create a seamless infinite loop
    const extendedSteps = [...steps, ...steps];

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        let animationFrameId = null;
        let ready = false;
        let visible = false;
        let maxScroll = container.scrollWidth / 2;
        // Keep track of exact float position to avoid precision rounding issues at low speeds
        let currentScroll = container.scrollLeft;
        let lastWrittenScroll = currentScroll;
        let roundsScrollOffsets = null;
        
        const scroll = () => {
            animationFrameId = null;

            // A slower, much more elegant cinematic speed
            currentScroll += 0.25; 
            
            // Seamless infinite teleport logic
            // Since array is doubled, the exact midpoint is scrollWidth / 2
            // We use clientWidth/scrollWidth to guarantee perfect arithmetic alignment
            if (maxScroll > 0 && currentScroll >= maxScroll) {
                currentScroll = currentScroll - maxScroll;
            } else if (currentScroll < 0) {
                currentScroll = maxScroll + currentScroll;
            }
            
            // Chromium rounds native scroll offsets to whole CSS pixels. The
            // old loop wrote 0.25px every frame, forcing layout even when the
            // visible scroll position could not change. Detect that behavior
            // once; retain subpixel scrolling in browsers that support it.
            const nextScroll = roundsScrollOffsets ? Math.round(currentScroll) : currentScroll;
            if (nextScroll !== lastWrittenScroll) {
                container.scrollLeft = nextScroll;
                lastWrittenScroll = nextScroll;
                if (roundsScrollOffsets === null) {
                    const actualScroll = container.scrollLeft;
                    roundsScrollOffsets = actualScroll === Math.round(currentScroll);
                    lastWrittenScroll = actualScroll;
                }
            }
            animationFrameId = requestAnimationFrame(scroll);
        };

        const sync = () => {
            const active = visible && !document.hidden;
            container.dataset.active = String(active);
            if (ready && active && !hoverRef.current && maxScroll > 0) {
                if (animationFrameId === null) {
                    currentScroll = container.scrollLeft;
                    lastWrittenScroll = currentScroll;
                    animationFrameId = requestAnimationFrame(scroll);
                }
            } else if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        };
        syncScrollRef.current = sync;
        // Geometry changes only with content/fonts/resizing, not every frame.
        const resizeObserver = new ResizeObserver(() => {
            maxScroll = container.scrollWidth / 2;
            sync();
        });
        resizeObserver.observe(container);
        Array.from(container.children).forEach(node => resizeObserver.observe(node));
        const visibilityObserver = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            sync();
        }, { rootMargin: '100px' });
        visibilityObserver.observe(container);
        document.addEventListener('visibilitychange', sync);

        // Delay the start initially so user has time to read the first node
        const startTimeout = setTimeout(() => {
            ready = true;
            sync();
        }, 1500);

        return () => {
            clearTimeout(startTimeout);
            cancelAnimationFrame(animationFrameId);
            clearTimeout(resumeTimeoutRef.current);
            resizeObserver.disconnect();
            visibilityObserver.disconnect();
            document.removeEventListener('visibilitychange', sync);
            syncScrollRef.current = null;
        };
    }, [steps]);

    const pauseScroll = () => {
        clearTimeout(resumeTimeoutRef.current);
        hoverRef.current = true;
        syncScrollRef.current?.();
    };

    const resumeScroll = () => {
        hoverRef.current = false;
        syncScrollRef.current?.();
    };

    const resumeAfterTouch = () => {
        clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = setTimeout(resumeScroll, 1000);
    };

    const scrollBy = (amount) => {
        pauseScroll();
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
        }
        // If clicking via touch, ensure we release hover state after a moment to resume auto-scroll
        resumeTimeoutRef.current = setTimeout(() => {
            if (scrollRef.current && !scrollRef.current.matches(':hover')) {
                resumeScroll();
            }
        }, 1000);
    };

    return (
        <div 
            className="relative group/diagram w-full"
            onMouseEnter={pauseScroll}
            onMouseLeave={resumeScroll}
            onTouchStart={pauseScroll}
            onTouchEnd={resumeAfterTouch}
        >
            {/* Integrated, subtle fade paddles using pure CSS hover states for zero-react-render performance */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#17181c]/90 via-[#17181c]/50 to-transparent z-20 pointer-events-none flex items-center justify-start opacity-0 group-hover/diagram:opacity-100 transition-opacity duration-300">
                <button
                    aria-label="Previous workflow steps"
                    onClick={() => scrollBy(-200)}
                    className="pointer-events-auto ml-1 p-1.5 rounded-full text-white/50 hover:text-electric-green hover:bg-white/5 transition-colors cursor-pointer"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
            </div>

            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#17181c]/90 via-[#17181c]/50 to-transparent z-20 pointer-events-none flex items-center justify-end opacity-0 group-hover/diagram:opacity-100 transition-opacity duration-300">
                <button
                    aria-label="Next workflow steps"
                    onClick={() => scrollBy(200)}
                    className="pointer-events-auto mr-1 p-1.5 rounded-full text-white/50 hover:text-electric-green hover:bg-white/5 transition-colors cursor-pointer"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            <div 
                ref={scrollRef}
                className={`workflow-diagram-viewport flex flex-nowrap items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar py-8 px-8 ${className}`}
            >
                {extendedSteps.map((step, index) => (
                    <React.Fragment key={index}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: "100px" }}
                            transition={{ delay: (index % steps.length) * 0.1 }}
                            className="flex items-center shrink-0"
                        >
                            {/* Node Box */}
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-electric-green/30 rounded blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                                
                                <div className="relative glass-card px-4 py-2 border-white/20 group-hover:border-electric-green/50 transition-colors">
                                    <span className="font-mono text-[10px] sm:text-xs font-bold text-gray-300 group-hover:text-electric-green tracking-widest uppercase whitespace-nowrap">
                                        {step}
                                    </span>
                                </div>

                                {/* Small indicator light */}
                                <span className="absolute -top-1 -right-1 flex h-2 w-2 z-10 pointer-events-none">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric-green opacity-40"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-electric-green/60"></span>
                                </span>
                            </div>

                            {/* Connecting Arrow/Line */}
                            {index < extendedSteps.length - 1 && (
                                <div className="flex items-center px-2">
                                    <svg width="24" height="12" viewBox="0 0 24 12" fill="none" className="overflow-visible">
                                        <motion.path
                                            d="M0 6H22M22 6L17 1M22 6L17 11"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-white/20 group-hover:text-electric-green"
                                            initial={{ pathLength: 0 }}
                                            whileInView={{ pathLength: 1 }}
                                            viewport={{ once: true, margin: "100px" }}
                                            transition={{ duration: 1, delay: (index % steps.length) * 0.2 }}
                                        />
                                        <circle
                                            r="2"
                                            cx="0"
                                            cy="6"
                                            fill="var(--electric-green)"
                                            className="workflow-packet"
                                            style={{ animationDelay: `${(index % steps.length) * 0.2}s` }}
                                        />
                                    </svg>
                                </div>
                            )}
                        </motion.div>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default WorkflowDiagram;
