import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, ArrowUpRight, Play, Terminal, X, Github, Cpu, ExternalLink } from 'lucide-react';
import WorkflowDiagram from '../common/WorkflowDiagram';
import { containerVariants, cardVariants, viewportConfig, fadeInUp } from '../../utils/animations';

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

                {/* Grid Layout with Staggered Entrance */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportConfig}
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {projects.map((project) => (
                        <motion.div
                            key={project.id}
                            layoutId={`card-${project.id}`}
                            variants={cardVariants}
                            onClick={() => setSelectedId(project.id)}
                            className="glass-card p-0 border-white/5 cursor-pointer group hover:border-electric-green/30 transition-all flex flex-col min-h-[420px] relative overflow-hidden gpu-accelerated"
                        >
                            {/* GIF Thumbnail Preview */}
                            <div className="relative w-full h-48 overflow-hidden bg-black/40 border-b border-white/10 group-hover:border-electric-green/20 transition-colors">
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

                            <div className="p-8 flex flex-col justify-between flex-grow relative z-10">
                                <div className="relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-electric-green/50 transition-colors">
                                            <Code2 className="w-5 h-5 text-gray-400 group-hover:text-electric-green transition-colors" />
                                        </div>
                                        <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-electric-green transition-colors" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-electric-green transition-colors">{project.title}</h3>
                                    <p className="text-gray-500 font-mono text-[9px] uppercase tracking-widest">{project.subtitle}</p>
                                </div>

                                <div className="mt-6 flex flex-wrap gap-2">
                                    {project.stack.slice(0, 3).map(tech => (
                                        <span key={tech} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[8px] font-mono text-gray-500">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Background Glow */}
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-electric-green/5 blur-3xl rounded-full group-hover:bg-electric-green/10 transition-all"></div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Modal Overlay */}
            <AnimatePresence>
                {selectedId && activeProject && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedId(null)}
                            className="absolute inset-0 bg-dark-void/90 backdrop-blur-xl"
                        />

                        {/* Modal Content */}
                        <motion.div
                            layoutId={`card-${selectedId}`}
                            className="relative w-full max-w-6xl bg-dark-high border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row h-full max-h-[85vh] lg:max-h-[80vh]"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedId(null)}
                                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 z-20 transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {/* LEFT COLUMN: Text Content & Actions */}
                            <div className="w-full lg:w-1/2 p-8 md:p-12 overflow-y-auto custom-scrollbar flex flex-col">
                                <div className="space-y-8 flex-grow">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-[10px] text-electric-green bg-electric-green/10 px-2 py-0.5 rounded border border-electric-green/20 uppercase tracking-widest">
                                                Active_Module
                                            </span>
                                            <div className="h-px w-8 bg-white/10"></div>
                                        </div>
                                        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tighter leading-tight">
                                            {activeProject.title}
                                        </h2>
                                        <p className="text-lg text-gray-400 font-medium leading-relaxed">
                                            {activeProject.subtitle}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
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
                                <div className="pt-12 mt-auto">
                                    <a
                                        href={activeProject.githubLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-system inline-flex items-center gap-3 px-8 py-4 group"
                                    >
                                        <span className="font-mono text-sm tracking-widest">ACCESS_REPO</span>
                                        <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    </a>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Visuals (Diagram + Demo) */}
                            <div className="w-full lg:w-1/2 bg-black/40 border-l border-white/5 flex flex-col p-8 md:p-12 gap-8 overflow-y-auto custom-scrollbar">
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
                                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 group-hover:border-electric-green/20 transition-all">
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
                                        <div className="absolute inset-0 bg-dark-high/50 flex flex-col items-center justify-center text-center p-8">
                                            <div className="w-16 h-16 rounded-full bg-electric-green/10 border border-electric-green/20 flex items-center justify-center mb-4 group-hover/media:scale-110 transition-transform">
                                                <Play className="w-8 h-8 text-electric-green opacity-70 group-hover/media:opacity-100" />
                                            </div>
                                            <p className="font-mono text-xs text-gray-400">Payload: demo_preview.{activeProject.demoType}</p>
                                            <p className="font-mono text-[8px] text-gray-600 mt-2">Buffer initialized. Ready for visual playback.</p>
                                        </div>
                                        {/* Scanline Effect */}
                                        <div className="absolute top-0 left-0 w-full h-[2px] bg-electric-green/20 shadow-[0_0_15px_rgba(0,255,153,0.3)] animate-scan pointer-events-none"></div>
                                    </div>
                                </div>

                                {/* Digital Footprint Overlay */}
                                <div className="flex justify-between items-center mt-auto pt-8 border-t border-white/5 opacity-30grayscale">
                                    <div className="flex flex-col">
                                        <span className="font-mono text-[8px] text-gray-500 uppercase">Process_UID</span>
                                        <span className="font-mono text-[10px] text-white">PX-73892-LOG</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="font-mono text-[8px] text-gray-500 uppercase">Latency</span>
                                        <span className="font-mono text-[10px] text-electric-green">14ms_STABLE</span>
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
