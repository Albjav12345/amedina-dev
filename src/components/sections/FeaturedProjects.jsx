import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, ArrowUpRight, Play, Terminal, X, Github, Cpu, ExternalLink, Zap, Box, Brain, Layers, Globe } from 'lucide-react';
import WorkflowDiagram from '../common/WorkflowDiagram';
import { fadeInUp, viewportConfig } from '../../utils/animations';
import { useHardwareQuality } from '../../hooks/useHardwareQuality';
import SmartThumbnail from './SmartThumbnail';

import portfolioData from '../../data/portfolio';
const { projects } = portfolioData;

const cardVariants = {
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        pointerEvents: "auto",
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1]
        }
    },
    below: {
        opacity: 0,
        y: 80,
        scale: 0.95,
        pointerEvents: "none",
        transition: { duration: 0.4 }
    },
    above: {
        opacity: 0,
        y: -150,
        scale: 0.95,
        pointerEvents: "none",
        transition: { duration: 0.4 }
    }
};

const FeaturedProjects = () => {
    const [selectedId, setSelectedId] = useState(null);
    const [isContentReady, setContentReady] = useState(false);
    const quality = useHardwareQuality();

    // ORCHESTRATOR & DIRECTIONAL STATE
    const [cardStatus, setCardStatus] = useState({}); // { id: 'visible' | 'above' | 'below' }
    const [allowedVideoIds, setAllowedVideoIds] = useState([]);
    const dwellTimeoutRef = useRef(null);
    const cardRefs = useRef({});

    // PROXIMITY-BASED VIDEO ORCHESTRATOR
    useEffect(() => {
        const updateOrchestration = () => {
            if (dwellTimeoutRef.current) clearTimeout(dwellTimeoutRef.current);

            const maxVideos = quality.tier === 'low' ? 0 : 6;

            dwellTimeoutRef.current = setTimeout(() => {
                // Focus Line: 65% of viewport height (Center + 15% shift)
                const targetLine = window.innerHeight * 0.65;

                // 1. Identify IDs that the Viewport Observer says are currently 'visible'
                const visibleIds = Object.entries(cardStatus)
                    .filter(([_, status]) => status === 'visible')
                    .map(([id]) => Number(id));

                if (visibleIds.length === 0) {
                    setAllowedVideoIds([]);
                    return;
                }

                // 2. Measure physical distance for all 'visible' cards
                const measured = visibleIds.map(id => {
                    const el = cardRefs.current[id];
                    if (!el) return null;
                    const rect = el.getBoundingClientRect();
                    const centerY = rect.top + rect.height / 2;
                    return { id, distance: Math.abs(centerY - targetLine) };
                }).filter(Boolean);

                // 3. Sort by proximity (Closest to the focus line wins the priority queue)
                const sorted = measured.sort((a, b) => a.distance - b.distance);
                const winningIds = sorted.slice(0, maxVideos).map(entry => entry.id);

                setAllowedVideoIds(winningIds);
            }, 150); // Dwell time: 150ms
        };

        // Trigger on card entry/exit OR on mount
        updateOrchestration();

        // Also trigger on scroll-stop for precise proximity re-evaluation
        const handleScroll = () => updateOrchestration();
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (dwellTimeoutRef.current) clearTimeout(dwellTimeoutRef.current);
        };
    }, [cardStatus, quality.tier]);

    const handleViewportAction = (id, inView, entry) => {
        if (inView) {
            setCardStatus(prev => ({ ...prev, [id]: 'visible' }));
        } else if (entry) {
            const isAbove = entry.boundingClientRect.top < 0;
            setCardStatus(prev => ({ ...prev, [id]: isAbove ? 'above' : 'below' }));
        }
    };

    const { projects: projectsHeader } = portfolioData.ui.sections;

    const iconMap = {
        Zap: <Zap className="w-6 h-6 md:w-10 md:h-10 text-electric-green" />,
        Box: <Box className="w-6 h-6 md:w-10 md:h-10 text-electric-green" />,
        Cpu: <Cpu className="w-6 h-6 md:w-10 md:h-10 text-electric-green" />,
        Brain: <Brain className="w-6 h-6 md:w-10 md:h-10 text-electric-cyan" />,
        Layers: <Layers className="w-6 h-6 md:w-10 md:h-10 text-electric-green" />,
        Globe: <Globe className="w-6 h-6 md:w-10 md:h-10 text-electric-cyan" />
    };

    // Lock body scroll when modal is open
    useEffect(() => {
        if (selectedId) {
            document.body.style.overflow = 'hidden';
            setContentReady(false);
        } else {
            document.body.style.overflow = 'unset';
            setContentReady(false);
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedId]);

    const activeProject = projects.find(p => p.id === selectedId);

    return (
        <section id="projects" className="py-20 md:py-32 relative overflow-hidden render-optimize">
            {/* Background Decor - GPU-Friendly Radial Gradient */}
            <div
                className="absolute top-[20%] right-0 w-[600px] h-[600px] md:w-[1000px] md:h-[1000px] pointer-events-none opacity-40 translate-x-1/2"
                style={{ background: "radial-gradient(circle, rgba(0, 255, 153, 0.13) 0%, transparent 70%)" }}
            />

            <div className="container mx-auto px-6">

                {/* Section Title */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={viewportConfig}
                    className="flex flex-col mb-16"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <span className="font-mono text-xs text-electric-green bg-electric-green/10 border border-electric-green/20 px-2 py-1 rounded">{projectsHeader.id}</span>
                        <div className="h-px flex-grow bg-gradient-to-r from-electric-green/30 to-transparent"></div>
                    </div>
                    <h2 className="text-5xl font-bold font-mono tracking-tighter uppercase text-white">
                        {projectsHeader.line1} <br />
                        <span className="text-electric-green">{projectsHeader.line2}</span>
                    </h2>
                </motion.div>

                {/* Grid Layout with Directional System */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                    {projects.map((project, index) => {
                        const isSelected = selectedId === project.id;
                        const isAllowedToPlay = allowedVideoIds.includes(project.id);
                        const currentStatus = isSelected ? "visible" : (cardStatus[project.id] || "below");

                        return (
                            <motion.div
                                ref={el => cardRefs.current[project.id] = el}
                                key={project.id}
                                layoutId={`project-${project.id}`}
                                initial="below"
                                animate={currentStatus}
                                viewport={{ once: false, amount: 0.1, margin: "15% 0px 15% 0px" }}
                                onViewportEnter={(entry) => handleViewportAction(project.id, true, entry)}
                                onViewportLeave={(entry) => handleViewportAction(project.id, false, entry)}
                                variants={cardVariants}
                                onClick={() => setSelectedId(project.id)}
                                className="gpu-accelerated cursor-pointer group relative flex flex-col h-[220px] md:h-[450px] overflow-hidden rounded-xl border border-white/5 bg-dark-high/50"
                            >
                                <div className="relative w-full h-[60%] md:h-[60%] overflow-hidden bg-black/40 border-b border-white/10 group-hover:border-electric-green/20 transition-colors">
                                    <SmartThumbnail
                                        project={project}
                                        isAllowedToPlay={isAllowedToPlay}
                                        stagger={allowedVideoIds.indexOf(project.id)}
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-dark-high via-transparent to-transparent pointer-events-none group-hover:opacity-40 transition-opacity duration-700"></div>
                                    {/* Scanning Line Effect - DISABLED ON LOW TIER */}
                                    {!quality.simplePhysics && (
                                        <div className="absolute top-0 left-0 w-full h-[1px] bg-electric-green/10 shadow-[0_0_10px_rgba(0,255,153,0.3)] animate-scan pointer-events-none z-20"></div>
                                    )}

                                    <div className="absolute top-4 left-4 flex gap-1 z-20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500/30"></div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/30"></div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500/30"></div>
                                    </div>
                                </div>

                                <div className="p-3 md:p-8 flex flex-col justify-between flex-grow relative z-10">
                                    <div className="relative">
                                        <div className="flex justify-between items-start mb-1 md:mb-4">
                                            <div className="w-6 h-6 md:w-10 md:h-10 rounded-md md:rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-electric-green/50 transition-colors">
                                                <Code2 className="w-3 h-3 md:w-5 md:h-5 text-gray-400 group-hover:text-electric-green transition-colors" />
                                            </div>
                                            <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-gray-600 group-hover:text-electric-green transition-colors" />
                                        </div>
                                        <h3 className="text-sm md:text-xl font-bold text-white mb-0.5 md:mb-2 leading-tight group-hover:text-electric-green transition-colors line-clamp-1">{project.title}</h3>
                                        <p className="text-gray-500 font-mono text-[7px] md:text-[9px] uppercase tracking-widest line-clamp-1">{project.subtitle}</p>
                                    </div>

                                    <div className="hidden md:flex mt-6 flex-wrap gap-2">
                                        {project.stack.slice(0, 3).map(tech => (
                                            <span key={tech} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[8px] font-mono text-gray-500">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Background Glow - Simple opacity fade on low tier */}
                                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-electric-green/5 blur-3xl rounded-full group-hover:bg-electric-green/10 transition-colors duration-500"></div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>


            {/* Modal Overlay */}
            <AnimatePresence>
                {selectedId && activeProject && (
                    <div className="fixed inset-0 z-[70] flex items-start md:items-center justify-center p-4 md:p-8 overflow-y-auto custom-scrollbar pt-10 md:pt-8 line-clamp-none">
                        {/* Backdrop - Adaptive Glass */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedId(null)}
                            className={`fixed inset-0 bg-dark-void/90 cursor-pointer ${quality.allowBlur ? 'backdrop-blur-xl' : ''}`}
                        />

                        {/* Close Button - Moved OUTSIDE layoutId container to prevent 'stretching' */}
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                            onClick={() => setSelectedId(null)}
                            className="fixed md:absolute top-6 right-6 p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-electric-green hover:text-dark-void z-[110] transition-all cursor-pointer"
                        >
                            <X className="w-6 h-6" />
                        </motion.button>

                        <motion.div
                            layoutId={`project-${selectedId}`}
                            transition={quality.spring}
                            onLayoutAnimationComplete={() => setContentReady(true)}
                            className={`relative w-full max-w-6xl mx-auto border border-white/10 md:rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:grid lg:grid-cols-2 h-auto min-h-[50vh] gpu-accelerated my-8 md:my-0 ${quality.glassClass}`}
                        >

                            {/* Orchestrated Content Fade-in - DEFERRED RENDER */}
                            {(isContentReady || quality.tier === 'high') && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="contents"
                                >
                                    {/* PART 2: Text Content & Actions */}
                                    <div className="w-full lg:col-start-1 lg:row-start-1 lg:row-span-2 p-6 md:p-12 md:overflow-y-auto custom-scrollbar flex flex-col order-2 lg:order-none border-b lg:border-b-0 border-white/5">
                                        <div className="space-y-8 flex-grow">
                                            <div className="space-y-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="space-y-2 md:space-y-4 md:flex-grow">
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-mono text-[10px] text-electric-green bg-electric-green/10 px-2 py-0.5 rounded border border-electric-green/20 uppercase tracking-widest">
                                                                Active_Module
                                                            </span>
                                                            <div className="h-px w-8 bg-white/10 hidden md:block"></div>
                                                        </div>

                                                        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tighter leading-tight">
                                                            {activeProject.title}
                                                        </h2>
                                                    </div>

                                                    {activeProject.icon && (
                                                        <div className="shrink-0 w-12 h-12 md:w-24 md:h-24 rounded-2xl bg-white/5 border border-white/10 shadow-glow-green/20 overflow-hidden flex items-center justify-center md:mt-4 lg:mt-6">
                                                            {iconMap[activeProject.icon] ? (
                                                                <div className="flex items-center justify-center w-full h-full p-3 md:p-5">
                                                                    {iconMap[activeProject.icon]}
                                                                </div>
                                                            ) : (
                                                                <img src={activeProject.icon} alt="icon" className="w-full h-full object-cover" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <p className="text-base md:text-lg text-gray-400 font-medium leading-relaxed">
                                                    {activeProject.subtitle}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 py-2">
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 text-gray-500 font-mono text-[10px] uppercase tracking-widest">
                                                        <Cpu className="w-3 h-3 text-electric-cyan" />
                                                        Context_Problem
                                                    </div>
                                                    <p className="text-sm text-gray-400 leading-relaxed">
                                                        {activeProject.problem}
                                                    </p>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 text-electric-green font-mono text-[10px] uppercase tracking-widest">
                                                        <Terminal className="w-3 h-3" />
                                                        Engineered_Solution
                                                    </div>
                                                    <p className="text-sm text-gray-400 leading-relaxed border-l border-electric-green/20 pl-4 py-1">
                                                        {activeProject.solution}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <span className="text-gray-500 font-mono text-[10px] uppercase tracking-widest block pb-2 border-b border-white/5">Tech_Arsenal</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {activeProject.stack.map(tech => (
                                                        <span key={tech} className="px-3 py-1 bg-white/5 border border-white/10 rounded-md font-mono text-[10px] text-gray-300">
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Footer */}
                                        <div className="pt-10 mt-auto flex flex-col sm:flex-row gap-4">
                                            <a
                                                href={activeProject.githubLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-grow btn-system inline-flex items-center justify-center gap-3 px-8 py-4 group"
                                            >
                                                <span className="font-mono text-sm tracking-widest uppercase">Access_Repo</span>
                                                <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            </a>
                                        </div>
                                        <div className="h-4 lg:hidden" />
                                    </div>

                                    {/* PART 1: Media/Demo - TOP on Mobile */}
                                    <div className="w-full lg:col-start-2 lg:row-start-1 bg-black/40 border-b lg:border-l border-white/5 flex flex-col p-6 md:p-12 gap-6 order-1 lg:order-none">
                                        <div className="space-y-4 flex-grow">
                                            <span className="text-gray-500 font-mono text-[10px] uppercase tracking-widest inline-flex items-center gap-2">
                                                Live_Stream_Demo
                                                <ExternalLink className="w-3 h-3 opacity-50" />
                                            </span>
                                            <div className="relative aspect-video rounded-xl overflow-hidden glass-card border-white/10 group/media bg-black shadow-2xl">
                                                {activeProject.demoType === 'video' ? (
                                                    <video
                                                        src={activeProject.demoUrl}
                                                        controls
                                                        playsInline
                                                        className="w-full h-full object-contain"
                                                    />
                                                ) : (
                                                    <img
                                                        src={activeProject.demoUrl || activeProject.thumbnail}
                                                        alt="Demo Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}

                                                <div className="absolute top-0 left-0 w-full h-[2px] bg-electric-green/20 shadow-[0_0_15px_rgba(0,255,153,0.3)] animate-scan pointer-events-none z-10"></div>

                                                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none opacity-0 group-hover/media:opacity-100 transition-opacity">
                                                    <div className="w-2 h-2 rounded-full bg-electric-green animate-pulse"></div>
                                                    <span className="font-mono text-[8px] text-electric-green uppercase tracking-[0.2em] bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
                                                        HD_SOURCE_ACTIVE
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* PART 3: Workflow/Diagram - BOTTOM on Mobile */}
                                    <div className="w-full lg:col-start-2 lg:row-start-2 bg-black/60 lg:bg-black/40 border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col p-6 md:p-12 gap-6 order-3 lg:order-none">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500 font-mono text-[10px] uppercase tracking-widest">System_Arch_Flow</span>
                                                <div className="flex gap-1">
                                                    <div className="w-1 h-1 rounded-full bg-electric-green animate-pulse"></div>
                                                    <div className="w-1 h-1 rounded-full bg-electric-green delay-100 animate-pulse"></div>
                                                    <div className="w-1 h-1 rounded-full bg-electric-green delay-200 animate-pulse"></div>
                                                </div>
                                            </div>
                                            <div className="p-4 md:p-6 rounded-xl bg-white/5 border border-white/10">
                                                <WorkflowDiagram steps={activeProject.arch} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
};

// FeaturedProjects component is now a named export for optimized lazy loading
export { FeaturedProjects };
