import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Download, Cpu } from 'lucide-react';
import TerminalWindow, { AnimatedPipeline } from '../common/TerminalWindow';
import { fadeInUp, viewportConfig } from '../../utils/animations';
import portfolioData from '../../data/portfolio';

const Hero = () => {
    const { hero, sections } = portfolioData.ui;
    const [isTerminalExpanded, setIsTerminalExpanded] = React.useState(false);

    return (
        <section id="home" className="min-h-screen pt-32 pb-20 flex items-center relative overflow-hidden">
            {/* Background Decor - GPU-Friendly Radial Gradient */}
            <div
                className="absolute top-[30%] left-[20%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] pointer-events-none opacity-40"
                style={{ background: "radial-gradient(circle, rgba(0, 255, 153, 0.2) 0%, transparent 70%)" }}
            />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid xl:grid-cols-12 gap-16 items-center relative">
                    {/* Hand-Drawn Arrow Pointer - ABSOLUTELY POSITIONED & INDEPENDENT */}
                    <AnimatePresence>
                        {!isTerminalExpanded && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    y: [0, 10, 0],
                                    x: [0, 5, 0]
                                }}
                                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
                                transition={{
                                    delay: 1.5,
                                    duration: 0.8,
                                    y: {
                                        repeat: Infinity,
                                        duration: 3,
                                        ease: "easeInOut",
                                    },
                                    x: {
                                        repeat: Infinity,
                                        duration: 3,
                                        ease: "easeInOut",
                                    }
                                }}
                                className="hidden lg:flex absolute left-1/2 top-1/2 -ml-16 -mt-65 z-30 flex-col items-center pointer-events-none"
                            >
                                <span className="font-handwriting text-sm text-electric-green mb-1 -rotate-6 w-max drop-shadow-md">
                                    CLICK_TO_INIT_SHELL
                                </span>
                                <svg
                                    width="60"
                                    height="60"
                                    viewBox="0 0 100 100"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="text-electric-green translate-x-4"
                                >
                                    {/* Natural curve path without CSS rotation hacks */}
                                    <path
                                        d="M20 20 C 50 10, 80 40, 80 80"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        className="drop-shadow-[0_0_5px_rgba(0,255,153,0.5)]"
                                    />
                                    {/* Arrowhead */}
                                    <path
                                        d="M65 65 L 80 80 L 90 60"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="drop-shadow-[0_0_5px_rgba(0,255,153,0.5)]"
                                    />
                                </svg>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Text Content */}
                    <div className="lg:col-span-6 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-green/10 border border-electric-green/20 text-electric-green text-[10px] font-mono uppercase tracking-[0.2em] gpu-accelerated"
                        >
                            <Cpu className="w-3 h-3" />
                            <span>{hero.priorityLabel}</span>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="space-y-4 gpu-accelerated"
                        >
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl md:text-7xl font-bold tracking-tighter leading-none">
                                    {hero.title.white} <br />
                                    <span className="text-electric-green drop-shadow-[0_0_15px_rgba(0,255,153,0.3)]">
                                        {hero.title.green}
                                    </span>
                                </h1>
                            </div>
                            <div className="flex items-center gap-2 font-mono text-xs text-secondary/60">
                                <span className="opacity-50">@</span>
                                <span className="text-electric-cyan">{hero.handle.replace('@', '')}</span>
                            </div>
                            <p className="text-gray-400 text-lg md:text-xl max-w-xl font-medium leading-relaxed">
                                {hero.description}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="flex flex-wrap gap-4 pt-4 gpu-accelerated"
                        >
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('toggle-terminal'))}
                                className="relative px-8 py-4 bg-electric-green text-dark-void font-mono font-bold rounded-lg overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 cursor-pointer"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {hero.buttons.terminal}
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            </button>

                            <button className="px-8 py-4 border border-white/10 hover:border-electric-green/50 hover:bg-electric-green/5 text-white font-mono font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer">
                                <Download className="w-4 h-4" />
                                {hero.buttons.cv}
                            </button>
                        </motion.div>

                        {/* Quick Metadata */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="pt-10 flex gap-8 border-t border-white/5 gpu-accelerated"
                        >
                            {hero.metadata.map((item, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <span className="text-[10px] text-gray-600 font-mono uppercase">{item.label}</span>
                                    <span className="text-xs font-mono text-gray-300">{item.value}</span>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Terminal Visual */}
                    {/* Terminal Visual */}
                    <div className="lg:col-span-6 flex flex-col p-4 lg:p-8 mt-12 lg:mt-0 w-full relative">
                        {/* Hand-Drawn Arrow Pointer - Independent Layout Layer */}

                        {/* Mobile Section Title */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={viewportConfig}
                            className="w-full mb-16 block lg:hidden text-left"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <span className="font-mono text-xs text-electric-green bg-electric-green/10 border border-electric-green/20 px-2 py-1 rounded">{sections.console.id}</span>
                                <div className="h-px flex-grow bg-gradient-to-r from-electric-green/30 to-transparent"></div>
                            </div>
                            <h2 className="text-5xl font-bold font-mono tracking-tighter uppercase text-white">
                                {sections.console.line1} <br />
                                <span className="text-electric-green">{sections.console.line2}</span>
                            </h2>
                        </motion.div>

                        <div className="w-full flex justify-center relative">
                            <TerminalWindow onStateChange={setIsTerminalExpanded} />
                        </div>
                    </div>

                </div>
            </div>
        </section >
    );
};

export default Hero;
