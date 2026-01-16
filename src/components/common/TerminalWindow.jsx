import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TerminalWindow = ({ children, title = "zsh — port-folio" }) => {
    return (
        <div className="w-full max-w-2xl glass-card border-white/20 shadow-2xl overflow-hidden">
            {/* Window Header */}
            <div className="bg-white/5 border-b border-white/10 px-4 py-2 flex items-center justify-between">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{title}</span>
                </div>
                <div className="w-12"></div>
            </div>

            {/* Window Body */}
            <div className="p-6 font-mono text-sm sm:text-base leading-relaxed overflow-x-auto whitespace-pre">
                {children}
            </div>
        </div>
    );
};

export const AnimatedPipeline = () => {
    const [lineIdx, setLineIdx] = useState(0);
    const lines = [
        { text: ">>> Initializing System...", color: "white" },
        { text: ">>> Loading AI Core (Groq-Llama-3)...", color: "electric-green" },
        { text: ">>> Setting up Automation Hub...", color: "white" },
        { text: ">>> [SUCCESS] All systems go.", color: "electric-green" },
        { text: "$ python3 build_future.py", color: "gray" },
        { text: "Optimizing everything...", color: "electric-cyan" }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setLineIdx(prev => (prev + 1) % (lines.length + 1));
        }, 800);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col gap-1">
            {lines.slice(0, lineIdx).map((line, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={line.color === 'electric-green' ? 'text-electric-green' :
                        line.color === 'electric-cyan' ? 'text-electric-cyan' :
                            line.color === 'gray' ? 'text-gray-500' : 'text-white'}
                >
                    {line.text}
                </motion.div>
            ))}
            <motion.span
                animate={{ opacity: [0, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-2 h-4 bg-electric-green inline-block ml-1 align-middle"
            />
        </div>
    );
}

export default TerminalWindow;
