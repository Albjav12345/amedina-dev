import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WorkflowDiagram = ({ steps = [], className = "" }) => {
    const scrollRef = useRef(null);
    const hoverRef = useRef(false);
    
    // We duplicate the steps to create a seamless infinite loop
    const extendedSteps = [...steps, ...steps];

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        let animationFrameId;
        // Keep track of exact float position to avoid precision rounding issues at low speeds
        let currentScroll = container.scrollLeft;
        
        const scroll = () => {
            if (hoverRef.current) {
                // If paused, keep syncing the exact position to avoid jumps when resuming
                currentScroll = container.scrollLeft;
                animationFrameId = requestAnimationFrame(scroll);
                return;
            }

            // A slower, much more elegant cinematic speed
            currentScroll += 0.25; 
            
            // Seamless infinite teleport logic
            // Since array is doubled, the exact midpoint is scrollWidth / 2
            // We use clientWidth/scrollWidth to guarantee perfect arithmetic alignment
            const maxScroll = container.scrollWidth / 2;
            if (currentScroll >= maxScroll) {
                currentScroll = currentScroll - maxScroll;
            } else if (currentScroll < 0) {
                currentScroll = maxScroll + currentScroll;
            }
            
            container.scrollLeft = currentScroll;
            animationFrameId = requestAnimationFrame(scroll);
        };

        // Delay the start initially so user has time to read the first node
        const startTimeout = setTimeout(() => {
            animationFrameId = requestAnimationFrame(scroll);
        }, 1500);

        return () => {
            clearTimeout(startTimeout);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const scrollBy = (amount) => {
        hoverRef.current = true;
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
        }
        // If clicking via touch, ensure we release hover state after a moment to resume auto-scroll
        setTimeout(() => {
            if (scrollRef.current && !scrollRef.current.matches(':hover')) {
                hoverRef.current = false;
            }
        }, 1000);
    };

    return (
        <div 
            className="relative group/diagram w-full"
            onMouseEnter={() => hoverRef.current = true}
            onMouseLeave={() => hoverRef.current = false}
            onTouchStart={() => hoverRef.current = true}
            onTouchEnd={() => setTimeout(() => { hoverRef.current = false; }, 1000)}
        >
            {/* Integrated, subtle fade paddles using pure CSS hover states for zero-react-render performance */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#17181c]/90 via-[#17181c]/50 to-transparent z-20 pointer-events-none flex items-center justify-start opacity-0 group-hover/diagram:opacity-100 transition-opacity duration-300">
                <button
                    onClick={() => scrollBy(-200)}
                    className="pointer-events-auto ml-1 p-1.5 rounded-full text-white/50 hover:text-electric-green hover:bg-white/5 transition-colors cursor-pointer"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
            </div>

            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#17181c]/90 via-[#17181c]/50 to-transparent z-20 pointer-events-none flex items-center justify-end opacity-0 group-hover/diagram:opacity-100 transition-opacity duration-300">
                <button
                    onClick={() => scrollBy(200)}
                    className="pointer-events-auto mr-1 p-1.5 rounded-full text-white/50 hover:text-electric-green hover:bg-white/5 transition-colors cursor-pointer"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            <div 
                ref={scrollRef}
                className={`flex flex-nowrap items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar py-8 px-8 ${className}`}
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
                                        <motion.circle
                                            r="2"
                                            fill="var(--electric-green)"
                                            initial={{ cx: 0, cy: 6, opacity: 0 }}
                                            animate={{ cx: [0, 24], opacity: [0, 1, 0] }}
                                            transition={{ repeat: Infinity, duration: 1.5, delay: (index % steps.length) * 0.2 }}
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
