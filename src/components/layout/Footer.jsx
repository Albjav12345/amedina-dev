import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import portfolioData from '../../data/portfolio';

const Footer = ({ onOpenControlPanel }) => {
    const { footer } = portfolioData.ui;
    const { name } = portfolioData.profile;
    const prefersReducedMotion = useReducedMotion();

    const shellTransition = prefersReducedMotion
        ? { duration: 0 }
        : { duration: 0.24, ease: [0.22, 1, 0.36, 1] };

    const contentTransition = prefersReducedMotion
        ? { duration: 0 }
        : { duration: 0.34, delay: 0.05, ease: [0.22, 1, 0.36, 1] };

    const detailTransition = prefersReducedMotion
        ? { duration: 0 }
        : { duration: 0.28, delay: 0.12, ease: [0.22, 1, 0.36, 1] };

    return (
        <motion.footer
            initial={prefersReducedMotion ? false : { opacity: 0.98 }}
            animate={{ opacity: 1 }}
            transition={shellTransition}
            className="relative overflow-hidden border-t border-white/8 bg-dark-high/50 backdrop-blur-sm py-12"
        >
            <motion.div
                aria-hidden="true"
                initial={prefersReducedMotion ? false : { opacity: 0, scaleX: 0.985 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={contentTransition}
                className="pointer-events-none absolute inset-x-8 top-0 h-px origin-center bg-gradient-to-r from-transparent via-white/14 to-transparent"
            />
            <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, filter: 'blur(10px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                transition={contentTransition}
                className="container mx-auto px-10 md:px-6"
            >
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <motion.div
                        initial={prefersReducedMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={detailTransition}
                        className="flex flex-col gap-2"
                    >
                        <motion.button
                            type="button"
                            onClick={onOpenControlPanel}
                            className="flex items-center gap-3 rounded-full border border-electric-green/20 bg-electric-green/10 px-3 py-1.5 transition-colors hover:border-electric-cyan/30 hover:bg-electric-cyan/10 cursor-pointer"
                            initial={prefersReducedMotion ? false : { opacity: 0.88, scale: 0.985 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={detailTransition}
                            whileHover={prefersReducedMotion ? undefined : { scale: 1.015 }}
                            whileTap={prefersReducedMotion ? undefined : { scale: 0.992 }}
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric-green opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-electric-green"></span>
                            </span>
                            <span className="font-mono text-[10px] tracking-widest text-electric-green uppercase">
                                {footer.status}
                            </span>
                        </motion.button>
                        <p className="text-gray-400 text-[8px] md:text-xs mt-1 whitespace-nowrap">
                            Copyright {new Date().getFullYear()} Engineered by <span className="text-white">{footer.name || name}</span>.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={prefersReducedMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ ...detailTransition, delay: prefersReducedMotion ? 0 : 0.16 }}
                        className="flex gap-4 md:gap-6 font-mono text-[8px] md:text-[10px] text-gray-400 whitespace-nowrap"
                    >
                        <div className="flex flex-col items-center md:items-end">
                            <span className="text-gray-500">LOCATION</span>
                            <span>{footer.location}</span>
                        </div>
                        <div className="flex flex-col items-center md:items-end">
                            <span className="text-gray-500">VESSEL_ID</span>
                            <span>{footer.vesselId}</span>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </motion.footer>
    );
};

// Footer stays as a named export so App can choose whether to lazy-load it or keep it critical.
export { Footer };
