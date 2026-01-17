import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minimize2, Maximize2 } from 'lucide-react';

const TerminalWindow = ({ title = "zsh — port-folio" }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const containerRef = useRef(null);

    const toggleExpand = () => setIsExpanded(!isExpanded);

    return (
        <motion.div
            layout
            onClick={() => !isExpanded && setIsExpanded(true)}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`w-full max-w-2xl glass-card border-white/20 shadow-2xl overflow-hidden relative cursor-default flex flex-col ${isExpanded ? 'h-80 md:h-96' : 'h-auto cursor-pointer hover:border-electric-green/30 transition-colors'
                }`}
        >
            {/* Window Header */}
            <motion.div layout="position" className="flex-none bg-white/5 border-b border-white/10 px-4 py-2 flex items-center justify-between relative z-10">
                <div className="flex gap-1.5 w-16">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                </div>
                <div className="flex-1 flex justify-center">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{title}</span>
                </div>
                <div className="flex items-center justify-end gap-2 w-16">
                    {isExpanded && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(false);
                            }}
                            className="text-gray-500 hover:text-white transition-colors cursor-pointer p-1"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Window Body */}
            <motion.div
                layout
                className={`flex-1 min-h-0 p-6 font-mono text-xs sm:text-sm leading-relaxed relative overflow-hidden`}
            >
                <AnimatePresence mode="popLayout" initial={false}>
                    {!isExpanded ? (
                        <motion.div
                            layout
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="relative"
                        >
                            <AnimatedPipeline />
                            <div className="mt-8 text-[10px] text-gray-600 animate-pulse">
                                Click to access system...
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            layout
                            key="active"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="h-full flex flex-col"
                        >
                            <InteractiveConsole onClose={() => setIsExpanded(false)} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

const InteractiveConsole = ({ onClose }) => {
    const [input, setInput] = useState("");
    const [history, setHistory] = useState([]);
    const inputRef = useRef(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, input]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            const cmd = input.trim().toLowerCase();
            let response = "";
            let action = null;

            switch (cmd) {
                case 'help':
                    response = "Available commands: help, clear, exit, whoami, contact";
                    break;
                case 'clear':
                    setHistory([]);
                    setInput("");
                    return;
                case 'exit':
                    onClose();
                    return;
                case 'whoami':
                    response = "visitor@automation-portfolio ~ guest_access_level_1";
                    break;
                case 'contact':
                    response = "Opening contact protocol...";
                    action = () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                    break;
                case '':
                    break;
                default:
                    response = `Command not found: ${cmd}. Type 'help' for available commands.`;
            }

            setHistory([...history, { type: 'input', content: input }, ...(response ? [{ type: 'output', content: response }] : [])]);
            setInput("");
            if (action) setTimeout(action, 500);
        }
    };

    return (
        <div
            className="h-full overflow-y-auto pb-4 custom-scrollbar"
            ref={scrollRef}
            onClick={() => inputRef.current?.focus()}
            data-lenis-prevent
        >
            <div className="flex flex-col gap-2 text-gray-300">
                <div className="text-electric-green shrink-0">
                    {">"} INITIALIZING GUEST SESSION...
                </div>
                <div className="text-electric-green mb-2 shrink-0">
                    {">"} ACCESS GRANTED. AWAITING INPUT...
                </div>

                {history.map((entry, i) => (
                    <div key={i} className={`flex gap-2 leading-relaxed ${entry.type === 'input' ? 'text-white' : 'text-gray-400'}`}>
                        <span className="shrink-0">{entry.type === 'input' ? <span className="text-electric-cyan font-bold">visitor@sys:~$</span> : ">"}</span>
                        <span className="break-all">{entry.content}</span>
                    </div>
                ))}

                <div className="flex items-center gap-2 text-white leading-relaxed">
                    <span className="text-electric-cyan font-bold shrink-0">visitor@sys:~$</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-transparent border-none outline-none text-white font-mono p-0 m-0 min-w-0"
                        autoComplete="off"
                        autoCapitalize="off"
                        spellCheck="false"
                    />
                </div>
            </div>
        </div>
    );
};

export const AnimatedPipeline = () => {
    const [lineIdx, setLineIdx] = useState(0);
    const lines = [
        { text: ">>> Initializing System...", color: "white" },
        { text: ">>> User authenticated: Albjav1235", color: "electric-green" },
        { text: ">>> const developer = 'Alberto Medina';", color: "electric-cyan" },
        { text: ">>> dev.focus = ['Automation', 'Full-Stack'];", color: "white" },
        { text: ">>> [SUCCESS] Workspace ready.", color: "electric-green" },
        { text: "$ python3 optimize_workflow.py", color: "gray" }
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
