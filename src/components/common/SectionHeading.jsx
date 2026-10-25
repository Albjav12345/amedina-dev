import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { viewportConfig } from '../../utils/animations';

export default function SectionHeading({ header, description }) {
    const reducedMotion = useReducedMotion();
    return (
        <motion.header
            className="section-heading flex flex-col mb-16"
            initial={reducedMotion ? false : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewportConfig}
        >
            <div className="flex items-center gap-4 mb-4">
                <span className="font-mono text-xs text-electric-green bg-electric-green/10 border border-electric-green/20 px-2 py-1 rounded">{header.id}</span>
                <div className="h-px flex-grow bg-gradient-to-r from-electric-green/30 to-transparent" />
            </div>
            <h2 className="text-[clamp(2rem,8vw,3rem)] md:text-5xl leading-none font-bold font-mono tracking-tighter uppercase text-white">
                {header.line1}<br /><span className="text-electric-green">{header.line2}</span>
            </h2>
            {description && <p className="mt-5 max-w-2xl text-base md:text-lg leading-relaxed text-gray-400">{description}</p>}
        </motion.header>
    );
}
