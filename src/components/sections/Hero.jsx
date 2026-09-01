import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowRight, Cpu, Download, MessageSquare, Terminal } from 'lucide-react';

import TerminalWindow from '../common/TerminalWindow';
import { dispatchSectionNavigation, isPlainLeftClick } from '../../utils/sectionRouting';
import portfolioData from '../../data/portfolio';
import HeroProjectWall from './HeroProjectWall';
import './Hero.css';

const reveal = {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
};

const Hero = ({ isUiFrozen = false }) => {
    const { hero } = portfolioData.ui;
    const [isTerminalExpanded, setIsTerminalExpanded] = React.useState(false);
    const isCvAvailable = Boolean(hero.buttons.cvHref);

    const handleSectionLink = (event, sectionId) => {
        if (!isPlainLeftClick(event)) return;
        event.preventDefault();
        dispatchSectionNavigation(sectionId);
    };

    return (
        <section id="home" className="hero-reel-section">
            <HeroProjectWall isFrozen={isUiFrozen || isTerminalExpanded} />

            <div className="hero-reel-section__glow" aria-hidden="true" />
            <div className="hero-reel-section__noise" aria-hidden="true" />

            <div className="hero-reel-container">
                <div className="hero-reel-layout">
                    <div className="hero-copy-shell">
                        <motion.div
                            {...reveal}
                            transition={{ delay: 0.08, duration: 0.5 }}
                            className="hero-eyebrow"
                        >
                            <Cpu className="h-3 w-3" />
                            <span>{hero.priorityLabel}</span>
                        </motion.div>

                        <motion.div
                            {...reveal}
                            transition={{ delay: 0.16, duration: 0.55 }}
                            className="hero-title-block"
                        >
                            <h1 className="hero-title">
                                {hero.title.white}
                                <span>{hero.title.green}</span>
                            </h1>
                            <div className="hero-handle">
                                <span>@</span>{hero.handle.replace('@', '')}
                            </div>
                            <p className="hero-description">{hero.description}</p>
                        </motion.div>

                        <motion.div
                            {...reveal}
                            transition={{ delay: 0.25, duration: 0.55 }}
                            className="hero-actions"
                        >
                            <div className="hero-actions__primary">
                                <a
                                    href="/projects"
                                    onClick={(event) => handleSectionLink(event, 'projects')}
                                    className="hero-primary-button"
                                >
                                    <span>VIEW_SELECTED_WORK</span>
                                    <ArrowRight className="h-4 w-4" />
                                </a>
                                <a
                                    href="/contact"
                                    onClick={(event) => handleSectionLink(event, 'contact')}
                                    className="hero-secondary-button"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    START_A_CONVERSATION
                                </a>
                            </div>

                            <div className="hero-actions__utility">
                                <button
                                    type="button"
                                    onClick={() => window.dispatchEvent(new CustomEvent('toggle-terminal'))}
                                >
                                    <Terminal className="h-4 w-4" />
                                    {hero.buttons.terminal}
                                </button>

                                {isCvAvailable ? (
                                    <a
                                        href={hero.buttons.cvHref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="CV for recruitment and administrative review"
                                    >
                                        <Download className="h-4 w-4" />
                                        {hero.buttons.cv}
                                        <span>Recruitment document</span>
                                    </a>
                                ) : (
                                    <span className="hero-cv-pending">
                                        <Download className="h-4 w-4" />
                                        {hero.buttons.cvPending}
                                    </span>
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            {...reveal}
                            transition={{ delay: 0.34, duration: 0.55 }}
                            className="hero-metadata"
                        >
                            {hero.metadata.map((item) => (
                                <div key={item.label}>
                                    <span>{item.label}</span>
                                    <strong>{item.value}</strong>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    <motion.aside
                        initial={{ opacity: 0, x: 34 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.42, duration: 0.65 }}
                        className={`hero-terminal-dock ${isTerminalExpanded ? 'hero-terminal-dock--expanded' : ''}`}
                        aria-label="Interactive portfolio console"
                    >
                        <TerminalWindow onStateChange={setIsTerminalExpanded} isUiFrozen={isUiFrozen} />
                    </motion.aside>
                </div>
            </div>

            <a
                href="/about"
                onClick={(event) => handleSectionLink(event, 'about')}
                className="hero-scroll-cue"
                aria-label="Continue to the about section"
            >
                <span>SCROLL_TO_DISCOVER</span>
                <ArrowDownRight className="h-4 w-4" />
            </a>
        </section>
    );
};

export default Hero;
