import React, { useRef, useEffect } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { Shield, Zap, Target, Box, Star, Quote, Globe } from 'lucide-react';
import { fadeInUp, viewportConfig, scaleIn } from '../../utils/animations';
import portfolioData from '../../data/portfolio.js';
import { useHardwareQuality } from '../../hooks/useHardwareQuality';

const { about: profileAbout } = portfolioData.profile;

const Counter = ({ value }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const strValue = String(value || "0");
    const numericValue = parseInt(strValue) || 0;
    const suffix = strValue.replace(numericValue.toString(), '');

    const springValue = useSpring(0, {
        stiffness: 30,
        damping: 15,
    });

    const displayValue = useTransform(springValue, (latest) =>
        Math.floor(latest) + suffix
    );

    useEffect(() => {
        if (isInView) {
            springValue.set(numericValue);
        }
    }, [isInView, numericValue, springValue]);

    return (
        <motion.span
            ref={ref}
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="tabular-nums block"
        >
            {displayValue}
        </motion.span>
    );
};

const About = () => {
    const { about } = portfolioData.ui.sections;
    const quality = useHardwareQuality();
    const isLow = quality.tier === 'low';

    const stats = profileAbout.stats.map(s => {
        let icon;
        if (s.id === 'years') icon = <Zap className="w-5 h-5" />;
        if (s.id === 'delivery') icon = <Shield className="w-5 h-5" />;
        if (s.id === 'rating') icon = <Star className="w-5 h-5" />;
        if (s.id === 'projects') icon = <Target className="w-5 h-5" />;
        if (s.id === 'global') icon = <Globe className="w-5 h-5" />;

        return { ...s, icon, color: s.id === 'rating' ? 'text-electric-cyan' : 'text-electric-green' };
    });

    return (
        <section id="about" className="py-20 md:py-32 relative overflow-hidden px-0">
            {/* Background Decor - GPU-Friendly Radial Gradient */}
            {!isLow && (
                <div
                    className="absolute top-1/4 right-0 w-[600px] h-[600px] md:w-[1000px] md:h-[1000px] pointer-events-none opacity-40 translate-x-1/2"
                    style={{ background: "radial-gradient(circle, rgba(102, 252, 241, 0.13) 0%, transparent 70%)" }}
                />
            )}

            <div className="container mx-auto px-6">

                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={viewportConfig}
                    className="mb-16"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <span className="font-mono text-xs text-electric-green bg-electric-green/10 border border-electric-green/20 px-2 py-1 rounded">{about.id}</span>
                        <div className="h-px flex-grow bg-gradient-to-r from-electric-green/30 to-transparent"></div>
                    </div>
                    <h2 className="text-5xl font-bold font-mono tracking-tighter uppercase text-white">
                        {about.line1} <br />
                        <span className="text-electric-green">{about.line2}</span>
                    </h2>
                </motion.div>

                {/* Split Layout: Identity (Left) & Narrative (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">

                    {/* Left Column: Identity Card */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportConfig}
                        variants={fadeInUp}
                        className="lg:col-span-4 h-full"
                    >
                        <div className={`p-8 h-full relative group gpu-accelerated flex flex-col items-center text-center rounded-xl border border-white/10 transition-colors duration-300 overflow-hidden ${quality.glassClass}`}>
                            {/* Avatar */}
                            <div className="relative mb-6">
                                <div className="w-40 h-40 rounded-full border-2 border-electric-green relative z-10 shadow-lg shadow-electric-green/20 ring-2 ring-electric-green/20 flex items-center justify-center bg-black overflow-hidden">
                                    <img
                                        src={profileAbout.avatarUrl}
                                        alt="Alberto Medina"
                                        className="w-full h-full object-cover object-center scale-110 transform"
                                    />
                                </div>
                                {/* Avatar Glow - Hide on Low Tier */}
                                {!isLow && <div className="absolute inset-0 bg-electric-green/40 blur-3xl rounded-full"></div>}
                            </div>

                            {/* Identity Info */}
                            <h3 className="text-2xl font-bold text-white tracking-tight mb-2">{portfolioData.profile.name}</h3>
                            <p className="text-sm text-electric-green font-mono mb-6">{portfolioData.profile.role}</p>

                            {/* Verified Badge & Rating */}
                            <div className="bg-white/5 border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 mb-8" title="Verified Commercial History">
                                <Shield className="w-3 h-3 text-electric-green" />
                                <span className="text-[10px] uppercase tracking-wider text-gray-300">Verified Pro</span>
                                <div className="h-3 w-px bg-white/10 mx-1"></div>
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-3 h-3 fill-electric-green text-electric-green" />
                                    ))}
                                </div>
                                <span className="text-xs font-bold text-white ml-1">4.9</span>
                            </div>

                            {/* Quick Stats Divider */}
                            <div className="w-full h-px bg-white/5 mb-8"></div>

                            {/* Vertical Stats */}
                            <div className="w-full grid grid-cols-2 gap-y-6 gap-x-4">
                                {stats.filter(s => s.id !== 'rating').map((stat) => (
                                    <div key={stat.id} className="flex flex-col items-center group/stat">
                                        <span className="text-2xl font-bold text-white font-mono group-hover/stat:text-electric-green transition-colors">
                                            <Counter value={stat.value} />
                                        </span>
                                        <span className="text-[9px] text-gray-500 uppercase tracking-widest">{stat.label.replace(' ', '_')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Bio / Narrative */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportConfig}
                        variants={fadeInUp}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-8 h-full"
                    >
                        <div className={`p-8 md:p-12 h-full relative gpu-accelerated flex flex-col justify-center rounded-xl border border-white/10 ${quality.glassClass}`}>


                            <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-8 text-glow-green relative z-10 leading-tight">
                                {profileAbout.title}
                            </h3>

                            <div className="space-y-6 text-gray-400 leading-relaxed font-medium text-lg relative z-10">
                                {profileAbout.bio.map((paragraph, i) => (
                                    <p key={i} className="text-justify">
                                        {paragraph.split(' ').map((word, j) => {
                                            const cleanWord = word.replace(/[.,]/g, '');
                                            if (['Unity', 'C#', 'AI-driven', 'full-stack', 'automated', 'ecosystems', 'optimization'].includes(cleanWord)) {
                                                return <React.Fragment key={j}><span className="text-electric-cyan font-semibold">{word}</span> </React.Fragment>;
                                            }
                                            return word + ' ';
                                        })}
                                    </p>
                                ))}
                            </div>

                            <div className="flex flex-wrap gap-3 mt-10 relative z-10">
                                <span className="px-3 py-1.5 bg-electric-green/10 border border-electric-green/20 rounded text-[10px] font-mono text-electric-green uppercase tracking-wider">
                                    Unity_Engine
                                </span>
                                <span className="px-3 py-1.5 bg-electric-cyan/10 border border-electric-cyan/20 rounded text-[10px] font-mono text-electric-cyan uppercase tracking-wider">
                                    Python_Automation
                                </span>
                                <span className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded text-[10px] font-mono text-purple-400 uppercase tracking-wider">
                                    React_Systems
                                </span>
                            </div>
                        </div>
                    </motion.div>

                </div>

                {/* Infinite Testimonials Marquee */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={viewportConfig}
                    className="w-full relative"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-px flex-shrink w-12 bg-white/10"></div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Verified Client Feedback</h4>
                        <div className="h-px flex-grow bg-white/10"></div>
                    </div>

                    <div className={`relative w-full overflow-hidden ${!isLow ? 'mask-linear-fade' : ''}`}>
                        {/* Gradient Masks for edges - Hide on Low Tier */}
                        {!isLow && (
                            <>
                                <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-dark-void to-transparent"></div>
                                <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-dark-void to-transparent"></div>
                            </>
                        )}

                        {/* Scrolling Container */}
                        <motion.div
                            className="flex gap-6 w-max will-change-transform transform-gpu"
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{
                                repeat: Infinity,
                                ease: "linear",
                                duration: isLow ? 50 : 40 // Slower on low end for visuals, or same? 40 is fine.
                            }}
                        >
                            {/* Duplicate list 4 times for seamless loop */}
                            {[...profileAbout.testimonials, ...profileAbout.testimonials, ...profileAbout.testimonials, ...profileAbout.testimonials].map((t, i) => (
                                <div
                                    key={i}
                                    className={`w-[350px] md:w-[400px] p-6 rounded-xl flex flex-col justify-between transition-colors cursor-default group border border-white/5 ${isLow ? 'bg-dark-slate' : 'bg-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    <div className={`flex gap-1 mb-3 transition-opacity ${isLow ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>
                                        {[...Array(5)].map((_, j) => (
                                            <Star key={j} className="w-3 h-3 fill-electric-green text-electric-green" />
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-300 italic mb-4 leading-relaxed line-clamp-3">"{t.text}"</p>
                                    <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/5">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-[10px] font-bold text-white">
                                            {t.author.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-white">{t.author}</span>
                                            <span className="text-[9px] text-gray-500 font-mono uppercase">{t.project}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>
            </div>

        </section >
    );
};

export default About;
