import React, { useEffect, useRef } from 'react';
import { motion, useInView, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { viewportConfig } from '../../utils/animations';
import ProjectReference from '../common/ProjectReference';
import SectionHeading from '../common/SectionHeading';
import './EditorialSections.css';
import './AboutProfile.css';

const MotionProjectReference = motion.create(ProjectReference);

function Counter({ value }) {
    const ref = useRef(null);
    const visible = useInView(ref, { once: true });
    const reducedMotion = useReducedMotion();
    const number = parseInt(value, 10) || 0;
    const suffix = String(value).replace(String(number), '');
    const spring = useSpring(0, { stiffness: 50, damping: 20 });
    const text = useTransform(spring, latest => `${Math.round(latest)}${suffix}`);
    useEffect(() => { if (visible) spring.set(number); }, [visible, number, spring]);
    return <motion.span ref={ref} className="tabular-nums">{reducedMotion ? value : text}</motion.span>;
}

export default function AboutProfile({ header, profile, projects }) {
    const { about } = profile;
    const gridRef = useRef(null);
    const reducedMotion = useReducedMotion();
    const featuredProject = projects.find(project => project.id === about.featuredProjectId);
    const stats = about.stats.filter(stat => ['projects', 'global'].includes(stat.id));
    useEffect(() => {
        const grid = gridRef.current;
        const cards = Array.from(grid.children);
        const updateLight = () => {
            const originX = grid.clientWidth * .92;
            cards.forEach(card => {
                card.style.setProperty('--card-light-x', `${originX - card.offsetLeft}px`);
                card.style.setProperty('--card-light-y', `${-40 - card.offsetTop}px`);
                card.style.setProperty('--card-light-width', `${grid.clientWidth * 1.25}px`);
                card.style.setProperty('--card-light-height', `${Math.min(grid.clientHeight * 1.4, 800)}px`);
            });
        };
        // A shared light origin, measured only when the layout changes.
        const observer = new ResizeObserver(updateLight);
        observer.observe(grid);
        cards.forEach(card => observer.observe(card));
        updateLight();
        return () => observer.disconnect();
    }, []);
    useEffect(() => {
        if (reducedMotion) return undefined;
        const grid = gridRef.current;
        const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
        let activeCard;
        let frame = 0;
        let pointer;
        const reset = () => {
            window.cancelAnimationFrame(frame);
            frame = 0;
            if (!activeCard) return;
            // Keep the light's last coordinates while its opacity fades out.
            // Clearing them here snaps the still-visible glow to the CSS fallback.
            activeCard.style.removeProperty('--portrait-tilt-x');
            activeCard.style.removeProperty('--portrait-tilt-y');
            activeCard = undefined;
        };
        const update = () => {
            frame = 0;
            const { card, x, y } = pointer;
            if (activeCard !== card) reset();
            activeCard = card;
            const bounds = card.getBoundingClientRect();
            const localX = x - bounds.left;
            const localY = y - bounds.top;
            card.style.setProperty('--pointer-x', `${localX}px`);
            card.style.setProperty('--pointer-y', `${localY}px`);
            if (card.classList.contains('about-editorial__portrait')) {
                const horizontal = Math.max(-1, Math.min(1, localX / bounds.width * 2 - 1));
                const vertical = Math.max(-1, Math.min(1, localY / bounds.height * 2 - 1));
                card.style.setProperty('--portrait-tilt-x', `${-vertical * 2}deg`);
                card.style.setProperty('--portrait-tilt-y', `${horizontal * 3}deg`);
            }
        };
        const move = event => {
            if (!finePointer.matches || event.pointerType !== 'mouse') return;
            const card = event.target.closest('[data-about-surface]');
            if (!card || card.parentElement !== grid) { reset(); return; }
            pointer = { card, x: event.clientX, y: event.clientY };
            if (!frame) frame = window.requestAnimationFrame(update);
        };
        grid.addEventListener('pointermove', move, { passive: true });
        grid.addEventListener('pointerleave', reset);
        finePointer.addEventListener('change', reset);
        window.addEventListener('blur', reset);
        return () => {
            reset();
            grid.removeEventListener('pointermove', move);
            grid.removeEventListener('pointerleave', reset);
            finePointer.removeEventListener('change', reset);
            window.removeEventListener('blur', reset);
        };
    }, [reducedMotion]);
    return (
        <>
            <SectionHeading header={header} />

            <div ref={gridRef} className="about-editorial">
                <motion.figure
                    className="about-editorial__portrait"
                    data-about-surface
                    initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={viewportConfig}
                    transition={{ duration: 0.55 }}
                >
                    <div className="about-editorial__photo">
                        <img src={about.avatarUrl} alt={profile.name} width="960" height="1200" loading="lazy" decoding="async" />
                    </div>
                    <figcaption>
                        <h3>{profile.name}</h3>
                        <p>{profile.role}</p>
                        <a href={profile.social.github} target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight aria-hidden="true" /></a>
                        <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight aria-hidden="true" /></a>
                    </figcaption>
                </motion.figure>

                <motion.div
                    className="about-editorial__story"
                    data-about-surface
                    initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={viewportConfig}
                    transition={{ duration: 0.55, delay: 0.08 }}
                >
                    <h3>{about.title}</h3>
                    <div className="about-editorial__bio">{about.bio.map((paragraph, index) => (
                        <motion.p
                            key={index}
                            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={viewportConfig}
                            transition={{ duration: .45, delay: .12 + index * .07 }}
                        >{paragraph}</motion.p>
                    ))}</div>
                    {featuredProject && (
                        <ProjectReference project={featuredProject} className="about-editorial__project">
                            <span>{about.featuredProjectLabel}:</span>
                            <strong>{featuredProject.title}</strong>
                            <ArrowUpRight aria-hidden="true" />
                        </ProjectReference>
                    )}
                </motion.div>
                <motion.div
                    className="about-editorial__details"
                    data-about-surface
                    initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={viewportConfig}
                    transition={{ duration: 0.55, delay: 0.12 }}
                >
                    <dl className="about-editorial__stats">
                        {stats.map(stat => <div key={stat.id}><dt>{stat.label}</dt><dd><Counter value={stat.value} /></dd></div>)}
                    </dl>
                    {about.philosophy?.quote && (
                        <aside className="about-editorial__perspective">
                            <h4>{about.philosophy.label}</h4>
                            <p>{about.philosophy.quote}</p>
                        </aside>
                    )}
                </motion.div>
                {featuredProject && (
                    <MotionProjectReference
                        project={featuredProject}
                        className="about-editorial__project-card"
                        data-about-surface
                        initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={viewportConfig}
                        transition={{ duration: 0.55, delay: 0.18 }}
                    >
                        <div className="about-editorial__project-cover">
                            <img src={featuredProject.thumbnail} alt="" width="600" height="400" loading="lazy" decoding="async" />
                        </div>
                        <span>
                            <small>{about.featuredProjectLabel}</small>
                            <strong>{featuredProject.title} <ArrowUpRight aria-hidden="true" /></strong>
                        </span>
                    </MotionProjectReference>
                )}
            </div>
        </>
    );
}
