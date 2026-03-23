import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Menu, X } from 'lucide-react';
import portfolioData from '../../data/portfolio';

const NAV_HEIGHT = 50;
const SECTION_TARGETS = {
    home: 'home',
    about: 'about-wrapper',
    projects: 'projects-wrapper',
    'tech-stack': 'tech-stack-wrapper',
    architect: 'architect-wrapper',
    contact: 'contact-wrapper',
};

function getSectionElement(sectionId) {
    return document.getElementById(SECTION_TARGETS[sectionId] || sectionId) || document.getElementById(sectionId);
}

function getActiveSectionId(sectionIds) {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const anchorY = scrollY + NAV_HEIGHT + Math.min(viewportHeight * 0.32, 260);

    if (scrollY <= 24) {
        return 'home';
    }

    if (scrollY + viewportHeight >= documentHeight - 24) {
        return 'contact';
    }

    const positionedSections = sectionIds.map((sectionId) => {
        const element = getSectionElement(sectionId);
        if (!element) return null;

        return {
            id: sectionId,
            top: element.getBoundingClientRect().top + scrollY,
        };
    }).filter(Boolean);

    if (!positionedSections.length) {
        return 'home';
    }

    let activeId = positionedSections[0].id;

    positionedSections.forEach((section) => {
        if (section.top <= anchorY) {
            activeId = section.id;
        }
    });

    return activeId;
}

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const scrollLockRef = useRef({ active: false, targetId: null, targetY: 0, expiresAt: 0 });
    const { navigation } = portfolioData.ui;
    const navLinks = navigation.links;

    useEffect(() => {
        const sectionIds = navLinks.map((link) => link.id);
        let rafId = null;

        const updateNavigationState = () => {
            rafId = null;
            setIsScrolled(window.scrollY > 20);

            const lock = scrollLockRef.current;
            if (lock.active) {
                const hasReachedTarget = Math.abs(window.scrollY - lock.targetY) <= 28;
                const lockExpired = Date.now() >= lock.expiresAt;

                if (!hasReachedTarget && !lockExpired) {
                    setActiveSection(lock.targetId);
                    return;
                }

                scrollLockRef.current = { active: false, targetId: null, targetY: 0, expiresAt: 0 };
            }

            setActiveSection(getActiveSectionId(sectionIds));
        };

        const queueNavigationStateUpdate = () => {
            if (rafId !== null) return;
            rafId = window.requestAnimationFrame(updateNavigationState);
        };

        queueNavigationStateUpdate();

        window.addEventListener('scroll', queueNavigationStateUpdate, { passive: true });
        window.addEventListener('resize', queueNavigationStateUpdate);

        return () => {
            window.removeEventListener('scroll', queueNavigationStateUpdate);
            window.removeEventListener('resize', queueNavigationStateUpdate);
            if (rafId !== null) {
                window.cancelAnimationFrame(rafId);
            }
        };
    }, [navLinks]);

    const scrollToSection = (event, id) => {
        event.preventDefault();

        const element = document.getElementById(id);
        if (!element) return;

        const targetY = Math.max(0, element.getBoundingClientRect().top + window.pageYOffset - NAV_HEIGHT);
        scrollLockRef.current = {
            active: true,
            targetId: id,
            targetY,
            expiresAt: Date.now() + 1800,
        };
        setActiveSection(id);
        setIsMobileMenuOpen(false);

        if (window.lenis) {
            window.lenis.scrollTo(element, {
                offset: -NAV_HEIGHT,
                duration: 1.5,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            });
            return;
        }

        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - NAV_HEIGHT;

        window.scrollTo({
            top: offsetPosition,
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

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${getNavClasses()}`}>
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={(event) => scrollToSection(event, 'home')}
                    className="flex items-center gap-2 group cursor-pointer"
                >
                    <div className="w-10 h-10 rounded-lg bg-electric-green/10 border border-electric-green/30 flex items-center justify-center group-hover:bg-electric-green/20">
                        <Terminal className="w-5 h-5 text-electric-green" />
                    </div>
                    <span className="font-mono font-bold text-xl tracking-tighter min-w-[200px]">
                        {navigation.brand.first}
                        <span className="text-electric-green">{navigation.brand.last}</span>
                    </span>
                </motion.div>

                <div className="hidden lg:flex items-center gap-4 lg:gap-8">
                    {navLinks.map((link, index) => (
                        <motion.a
                            key={link.id}
                            href={link.href}
                            onClick={(event) => scrollToSection(event, link.id)}
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
                        onClick={(event) => {
                            window.dispatchEvent(new CustomEvent('toggle-terminal'));
                            scrollToSection(event, 'home');
                        }}
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
                                    onClick={(event) => scrollToSection(event, link.id)}
                                    className="flex items-center gap-4 group cursor-pointer p-2"
                                >
                                    <span className="font-mono text-xs text-electric-green">{link.num}</span>
                                    <span className={`text-lg font-medium ${activeSection === link.id ? 'text-white' : 'text-gray-400'}`}>
                                        {link.name}
                                    </span>
                                </a>
                            ))}
                            <motion.button
                                onClick={(event) => {
                                    window.dispatchEvent(new CustomEvent('toggle-terminal'));
                                    scrollToSection(event, 'home');
                                }}
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
