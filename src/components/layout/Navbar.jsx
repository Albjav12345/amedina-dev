import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Menu, X } from 'lucide-react';
import portfolioData from '../../data/portfolio';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const isManualScroll = useRef(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        const observerOptions = {
            root: null,
            rootMargin: '-10% 0px -60% 0px',
            threshold: 0
        };

        // Map base ID -> Wrapper ID (for observation)
        const targetMap = {
            'home': 'home',
            'about': 'about-wrapper',
            'projects': 'projects-wrapper',
            'tech-stack': 'tech-stack-wrapper',
            'contact': 'contact-wrapper'
        };

        const handleIntersect = (entries) => {
            if (isManualScroll.current) return;

            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Reverse Lookup: Find base ID from wrapper ID
                    const baseId = Object.keys(targetMap).find(key => targetMap[key] === entry.target.id);
                    if (baseId) setActiveSection(baseId);
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersect, observerOptions);

        // Observe the WRAPPERS instead of the lazy sections
        Object.values(targetMap).forEach(id => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
        };
    }, []);

    const scrollToSection = (e, id) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (!element) return;

        isManualScroll.current = true;
        setActiveSection(id);
        setIsMobileMenuOpen(false);

        const navHeight = 50;

        if (window.lenis) {
            window.lenis.scrollTo(element, {
                offset: -navHeight,
                duration: 1.5,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
        } else {
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }

        // Trigger a fake scroll event to help Lenis/Smoothscroll sync
        window.dispatchEvent(new Event('scroll'));

        // Release observer after scroll animation finishes
        setTimeout(() => {
            isManualScroll.current = false;
        }, 1000);
    };

    const { navigation } = portfolioData.ui;
    const navLinks = navigation.links;

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
                    onClick={(e) => scrollToSection(e, 'home')}
                    className="flex items-center gap-2 group cursor-pointer"
                >
                    <div className="w-10 h-10 rounded-lg bg-electric-green/10 border border-electric-green/30 flex items-center justify-center group-hover:bg-electric-green/20">
                        <Terminal className="w-5 h-5 text-electric-green" />
                    </div>
                    <span className="font-mono font-bold text-xl tracking-tighter min-w-[200px]">
                        {navigation.brand.first}<span className="text-electric-green">{navigation.brand.last}</span>
                    </span>
                </motion.div>

                {/* Desktop Links */}
                <div className="hidden lg:flex items-center gap-4 lg:gap-8">
                    {navLinks.map((link, i) => (
                        <motion.a
                            key={link.id}
                            href={link.href}
                            onClick={(e) => scrollToSection(e, link.id)}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="relative px-4 py-2 group flex flex-col items-center justify-center cursor-pointer"
                        >
                            {activeSection === link.id && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute inset-0 bg-white/5 border border-white/10 rounded-lg z-0"
                                    transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
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
                    {/* Terminal Toggle Button */}
                    {/* Terminal Toggle Button */}
                    <motion.button
                        onClick={(e) => {
                            window.dispatchEvent(new CustomEvent('toggle-terminal'));
                            scrollToSection(e, 'home');
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

                {/* Mobile Toggle */}
                <button
                    className="lg:hidden text-white focus:outline-none"
                    aria-label="Toggle navigation menu"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
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
                                    onClick={(e) => scrollToSection(e, link.id)}
                                    className="flex items-center gap-4 group cursor-pointer p-2"
                                >
                                    <span className="font-mono text-xs text-electric-green">{link.num}</span>
                                    <span className={`text-lg font-medium ${activeSection === link.id ? 'text-white' : 'text-gray-400'}`}>
                                        {link.name}
                                    </span>
                                </a>
                            ))}
                            {/* Mobile Terminal Button */}
                            <motion.button
                                onClick={(e) => {
                                    window.dispatchEvent(new CustomEvent('toggle-terminal'));
                                    scrollToSection(e, 'home');
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
