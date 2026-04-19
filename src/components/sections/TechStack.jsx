import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { viewportConfig } from '../../utils/animations';
import portfolioData from '../../data/portfolio.js';
import { useHardwareQuality } from '../../hooks/useHardwareQuality';
import { renderTechCategoryIcon, renderTechItemIcon } from './techStackIcons';
import { subscribeScrollRuntime, isElementNearViewport } from '../../utils/scrollRuntime';
import { SECTION_ACTIVE_LOCK_EVENT } from '../../utils/sectionRouting';

const COLOR_STYLES = {
    'electric-green': {
        glowBg: 'bg-electric-green/10',
        hoverText: 'group-hover:text-electric-green',
        border: 'border-electric-green/10',
        text: 'text-electric-green',
    },
    'electric-cyan': {
        glowBg: 'bg-electric-cyan/10',
        hoverText: 'group-hover:text-electric-cyan',
        border: 'border-electric-cyan/10',
        text: 'text-electric-cyan',
    },
};

// Internet-sourced backgrounds are pre-blurred local assets to avoid runtime blur cost.
const TECH_CARD_BACKGROUNDS = {
    'Core Development': {
        image: '/assets/stack/tech-core.webp',
        position: 'center 66%',
        overlay:
            'radial-gradient(circle at 78% 24%, rgba(255, 120, 90, 0.10) 0%, rgba(255, 120, 90, 0) 28%), linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0) 40%, rgba(0, 255, 153, 0.10) 100%)',
    },
    'AI & Vision Workflows': {
        image: '/assets/stack/tech-ai.webp',
        position: 'center 58%',
        overlay:
            'radial-gradient(circle at 18% 78%, rgba(240, 255, 140, 0.16) 0%, rgba(240, 255, 140, 0) 26%), linear-gradient(135deg, rgba(255, 96, 72, 0.14) 0%, rgba(0, 0, 0, 0.02) 42%, rgba(88, 166, 255, 0.14) 100%)',
    },
    'Frontend & Interactive Systems': {
        image: '/assets/stack/tech-frontend.webp',
        position: 'center 52%',
        overlay:
            'radial-gradient(circle at 52% 24%, rgba(88, 166, 255, 0.18) 0%, rgba(88, 166, 255, 0) 30%), linear-gradient(135deg, rgba(255, 220, 120, 0.08) 0%, rgba(0, 0, 0, 0) 42%, rgba(88, 166, 255, 0.14) 100%)',
    },
    'Infra & Delivery': {
        image: '/assets/stack/tech-infra.webp',
        position: 'center 60%',
        overlay:
            'radial-gradient(circle at 84% 16%, rgba(0, 255, 153, 0.18) 0%, rgba(0, 255, 153, 0) 24%), linear-gradient(135deg, rgba(0, 255, 153, 0.10) 0%, rgba(0, 0, 0, 0) 42%, rgba(255, 255, 255, 0.04) 100%)',
    },
};

const TECH_CARD_TITLE_LINES = {
    'Core Development': ['Core', 'Development'],
    'AI & Vision Workflows': ['AI & Vision', 'Workflows'],
    'Frontend & Interactive Systems': ['Frontend &', 'UI Systems'],
    'Infra & Delivery': ['Infra &', 'Delivery'],
};

const STACK_CARD_BG_DEFAULTS = {
    scale: 1.07,
    shift: '3%',
    brightness: 1,
    saturation: 1.03,
    bandOpacity: 1,
    bandBrightness: 1,
    highlightOpacity: 0,
    highlightScale: 1.02,
};

function getCardBackgroundStyle(title) {
    const background = TECH_CARD_BACKGROUNDS[title] || TECH_CARD_BACKGROUNDS['Core Development'];

    return {
        shellStyle: {
            backgroundColor: '#0f141a',
            boxShadow: 'inset 0 -1px 0 rgba(5, 8, 12, 0.98), inset 0 -60px 74px rgba(5, 8, 12, 0.97), inset 0 -136px 156px rgba(5, 8, 12, 0.64), inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 22px 54px rgba(0, 0, 0, 0.18)',
        },
        imageStyle: {
            backgroundImage: `${background.overlay}, url("${background.image}")`,
            backgroundPosition: `center, ${background.position}`,
            backgroundRepeat: 'no-repeat, no-repeat',
            backgroundSize: 'cover, cover',
        },
        bandStyle: {
            backgroundImage: 'linear-gradient(180deg, rgba(5, 8, 12, 0.03) 0%, rgba(5, 8, 12, 0.05) 22%, rgba(5, 8, 12, 0.22) 38%, rgba(5, 8, 12, 0.48) 56%, rgba(5, 8, 12, 0.78) 74%, rgba(5, 8, 12, 0.94) 90%, rgba(5, 8, 12, 1) 100%)',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
        },
        highlightStyle: {
            backgroundImage: 'radial-gradient(circle at 22% 18%, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 26%), linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 42%)',
            backgroundPosition: 'center, center',
            backgroundRepeat: 'no-repeat, no-repeat',
            backgroundSize: 'cover, cover',
        },
    };
}

const TechNode = ({ name, icon, color = 'electric-green', quality }) => {
    const isLow = quality.tier === 'low';
    const colorStyles = COLOR_STYLES[color] || COLOR_STYLES['electric-green'];

    return (
        <motion.div
            variants={isLow ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : {
                hidden: { opacity: 0, scale: 0.8, y: 10 },
                visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
            }}
            whileHover={!isLow ? { y: -5, scale: 1.05 } : {}}
            className="group relative flex flex-col items-center gap-2 gpu-accelerated"
        >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center border-white/5 relative overflow-hidden transition-all duration-300 ${quality.glassClass}`}>
                {quality.tier !== 'low' && (
                    <>
                        <div className={`absolute inset-0 ${colorStyles.glowBg} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`}></div>
                        <div className="absolute -inset-[1px] bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </>
                )}

                <div className={`relative z-10 text-gray-400 ${colorStyles.hoverText} transition-colors duration-300 transform ${quality.tier !== 'low' ? 'group-hover:scale-110' : ''}`}>
                    {icon}
                </div>
            </div>
            <div className="flex flex-col items-center gap-0.5">
                <span className="font-mono text-[8px] text-gray-500 group-hover:text-white uppercase tracking-wider transition-colors text-center px-1">
                    {name}
                </span>
            </div>
        </motion.div>
    );
};

const NodeGroup = ({ title, icon, items, index, color, quality, backgroundRef }) => {
    const colorStyles = COLOR_STYLES[color] || COLOR_STYLES['electric-green'];
    const backgroundStyle = getCardBackgroundStyle(title);
    const mobileTitleLines = TECH_CARD_TITLE_LINES[title] || [title];

    const activeContainerVariants = quality.tier === 'low' ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    } : {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
    };

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            variants={activeContainerVariants}
            custom={index}
            className="group/stack-card stack-card-hoverable min-h-[272px] md:min-h-[296px] px-10 pt-10 pb-14 border border-white/5 relative overflow-hidden gpu-accelerated rounded-xl bg-dark-high/90"
            style={backgroundStyle.shellStyle}
        >
            <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none">
                <div ref={backgroundRef} className="stack-card-bg absolute inset-0" style={backgroundStyle.imageStyle}></div>
                <div className="stack-card-band absolute inset-0" style={backgroundStyle.bandStyle}></div>
                <div className="stack-card-highlight absolute inset-0" style={backgroundStyle.highlightStyle}></div>
            </div>

            <div className="relative z-10 flex items-center gap-4 border-l-2 border-white/5 pl-6">
                <div className={`p-3 rounded-lg bg-black/40 border ${colorStyles.border} ${colorStyles.text} shadow-[0_0_20px_rgba(0,255,153,0.05)]`}>
                    {icon}
                </div>
                <div className="flex min-h-[3.75rem] flex-col justify-start md:min-h-0">
                    <h3 className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-white/90">
                        <span className="block md:hidden leading-[1.35]">
                            {mobileTitleLines.map((line) => (
                                <span key={line} className="block min-h-[1.2em] whitespace-nowrap">
                                    {line}
                                </span>
                            ))}
                        </span>
                        <span className="hidden md:block">
                            {title}
                        </span>
                    </h3>
                    <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mt-1">Classification_Level_{index + 1}</span>
                </div>
            </div>

            <div className={`relative z-10 mt-10 flex flex-wrap gap-x-6 gap-y-8 justify-center lg:justify-start ${quality.tier === 'low' ? 'will-change-contents' : ''}`}>
                {items.map((item) => <TechNode key={item} name={item} color={color} icon={renderTechItemIcon(item, quality)} quality={quality} />)}
            </div>

            <span className="absolute bottom-6 right-6 text-[70px] font-mono font-bold text-white/[0.02] pointer-events-none select-none leading-none hidden md:block">
                0{index + 1}
            </span>
        </motion.div>
    );
};

const TechStack = () => {
    const quality = useHardwareQuality();
    const sectionRef = useRef(null);
    const cardRefs = useRef([]);
    const bgRefs = useRef([]);
    const navLockRef = useRef(false);
    const { tech } = portfolioData.ui.sections;
    const { categories } = portfolioData.skills;

    const mappedCategories = categories.map((cat) => ({
        ...cat,
        icon: renderTechCategoryIcon(cat.title, quality),
    }));

    useEffect(() => {
        const activeCards = cardRefs.current.filter(Boolean);

        const resetCardVisuals = (cardElement, backgroundElement) => {
            if (!backgroundElement) {
                if (!cardElement) {
                    return;
                }
            } else {
                backgroundElement.style.setProperty('--stack-card-bg-scale', String(STACK_CARD_BG_DEFAULTS.scale));
                backgroundElement.style.setProperty('--stack-card-bg-shift', STACK_CARD_BG_DEFAULTS.shift);
                backgroundElement.style.setProperty('--stack-card-bg-brightness', String(STACK_CARD_BG_DEFAULTS.brightness));
                backgroundElement.style.setProperty('--stack-card-bg-saturation', String(STACK_CARD_BG_DEFAULTS.saturation));
            }

            if (cardElement) {
                cardElement.style.setProperty('--stack-card-band-opacity', String(STACK_CARD_BG_DEFAULTS.bandOpacity));
                cardElement.style.setProperty('--stack-card-band-brightness', String(STACK_CARD_BG_DEFAULTS.bandBrightness));
                cardElement.style.setProperty('--stack-card-highlight-opacity', String(STACK_CARD_BG_DEFAULTS.highlightOpacity));
                cardElement.style.setProperty('--stack-card-highlight-scale', String(STACK_CARD_BG_DEFAULTS.highlightScale));
            }
        };

        const resetAllBackgrounds = () => {
            activeCards.forEach((cardElement, index) => {
                resetCardVisuals(cardElement, bgRefs.current[index]);
            });
        };

        if (!activeCards.length || quality.isDesktopViewport || !quality.allowAmbientMotion) {
            resetAllBackgrounds();
            return undefined;
        }

        const handleActiveLock = (event) => {
            navLockRef.current = Boolean(event.detail?.locked);

            if (navLockRef.current) {
                resetAllBackgrounds();
            }
        };

        const updateScrollZoom = (runtimeSnapshot) => {
            if (navLockRef.current || !sectionRef.current || !isElementNearViewport(sectionRef.current, runtimeSnapshot, runtimeSnapshot.height * 0.35)) {
                resetAllBackgrounds();
                return;
            }

            const viewportCenter = runtimeSnapshot.height / 2;
            const rankedCards = activeCards.map((cardElement, cardIndex) => {
                const rect = cardElement.getBoundingClientRect();
                const cardCenter = rect.top + (rect.height / 2);
                const distanceRatio = Math.min(1, Math.abs(cardCenter - viewportCenter) / (runtimeSnapshot.height * 1.02));
                const visibilityScore = 1 - distanceRatio;

                return {
                    cardElement,
                    backgroundElement: bgRefs.current[cardIndex],
                    score: Math.max(0, visibilityScore),
                };
            }).sort((a, b) => b.score - a.score);

            const highlightedBackgrounds = new Set(
                rankedCards
                    .filter((entry) => entry.score > 0.04)
                    .slice(0, 2)
                    .map((entry) => entry.backgroundElement),
            );

            rankedCards.forEach(({ cardElement, backgroundElement, score }) => {
                if (!cardElement && !backgroundElement) {
                    return;
                }

                if (!highlightedBackgrounds.has(backgroundElement)) {
                    resetCardVisuals(cardElement, backgroundElement);
                    return;
                }

                const normalizedScore = Math.min(1, score);
                const easedScore = normalizedScore * normalizedScore * (3 - (2 * normalizedScore));
                const cinematicIntensity = easedScore * easedScore * (3 - (2 * easedScore));
                const scale = STACK_CARD_BG_DEFAULTS.scale + (cinematicIntensity * 0.33);
                const shift = 3 + (cinematicIntensity * 4.25);
                const brightness = STACK_CARD_BG_DEFAULTS.brightness + (cinematicIntensity * 0.14);
                const saturation = STACK_CARD_BG_DEFAULTS.saturation + (cinematicIntensity * 0.17);
                const bandOpacity = STACK_CARD_BG_DEFAULTS.bandOpacity - (cinematicIntensity * 0.18);
                const bandBrightness = STACK_CARD_BG_DEFAULTS.bandBrightness + (cinematicIntensity * 0.15);
                const highlightOpacity = STACK_CARD_BG_DEFAULTS.highlightOpacity + (cinematicIntensity * 0.1);
                const highlightScale = STACK_CARD_BG_DEFAULTS.highlightScale + (cinematicIntensity * 0.04);

                if (backgroundElement) {
                    backgroundElement.style.setProperty('--stack-card-bg-scale', scale.toFixed(3));
                    backgroundElement.style.setProperty('--stack-card-bg-shift', `${shift.toFixed(2)}%`);
                    backgroundElement.style.setProperty('--stack-card-bg-brightness', brightness.toFixed(3));
                    backgroundElement.style.setProperty('--stack-card-bg-saturation', saturation.toFixed(3));
                }

                if (cardElement) {
                    cardElement.style.setProperty('--stack-card-band-opacity', bandOpacity.toFixed(3));
                    cardElement.style.setProperty('--stack-card-band-brightness', bandBrightness.toFixed(3));
                    cardElement.style.setProperty('--stack-card-highlight-opacity', highlightOpacity.toFixed(3));
                    cardElement.style.setProperty('--stack-card-highlight-scale', highlightScale.toFixed(3));
                }
            });
        };

        window.addEventListener(SECTION_ACTIVE_LOCK_EVENT, handleActiveLock);
        const unsubscribe = subscribeScrollRuntime(updateScrollZoom);

        return () => {
            unsubscribe();
            window.removeEventListener(SECTION_ACTIVE_LOCK_EVENT, handleActiveLock);
            resetAllBackgrounds();
        };
    }, [quality.allowAmbientMotion, quality.isDesktopViewport]);

    return (
        <section id="tech-stack" ref={sectionRef} className="py-20 md:py-32 relative overflow-hidden section-padding render-optimize">
            <div
                className="absolute bottom-[10%] left-0 w-[600px] h-[600px] md:w-[1000px] md:h-[1000px] pointer-events-none opacity-45 -translate-x-1/2"
                style={{ background: 'radial-gradient(circle, rgba(0, 255, 153, 0.22) 0%, transparent 70%)' }}
            />

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={viewportConfig}
                    className="mb-16"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <span className="font-mono text-xs text-electric-green bg-electric-green/5 border border-electric-green/20 px-3 py-1 rounded">{tech.id}</span>
                        <div className="h-[1px] flex-grow bg-gradient-to-r from-electric-green/30 to-transparent"></div>
                    </div>
                    <h2 className="text-5xl font-bold font-mono tracking-tighter uppercase text-white">
                        {tech.line1} <br />
                        <span className="text-electric-green">{tech.line2}</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {mappedCategories.map((cat, i) => (
                        <div
                            key={cat.title}
                            ref={(element) => {
                                cardRefs.current[i] = element;
                            }}
                        >
                            <NodeGroup
                                title={cat.title}
                                icon={cat.icon}
                                items={cat.items}
                                index={i}
                                quality={quality}
                                color={cat.color === 'electric-green' ? 'electric-green' : 'electric-cyan'}
                                backgroundRef={(element) => {
                                    bgRefs.current[i] = element;
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export { TechStack };
