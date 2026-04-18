import React from 'react';
import { motion } from 'framer-motion';
import { viewportConfig } from '../../utils/animations';
import portfolioData from '../../data/portfolio.js';
import { useHardwareQuality } from '../../hooks/useHardwareQuality';
import { renderTechCategoryIcon, renderTechItemIcon } from './techStackIcons';

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
        position: 'center 54%',
        overlay:
            'radial-gradient(circle at 78% 24%, rgba(255, 120, 90, 0.10) 0%, rgba(255, 120, 90, 0) 28%), linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0) 40%, rgba(0, 255, 153, 0.10) 100%)',
    },
    'AI & Vision Workflows': {
        image: '/assets/stack/tech-ai.webp',
        position: 'center 34%',
        overlay:
            'radial-gradient(circle at 18% 78%, rgba(240, 255, 140, 0.16) 0%, rgba(240, 255, 140, 0) 26%), linear-gradient(135deg, rgba(255, 96, 72, 0.14) 0%, rgba(0, 0, 0, 0.02) 42%, rgba(88, 166, 255, 0.14) 100%)',
    },
    'Frontend & Interactive Systems': {
        image: '/assets/stack/tech-frontend.webp',
        position: 'center 32%',
        overlay:
            'radial-gradient(circle at 52% 24%, rgba(88, 166, 255, 0.18) 0%, rgba(88, 166, 255, 0) 30%), linear-gradient(135deg, rgba(255, 220, 120, 0.08) 0%, rgba(0, 0, 0, 0) 42%, rgba(88, 166, 255, 0.14) 100%)',
    },
    'Infra & Delivery': {
        image: '/assets/stack/tech-infra.webp',
        position: 'center center',
        overlay:
            'radial-gradient(circle at 84% 16%, rgba(0, 255, 153, 0.18) 0%, rgba(0, 255, 153, 0) 24%), linear-gradient(135deg, rgba(0, 255, 153, 0.10) 0%, rgba(0, 0, 0, 0) 42%, rgba(255, 255, 255, 0.04) 100%)',
    },
};

function getCardBackgroundStyle(title) {
    const background = TECH_CARD_BACKGROUNDS[title] || TECH_CARD_BACKGROUNDS['Core Development'];

    return {
        backgroundColor: '#0f141a',
        backgroundImage: `${background.overlay}, linear-gradient(180deg, rgba(5, 8, 12, 0.10) 0%, rgba(5, 8, 12, 0.42) 38%, rgba(5, 8, 12, 0.84) 68%, rgba(5, 8, 12, 0.98) 86%, rgba(5, 8, 12, 1) 100%), linear-gradient(180deg, rgba(5, 8, 12, 0) 58%, rgba(5, 8, 12, 0.72) 82%, rgba(5, 8, 12, 1) 100%), url("${background.image}")`,
        backgroundPosition: `center, center, center, ${background.position}`,
        backgroundRepeat: 'no-repeat, no-repeat, no-repeat, no-repeat',
        backgroundSize: 'cover, cover, cover, cover',
        backgroundClip: 'padding-box',
        boxShadow: 'inset 0 -1px 0 rgba(5, 8, 12, 0.96), inset 0 -34px 42px rgba(5, 8, 12, 0.90), inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 22px 54px rgba(0, 0, 0, 0.18)',
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

const NodeGroup = ({ title, icon, items, index, color, quality }) => {
    const colorStyles = COLOR_STYLES[color] || COLOR_STYLES['electric-green'];
    const backgroundStyle = getCardBackgroundStyle(title);

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
            className="p-10 border border-white/5 relative overflow-hidden space-y-10 gpu-accelerated rounded-xl bg-dark-high/90"
            style={backgroundStyle}
        >
            <div className="flex items-center gap-4 border-l-2 border-white/5 pl-6">
                <div className={`p-3 rounded-lg bg-black/40 border ${colorStyles.border} ${colorStyles.text} shadow-[0_0_20px_rgba(0,255,153,0.05)]`}>
                    {icon}
                </div>
                <div className="flex flex-col">
                    <h3 className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-white/90">{title}</h3>
                    <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mt-1">Classification_Level_{index + 1}</span>
                </div>
            </div>

            <div className={`flex flex-wrap gap-x-6 gap-y-8 justify-center lg:justify-start ${quality.tier === 'low' ? 'will-change-contents' : ''}`}>
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
    const { tech } = portfolioData.ui.sections;
    const { categories } = portfolioData.skills;

    const mappedCategories = categories.map((cat) => ({
        ...cat,
        icon: renderTechCategoryIcon(cat.title, quality),
    }));

    return (
        <section id="tech-stack" className="py-20 md:py-32 relative overflow-hidden section-padding render-optimize">
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
                        <NodeGroup
                            key={cat.title}
                            title={cat.title}
                            icon={cat.icon}
                            items={cat.items}
                            index={i}
                            quality={quality}
                            color={cat.color === 'electric-green' ? 'electric-green' : 'electric-cyan'}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export { TechStack };
