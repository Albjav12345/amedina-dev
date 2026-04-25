import React, { useEffect, useId, useRef, useState } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { Shield, Zap, Target, Star, Quote, Globe } from 'lucide-react';
import { fadeInUp, viewportConfig } from '../../utils/animations';
import portfolioData from '../../data/portfolio.js';
import { useHardwareQuality } from '../../hooks/useHardwareQuality';

const { about: profileAbout } = portfolioData.profile;

const testimonialSection = profileAbout.testimonialsSection ?? {
    title: 'Verified Fiverr Client Feedback',
    subtitle: 'Real client feedback collected from completed Fiverr orders.',
};

const renderStars = (rating = 5, sizeClassName = 'w-3 h-3') => (
    [...Array(Math.max(1, Math.min(5, rating)))].map((_, index) => (
        <Star key={index} className={`${sizeClassName} fill-electric-green text-electric-green`} />
    ))
);

const avatarVariants = [
    {
        headRadius: 11,
        shouldersPath: 'M14 58c3-11 12-17 22-17s19 6 22 17',
        visorPath: 'M24 24h24',
        accentCircle: { cx: 52, cy: 18, r: 5 },
        shellOpacity: 0.82,
    },
    {
        headRadius: 10,
        shouldersPath: 'M12 58c5-10 14-15 24-15s19 5 24 15',
        visorPath: 'M22 25c6 4 22 4 28 0',
        accentCircle: { cx: 18, cy: 18, r: 4.5 },
        shellOpacity: 0.76,
    },
    {
        headRadius: 10.5,
        shouldersPath: 'M15 58c4-9 11-14 21-14s17 5 21 14',
        visorPath: 'M24 26c4-2 16-2 24 0',
        accentCircle: { cx: 50, cy: 20, r: 4 },
        shellOpacity: 0.8,
    },
];

const getAvatarVariant = (testimonial) => {
    const hash = testimonial.id.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
    return avatarVariants[hash % avatarVariants.length];
};

const GeneratedClientAvatar = ({ testimonial, sizeClassName, textClassName }) => {
    const avatarId = useId().replace(/:/g, '');
    const gradientId = `${avatarId}-avatar-gradient`;
    const silhouetteId = `${avatarId}-avatar-silhouette`;
    const highlightId = `${avatarId}-avatar-highlight`;
    const variant = getAvatarVariant(testimonial);
    const avatarLabel = testimonial.avatarLabel || testimonial.clientName.slice(0, 2);

    if (testimonial.avatarUrl) {
        return (
            <div className={`${sizeClassName} relative shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/5`}>
                <img src={testimonial.avatarUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
            </div>
        );
    }

    return (
        <div
            className={`${sizeClassName} relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5`}
            style={{
                background: testimonial.avatarGradient,
                boxShadow: testimonial.avatarAccent ? `0 0 30px -16px ${testimonial.avatarAccent}` : undefined,
            }}
        >
            <div className="absolute inset-[1px] rounded-full border border-white/10" />
            <svg
                viewBox="0 0 72 72"
                aria-hidden="true"
                className="relative z-10 h-full w-full"
                role="presentation"
            >
                <defs>
                    <radialGradient id={gradientId} cx="50%" cy="35%" r="70%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
                        <stop offset="52%" stopColor="rgba(12,16,22,0.08)" />
                        <stop offset="100%" stopColor="rgba(8,11,17,0.52)" />
                    </radialGradient>
                    <linearGradient id={silhouetteId} x1="50%" y1="10%" x2="50%" y2="100%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                        <stop offset="100%" stopColor="rgba(162,255,220,0.16)" />
                    </linearGradient>
                    <radialGradient id={highlightId} cx="25%" cy="20%" r="55%">
                        <stop offset="0%" stopColor="rgba(102,252,241,0.55)" />
                        <stop offset="100%" stopColor="rgba(102,252,241,0)" />
                    </radialGradient>
                </defs>

                <circle cx="36" cy="36" r="35" fill={`url(#${gradientId})`} opacity="0.95" />
                <circle cx="36" cy="36" r="26" fill={`url(#${highlightId})`} opacity="0.9" />
                <circle cx="36" cy="25" r={variant.headRadius} fill="rgba(248, 252, 255, 0.84)" />
                <path d={variant.shouldersPath} fill={`url(#${silhouetteId})`} opacity={variant.shellOpacity} stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeLinecap="round" />
                <path d={variant.visorPath} fill="none" stroke="rgba(102,252,241,0.82)" strokeWidth="2" strokeLinecap="round" />
                <circle
                    cx={variant.accentCircle.cx}
                    cy={variant.accentCircle.cy}
                    r={variant.accentCircle.r}
                    fill="rgba(15,255,153,0.18)"
                    stroke="rgba(15,255,153,0.44)"
                />
                <path d="M19 51c7 5 27 5 34 0" fill="none" stroke="rgba(15,255,153,0.28)" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <span className={`absolute bottom-[14%] z-20 font-mono font-bold uppercase tracking-[0.18em] text-white/90 ${textClassName}`}>
                {avatarLabel}
            </span>
        </div>
    );
};

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

const About = ({ isUiFrozen = false }) => {
    const { about } = portfolioData.ui.sections;
    const quality = useHardwareQuality();
    const isLow = quality.tier === 'low';
    const mobileTestimonialsRef = useRef(null);
    const desktopMarqueeRef = useRef(null);
    const [mobileTestimonialIndex, setMobileTestimonialIndex] = useState(0);
    const isDesktopMarqueeInView = useInView(desktopMarqueeRef, { margin: '200px', amount: 0.05 });
    const shouldAnimateDesktopMarquee = !isUiFrozen && isDesktopMarqueeInView;
    const desktopMarqueeDuration = isLow ? 110 : 140;

    const stats = profileAbout.stats.map(s => {
        let icon;
        if (s.id === 'years') icon = <Zap className="w-5 h-5" />;
        if (s.id === 'delivery') icon = <Shield className="w-5 h-5" />;
        if (s.id === 'rating') icon = <Star className="w-5 h-5" />;
        if (s.id === 'projects') icon = <Target className="w-5 h-5" />;
        if (s.id === 'global') icon = <Globe className="w-5 h-5" />;

        return { ...s, icon, color: s.id === 'rating' ? 'text-electric-cyan' : 'text-electric-green' };
    });

    useEffect(() => {
        const container = mobileTestimonialsRef.current;
        if (!container) return undefined;

        const handleScroll = () => {
            const card = container.querySelector('[data-testimonial-card]');
            if (!card) return;

            const cardWidth = card.getBoundingClientRect().width + 16;
            if (!cardWidth) return;

            const nextIndex = Math.round(container.scrollLeft / cardWidth);
            setMobileTestimonialIndex(Math.max(0, Math.min(profileAbout.testimonials.length - 1, nextIndex)));
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, [profileAbout.testimonials.length]);

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
                        <div className={`p-8 h-full relative group gpu-accelerated flex flex-col items-center text-center rounded-xl border border-white/10 transition-colors duration-300 overflow-hidden bg-dark-high/90`}>
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

                            {/* Verified Badge */}
                            <div className="bg-white/5 border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 mb-8" title="Real client feedback sourced from completed freelance work">
                                <Shield className="w-3 h-3 text-electric-green" />
                                <span className="text-[10px] uppercase tracking-wider text-gray-300">Client-Backed</span>
                                <div className="h-3 w-px bg-white/10 mx-1"></div>
                                <div className="flex gap-0.5">{renderStars(5, 'w-3 h-3')}</div>
                                <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-gray-400 ml-1">Real Reviews</span>
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
                        <div className={`p-8 md:p-12 h-full relative gpu-accelerated flex flex-col justify-center rounded-xl border border-white/10 bg-dark-high/90`}>


                            <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-8 text-glow-green relative z-10 leading-tight">
                                {profileAbout.title}
                            </h3>

                            <div className="space-y-6 text-gray-400 leading-relaxed font-medium text-lg relative z-10">
                                {profileAbout.bio.map((paragraph, i) => (
                                    <p key={i} className="text-justify">
                                        {paragraph.split(' ').map((word, j) => {
                                            const cleanWord = word.replace(/[.,]/g, '');
                                            if (['Unity', 'C#', 'full-stack', 'automation', 'AI', 'systems', 'backend'].includes(cleanWord)) {
                                                return <React.Fragment key={j}><span className="text-electric-cyan font-semibold">{word}</span> </React.Fragment>;
                                            }
                                            return word + ' ';
                                        })}
                                    </p>
                                ))}
                            </div>

                            {profileAbout.philosophy?.quote && (
                                <div className="mt-8 rounded-2xl border border-electric-cyan/20 bg-electric-cyan/10 p-5 relative z-10">
                                    <div className="flex items-center gap-2 text-electric-cyan">
                                        <Quote className="w-4 h-4" />
                                        <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
                                            {profileAbout.philosophy.label || 'Perspective'}
                                        </span>
                                    </div>
                                    <p className="mt-4 text-base md:text-lg leading-relaxed text-white">
                                        {profileAbout.philosophy.quote}
                                    </p>
                                </div>
                            )}

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
                    <div className="mb-8 flex flex-wrap items-start gap-4 md:items-center">
                        <div className="mt-3 h-px w-12 flex-shrink-0 bg-white/10 md:mt-0"></div>
                        <div className="min-w-[16rem] flex-1">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">{testimonialSection.title}</h4>
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">{testimonialSection.subtitle}</p>
                        </div>
                        <div className="ml-auto inline-flex md:hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-gray-400">
                            <span>{mobileTestimonialIndex + 1}</span>
                            <span className="text-gray-600">/</span>
                            <span>{profileAbout.testimonials.length}</span>
                        </div>
                        <div className="ml-auto hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-gray-400 md:inline-flex">
                            <span className="text-electric-green">Hover</span>
                            <span className="text-gray-600">to</span>
                            <span>pause</span>
                        </div>
                        <div className="hidden h-px flex-grow bg-white/10 md:block"></div>
                    </div>

                    <div className="md:hidden">
                        <div
                            ref={mobileTestimonialsRef}
                            className="flex gap-3 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        >
                            {profileAbout.testimonials.map((t, i) => (
                                <div
                                    key={`mobile-${i}`}
                                    data-testimonial-card
                                    className="w-[calc(100vw-4.25rem)] max-w-none min-h-[22rem] shrink-0 snap-center rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-5 flex flex-col justify-between"
                                >
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <div className="flex gap-1">{renderStars(t.rating, 'w-3.5 h-3.5')}</div>
                                        <span className="rounded-full border border-electric-green/20 bg-electric-green/10 px-2.5 py-1 text-[9px] font-mono uppercase tracking-[0.16em] text-electric-green">
                                            {t.label}
                                        </span>
                                    </div>
                                    <p className="text-[1rem] leading-[1.65] text-gray-100 italic mb-5">
                                        "{t.review}"
                                    </p>
                                    <div className="mt-auto flex items-start gap-3 pt-4 border-t border-white/5">
                                        <GeneratedClientAvatar testimonial={t} sizeClassName="w-12 h-12" textClassName="text-[10px]" />
                                        <div className="min-w-0">
                                            <div className="text-[1.05rem] font-bold text-white leading-tight truncate">{t.clientName}</div>
                                            <div className="mt-1 text-[10px] font-mono uppercase tracking-[0.18em] text-gray-500">{t.clientType}</div>
                                            <div className="mt-3 inline-flex max-w-full rounded-full border border-electric-green/20 bg-electric-green/10 px-2.5 py-1 text-[9px] font-mono uppercase tracking-[0.16em] text-electric-green">
                                                {t.service}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-3 flex items-center justify-center gap-2">
                            {profileAbout.testimonials.map((_, index) => (
                                <button
                                    key={`dot-${index}`}
                                    type="button"
                                    onClick={() => {
                                        const container = mobileTestimonialsRef.current;
                                        const card = container?.querySelector('[data-testimonial-card]');
                                        if (!container || !card) return;
                                        const cardWidth = card.getBoundingClientRect().width + 16;
                                        container.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
                                    }}
                                    aria-label={`Show testimonial ${index + 1}`}
                                    className={`h-2 rounded-full transition-all ${mobileTestimonialIndex === index ? 'w-8 bg-electric-green' : 'w-2 bg-white/15'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className={`testimonial-marquee-shell relative hidden md:block w-full overflow-hidden ${!isLow ? 'mask-linear-fade' : ''}`}
                        style={!isLow ? { maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' } : {}}
                    >
                        {/* Gradient Masks for edges - Fallback for non-mask browsers or Low Tier */}
                        {isLow && (
                            <>
                                <div className="absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-dark-void to-transparent"></div>
                                <div className="absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-dark-void to-transparent"></div>
                            </>
                        )}

                        <div
                            ref={desktopMarqueeRef}
                            className="testimonial-marquee-track flex gap-6 w-max transform-gpu"
                            style={{
                                animationDuration: `${desktopMarqueeDuration}s`,
                                animationPlayState: shouldAnimateDesktopMarquee ? 'running' : 'paused',
                                willChange: shouldAnimateDesktopMarquee ? 'transform' : 'auto',
                            }}
                        >
                            {[...profileAbout.testimonials, ...profileAbout.testimonials, ...profileAbout.testimonials, ...profileAbout.testimonials].map((t, i) => (
                                <div
                                    key={i}
                                    className={`testimonial-card w-[350px] md:w-[400px] min-h-[19rem] p-6 rounded-xl flex flex-col justify-between transition-colors cursor-default group border border-white/5 shrink-0 ${isLow ? 'bg-dark-slate' : 'bg-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <div className={`flex gap-1 transition-opacity ${isLow ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>
                                            {renderStars(t.rating, 'w-3 h-3')}
                                        </div>
                                        <span className="rounded-full border border-electric-green/20 bg-electric-green/10 px-2.5 py-1 text-[9px] font-mono uppercase tracking-[0.16em] text-electric-green">
                                            {t.label}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-300 italic mb-5 leading-relaxed line-clamp-4">"{t.review}"</p>
                                    <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/5">
                                        <GeneratedClientAvatar testimonial={t} sizeClassName="w-10 h-10" textClassName="text-[9px]" />
                                        <div className="flex min-w-0 flex-col">
                                            <span className="text-xs font-bold text-white">{t.clientName}</span>
                                            <span className="text-[9px] text-gray-500 font-mono uppercase">{t.clientType}</span>
                                            <span className="mt-2 text-[9px] text-electric-green font-mono uppercase tracking-[0.18em]">{t.service}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

        </section >
    );
};

// About component is now a named export for optimized lazy loading
export { About };
