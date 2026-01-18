import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minimize2, Maximize2, Info } from 'lucide-react';

const TerminalWindow = ({ title = "zsh — port-folio" }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const containerRef = useRef(null);

    const toggleExpand = () => setIsExpanded(!isExpanded);

    useEffect(() => {
        const handleToggle = () => setIsExpanded(prev => !prev);
        window.addEventListener('toggle-terminal', handleToggle);
        return () => window.removeEventListener('toggle-terminal', handleToggle);
    }, []);

    return (
        <motion.div
            layout
            onClick={() => !isExpanded && setIsExpanded(true)}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`w-full max-w-2xl glass-card border-white/20 shadow-2xl overflow-visible relative cursor-default flex flex-col ${isExpanded ? 'h-96 md:h-96' : 'h-80 md:h-auto cursor-pointer hover:border-electric-green/30 transition-colors'
                }`}
        >
            {/* Window Header */}
            <motion.div layout="position" className="flex-none bg-white/5 border-b border-white/10 px-4 py-2 flex items-center justify-between relative z-10 rounded-t-xl">
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
                        <>
                            {/* Info Tooltip Trigger */}
                            <div className="relative group">
                                <button className="text-gray-500 hover:text-electric-cyan transition-colors cursor-pointer p-1">
                                    <Info size={14} />
                                </button>
                                {/* Tooltip */}
                                <div className="absolute bottom-full right-0 mb-5 w-72 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none">
                                    <div className="glass-card p-4 border-electric-cyan/20 bg-dark-deep/95 backdrop-blur-2xl relative shadow-2xl">
                                        <div className="absolute -bottom-1 right-2 w-2 h-2 bg-dark-deep border-r border-b border-white/10 transform rotate-45"></div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-electric-cyan text-[10px] font-bold tracking-widest uppercase">
                                                <div className="w-1.5 h-1.5 rounded-full bg-electric-cyan animate-pulse"></div>
                                                System Architecture
                                            </div>
                                            <p className="text-[10px] text-gray-300 font-mono leading-relaxed">
                                                Powered by <span className="text-white">Llama-3-70b</span> via Groq Cloud.
                                                <br /><br />
                                                <span className="text-electric-green">>> REAL-TIME CAPABILITIES:</span><br />
                                                • Accesses live website content & GitHub repos.<br />
                                                • Performs autonomous navigation.<br />
                                                • Controls system interface.
                                                <br /><br />
                                                <span className="opacity-60">USAGE:</span> Try asking about "projects" or type "help".
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(false);
                                }}
                                className="text-gray-500 hover:text-white transition-colors cursor-pointer p-1"
                            >
                                <X size={14} />
                            </button>
                        </>
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
                            className="relative h-full"
                        >
                            <AnimatedPipeline />
                            <div className="absolute bottom-6 left-6 md:static md:mt-4 text-[10px] text-gray-600 animate-pulse">
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
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, input, isLoading]);

    const handleKeyDown = async (e) => {
        if (e.key === 'Enter') {
            if (!input.trim()) return;
            const cmd = input.trim();

            // Add user command to history
            setHistory(prev => [...prev, { type: 'input', content: cmd }]);
            setInput("");
            setIsLoading(true);

            // Local commands override
            if (cmd.toLowerCase() === 'clear') {
                setHistory([]);
                setIsLoading(false);
                return;
            }
            if (cmd.toLowerCase() === 'exit') {
                onClose();
                return;
            }

            try {
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: cmd })
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    let errorMessage = `>> ERROR ${res.status}: NEURAL LINK FAILURE.`;
                    try {
                        const errorJson = JSON.parse(errorText);
                        if (errorJson.text) errorMessage = errorJson.text;
                    } catch (e) { }

                    console.error("API Error:", errorText);
                    setHistory(prev => [...prev, { type: 'output', content: errorMessage }]);
                    setIsLoading(false);
                    return;
                }

                const data = await res.json();

                // Add AI response to history
                setHistory(prev => [...prev, { type: 'output', content: data.text }]);

                // Execute Action
                if (data.action) {
                    const sectionId = data.action.replace('SCROLL_TO_', '').toLowerCase().replace('_', '-');
                    // Map generic names to specific IDs if needed
                    const targetId = sectionId === 'stack' ? 'tech-stack' : sectionId;

                    setTimeout(() => {
                        const element = document.getElementById(targetId);
                        if (element) {
                            // Use window.lenis if available for smooth consistency
                            if (window.lenis) {
                                window.lenis.scrollTo(element, { offset: -50, duration: 1.5 });
                            } else {
                                element.scrollIntoView({ behavior: 'smooth' });
                            }
                        }
                    }, 500);
                }

            } catch (error) {
                setHistory(prev => [...prev, { type: 'output', content: ">> ERROR: SERVER DISCONNECTED. PLEASE CHECK CONNECTION." }]);
            } finally {
                setIsLoading(false);
            }
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
                        <span className="break-all whitespace-pre-wrap">{entry.content}</span>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-2 leading-relaxed text-gray-400 animate-pulse">
                        <span className="shrink-0">{">"}</span>
                        <span>SYSTEM_THINKING...</span>
                    </div>
                )}

                <div className="flex items-center gap-2 text-white leading-relaxed">
                    <span className="text-electric-cyan font-bold shrink-0">visitor@sys:~$</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
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
                className="w-2 h-4 bg-electric-green inline-block ml-1 align-middle mt-2"
            />
        </div>
    );
}

export default TerminalWindow;
