import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Download, Cpu } from 'lucide-react';
import TerminalWindow, { AnimatedPipeline } from '../common/TerminalWindow';
import { fadeInUp, viewportConfig } from '../../utils/animations';

const Hero = () => {
    return (
        <section id="home" className="min-h-screen pt-32 pb-20 flex items-center relative overflow-hidden">
            {/* ... */}
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-12 gap-16 items-center">

                    {/* Text Content */}
                    <div className="lg:col-span-6 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-green/10 border border-electric-green/20 text-electric-green text-[10px] font-mono uppercase tracking-[0.2em] gpu-accelerated"
                        >
                            <Cpu className="w-3 h-3" />
                            <span>Priority: Level 1 Alpha</span>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="space-y-4 gpu-accelerated"
                        >
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl md:text-7xl font-bold tracking-tighter leading-none">
                                    ALBERTO <br />
                                    <span className="text-electric-green drop-shadow-[0_0_15px_rgba(0,255,153,0.3)]">
                                        MEDINA
                                    </span>
                                </h1>
                            </div>
                            <div className="flex items-center gap-2 font-mono text-xs text-secondary/60">
                                <span className="opacity-50">@</span>
                                <span className="text-electric-cyan">Albjav1235</span>
                            </div>
                            <p className="text-gray-400 text-lg md:text-xl max-w-xl font-medium leading-relaxed">
                                Full-Stack Developer & Automation Specialist. Engineering high-performance systems and deterministic solutions since age 10.
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
                                    ACCESS_TERMINAL
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            </button>

                            <button className="px-8 py-4 border border-white/10 hover:border-electric-green/50 hover:bg-electric-green/5 text-white font-mono font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer">
                                <Download className="w-4 h-4" />
                                GET_MANIFEST.PDF
                            </button>
                        </motion.div>

                        {/* Quick Metadata */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="pt-10 flex gap-8 border-t border-white/5 gpu-accelerated"
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
                    <div className="lg:col-span-6 flex flex-col p-4 lg:p-8 mt-12 lg:mt-0 w-full overflow-hidden">
                        {/* Mobile Section Title */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={viewportConfig}
                            className="w-full mb-16 block lg:hidden text-left"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <span className="font-mono text-xs text-electric-green bg-electric-green/10 border border-electric-green/20 px-2 py-1 rounded">SYS_00</span>
                                <div className="h-px flex-grow bg-gradient-to-r from-electric-green/30 to-transparent"></div>
                            </div>
                            <h2 className="text-5xl font-bold font-mono tracking-tighter uppercase text-white">
                                SYSTEM <br />
                                <span className="text-electric-green">CONSOLE</span>
                            </h2>
                        </motion.div>

                        <div className="w-full flex justify-center">
                            <TerminalWindow />
                        </div>
                    </div>

                </div>
            </div>
        </section >
    );
};

export default Hero;
