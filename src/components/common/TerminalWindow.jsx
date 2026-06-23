import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info } from 'lucide-react';
import portfolioData from '../../data/portfolio';
import { recordOpsRun } from '../../utils/opsTelemetry';
import { dispatchSectionNavigation } from '../../utils/sectionRouting';

const IDLE_PROMPTS = [
    'MATCH A ROLE TO REAL PROJECT EVIDENCE',
    'COMPARE SYSTEMS AND ENGINEERING TRADE-OFFS',
    'FIND THE STRONGEST PROJECT FOR YOUR TEAM',
    'OPEN THE CV, GITHUB, PROJECTS OR CONTACT',
    'ASK WHAT ALBERTO COULD SHIP IN 90 DAYS',
];

const PIPELINE_SUGGESTIONS = [
    'TRY: /fit frontend role using React, Node and SQL',
    'ASK: Which project best proves end-to-end ownership?',
    'COMPARE: Smart Inbox Manager vs Padel Booking Platform',
    'RUN: /cv /projects /github /contact',
    'ASK: What could Alberto contribute in his first 90 days?',
];

const PIPELINE_SUGGESTION_RESERVE = PIPELINE_SUGGESTIONS.reduce(
    (longest, suggestion) => suggestion.length > longest.length ? suggestion : longest,
    '',
);

const IDLE_SEQUENCE_HOLD_MS = 8200;
const IDLE_FIRST_LINE_DELAY_MS = 900;
const IDLE_LINE_HOLD_MS = 1200;

const SOFT_FLOAT_TRANSITION = {
    duration: 0.46,
    ease: [0.22, 1, 0.36, 1],
};

const INPUT_PLACEHOLDERS = [
    'Ask about a project...',
    'Try /fit <role>...',
    'Compare two systems...',
    'Type /help for commands...',
];

const QUICK_ACTIONS = [
    { label: 'ROLE MATCH', command: '/fit ', submit: false },
    { label: 'BEST PROJECT', command: 'Which project best demonstrates end-to-end ownership?', submit: true },
    { label: 'VIEW CV', command: '/cv', submit: true },
    { label: 'CONTACT', command: '/contact', submit: true },
];

const useRotatingIndex = (length, { paused = false, delay = 4400 } = {}) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (paused || length < 2) return undefined;

        const interval = window.setInterval(() => {
            setIndex(current => (current + 1) % length);
        }, delay);

        return () => window.clearInterval(interval);
    }, [delay, length, paused]);

    return index;
};

const getTerminalLayoutState = () => {
    if (typeof window === 'undefined') {
        return {
            isDesktopLandscape: false,
            isMobile: false,
            hasCursor: true,
        };
    }

    const hasCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    return {
        isDesktopLandscape: window.innerWidth > window.innerHeight && window.innerWidth >= 768,
        isMobile: !hasCursor && window.innerWidth < 768,
        hasCursor,
    };
};

const normalizeSearchText = (value = '') => value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const openInNewTab = (url) => {
    if (!url || typeof window === 'undefined') return;

    const openedWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (openedWindow) openedWindow.opener = null;
};

const getRelevantProjects = (query) => {
    const normalizedQuery = normalizeSearchText(query);
    const tokens = normalizedQuery
        .split(/[^a-z0-9+#.]+/)
        .filter(token => token.length > 2)
        .filter(token => !['the', 'and', 'for', 'with', 'que', 'para', 'con', 'una', 'del'].includes(token));

    return portfolioData.projects
        .map(project => {
            const corpus = normalizeSearchText([
                project.title,
                project.subtitle,
                project.problem,
                project.solution,
                ...(project.stack || []),
            ].join(' '));
            const score = tokens.reduce((total, token) => total + (corpus.includes(token) ? 1 : 0), 0);
            return { project, score };
        })
        .sort((left, right) => right.score - left.score);
};

const buildFallbackResponse = (query) => {
    const normalizedQuery = normalizeSearchText(query);
    const rankedProjects = getRelevantProjects(query);
    const matchingProjects = rankedProjects.filter(item => item.score > 0).slice(0, 2);
    const githubUrl = portfolioData.profile?.social?.github;

    if (normalizedQuery.includes('cv') || normalizedQuery.includes('resume') || normalizedQuery.includes('curriculum')) {
        return {
            text: 'LOCAL_ROUTE: The current CV is ready. Opening the PDF now.',
            action: 'OPEN_CV',
        };
    }

    if (normalizedQuery.includes('contact') || normalizedQuery.includes('email') || normalizedQuery.includes('hire')) {
        return {
            text: `LOCAL_ROUTE: Direct contact is available at ${portfolioData.ui.contact.email}. Opening the contact section.`,
            action: 'SCROLL_TO_CONTACT',
        };
    }

    if (normalizedQuery.includes('github') || normalizedQuery.includes('repository') || normalizedQuery.includes('repositorio')) {
        return {
            text: 'LOCAL_ROUTE: Opening Alberto\'s public GitHub profile. Live AI analysis is temporarily unavailable.',
            action: 'OPEN_LINK',
            url: githubUrl,
        };
    }

    if (normalizedQuery.includes('/fit') || normalizedQuery.includes('role') || normalizedQuery.includes('puesto') || normalizedQuery.includes('encaja')) {
        const selected = matchingProjects.length
            ? matchingProjects
            : rankedProjects.filter(({ project }) => ['Smart Inbox Manager', 'Padel Booking Platform'].includes(project.title));
        const matchedSkills = portfolioData.skills.categories
            .flatMap(category => category.items)
            .filter(skill => normalizeSearchText(skill)
                .split(/[^a-z0-9+#]+/)
                .some(term => term.length > 2 && normalizedQuery.includes(term)));
        const evidence = selected
            .slice(0, 2)
            .map(({ project }) => `- ${project.title} [${project.stack.join(', ')}]: ${project.solution}`)
            .join('\n');
        const skillOverlap = matchedSkills.length
            ? matchedSkills.join(', ')
            : 'No explicit skill overlap could be extracted from the short role description.';
        return {
            text: `ROLE_MATCH / LOCAL_EVIDENCE_MODE\nMATCHED_SKILLS\n- ${skillOverlap}\nEVIDENCE\n${evidence}\nGAPS\n- A full requirement-by-requirement assessment needs the live agent. No missing skill will be guessed.\nNEXT\n- Review the selected systems or run /cv.`,
            action: 'SCROLL_TO_PROJECTS',
        };
    }

    if (normalizedQuery.includes('stack') || normalizedQuery.includes('skills') || normalizedQuery.includes('technology')) {
        const categorySummary = portfolioData.skills.categories
            .map(category => `${category.title}: ${category.items.join(', ')}`)
            .join('\n');
        return {
            text: `LOCAL_EVIDENCE_MODE\n${categorySummary}`,
            action: 'SCROLL_TO_STACK',
        };
    }

    if (normalizedQuery.includes('project') || normalizedQuery.includes('portfolio') || normalizedQuery.includes('built') || normalizedQuery.includes('compare')) {
        const selected = matchingProjects.length
            ? matchingProjects
            : rankedProjects.filter(({ project }) => ['Smart Inbox Manager', 'Padel Booking Platform'].includes(project.title));
        const evidence = selected
            .slice(0, 2)
            .map(({ project }) => `- ${project.title}: ${project.solution}\n  Stack: ${project.stack.join(', ')}`)
            .join('\n');
        return {
            text: `PROJECT_EVIDENCE / LOCAL_MODE\n${evidence}\nOpen Systems for architecture and demos.`,
            action: 'SCROLL_TO_PROJECTS',
        };
    }

    if (normalizedQuery.includes('about') || normalizedQuery.includes('alberto') || normalizedQuery.includes('quien')) {
        return {
            text: `LOCAL_EVIDENCE_MODE: ${portfolioData.profile.tagline} Opening the background section for verified context.`,
            action: 'SCROLL_TO_ABOUT',
        };
    }

    return {
        text: 'LIVE_AGENT_UNAVAILABLE: Local commands still work. Try /help, /projects, /cv, /github or /contact.',
        action: null,
    };
};

const TerminalWindow = ({ title, onStateChange, isUiFrozen = false }) => {
    const { terminal } = portfolioData.ui;
    const windowTitle = title || terminal.headerTitle;
    const [isExpanded, setIsExpanded] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [lockedHeight, setLockedHeight] = useState(null);
    const terminalWindowRef = useRef(null);
    const openingFrameRef = useRef(null);
    const idlePromptIndex = useRotatingIndex(IDLE_PROMPTS.length, {
        paused: isUiFrozen || isExpanded,
        delay: 4800,
    });

    const clearOpeningFrame = useCallback(() => {
        if (openingFrameRef.current !== null) {
            window.cancelAnimationFrame(openingFrameRef.current);
            openingFrameRef.current = null;
        }

    }, []);

    const openTerminal = useCallback(() => {
        if (isExpanded) return;

        clearOpeningFrame();
        const currentHeight = terminalWindowRef.current?.getBoundingClientRect().height;

        if (!currentHeight) {
            setIsExpanded(true);
            return;
        }

        // Preserve the exact idle height while its content is exchanged. Without
        // this brief lock, `auto` can be remeasured after the idle panel leaves.
        setLockedHeight(currentHeight);
        openingFrameRef.current = window.requestAnimationFrame(() => {
            setIsExpanded(true);
            openingFrameRef.current = window.requestAnimationFrame(() => {
                setLockedHeight(null);
                openingFrameRef.current = null;
            });
        });
    }, [clearOpeningFrame, isExpanded]);

    const closeTerminal = useCallback(() => {
        clearOpeningFrame();
        setLockedHeight(null);
        setIsExpanded(false);
    }, [clearOpeningFrame]);

    useEffect(() => {
        onStateChange?.(isExpanded);
    }, [isExpanded, onStateChange]);
    const [layoutState, setLayoutState] = useState(getTerminalLayoutState);
    const { isDesktopLandscape, isMobile, hasCursor } = layoutState;

    useEffect(() => {
        const checkLayout = () => {
            const nextLayoutState = getTerminalLayoutState();
            setLayoutState(currentLayoutState => (
                currentLayoutState.isDesktopLandscape === nextLayoutState.isDesktopLandscape
                && currentLayoutState.isMobile === nextLayoutState.isMobile
                && currentLayoutState.hasCursor === nextLayoutState.hasCursor
                    ? currentLayoutState
                    : nextLayoutState
            ));
        };

        checkLayout();
        window.addEventListener('resize', checkLayout);
        return () => window.removeEventListener('resize', checkLayout);
    }, []);

    useEffect(() => {
        const handleToggle = () => {
            if (isExpanded) closeTerminal();
            else openTerminal();
        };
        const handleClickOutside = () => setShowTooltip(false);

        window.addEventListener('toggle-terminal', handleToggle);
        window.addEventListener('click', handleClickOutside);

        return () => {
            window.removeEventListener('toggle-terminal', handleToggle);
            window.removeEventListener('click', handleClickOutside);
        };
    }, [closeTerminal, isExpanded, openTerminal]);

    useEffect(() => () => clearOpeningFrame(), [clearOpeningFrame]);

    // Placeholder for global safety CSS removed (now in global.css)

    return (
        <motion.div
            ref={terminalWindowRef}
            role={!isExpanded ? 'button' : undefined}
            tabIndex={!isExpanded ? 0 : undefined}
            aria-label={!isExpanded ? 'Open interactive terminal' : undefined}
            initial={false}
            animate={{
                // PC Landscape: auto | Mobile: 350->450 | PC Portrait/Others: 320->384
                height: lockedHeight ?? (isExpanded
                    ? (isMobile ? 450 : 384)
                    : (isDesktopLandscape ? 'auto' : (isMobile ? 350 : 320)))
            }}
            onClick={openTerminal}
            onKeyDown={(event) => {
                if (!isExpanded && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    openTerminal();
                }
            }}
            transition={{
                height: {
                    duration: isExpanded ? 0.48 : 0.52,
                    ease: [0.22, 1, 0.36, 1],
                },
            }}
            className={`w-full glass-card border-white/20 shadow-2xl relative flex flex-col overflow-hidden gpu-accelerated ${!isExpanded ? 'cursor-pointer hover:border-electric-green/30 transition-colors' : ''
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
            <div className="flex-none h-10 bg-white/5 border-b border-white/10 px-4 flex items-center justify-between relative z-50 rounded-t-xl">
                <div className="flex gap-1.5 w-16">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                </div>
                <div className="flex-1 flex justify-center">
                    <span
                        title={windowTitle}
                        className="text-[9px] font-mono text-gray-500 uppercase tracking-[0.16em] sm:text-[10px] sm:tracking-widest"
                    >
                        <span className="sm:hidden">portfolio-agent</span>
                        <span className="hidden sm:inline">{windowTitle}</span>
                    </span>
                </div>
                <div className="flex items-center justify-end gap-2 w-16">
                    <AnimatePresence initial={false}>
                        {isExpanded && (
                            <motion.div
                                key="terminal-controls"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.16, ease: 'linear' }}
                                className="flex items-center justify-end gap-2"
                            >
                            {/* Info Tooltip Trigger */}
                            <div className="relative group">
                                <button
                                    type="button"
                                    aria-label="About the interactive terminal"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!hasCursor) setShowTooltip(!showTooltip);
                                    }}
                                    className="text-gray-500 hover:text-electric-cyan transition-colors cursor-pointer p-1"
                                >
                                    <Info size={14} />
                                </button>
                                {/* Tooltip Container */}
                                <div className={`absolute top-full right-0 mt-2 w-72 transition-all duration-300 transform ${showTooltip ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto'} z-[2000]`}>
                                    {/* Opaque solid container (No glass/blur) */}
                                    <div className="p-4 border border-electric-cyan/20 bg-[#0d0e12] rounded-xl relative shadow-[0_20px_50px_rgba(0,0,0,1)]">
                                        <div className="absolute -top-1 right-2 w-2 h-2 bg-[#0d0e12] border-l border-t border-white/10 transform rotate-45"></div>
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
                                                    <React.Fragment key={i}>- {cap}<br /></React.Fragment>
                                                ))}
                                                <br />
                                                <span className="opacity-60">USAGE:</span> {terminal.tooltip.usage}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                aria-label="Close interactive terminal"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    closeTerminal();
                                }}
                                className="text-gray-500 hover:text-white transition-colors cursor-pointer p-1"
                            >
                                <X size={14} />
                            </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
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
                            transition={{ duration: 0.18, ease: 'linear' }}
                            className="relative h-full"
                        >
                            <AnimatedPipeline isFrozen={isUiFrozen}>
                                <motion.div
                                    key="idle-footer"
                                    initial={{ opacity: 0, y: 12, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto', marginTop: isMobile ? 0 : 4 }}
                                    exit={{ opacity: 0, y: 8, height: 0, marginTop: 0 }}
                                    transition={{
                                        ...SOFT_FLOAT_TRANSITION,
                                        height: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                                        marginTop: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
                                    }}
                                    className="absolute bottom-3 left-4 right-4 md:static flex items-center gap-2 text-[10px] tracking-wide text-gray-500"
                                    style={{ overflow: 'hidden' }}
                                >
                                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-electric-green shadow-[0_0_10px_rgba(15,255,153,0.75)]" />
                                    <span className="text-gray-600">OPEN CONSOLE</span>
                                    <span className="text-gray-700">/</span>
                                    <AnimatePresence mode="wait" initial={false}>
                                        <motion.span
                                            key={idlePromptIndex}
                                            initial={{ opacity: 0, y: 3 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -3 }}
                                            transition={{ duration: 0.22 }}
                                            className="truncate text-gray-500"
                                        >
                                            {IDLE_PROMPTS[idlePromptIndex] || terminal.welcomeMessage}
                                        </motion.span>
                                    </AnimatePresence>
                                </motion.div>
                            </AnimatedPipeline>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="active"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.22, ease: 'linear' }}
                            className="h-full flex flex-col"
                        >
                            <InteractiveConsole onClose={closeTerminal} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

const InteractiveConsole = ({ onClose }) => {
    const { terminal } = portfolioData.ui;
    const [input, setInput] = useState("");
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef(null);
    const scrollRef = useRef(null);
    const isAutoScrollRef = useRef(true);
    const placeholderIndex = useRotatingIndex(INPUT_PLACEHOLDERS.length, {
        paused: Boolean(input) || isLoading,
        delay: 4200,
    });
    const cvHref = portfolioData.ui.hero?.buttons?.cvHref;
    const githubHref = portfolioData.profile?.social?.github;

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, []);

    // MutationObserver Logic: Scroll to bottom whenever DOM changes (text streaming)
    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        const observer = new MutationObserver(() => {
            if (isAutoScrollRef.current) {
                container.scrollTop = container.scrollHeight;
            }
        });

        observer.observe(container, {
            childList: true,
            subtree: true,
            characterData: true
        });

        return () => observer.disconnect();
    }, []);

    // Detect if user scrolled up to disable auto-scroll
    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            // Strict threshold (10px) to consider "at the bottom"
            const isActuallyAtBottom = scrollHeight - scrollTop - clientHeight < 10;
            isAutoScrollRef.current = isActuallyAtBottom;
        }
    };

    const executeUiAction = (action, url, delay = 0) => {
        if (!action) return;

        if (action === 'OPEN_CV') {
            openInNewTab(cvHref);
            return;
        }

        if (action === 'OPEN_LINK' && url) {
            openInNewTab(url);
            return;
        }

        if (action === 'OPEN_CONTROL_PANEL') {
            window.dispatchEvent(new CustomEvent('open-control-panel'));
            return;
        }

        if (!action.startsWith('SCROLL_TO_')) return;

        const sectionId = action.replace('SCROLL_TO_', '').toLowerCase().replaceAll('_', '-');
        const targetId = sectionId === 'stack' ? 'tech-stack' : sectionId;

        window.setTimeout(() => {
            dispatchSectionNavigation(targetId, {
                historyMode: 'push',
                behavior: 'smooth',
            });
        }, delay);
    };

    const resolveLocalCommand = (cmd) => {
        const [rawCommand, ...args] = cmd.split(/\s+/);
        const command = rawCommand.toLowerCase();
        const argument = args.join(' ').trim();

        if (command === '/help' || command === 'help') {
            return {
                text: [
                    'AVAILABLE_COMMANDS',
                    '/fit <role>                      Evidence, gaps, next step',
                    '/projects /cv /github /contact  Direct routes',
                    '/stack /about                   Portfolio context',
                    '/clear /exit                    Session controls',
                    'Or ask naturally for a comparison, deep-dive, or role fit.',
                ].join('\n'),
                decision: 'Displayed the local command guide',
            };
        }

        if (command === '/fit' && !argument) {
            return {
                text: 'ROLE_MATCH_READY\nPaste a role or its key requirements after /fit.\nExample: /fit junior full-stack role using React, Node and SQL',
                decision: 'Requested role context before analysis',
            };
        }

        if (command === '/cv') {
            return {
                text: 'CV_ROUTE: Opening Alberto\'s current CV in a new tab.',
                action: 'OPEN_CV',
                decision: 'Opened the current CV',
            };
        }

        if (command === '/projects') {
            return {
                text: 'SYSTEMS_ROUTE: Opening selected projects, architecture notes and demos.',
                action: 'SCROLL_TO_PROJECTS',
                decision: 'Navigated to selected projects',
            };
        }

        if (command === '/contact') {
            return {
                text: `CONTACT_ROUTE: ${portfolioData.ui.contact.email}`,
                action: 'SCROLL_TO_CONTACT',
                decision: 'Navigated to direct contact',
            };
        }

        if (command === '/github') {
            return {
                text: 'GITHUB_ROUTE: Opening public repositories and activity.',
                action: 'OPEN_LINK',
                url: githubHref,
                decision: 'Opened the public GitHub profile',
            };
        }

        if (command === '/stack') {
            return {
                text: 'STACK_ROUTE: Opening the technical stack grouped by capability.',
                action: 'SCROLL_TO_STACK',
                decision: 'Navigated to the technical stack',
            };
        }

        if (command === '/about') {
            return {
                text: 'ABOUT_ROUTE: Opening Alberto\'s background and verified client feedback.',
                action: 'SCROLL_TO_ABOUT',
                decision: 'Navigated to background and evidence',
            };
        }

        if (command === '/status') {
            return {
                text: 'STATUS: PORTFOLIO_CONTEXT_READY\nLOCAL_ROUTES: ONLINE\nLIVE_AGENT: CHECKED_ON_QUERY\nRun /help to see available actions.',
                decision: 'Displayed terminal status',
            };
        }

        return null;
    };

    const recordLocalCommand = ({ cmd, result, startedAt, startedAtMs }) => {
        recordOpsRun({
            channel: 'terminal',
            title: 'Terminal Local Command',
            status: 'success',
            startedAt,
            completedAt: new Date().toISOString(),
            latencyMs: Date.now() - startedAtMs,
            input: cmd,
            output: result.text,
            decision: result.decision || result.action || 'Resolved locally',
            approval: result.action === 'OPEN_LINK' || result.action === 'OPEN_CV'
                ? 'User-triggered handoff'
                : 'Autonomous UI-safe response',
            tools: ['Local Command Router', 'Portfolio Context'],
            steps: [
                { key: 'ingress', label: 'COMMAND ENTERS', detail: 'Command received by the local terminal router.', state: 'complete', at: startedAt },
                { key: 'action', label: 'ACTION RESOLUTION', detail: result.decision || 'Local response prepared.', state: 'complete', at: new Date().toISOString() },
                { key: 'response', label: 'RESPONSE', detail: 'Result committed to the current terminal session.', state: 'complete', at: new Date().toISOString() },
            ],
        });
    };

    const recordFallback = ({ cmd, fallback, startedAt, startedAtMs, status, trace = null }) => {
        recordOpsRun({
            channel: 'terminal',
            title: 'Terminal Agent Fallback',
            status: 'error',
            startedAt,
            completedAt: new Date().toISOString(),
            latencyMs: Date.now() - startedAtMs,
            input: cmd,
            output: fallback.text,
            decision: `${status}; resolved with grounded local fallback`,
            approval: fallback.action === 'OPEN_LINK' || fallback.action === 'OPEN_CV'
                ? 'User-triggered fallback handoff'
                : 'UI-safe local fallback',
            tools: ['Terminal API', 'Local Evidence Fallback'],
            trace,
            steps: [
                { key: 'ingress', label: 'REQUEST ENTERS', detail: 'Terminal request dispatched from the client.', state: 'complete', at: startedAt },
                { key: 'inference', label: 'LIVE AGENT', detail: status, state: 'error', at: new Date().toISOString() },
                { key: 'response', label: 'LOCAL FALLBACK', detail: 'Portfolio evidence and deterministic routes remained available.', state: 'complete', at: new Date().toISOString() },
            ],
        });
    };

    const executeCommand = async (rawCommand) => {
        const cmd = rawCommand.trim();
        if (!cmd || isLoading) return;

        const normalizedCommand = cmd.toLowerCase();
        if (normalizedCommand === '/clear' || normalizedCommand === 'clear') {
            setHistory([]);
            setInput('');
            return;
        }
        if (normalizedCommand === '/exit' || normalizedCommand === 'exit') {
            setInput('');
            onClose();
            return;
        }

        const startedAt = new Date().toISOString();
        const startedAtMs = Date.now();
        const localResult = resolveLocalCommand(cmd);

        setInput('');
        setHistory(previous => [...previous, { type: 'input', content: cmd }]);
        isAutoScrollRef.current = true;

        if (localResult) {
            setHistory(previous => [...previous, { type: 'output', content: localResult.text }]);
            executeUiAction(localResult.action, localResult.url);
            recordLocalCommand({ cmd, result: localResult, startedAt, startedAtMs });
            return;
        }

        setIsLoading(true);
        const fitArgument = normalizedCommand.startsWith('/fit ')
            ? cmd.slice(cmd.indexOf(' ') + 1).trim()
            : null;
        const requestMessage = fitArgument
            ? `Recruiter fit analysis requested. Role or requirements: ${fitArgument}`
            : cmd;

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: requestMessage,
                    history: history.slice(-5),
                }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                let errorTrace = null;
                try {
                    errorTrace = JSON.parse(errorText).debugTrace || null;
                } catch { /* The fallback does not depend on the server error body. */ }

                console.error('Terminal API Error:', errorText);
                const fallback = buildFallbackResponse(cmd);
                setHistory(previous => [...previous, { type: 'output', content: fallback.text }]);
                executeUiAction(fallback.action, fallback.url, 250);
                recordFallback({
                    cmd,
                    fallback,
                    startedAt,
                    startedAtMs,
                    status: `HTTP ${res.status} from the live agent`,
                    trace: errorTrace,
                });
                return;
            }

            const data = await res.json();
            setHistory(previous => [...previous, { type: 'output', content: data.text }]);
            executeUiAction(data.action, data.url, 350);

            recordOpsRun({
                channel: 'terminal',
                title: 'Terminal Agent Request',
                status: 'success',
                startedAt,
                completedAt: new Date().toISOString(),
                latencyMs: Date.now() - startedAtMs,
                input: cmd,
                output: data.text,
                decision: data.action ? `Resolved ${data.action}` : 'Returned message response',
                approval: data.action === 'OPEN_LINK' || data.action === 'OPEN_CV'
                    ? 'User-triggered handoff approved'
                    : 'Autonomous UI-safe response',
                tools: ['Terminal API', 'Groq LLM', 'GitHub Context'],
                trace: data.debugTrace || null,
                steps: [
                    { key: 'ingress', label: 'REQUEST ENTERS', detail: 'Terminal request dispatched from the client.', state: 'complete', at: startedAt },
                    { key: 'validation', label: 'VALIDATION', detail: 'Payload accepted and sanitized by the backend.', state: 'complete', at: startedAt },
                    { key: 'context', label: 'CONTEXT HYDRATION', detail: 'Portfolio and GitHub context attached to the request.', state: 'complete', at: new Date().toISOString() },
                    { key: 'inference', label: 'AGENT REASONING', detail: 'Groq generated a grounded response and optional next action.', state: 'complete', at: new Date().toISOString() },
                    { key: 'action', label: 'ACTION RESOLUTION', detail: data.action ? `Frontend resolved ${data.action}.` : 'No UI action was required.', state: 'complete', at: new Date().toISOString() },
                    { key: 'response', label: 'RESPONSE', detail: 'The terminal response was committed to the session log.', state: 'complete', at: new Date().toISOString() },
                ],
            });
        } catch (error) {
            console.error('Terminal connection error:', error);
            const fallback = buildFallbackResponse(cmd);
            setHistory(previous => [...previous, { type: 'output', content: fallback.text }]);
            executeUiAction(fallback.action, fallback.url, 250);
            recordFallback({
                cmd,
                fallback,
                startedAt,
                startedAtMs,
                status: 'Network or server disconnect',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        executeCommand(input);
    };

    const handleQuickAction = (quickAction) => {
        if (quickAction.submit) {
            executeCommand(quickAction.command);
            return;
        }

        setInput(quickAction.command);
        window.requestAnimationFrame(() => inputRef.current?.focus());
    };

    const handleWheel = (e) => {
        const container = scrollRef.current;
        if (!container) return;

        const deltaY = e.deltaY;
        const { scrollTop, scrollHeight, clientHeight } = container;
        
        const isAtTop = scrollTop <= 0;
        const isAtBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight - 1;

        if (deltaY < 0 && isAtTop) {
            return; // Scroll page up smoothly
        }

        if (deltaY > 0 && isAtBottom) {
            return; // Scroll page down smoothly
        }

        if (scrollHeight <= clientHeight) {
            return; // No scroll needed inside terminal
        }

        // Prevent Lenis from intercepting while we scroll internal content natively
        e.stopPropagation();
    };

    return (
        <div
            className="h-full overflow-y-auto custom-terminal-scroll pr-5 pb-4"
            ref={scrollRef}
            onScroll={handleScroll}
            onWheel={handleWheel}
            onClick={() => inputRef.current?.focus()}
        >
            <div className="flex flex-col gap-2 text-gray-300 text-xs md:text-sm font-mono leading-relaxed">
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
                        <span>CHECKING_PROJECT_EVIDENCE...</span>
                    </div>
                )}

                {history.length === 0 && !isLoading && (
                    <div className="my-1 flex flex-wrap gap-2" aria-label="Suggested terminal actions">
                        {QUICK_ACTIONS.map(quickAction => (
                            <button
                                key={quickAction.label}
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleQuickAction(quickAction);
                                }}
                                className="rounded-md border border-white/10 bg-white/[0.025] px-2.5 py-1.5 text-[9px] font-semibold tracking-[0.12em] text-gray-400 transition-colors hover:border-electric-cyan/40 hover:text-electric-cyan focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-electric-cyan"
                            >
                                {quickAction.label}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-2 text-white leading-relaxed w-full overflow-hidden min-w-0">
                    <span className="text-electric-cyan font-bold shrink-0 whitespace-nowrap">visitor@sys:~$</span>
                    <input
                        ref={inputRef}
                        type="text"
                        aria-label="Terminal command"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        className="flex-1 bg-transparent border-none outline-none text-white font-mono p-0 m-0 min-w-0 w-full text-xs md:text-sm"
                        autoComplete="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        placeholder={INPUT_PLACEHOLDERS[placeholderIndex]}
                        style={{ minWidth: '0px' }}
                    />
                </div>
            </div>
        </div>
    );
};

const TypewriterEffect = ({ text, speed = 8, onComplete = null }) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const [displayedText, setDisplayedText] = useState(isMobile ? text : "");
    const [index, setIndex] = useState(0);
    const chunkSize = Math.max(1, Math.ceil(text.length / 140));
    const onCompleteRef = useRef(onComplete);
    const hasCompletedRef = useRef(false);

    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        hasCompletedRef.current = false;
        setDisplayedText(isMobile ? text : '');
        setIndex(isMobile ? text.length : 0);
    }, [isMobile, text]);

    useEffect(() => {
        if (!isMobile && index < text.length) return;
        if (hasCompletedRef.current) return;

        hasCompletedRef.current = true;
        onCompleteRef.current?.();
    }, [index, isMobile, text.length]);

    useEffect(() => {
        if (isMobile || index >= text.length) return undefined;

        const timeout = window.setTimeout(() => {
            const nextIndex = Math.min(text.length, index + chunkSize);
            setDisplayedText(text.slice(0, nextIndex));
            setIndex(nextIndex);
        }, speed);

        return () => window.clearTimeout(timeout);
    }, [chunkSize, index, isMobile, speed, text]);

    return <span>{displayedText}</span>;
};

export const AnimatedPipeline = ({ isFrozen = false, children = null }) => {
    const { terminal } = portfolioData.ui;
    const lines = terminal.initialLines;
    const [visibleLineCount, setVisibleLineCount] = useState(isFrozen ? lines.length : 0);
    const [completedLineCount, setCompletedLineCount] = useState(isFrozen ? lines.length : 0);
    const [isSuggestionComplete, setIsSuggestionComplete] = useState(isFrozen);
    const [sequencePhase, setSequencePhase] = useState(isFrozen ? 'complete' : 'lines');
    const isSuggestionVisible = sequencePhase !== 'lines';
    const isFooterVisible = sequencePhase === 'complete';
    const suggestionIndex = useRotatingIndex(PIPELINE_SUGGESTIONS.length, {
        paused: isFrozen || !isSuggestionVisible,
        delay: 4600,
    });

    useEffect(() => {
        if (isFrozen) {
            setVisibleLineCount(lines.length);
            setCompletedLineCount(lines.length);
            setIsSuggestionComplete(true);
            setSequencePhase('complete');
            return undefined;
        }

        if (sequencePhase === 'lines' && visibleLineCount === 0) {
            const timeout = window.setTimeout(() => {
                setVisibleLineCount(1);
            }, IDLE_FIRST_LINE_DELAY_MS);

            return () => window.clearTimeout(timeout);
        }

        if (sequencePhase === 'lines') {
            if (completedLineCount < visibleLineCount) return undefined;

            const timeout = window.setTimeout(() => {
                if (visibleLineCount < lines.length) {
                    setVisibleLineCount(current => Math.min(lines.length, current + 1));
                } else {
                    setSequencePhase('suggestion');
                }
            }, IDLE_LINE_HOLD_MS);

            return () => window.clearTimeout(timeout);
        }

        if (sequencePhase === 'suggestion') {
            if (!isSuggestionComplete) return undefined;

            const timeout = window.setTimeout(() => {
                setSequencePhase('complete');
            }, IDLE_LINE_HOLD_MS);

            return () => window.clearTimeout(timeout);
        }

        return undefined;
    }, [completedLineCount, isFrozen, isSuggestionComplete, lines.length, sequencePhase, visibleLineCount]);

    useEffect(() => {
        if (isFrozen || !isFooterVisible) return undefined;

        const timeout = window.setTimeout(() => {
            setSequencePhase('lines');
            setVisibleLineCount(0);
            setCompletedLineCount(0);
            setIsSuggestionComplete(false);
        }, IDLE_SEQUENCE_HOLD_MS);

        return () => window.clearTimeout(timeout);
    }, [isFooterVisible, isFrozen]);

    return (
        <div
            className="flex flex-col"
            data-idle-phase={sequencePhase}
            data-idle-line-count={visibleLineCount}
        >
            <AnimatePresence initial={false}>
                {lines.slice(0, visibleLineCount).map((line, i) => (
                    <motion.div
                        key={`${line.text}-${i}`}
                        initial={{ opacity: 0, y: 7, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto', marginBottom: 4 }}
                        exit={{
                            opacity: 0,
                            y: -6,
                            height: 0,
                            marginBottom: 0,
                            transition: {
                                duration: 0.3,
                                delay: (lines.length - i - 1) * 0.035,
                                ease: [0.4, 0, 0.6, 1],
                            },
                        }}
                        transition={{
                            opacity: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
                            y: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
                            height: { duration: 0.44, ease: [0.22, 1, 0.36, 1] },
                            marginBottom: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
                        }}
                        className={line.color === 'electric-green' ? 'text-electric-green' :
                            line.color === 'electric-cyan' ? 'text-electric-cyan' :
                                line.color === 'gray' ? 'text-gray-500' : 'text-white'}
                        style={{ overflow: 'hidden' }}
                    >
                        <div className="relative min-w-0">
                            <span aria-hidden="true" className="invisible block">
                                {line.text}
                            </span>
                            <span className="absolute inset-0 block">
                                {i === visibleLineCount - 1 ? (
                                    <TypewriterEffect
                                        text={line.text}
                                        speed={12}
                                        onComplete={() => setCompletedLineCount(current => Math.max(current, i + 1))}
                                    />
                                ) : (
                                    line.text
                                )}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            <AnimatePresence initial={false}>
                {isSuggestionVisible && (
                    <motion.div
                        key="idle-suggestion-row"
                        initial={{ opacity: 0, y: 11, height: 0, marginTop: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto', marginTop: 4, marginBottom: 4 }}
                        exit={{ opacity: 0, y: -7, height: 0, marginTop: 0, marginBottom: 0 }}
                        transition={{
                            ...SOFT_FLOAT_TRANSITION,
                            height: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                            marginTop: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
                            marginBottom: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
                        }}
                        className="relative min-w-0"
                        style={{ overflow: 'hidden' }}
                    >
                        <span aria-hidden="true" className="invisible block">
                            {`>>> ${PIPELINE_SUGGESTION_RESERVE}`}
                        </span>
                        <AnimatePresence mode="sync" initial={false}>
                            <motion.div
                                key={suggestionIndex}
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 6 }}
                                transition={{ duration: 0.24 }}
                                className="absolute inset-0 text-electric-cyan"
                            >
                                <TypewriterEffect
                                    text={`>>> ${PIPELINE_SUGGESTIONS[suggestionIndex]}`}
                                    speed={10}
                                    onComplete={() => setIsSuggestionComplete(true)}
                                />
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            {isFrozen ? (
                <span className="w-2 h-4 bg-electric-green/50 inline-block ml-1 align-middle mt-2 mb-1" />
            ) : (
                <motion.span
                    animate={{ opacity: [0, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-2 h-4 bg-electric-green inline-block ml-1 align-middle mt-2 mb-1"
                />
            )}

            <span aria-hidden="true" className="h-4 shrink-0" />

            <AnimatePresence initial={false}>
                {isFooterVisible ? children : null}
            </AnimatePresence>
        </div>
    );
}

export default TerminalWindow;
