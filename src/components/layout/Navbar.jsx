import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Menu, X } from 'lucide-react';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        // Intersection Observer for active sections
        const sections = ['home', 'about', 'projects', 'tech-stack', 'contact'];
        const observers = sections.map(id => {
            const element = document.getElementById(id);
            if (!element) return null;

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setActiveSection(id);
                    }
                },
                { threshold: 0.5 }
            );
            observer.observe(element);
            return observer;
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            observers.forEach(obs => obs?.disconnect());
        };
    }, []);

    const navLinks = [
        { name: 'Start', href: '#home', id: 'home', num: '01' },
        { name: 'About', href: '#about', id: 'about', num: '02' },
        { name: 'Systems', href: '#projects', id: 'projects', num: '03' },
        { name: 'Stack', href: '#tech-stack', id: 'tech-stack', num: '04' },
        { name: 'Contact', href: '#contact', id: 'contact', num: '05' },
    ];

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-dark-void/80 backdrop-blur-lg border-b border-white/10 py-3' : 'bg-transparent py-6'
            }`}>
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 group cursor-pointer"
                >
                    <div className="w-10 h-10 rounded-lg bg-electric-green/10 border border-electric-green/30 flex items-center justify-center group-hover:bg-electric-green/20">
                        <Terminal className="w-5 h-5 text-electric-green" />
                    </div>
                    <span className="font-mono font-bold text-xl tracking-tighter">
                        ALBERTO<span className="text-electric-green">.M</span>
                    </span>
                </motion.div>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-4 lg:gap-8">
                    {navLinks.map((link, i) => (
                        <motion.a
                            key={link.id}
                            href={link.href}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="relative px-4 py-2 group flex flex-col items-center justify-center"
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
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="btn-system text-[10px] py-1.5 px-3 uppercase tracking-widest ml-4"
                    >
                        SYS_INIT
                    </motion.button>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-white"
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
                        className="md:hidden bg-dark-high border-b border-white/10 overflow-hidden"
                    >
                        <div className="flex flex-col p-6 gap-4">
                            {navLinks.map((link) => (
                                <a
                                    key={link.id}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-4 group"
                                >
                                    <span className="font-mono text-xs text-electric-green">{link.num}</span>
                                    <span className={`text-lg font-medium ${activeSection === link.id ? 'text-white' : 'text-gray-400'}`}>
                                        {link.name}
                                    </span>
                                </a>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
