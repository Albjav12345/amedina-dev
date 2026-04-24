import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Menu, X } from 'lucide-react';
import portfolioData from '../../data/portfolio';
import {
    DEFAULT_SECTION_ID,
    SECTION_ACTIVE_LOCK_EVENT,
    SECTION_VISIBLE_EVENT,
    dispatchSectionNavigation,
    getPathnameForSection,
    getSectionIdFromPathname,
    getSectionScrollY,
    isPlainLeftClick,
} from '../../utils/sectionRouting';
import { subscribeScrollRuntime } from '../../utils/scrollRuntime';

const Navbar = ({ isUiObscured = false }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState(() => {
        if (typeof window === 'undefined') {
            return DEFAULT_SECTION_ID;
        }

        return getSectionIdFromPathname(window.location.pathname) || DEFAULT_SECTION_ID;
    });
    const scrollLockRef = useRef({ active: false, targetId: null, targetY: 0, expiresAt: 0 });
    const activeLockRef = useRef({ active: false, targetId: DEFAULT_SECTION_ID });
    const isScrolledRef = useRef(false);
    const activeSectionRef = useRef(
        typeof window === 'undefined'
            ? DEFAULT_SECTION_ID
            : (getSectionIdFromPathname(window.location.pathname) || DEFAULT_SECTION_ID),
    );
    const mobileScrollAnimationRef = useRef({ rafId: null, timeoutId: null, token: 0 });
    const { navigation } = portfolioData.ui;
    const navLinks = navigation.links;

    useEffect(() => {
        const updateNavigationState = () => {
            const nextIsScrolled = window.scrollY > 20;
            if (isScrolledRef.current !== nextIsScrolled) {
                isScrolledRef.current = nextIsScrolled;
                setIsScrolled(nextIsScrolled);
            }

            const activeLock = activeLockRef.current;
            if (activeLock.active) {
                return;
            }

            const lock = scrollLockRef.current;
            if (lock.active) {
                const hasReachedTarget = Math.abs(window.scrollY - lock.targetY) <= 28;
                const lockExpired = Date.now() >= lock.expiresAt;

                if (!hasReachedTarget && !lockExpired) {
                    return;
                }

                scrollLockRef.current = { active: false, targetId: null, targetY: 0, expiresAt: 0 };
            }
        };

        return subscribeScrollRuntime(updateNavigationState);
    }, []);

    useEffect(() => {
        const handleActiveLock = (event) => {
            const { sectionId, locked } = event.detail || {};

            activeLockRef.current = {
                active: Boolean(locked),
                targetId: sectionId || DEFAULT_SECTION_ID,
            };

            if (locked && activeSectionRef.current !== (sectionId || DEFAULT_SECTION_ID)) {
                activeSectionRef.current = sectionId || DEFAULT_SECTION_ID;
                setActiveSection(sectionId || DEFAULT_SECTION_ID);
            }
        };

        window.addEventListener(SECTION_ACTIVE_LOCK_EVENT, handleActiveLock);

        return () => {
            window.removeEventListener(SECTION_ACTIVE_LOCK_EVENT, handleActiveLock);
        };
    }, []);

    useEffect(() => {
        const handleVisibleSection = (event) => {
            const sectionId = event.detail?.sectionId || DEFAULT_SECTION_ID;

            if (activeSectionRef.current === sectionId) {
                return;
            }

            activeSectionRef.current = sectionId;
            setActiveSection(sectionId);
        };

        window.addEventListener(SECTION_VISIBLE_EVENT, handleVisibleSection);

        return () => {
            window.removeEventListener(SECTION_VISIBLE_EVENT, handleVisibleSection);
        };
    }, []);

    useEffect(() => {
        return () => {
            if (mobileScrollAnimationRef.current.rafId !== null) {
                window.cancelAnimationFrame(mobileScrollAnimationRef.current.rafId);
            }
            if (mobileScrollAnimationRef.current.timeoutId !== null) {
                window.clearTimeout(mobileScrollAnimationRef.current.timeoutId);
            }
        };
    }, []);

    const lockSection = (sectionId) => {
        const targetY = getSectionScrollY(sectionId);

        scrollLockRef.current = {
            active: true,
            targetId: sectionId,
            targetY: targetY ?? window.scrollY,
            expiresAt: Date.now() + 1800,
        };

        activeSectionRef.current = sectionId;
        setActiveSection(sectionId);
        setIsMobileMenuOpen(false);

        return true;
    };

    const releaseNavigationLocks = () => {
        window.dispatchEvent(new CustomEvent('close-control-panel'));
        window.dispatchEvent(new CustomEvent('close-project-modal'));
        document.body.style.overflow = '';
        document.body.style.overscrollBehaviorY = '';
        document.documentElement.style.overscrollBehaviorY = '';
    };

    const animateMobileScrollToSection = (sectionId, attempt = 0, token = Date.now()) => {
        const maxAttempts = 18;
        const targetY = getSectionScrollY(sectionId);

        mobileScrollAnimationRef.current.token = token;

        if (targetY === null) {
            if (attempt >= maxAttempts) {
                return;
            }

            mobileScrollAnimationRef.current.timeoutId = window.setTimeout(() => {
                animateMobileScrollToSection(sectionId, attempt + 1, token);
            }, 90);
            return;
        }

        const startY = window.scrollY;
        const distance = targetY - startY;

        if (Math.abs(distance) <= 2) {
            window.scrollTo(0, targetY);
            return;
        }

        const html = document.documentElement;
        const body = document.body;
        const previousHtmlBehavior = html.style.scrollBehavior;
        const previousBodyBehavior = body.style.scrollBehavior;
        html.style.scrollBehavior = 'auto';
        body.style.scrollBehavior = 'auto';

        const duration = Math.min(900, Math.max(420, Math.abs(distance) * 0.55));
        const startedAt = performance.now();

        const step = (now) => {
            if (mobileScrollAnimationRef.current.token !== token) {
                html.style.scrollBehavior = previousHtmlBehavior;
                body.style.scrollBehavior = previousBodyBehavior;
                return;
            }

            const elapsed = Math.min(1, (now - startedAt) / duration);
            const eased = 1 - Math.pow(1 - elapsed, 3);
            const nextY = Math.round(startY + distance * eased);

            window.scrollTo(0, nextY);

            if (elapsed < 1) {
                mobileScrollAnimationRef.current.rafId = window.requestAnimationFrame(step);
                return;
            }

            window.scrollTo(0, targetY);
            html.style.scrollBehavior = previousHtmlBehavior;
            body.style.scrollBehavior = previousBodyBehavior;
            mobileScrollAnimationRef.current.rafId = null;
            mobileScrollAnimationRef.current.timeoutId = null;
        };

        mobileScrollAnimationRef.current.rafId = window.requestAnimationFrame(step);
    };

    const handleSectionNavigation = (event, sectionId, { forceSpaNavigation = false, behavior = 'smooth' } = {}) => {
        if (!forceSpaNavigation && !isPlainLeftClick(event)) {
            return;
        }

        event.preventDefault();

        if (!lockSection(sectionId)) {
            return;
        }

        releaseNavigationLocks();

        dispatchSectionNavigation(sectionId, {
            historyMode: 'push',
            behavior,
            skipScroll: forceSpaNavigation,
        });

        if (forceSpaNavigation) {
            animateMobileScrollToSection(sectionId);
        }
    };

    const handleTerminalAccess = () => {
        if (!lockSection(DEFAULT_SECTION_ID)) {
            return;
        }

        releaseNavigationLocks();
        window.dispatchEvent(new CustomEvent('toggle-terminal'));
        dispatchSectionNavigation(DEFAULT_SECTION_ID, {
            historyMode: 'push',
            behavior: 'smooth',
        });
    };

    const getNavClasses = () => {
        if (isMobileMenuOpen) {
            return 'bg-dark-void/95 backdrop-blur-xl border-b border-white/10 py-3';
        }

        if (isScrolled) {
            return 'bg-dark-void/80 backdrop-blur-lg border-b border-white/10 py-3';
        }

        return 'bg-transparent py-6';
    };

    const resolvedNavbarZIndex = isUiObscured ? 80 : 'var(--project-navbar-layer, 1000)';

    return (
        <nav
            className={`fixed top-0 w-full z-[1000] isolate transition-[background-color,border-color,padding-top,padding-bottom,backdrop-filter] duration-300 ${getNavClasses()}`}
            style={{
                paddingRight: 'var(--viewport-scrollbar-compensation, 0px)',
                zIndex: resolvedNavbarZIndex,
            }}
        >
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                <motion.a
                    href={getPathnameForSection(DEFAULT_SECTION_ID)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={(event) => handleSectionNavigation(event, DEFAULT_SECTION_ID)}
                    className="flex items-center gap-2 group cursor-pointer"
                >
                    <div className="w-10 h-10 rounded-lg bg-electric-green/10 border border-electric-green/30 flex items-center justify-center group-hover:bg-electric-green/20">
                        <Terminal className="w-5 h-5 text-electric-green" />
                    </div>
                    <span className="font-mono font-bold text-xl tracking-tighter min-w-[200px]">
                        {navigation.brand.first}
                        <span className="text-electric-green">{navigation.brand.last}</span>
                    </span>
                </motion.a>

                <div className="hidden lg:flex items-center gap-4 lg:gap-8">
                    {navLinks.map((link, index) => (
                        <motion.a
                            key={link.id}
                            href={link.href}
                            onClick={(event) => handleSectionNavigation(event, link.id)}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative px-4 py-2 group flex flex-col items-center justify-center cursor-pointer"
                        >
                            {activeSection === link.id && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute inset-0 bg-white/5 border border-white/10 rounded-lg z-0"
                                    transition={{ type: 'spring', bounce: 0.25, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10 font-mono text-[9px] text-electric-green opacity-70 mb-0.5">
                                {link.num}
                            </span>
                            <span className={`relative z-10 text-sm font-medium transition-colors duration-300 ${activeSection === link.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                                {link.name}
                            </span>
                        </motion.a>
                    ))}
                    <motion.button
                        onClick={handleTerminalAccess}
                        className="btn-system text-[10px] py-1.5 px-3 uppercase tracking-widest flex items-center gap-2 ml-4 cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Terminal className="w-3 h-3" />
                        {navigation.terminalButton}
                    </motion.button>
                </div>

                <button
                    className="lg:hidden text-white focus:outline-none"
                    aria-label="Toggle navigation menu"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden overflow-hidden"
                    >
                        <div className="flex flex-col p-6 gap-4">
                            {navLinks.map((link) => (
                                <a
                                    key={link.id}
                                    href={link.href}
                                    onClick={(event) => handleSectionNavigation(event, link.id, {
                                        forceSpaNavigation: true,
                                        behavior: 'smooth',
                                    })}
                                    className="flex items-center gap-4 group cursor-pointer p-2"
                                >
                                    <span className="font-mono text-xs text-electric-green">{link.num}</span>
                                    <span className={`text-lg font-medium ${activeSection === link.id ? 'text-white' : 'text-gray-400'}`}>
                                        {link.name}
                                    </span>
                                </a>
                            ))}
                            <motion.button
                                onClick={handleTerminalAccess}
                                className="btn-system text-[10px] py-3 px-3 uppercase tracking-widest flex items-center justify-center gap-2 mt-4 cursor-pointer w-full"
                            >
                                <Terminal className="w-4 h-4" />
                                {navigation.terminalButton}
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
