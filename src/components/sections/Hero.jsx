import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Download, Cpu } from 'lucide-react';
import TerminalWindow, { AnimatedPipeline } from '../common/TerminalWindow';

const Hero = () => {
    return (
        <section id="home" className="min-h-screen pt-32 pb-20 flex items-center relative overflow-hidden">
            {/* Absolute Decorative Elements */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-electric-green/5 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-electric-cyan/5 blur-[120px] rounded-full"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-12 gap-16 items-center">

                    {/* Text Content */}
                    <div className="lg:col-span-6 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-green/10 border border-electric-green/20 text-electric-green text-[10px] font-mono uppercase tracking-[0.2em]"
                        >
                            <Cpu className="w-3 h-3" />
                            <span>Priority: Level 1 Alpha</span>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="space-y-4"
                        >
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none">
                                BUILDING <br />
                                <span className="text-electric-green drop-shadow-[0_0_15px_rgba(0,255,153,0.3)]">
                                    AUTONOMOUS
                                </span> <br />
                                SYSTEMS.
                            </h1>
                            <p className="text-gray-400 text-lg md:text-xl max-w-xl font-medium leading-relaxed">
                                I engineer high-performance automation, AI pipelines, and deterministic systems that scale. Precision code for complex problems.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="flex flex-wrap gap-4 pt-4"
                        >
                            <button className="group relative px-8 py-4 bg-electric-green text-dark-void font-mono font-bold rounded-lg overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]">
                                <span className="relative z-10 flex items-center gap-2">
                                    INIT_SEQUENCE
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            </button>

                            <button className="px-8 py-4 border border-white/10 hover:border-electric-green/50 hover:bg-electric-green/5 text-white font-mono font-bold rounded-lg transition-all flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                GET_MANIFEST.PDF
                            </button>
                        </motion.div>

                        {/* Quick Metadata */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="pt-10 flex gap-8 border-t border-white/5"
                        >
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-gray-600 font-mono uppercase">Stack_Focus</span>
                                <span className="text-xs font-mono text-gray-300">PYTHON / REACT / UNITY</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-gray-600 font-mono uppercase">Exp_Runtime</span>
                                <span className="text-xs font-mono text-gray-300">10+ YEARS</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Terminal Visual */}
                    <div className="lg:col-span-6 hidden lg:block">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="perspective-1000"
                        >
                            <TerminalWindow>
                                <AnimatedPipeline />
                            </TerminalWindow>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Hero;
