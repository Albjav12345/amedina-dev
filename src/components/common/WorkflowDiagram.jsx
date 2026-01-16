import React from 'react';
import { motion } from 'framer-motion';

const WorkflowDiagram = ({ steps = [], className = "" }) => {
    return (
        <div className={`flex flex-wrap items-center gap-4 py-4 ${className}`}>
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center"
                    >
                        {/* Node Box */}
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-electric-green/30 rounded blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                            <div className="relative glass-card px-4 py-2 border-white/20 group-hover:border-electric-green/50 transition-colors">
                                <span className="font-mono text-[10px] sm:text-xs font-bold text-gray-300 group-hover:text-electric-green tracking-widest uppercase">
                                    {step}
                                </span>

                                {/* Small indicator light */}
                                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric-green opacity-40"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-electric-green/60"></span>
                                </span>
                            </div>
                        </div>

                        {/* Connecting Arrow/Line */}
                        {index < steps.length - 1 && (
                            <div className="flex items-center px-2">
                                <svg width="24" height="12" viewBox="0 0 24 12" fill="none" className="overflow-visible">
                                    <motion.path
                                        d="M0 6H22M22 6L17 1M22 6L17 11"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="text-white/20 group-hover:text-electric-green"
                                        initial={{ pathLength: 0 }}
                                        whileInView={{ pathLength: 1 }}
                                        transition={{ duration: 1, delay: index * 0.2 }}
                                    />
                                    {/* Glowing trail effect */}
                                    <motion.circle
                                        r="2"
                                        fill="var(--electric-green)"
                                        initial={{ cx: 0, cy: 6, opacity: 0 }}
                                        animate={{ cx: [0, 24], opacity: [0, 1, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.5, delay: index * 0.2 }}
                                    />
                                </svg>
                            </div>
                        )}
                    </motion.div>
                </React.Fragment>
            ))}
        </div>
    );
};

export default WorkflowDiagram;
