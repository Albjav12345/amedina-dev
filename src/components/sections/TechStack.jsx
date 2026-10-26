import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { viewportConfig } from '../../utils/animations';
import portfolioData from '../../data/portfolio.js';
import { renderTechCategoryIcon, renderTechItemIcon } from './techStackIcons';
import SectionHeading from '../common/SectionHeading';
import ProjectReference from '../common/ProjectReference';
import { getSkillProjectEvidence } from '../../utils/skillProjectEvidence';
import './TechStack.css';

// Keep the toolkit still and readable, with no repeating icon timers.
const staticIcons = { tier: 'low', allowAmbientMotion: false };

function ToolkitCategory({ category, index, projects, reducedMotion }) {
    const [selectedSkill, setSelectedSkill] = useState(null);
    const [activeProjectId, setActiveProjectId] = useState(null);
    const evidence = getSkillProjectEvidence(category.items, projects);
    const demonstratedSkills = new Set(evidence.flatMap(reference => reference.skills));
    const matchingProjects = selectedSkill
        ? evidence.filter(reference => reference.skills.includes(selectedSkill))
        : evidence;
    const activeProjectIndex = Math.max(0, matchingProjects.findIndex(reference => reference.project.id === activeProjectId));
    const activeReference = matchingProjects[activeProjectIndex];

    function selectSkill(skill) {
        const nextSkill = selectedSkill === skill ? null : skill;
        const nextProjects = nextSkill ? evidence.filter(reference => reference.skills.includes(nextSkill)) : evidence;
        const currentProjectId = activeReference?.project.id;
        setSelectedSkill(nextSkill);
        // Keep the current project in place when it also demonstrates the next skill.
        setActiveProjectId(nextProjects.some(reference => reference.project.id === currentProjectId)
            ? currentProjectId : nextProjects[0]?.project.id ?? null);
    }

    return (
        <motion.article
            className="toolkit-card"
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportConfig}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            aria-labelledby={`toolkit-${category.id || index}`}
        >
            <header className="toolkit-card__header">
                <span className="toolkit-card__icon" aria-hidden="true">
                    {renderTechCategoryIcon(category.title, staticIcons, false)}
                </span>
                <h3 id={`toolkit-${category.id || index}`}>{category.title}</h3>
                <span className="toolkit-card__index" aria-hidden="true">0{index + 1}</span>
            </header>
            <ul className="toolkit-card__tools">
                {category.items.map(item => (
                    <li key={item}>
                        {demonstratedSkills.has(item) ? (
                            <button
                                type="button"
                                className="toolkit-skill"
                                aria-pressed={selectedSkill === item}
                                aria-controls={`toolkit-work-${category.id || index}`}
                                onClick={() => selectSkill(item)}
                                title={`Show projects using ${item}`}
                            >
                                <span className="toolkit-card__tool-icon" aria-hidden="true">{renderTechItemIcon(item, staticIcons, false)}</span>
                                <span>{item}</span>
                                <span className="toolkit-skill__dot" aria-hidden="true" />
                            </button>
                        ) : (
                            <span className="toolkit-skill toolkit-skill--additional">
                                <span className="toolkit-card__tool-icon" aria-hidden="true">{renderTechItemIcon(item, staticIcons, false)}</span>
                                <span>{item}</span>
                            </span>
                        )}
                    </li>
                ))}
            </ul>
            {evidence.length > 0 && (
                <div className="toolkit-work" id={`toolkit-work-${category.id || index}`}>
                    <div className="toolkit-work__heading">
                        <span>In practice</span>
                        <div className="toolkit-work__navigation" aria-label={`${category.title} project navigation`}>
                            <button type="button" aria-label={`Previous ${category.title} project`} disabled={activeProjectIndex === 0}
                                onClick={() => setActiveProjectId(matchingProjects[activeProjectIndex - 1].project.id)}>
                                <ChevronLeft size={15} aria-hidden="true" />
                            </button>
                            <span>{activeProjectIndex + 1} / {matchingProjects.length}</span>
                            <button type="button" aria-label={`Next ${category.title} project`} disabled={activeProjectIndex === matchingProjects.length - 1}
                                onClick={() => setActiveProjectId(matchingProjects[activeProjectIndex + 1].project.id)}>
                                <ChevronRight size={15} aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                    <div className="toolkit-work__projects" aria-live="polite" aria-atomic="true">
                        {activeReference && (
                            <ProjectReference
                                project={activeReference.project}
                                className="toolkit-project"
                                aria-label={`View ${activeReference.project.title} in the gallery. Uses ${activeReference.skills.join(', ')}.`}
                            >
                                <img src={activeReference.project.thumbnail} alt="" loading="lazy" width="80" height="60" />
                                <span className="toolkit-project__copy">
                                    <strong>{activeReference.project.title}</strong>
                                    <span title={activeReference.skills.join(' · ')}>{activeReference.skills.join(' · ')}</span>
                                </span>
                                <ArrowUpRight size={15} aria-hidden="true" />
                            </ProjectReference>
                        )}
                    </div>
                </div>
            )}
        </motion.article>
    );
}

const TechStack = () => {
    const reducedMotion = useReducedMotion();
    const { tech } = portfolioData.ui.sections;
    const { categories } = portfolioData.skills;

    return (
        <section id="tech-stack" className="py-20 md:py-32 relative overflow-hidden render-optimize">
            <div className="container mx-auto px-6">
                <SectionHeading header={tech} description="The tools behind the work. Select a highlighted skill to explore where I have used it." />
                <div className="toolkit-grid">
                    {categories.map((category, index) => (
                        <ToolkitCategory
                            key={category.id || category.title}
                            category={category}
                            index={index}
                            projects={portfolioData.projects}
                            reducedMotion={reducedMotion}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export { TechStack };
