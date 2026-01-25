import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minimize2, Maximize2, Info } from 'lucide-react';
import portfolioData from '../../data/portfolio';

const TerminalWindow = ({ title, onStateChange }) => {
    const { terminal } = portfolioData.ui;
    const windowTitle = title || terminal.headerTitle;
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        onStateChange?.(isExpanded);
    }, [isExpanded, onStateChange]);
    const [isDesktopLandscape, setIsDesktopLandscape] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const containerRef = useRef(null);

    const toggleExpand = () => setIsExpanded(!isExpanded);

    useEffect(() => {
        const checkLayout = () => {
            if (typeof window !== 'undefined') {
                const isLandscape = window.innerWidth > window.innerHeight;
                const isWide = window.innerWidth >= 768;
                const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

                // Detect real mobile (not narrow desktop)
                setIsMobile(!hasMouse && window.innerWidth < 768);

                // Only allow auto-growth on Desktop Landscape
                setIsDesktopLandscape(isLandscape && isWide && hasMouse);
            }
        };

        checkLayout();
        window.addEventListener('resize', checkLayout);
        return () => window.removeEventListener('resize', checkLayout);
    }, []);

    useEffect(() => {
        const handleToggle = () => setIsExpanded(prev => !prev);
        window.addEventListener('toggle-terminal', handleToggle);
        return () => window.removeEventListener('toggle-terminal', handleToggle);
    }, []);

    // Inject safety CSS to prevent horizontal overflow on mobile
    useEffect(() => {
        const styleId = 'terminal-mobile-safety';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            html, body, #root, #app {
                max-width: 100vw !important;
                overflow-x: hidden !important;
                width: 100% !important;
                position: relative;
                touch-action: pan-y;
            }
            input::placeholder {
                font-size: 16px !important;
            }
        `;
        document.head.appendChild(style);

        return () => {
            const el = document.getElementById(styleId);
            if (el) el.remove();
        };
    }, []);

    return (
        <motion.div
            initial={false}
            animate={{
                // PC Landscape: auto | Mobile: 350->450 | PC Portrait/Others: 320->384
                height: isExpanded
                    ? (isMobile ? 450 : 384)
                    : (isDesktopLandscape ? 'auto' : (isMobile ? 350 : 320))
            }}
            onClick={() => !isExpanded && setIsExpanded(true)}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`w-full glass-card border-white/20 shadow-2xl relative flex flex-col overflow-hidden ${!isExpanded ? 'cursor-pointer hover:border-electric-green/30 transition-colors' : ''
                }`}
            style={{
                clipPath: 'inset(-50px -50px -50px -50px)',
                width: '100%',
                maxWidth: isDesktopLandscape ? '672px' : '1052px',
                margin: '0 auto',
                boxSizing: 'border-box'
            }}
        >
            {/* Window Header */}
            <div className="flex-none bg-white/5 border-b border-white/10 px-4 py-2 flex items-center justify-between relative z-50 rounded-t-xl">
                <div className="flex gap-1.5 w-16">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                </div>
                <div className="flex-1 flex justify-center">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{windowTitle}</span>
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
                                <div className="absolute bottom-full right-0 mb-5 w-72 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none z-[1000]">
                                    <div className="glass-card p-4 border-electric-cyan/20 bg-dark-deep/95 backdrop-blur-2xl relative shadow-2xl">
                                        <div className="absolute -bottom-1 right-2 w-2 h-2 bg-dark-deep border-r border-b border-white/10 transform rotate-45"></div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-electric-cyan text-[10px] font-bold tracking-widest uppercase">
                                                <div className="w-1.5 h-1.5 rounded-full bg-electric-cyan animate-pulse"></div>
                                                {terminal.tooltip.title}
                                            </div>
                                            <p className="text-[10px] text-gray-300 font-mono leading-relaxed">
                                                {terminal.tooltip.description}
                                                <br /><br />
                                                <span className="text-electric-green">{" >> REAL-TIME CAPABILITIES:"}</span><br />
                                                {terminal.tooltip.capabilities.map((cap, i) => (
                                                    <React.Fragment key={i}>• {cap}<br /></React.Fragment>
                                                ))}
                                                <br />
                                                <span className="opacity-60">USAGE:</span> {terminal.tooltip.usage}
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
            </div>

            {/* Window Body */}
            <div
                className="flex-1 min-h-0 p-6 font-mono text-xs sm:text-sm leading-relaxed relative overflow-hidden rounded-b-xl"
            >
                <AnimatePresence mode="popLayout" initial={false}>
                    {!isExpanded ? (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="relative h-full"
                        >
                            <AnimatedPipeline />
                            <div className="absolute bottom-3 left-4 md:static md:mt-4 text-[10px] text-gray-600 animate-pulse">
                                {terminal.welcomeMessage}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
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
            </div>
        </motion.div >
    );
};

const InteractiveConsole = ({ onClose }) => {
    const { terminal } = portfolioData.ui;
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
                // Send history along with message for context
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: cmd,
                        history: history.slice(-5) // Send last 5 entries for context
                    })
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
                    if (data.action === 'OPEN_LINK' && data.url) {
                        window.open(data.url, '_blank');
                    } else {
                        const sectionId = data.action.replace('SCROLL_TO_', '').toLowerCase().replace('_', '-');
                        const targetId = sectionId === 'stack' ? 'tech-stack' : sectionId;

                        setTimeout(() => {
                            const element = document.getElementById(targetId);
                            if (element) {
                                if (window.lenis) {
                                    window.lenis.scrollTo(element, { offset: -50, duration: 1.5 });
                                } else {
                                    element.scrollIntoView({ behavior: 'smooth' });
                                }
                            }
                        }, 500);
                    }
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
            className="h-full overflow-y-auto pb-4 custom-terminal-scroll pr-1"
            ref={scrollRef}
            onClick={() => inputRef.current?.focus()}
            data-lenis-prevent
        >
            <div className="flex flex-col gap-2 text-gray-300 text-[16px] md:text-sm font-mono leading-relaxed">
                {terminal.consoleGretting.map((line, i) => (
                    <div key={i} className={`text-electric-green shrink-0 ${i === terminal.consoleGretting.length - 1 ? 'mb-2' : ''}`}>
                        {line.text}
                    </div>
                ))}

                {history.map((entry, i) => (
                    <div key={i} className={`flex gap-2 leading-relaxed ${entry.type === 'input' ? 'text-white' : 'text-gray-400'}`}>
                        <span className="shrink-0">{entry.type === 'input' ? <span className="text-electric-cyan font-bold">visitor@sys:~$</span> : ">"}</span>
                        <span className="break-words whitespace-pre-wrap">
                            {entry.type === 'output' ? (
                                <TypewriterEffect text={entry.content} speed={20} />
                            ) : entry.content}
                        </span>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-2 leading-relaxed text-gray-400 animate-pulse">
                        <span className="shrink-0">{">"}</span>
                        <span>SYSTEM_THINKING...</span>
                    </div>
                )}

                <div className="flex items-center gap-2 text-white leading-relaxed w-full overflow-hidden min-w-0">
                    <span className="text-electric-cyan font-bold shrink-0 whitespace-nowrap">visitor@sys:~$</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        className="flex-1 bg-transparent border-none outline-none text-white font-mono p-0 m-0 min-w-0 w-full text-[16px] md:text-sm"
                        autoComplete="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        style={{ minWidth: '0px' }}
                    />
                </div>
            </div>
        </div>
    );
};

const TypewriterEffect = ({ text, speed = 20 }) => {
    // Mobile Detection: If < 768px, render instantly for LCP Optimization
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // Initial state: If mobile, show full text. If desktop, start empty.
    const [displayedText, setDisplayedText] = useState(isMobile ? text : "");
    const [index, setIndex] = useState(0);

    // Effect: Only run typing animation if NOT mobile
    useEffect(() => {
        if (isMobile) {
            setDisplayedText(text); // Ensure sync if prop changes
            return;
        }

        if (index < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + text.charAt(index));
                setIndex((prev) => prev + 1);
            }, speed);
            return () => clearTimeout(timeout);
        }
    }, [index, text, speed, isMobile]);

    return <span>{displayedText}</span>;
};

export const AnimatedPipeline = () => {
    const { terminal } = portfolioData.ui;
    const [lineIdx, setLineIdx] = useState(0);
    const lines = terminal.initialLines;

    // Cyclic idle animation with original timing
    useEffect(() => {
        const interval = setInterval(() => {
            setLineIdx(prev => (prev + 1) % (lines.length + 1));
        }, 2500); // Original slow timing for idle effect
        return () => clearInterval(interval);
    }, [lines.length]);

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
                    {i === lineIdx - 1 ? (
                        <TypewriterEffect text={line.text} speed={15} />
                    ) : (
                        <span>{line.text}</span>
                    )}
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
