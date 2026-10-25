import React, { useEffect, useRef } from 'react';
import { motion, useInView, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { viewportConfig } from '../../utils/animations';
import ProjectReference from '../common/ProjectReference';
import SectionHeading from '../common/SectionHeading';
import './EditorialSections.css';

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
    return (
        <>
            <SectionHeading header={header} />

            <div ref={gridRef} className="about-editorial">
                <motion.figure
                    className="about-editorial__portrait"
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
                    initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={viewportConfig}
                    transition={{ duration: 0.55, delay: 0.08 }}
                >
                    <h3>{about.title}</h3>
                    <div className="about-editorial__bio">{about.bio.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
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
                        initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={viewportConfig}
                        transition={{ duration: 0.55, delay: 0.18 }}
                    >
                        <img src={featuredProject.thumbnail} alt="" width="600" height="400" loading="lazy" decoding="async" />
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
