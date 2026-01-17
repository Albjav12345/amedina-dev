import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, ArrowUpRight, Play, Terminal, X, Github, Cpu, ExternalLink } from 'lucide-react';
import WorkflowDiagram from '../common/WorkflowDiagram';
import { fadeInUp, viewportConfig } from '../../utils/animations';

const projects = [
    {
        id: 1,
        title: "ZeroTouch AI",
        subtitle: "Autonomous Corporate Email Triage",
        problem: "Corporate email management consumes 30% of work hours, causing bottlenecks.",
        solution: "Full Stack AI platform using Groq (Llama 3) to semantically analyze and draft responses.",
        stack: ["Python", "Flask", "Llama 3", "Supabase"],
        arch: ["Outlook", "Python Backend", "Groq Llama 3", "Web UI"],
        githubLink: "https://github.com/Albjav1235/zerotouch-ai",
        demoType: "gif",
        thumbnail: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHNoMTF5ZW5yNjd6YmJ6M3B0bDZ6ZXZ4ZXV4ZXV4ZXV4ZXV4ZXV4ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKSjPQC1Q_Vv-Vq/giphy.gif"
    },
    {
        id: 2,
        title: "Padel Sync",
        subtitle: "Atomic Booking Engine & Native UI",
        problem: "Race conditions between legacy web and new mobile app caused double-bookings.",
        solution: "Engineered a 'Double-Lock' Transaction Protocol with Firestore and Deterministic IDs.",
        stack: ["Android", "Firebase", "React", "Atomic Locking"],
        arch: ["Firebase Store", "Kotlin Logic", "Double-Lock", "React Hub"],
        githubLink: "https://github.com/Albjav1235/padel-sync",
        demoType: "gif",
        thumbnail: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHNoMTF5ZW5yNjd6YmJ6M3B0bDZ6ZXZ4ZXV4ZXV4ZXV4ZXV4ZXV4ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26tn33aiTi1jkl6H6/giphy.gif"
    },
    {
        id: 3,
        title: "Twitch Live Analytics",
        subtitle: "Real-time Streamer Detection",
        problem: "Manual detection of live streamers in Fortnite matches is slow and error-prone.",
        solution: "Automated Python utility combining Screen Capture, OCR, and Twitch API.",
        stack: ["Python", "Tesseract OCR", "Twitch API", "Tkinter"],
        arch: ["Screen Capture", "Tesseract OCR", "Twitch API", "Dashboard"],
        githubLink: "https://github.com/Albjav1235/twitch-analytics",
        demoType: "gif",
        thumbnail: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHNoMTF5ZW5yNjd6YmJ6M3B0bDZ6ZXZ4ZXV4ZXV4ZXV4ZXV4ZXV4ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/L8Krcdov0cE1V2UveY/giphy.gif"
    },
    {
        id: 4,
        title: "Visual Interfaces",
        subtitle: "High-Fidelity Unity UX",
        problem: "Demonstrating capability to build complex, non-standard visual interfaces.",
        solution: "Polished, interactive mini-interfaces built with Unity Engine demonstrating shader prowess.",
        stack: ["Unity 3D", "C#", "HLSL Shaders", "Motion Design"],
        arch: ["Unity Core", "C# Systems", "HLSL Shaders", "Motion UI"],
        githubLink: "https://github.com/Albjav1235/unity-interfaces",
        demoType: "video",
        thumbnail: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHNoMTF5ZW5yNjd6YmJ6M3B0bDZ6ZXZ4ZXV4ZXV4ZXV4ZXV4ZXV4ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41lTfuxV5F66d6hO/giphy.gif"
    }
];

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.5,
            ease: "easeOut"
        }
    })
};

const FeaturedProjects = () => {
    const [selectedId, setSelectedId] = useState(null);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (selectedId) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedId]);

    const activeProject = projects.find(p => p.id === selectedId);

    return (
        <section id="projects" className="py-32 relative">
            <div className="container mx-auto px-6">

                {/* Section Title */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportConfig}
                    variants={fadeInUp}
                    className="flex flex-col mb-20"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <span className="font-mono text-xs text-electric-green bg-electric-green/10 border border-electric-green/20 px-2 py-1 rounded">SYS_02</span>
                        <div className="h-px w-20 bg-electric-green/30"></div>
                    </div>
                    <h2 className="text-5xl font-bold font-mono tracking-tighter uppercase leading-none">
                        Project <br />
                        <span className="text-electric-green">Ecosystems.</span>
                    </h2>
                </motion.div>

                {/* Grid Layout with Robust Manual Stagger */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                    {projects.map((project, index) => (
                        <motion.div
                            key={project.id}
                            layoutId={`project-container-${project.id}`}
                            custom={index}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2, margin: "0px 0px -100px 0px" }}
                            variants={cardVariants}
                            onClick={() => setSelectedId(project.id)}
                            className="gpu-accelerated cursor-pointer group relative flex flex-col h-[220px] md:h-[450px] overflow-hidden rounded-xl border border-white/5 bg-dark-high/50"
                        >
                            {/* Project Thumbnail Area - 60% on mobile */}
                            <div className="relative w-full h-[60%] md:h-[60%] overflow-hidden bg-black/40 border-b border-white/10 group-hover:border-electric-green/20 transition-colors">
                                <img
                                    src={project.thumbnail}
                                    alt={project.title}
                                    className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500 scale-105 group-hover:scale-100 transition-transform"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-dark-high via-transparent to-transparent"></div>
                                {/* Scanning Line Effect */}
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-electric-green/10 shadow-[0_0_10px_rgba(0,255,153,0.3)] animate-scan pointer-events-none"></div>

                                <div className="absolute top-4 left-4 flex gap-1">
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

                            {/* Background Glow */}
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-electric-green/5 blur-3xl rounded-full group-hover:bg-electric-green/10 transition-colors duration-500"></div>
                        </motion.div>
                    ))}
                </div>
            </div>


            {/* Modal Overlay */}
            <AnimatePresence>
                {selectedId && activeProject && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-10 overflow-y-auto custom-scrollbar">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedId(null)}
                            className="fixed inset-0 bg-dark-void/90 backdrop-blur-xl cursor-pointer"
                        />

                        {/* Modal Content */}
                        <motion.div
                            layoutId={`project-container-${selectedId}`}
                            transition={{ type: "spring", stiffness: 250, damping: 25 }}
                            className="relative w-full max-w-6xl bg-dark-high border border-white/10 md:rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row h-auto min-h-screen md:h-full md:max-h-[85vh] lg:max-h-[80vh] gpu-accelerated"
                        >
                            {/* Close Button - Fixed on top right for unified scroll feel */}
                            <button
                                onClick={() => setSelectedId(null)}
                                className="fixed md:absolute top-6 right-6 p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-electric-green hover:text-dark-void z-[110] transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {/* RIGHT COLUMN: Text Content & Actions (Appears first on mobile for unified flow if desired, but image first is standard) */}
                            <div className="w-full lg:w-1/2 p-6 md:p-12 md:overflow-y-auto custom-scrollbar flex flex-col order-2 lg:order-1">
                                <div className="space-y-8 flex-grow">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-[10px] text-electric-green bg-electric-green/10 px-2 py-0.5 rounded border border-electric-green/20 uppercase tracking-widest">
                                                Active_Module
                                            </span>
                                            <div className="h-px w-8 bg-white/10"></div>
                                        </div>
                                        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tighter leading-tight">
                                            {activeProject.title}
                                        </h2>
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
                                {/* Safe padding for mobile bottom */}
                                <div className="h-10 lg:hidden" />
                            </div>

                            {/* LEFT COLUMN: Visuals - Now Order 1 for mobile (TOP) */}
                            <div className="w-full lg:w-1/2 bg-black/20 md:bg-black/40 border-b lg:border-b-0 lg:border-l border-white/5 flex flex-col p-6 md:p-12 gap-6 md:gap-8 md:overflow-y-auto custom-scrollbar order-1 lg:order-2">
                                {/* Workflow Section */}
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

                                {/* Demo Visual Section */}
                                <div className="space-y-4 flex-grow">
                                    <span className="text-gray-500 font-mono text-[10px] uppercase tracking-widest inline-flex items-center gap-2">
                                        Live_Stream_Demo
                                        <ExternalLink className="w-3 h-3 opacity-50" />
                                    </span>
                                    <div className="relative aspect-video rounded-xl overflow-hidden glass-card border-white/10 group/media">
                                        <div className="absolute inset-0 bg-dark-high/50 flex flex-col items-center justify-center text-center p-6 md:p-8">
                                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-electric-green/10 border border-electric-green/20 flex items-center justify-center mb-4 group-hover/media:scale-110 transition-transform">
                                                <Play className="w-6 h-6 md:w-8 md:h-8 text-electric-green opacity-70 group-hover/media:opacity-100" />
                                            </div>
                                            <p className="font-mono text-[10px] text-gray-400">Payload: demo_preview.{activeProject.demoType}</p>
                                        </div>
                                        {/* Scanline Effect */}
                                        <div className="absolute top-0 left-0 w-full h-[2px] bg-electric-green/20 shadow-[0_0_15px_rgba(0,255,153,0.3)] animate-scan pointer-events-none"></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default FeaturedProjects;
