import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Target, Box } from 'lucide-react';
import { fadeInUp, viewportConfig, scaleIn } from '../../utils/animations';

const About = () => {
    const stats = [
        { label: 'Years Runtime', value: '8+', icon: <Zap className="w-5 h-5" />, color: 'text-electric-green' },
        { label: 'Uptime Reliability', value: '100%', icon: <Shield className="w-5 h-5" />, color: 'text-electric-cyan' },
        { label: 'Systems Deployed', value: '25+', icon: <Target className="w-5 h-5" />, color: 'text-electric-green' },
        { label: 'Core Frameworks', value: '4+', icon: <Box className="w-5 h-5" />, color: 'text-electric-cyan' }
    ];

    return (
        <section id="about" className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-6">

                {/* Section Header */}
                <div className="mb-16">
                    <div className="flex items-center gap-4 mb-4">
                        <span className="font-mono text-xs text-electric-green bg-electric-green/10 border border-electric-green/20 px-2 py-1 rounded">SYS_01</span>
                        <div className="h-px flex-grow bg-gradient-to-r from-electric-green/30 to-transparent"></div>
                    </div>
                    <h2 className="text-4xl font-bold font-mono tracking-tighter uppercase">Identity Protocol.</h2>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* Main Bio Card */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportConfig}
                        variants={fadeInUp}
                        className="md:col-span-12 lg:col-span-8 glass-card p-10 relative group gpu-accelerated"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Zap className="w-40 h-40 text-electric-green" />
                        </div>
                        <div className="max-w-2xl space-y-6 relative z-10">
                            <h3 className="text-2xl font-bold text-white tracking-tight text-glow-green">Full-Stack Developer & Automation Pioneer</h3>
                            <div className="space-y-4 text-gray-400 leading-relaxed font-medium">
                                <p>
                                    I started coding at age 10, turning lines of logic into functional reality. With <span className="text-white">8+ years of experience</span>, I've evolved from curiosity to building high-performance architectures.
                                </p>
                                <p>
                                    I don't just build for clients; I build because I love the art of optimization. Whether it's the <span className="text-electric-cyan">Padel Booking App</span>, the <span className="text-electric-cyan">Twitch Tracker</span>, or high-fidelity 3D interfaces, my focus is always on speed, reliability, and precision.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Card (Integrated) */}
                    <div className="md:col-span-12 lg:col-span-4 grid grid-cols-2 gap-4">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial="hidden"
                                whileInView="visible"
                                viewport={viewportConfig}
                                variants={scaleIn}
                                transition={{ delay: i * 0.1, duration: 0.4 }}
                                className="glass-card p-6 flex flex-col items-center justify-center text-center gap-3 group hover:border-electric-green/40 transition-all border-white/5 gpu-accelerated"
                            >
                                <div className={`${stat.color} opacity-80 group-hover:scale-110 transition-transform duration-300`}>
                                    {stat.icon}
                                </div>
                                <div className="space-y-1">
                                    <span className="block text-2xl font-bold font-mono text-white leading-none tracking-tighter">
                                        {stat.value}
                                    </span>
                                    <span className="block text-[10px] text-gray-500 font-mono uppercase tracking-widest leading-none">
                                        {stat.label}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Secondary Detail Card */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportConfig}
                        variants={fadeInUp}
                        transition={{ delay: 0.2 }}
                        className="md:col-span-12 lg:col-span-12 glass-card p-8 border-white/5 relative bg-gradient-to-br from-white/5 to-transparent gpu-accelerated"
                    >
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 rounded-full border border-electric-green/30 flex items-center justify-center bg-electric-green/5">
                                    <Shield className="w-6 h-6 text-electric-green" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-widest">Protocol Override</h4>
                                    <p className="text-xs text-gray-400">Security-first development lifecycle</p>
                                </div>
                            </div>
                            <div className="h-px md:h-8 w-full md:w-px bg-white/10"></div>
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 rounded-full border border-electric-cyan/30 flex items-center justify-center bg-electric-cyan/5">
                                    <Target className="w-6 h-6 text-electric-cyan" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-widest">Target Acquisition</h4>
                                    <p className="text-xs text-gray-400">99.9% problem-resolution rate</p>
                                </div>
                            </div>
                            <div className="h-px md:h-8 w-full md:w-px bg-white/10"></div>
                            <button className="btn-system text-[10px] py-3 px-8 uppercase tracking-[0.2em]">
                                Open_Manual.src
                            </button>
                        </div>
                    </motion.div>

                </div>
            </div>

            {/* Ambient Background Detail */}
            <div className="absolute bottom-0 right-0 w-1/2 h-px bg-gradient-to-l from-electric-green/20 to-transparent"></div>
        </section>
    );
};

export default About;
