import React, { useEffect, useId, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star } from 'lucide-react';
import AboutProfile from './AboutProfile';
import { viewportConfig } from '../../utils/animations';
import portfolioData from '../../data/portfolio.js';
import { useHardwareQuality } from '../../hooks/useHardwareQuality';

const { about: profileAbout } = portfolioData.profile;

const testimonialSection = profileAbout.testimonialsSection ?? {
    title: 'Verified Client Feedback',
    subtitle: 'Real client feedback collected from completed projects.',
};
const desktopMarqueeCloneIndexes = [0, 1];
const desktopMarqueeViewportMargin = '360px 0px';
const desktopMarqueeMaskImage = 'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)';
const highlightedEyebrowClassName = 'inline-flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.24em] text-electric-cyan/80';

const getTestimonialCardSurface = (highlighted) => {
    return `testimonial-surface${highlighted ? ' testimonial-surface--featured' : ''}`;
};

const renderStars = (rating = 5, sizeClassName = 'w-3 h-3') => {
    const normalizedRating = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));

    return [...Array(5)].map((_, index) => {
        const isFilled = index < normalizedRating;
        return (
            <Star
                key={index}
                className={`${sizeClassName} ${isFilled ? 'fill-electric-green text-electric-green' : 'fill-transparent text-electric-green/25'}`}
            />
        );
    });
};

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
            <div className={`${sizeClassName} relative shrink-0 overflow-hidden rounded-full border ${testimonial.highlighted ? 'border-electric-cyan/22' : 'border-white/10'} bg-white/5 shadow-[0_10px_26px_rgba(0,0,0,0.28)]`}>
                <img
                    src={testimonial.avatarUrl}
                    alt=""
                    className="testimonial-avatar-photo h-full w-full object-cover object-center"
                    loading="lazy"
                    decoding="async"
                />
                <div className={`pointer-events-none absolute inset-0 rounded-full border ${testimonial.highlighted ? 'border-electric-cyan/18' : 'border-white/10'}`} />
                <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_24%,rgba(255,255,255,0.22),transparent_42%)] opacity-80" />
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

const MobileTestimonial = ({ testimonial, index, isActive }) => {
    const [expanded, setExpanded] = useState(false);
    const [canExpand, setCanExpand] = useState(false);
    const reviewRef = useRef(null);
    const reviewId = useId();

    useEffect(() => { if (!isActive) setExpanded(false); }, [isActive]);
    useEffect(() => {
        if (expanded) return undefined;
        const paragraph = reviewRef.current;
        const measure = () => setCanExpand(paragraph.scrollHeight > paragraph.clientHeight + 1);
        const observer = new ResizeObserver(measure);
        observer.observe(paragraph);
        measure();
        return () => observer.disconnect();
    }, [expanded, testimonial.review]);

    return (
        <div data-testimonial-card className="mobile-testimonial testimonial-surface">
            <div className="flex items-center justify-between gap-3">
                <div className="flex gap-0.5 opacity-75">{renderStars(testimonial.rating, 'w-2.5 h-2.5')}</div>
                <span className="text-[8px] font-mono uppercase tracking-wider text-gray-500">{testimonial.label}</span>
            </div>
            <p ref={reviewRef} id={reviewId} className={`mobile-testimonial__review${expanded ? ' mobile-testimonial__review--expanded' : ''}`}>
                "{testimonial.review}"
            </p>
            {canExpand && (
                <button type="button" className="mobile-testimonial__expand" aria-expanded={expanded} aria-controls={reviewId} aria-label={`${expanded ? 'Collapse' : 'Read full'} review ${index + 1}`} onClick={() => setExpanded(value => !value)}>
                    {expanded ? 'Show less' : 'Read more'}
                </button>
            )}
            <div className="mobile-testimonial__client">
                <GeneratedClientAvatar testimonial={testimonial} sizeClassName="w-7 h-7" textClassName="text-[7px]" />
                <div className="min-w-0">
                    <div className="text-xs font-medium text-gray-300 truncate">{testimonial.clientName}</div>
                    <div className="mt-1 text-[9px] text-gray-500 truncate">{testimonial.service}</div>
                </div>
            </div>
        </div>
    );
};

const About = ({ isUiFrozen = false }) => {
    const { about } = portfolioData.ui.sections;
    const quality = useHardwareQuality();
    const isLow = quality.tier === 'low';
    const mobileTestimonialsRef = useRef(null);
    const desktopMarqueeRef = useRef(null);
    const [mobileTestimonialIndex, setMobileTestimonialIndex] = useState(0);
    const [hasDesktopMarqueePrimed, setHasDesktopMarqueePrimed] = useState(false);
    const isDesktopMarqueeInView = useInView(desktopMarqueeRef, {
        margin: desktopMarqueeViewportMargin,
        amount: 0.01,
    });
    const shouldAnimateDesktopMarquee = !isUiFrozen && (hasDesktopMarqueePrimed || isDesktopMarqueeInView);
    const desktopMarqueeDuration = isLow ? 110 : 140;

    useEffect(() => {
        const container = mobileTestimonialsRef.current;
        if (!container) return undefined;

        const handleScroll = () => {
            const card = container.querySelector('[data-testimonial-card]');
            if (!card) return;

            const cardWidth = card.getBoundingClientRect().width + 12;
            if (!cardWidth) return;

            const nextIndex = Math.round(container.scrollLeft / cardWidth);
            setMobileTestimonialIndex(Math.max(0, Math.min(profileAbout.testimonials.length - 1, nextIndex)));
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, [profileAbout.testimonials.length]);

    useEffect(() => {
        if (isDesktopMarqueeInView) {
            setHasDesktopMarqueePrimed(true);
        }
    }, [isDesktopMarqueeInView]);

    return (
        <section id="about" className="editorial-section about-editorial-section">
            <div className="container mx-auto px-6">
                <AboutProfile header={about} profile={portfolioData.profile} projects={portfolioData.projects} />

                {/* Infinite Testimonials Marquee */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={viewportConfig}
                    className="w-full relative"
                >
                    <div className="mb-4 flex items-center gap-3 md:mb-8 md:flex-wrap md:gap-4">
                        <div className="hidden h-px w-12 flex-shrink-0 bg-white/10 md:block"></div>
                        <div className="min-w-0 flex-1 md:min-w-[16rem]">
                            <h4 className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-[0.16em] md:tracking-[0.2em]">{testimonialSection.title}</h4>
                            <p className="hidden md:block mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">{testimonialSection.subtitle}</p>
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
                            {profileAbout.testimonials.map((t, i) => <MobileTestimonial key={t.id} testimonial={t} index={i} isActive={mobileTestimonialIndex === i} />)}
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
                                        const cardWidth = card.getBoundingClientRect().width + 12;
                                        container.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
                                    }}
                                    aria-label={`Show testimonial ${index + 1}`}
                                    className={`h-2 rounded-full transition-all ${mobileTestimonialIndex === index ? 'w-8 bg-electric-green' : 'w-2 bg-white/15'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div
                        ref={desktopMarqueeRef}
                        className="testimonial-marquee-shell relative hidden md:block w-full overflow-hidden"
                        style={{
                            maskImage: desktopMarqueeMaskImage,
                            WebkitMaskImage: desktopMarqueeMaskImage,
                            maskRepeat: 'no-repeat',
                            WebkitMaskRepeat: 'no-repeat',
                            maskSize: '100% 100%',
                            WebkitMaskSize: '100% 100%',
                        }}
                    >
                        <div
                            className="testimonial-marquee-track flex w-max transform-gpu"
                            style={{
                                animationDuration: `${desktopMarqueeDuration}s`,
                                animationPlayState: shouldAnimateDesktopMarquee ? 'running' : 'paused',
                            }}
                        >
                            {desktopMarqueeCloneIndexes.map((cloneIndex) => (
                                <div
                                    key={`desktop-testimonial-clone-${cloneIndex}`}
                                    aria-hidden={cloneIndex === 1 ? 'true' : undefined}
                                    className="flex shrink-0 gap-6 pr-6"
                                >
                                    {profileAbout.testimonials.map((t) => (
                                        <div
                                            key={`${t.id}-${cloneIndex}`}
                                            className={`testimonial-card relative w-[350px] md:w-[400px] min-h-[16.25rem] overflow-hidden rounded-xl p-5 flex flex-col justify-between transition-colors cursor-default group shrink-0 ${getTestimonialCardSurface(t.highlighted)}`}
                                        >
                                            {t.highlighted && (
                                                <div className={`relative z-10 mb-3 ${highlightedEyebrowClassName}`}>
                                                    <span className="h-1.5 w-1.5 rounded-full bg-electric-cyan" />
                                                    <span>Featured Review</span>
                                                </div>
                                            )}
                                            <div className="relative z-10 mb-4 flex items-center justify-between gap-3">
                                                <div className={`flex gap-1 transition-opacity ${isLow ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>
                                                    {renderStars(t.rating, 'w-3 h-3')}
                                                </div>
                                                <span className="rounded-full border border-electric-green/20 bg-electric-green/10 px-2.5 py-1 text-[9px] font-mono uppercase tracking-[0.16em] text-electric-green">
                                                    {t.label}
                                                </span>
                                            </div>
                                            <p className={`relative z-10 mb-4 text-sm italic leading-relaxed line-clamp-4 ${t.highlighted ? 'text-white font-medium' : 'text-gray-300'}`}>
                                                "{t.review}"
                                            </p>
                                            <div className="relative z-10 flex items-center gap-3 mt-auto pt-3 border-t border-white/5">
                                                <GeneratedClientAvatar testimonial={t} sizeClassName="w-10 h-10" textClassName="text-[9px]" />
                                                <div className="flex min-w-0 flex-col">
                                                    <span className="testimonial-card__client-name text-xs font-bold text-white">{t.clientName}</span>
                                                    <span className="text-[9px] text-gray-500 font-mono uppercase">{t.clientType}</span>
                                                    <span className={`mt-2 text-[9px] font-mono uppercase tracking-[0.18em] ${t.highlighted ? 'text-electric-cyan' : 'text-electric-green'}`}>{t.service}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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
