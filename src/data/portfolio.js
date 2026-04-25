// -------------------------------------------------------------------------
// PORTFOLIO MASTER AGGREGATOR
// -------------------------------------------------------------------------
// Runtime content is generated from:
// -> src/data/content/portfolio-master.xlsx
//
// Regenerate runtime data with:
// -> npm run content:sync
// -------------------------------------------------------------------------

import { projects } from './projects.js';
import { profile, skills } from './profile.js';
import { ui } from './ui.js';
import portfolioContent from './generated/portfolioContent.json' with { type: 'json' };

const meta = {
    generatedAt: portfolioContent.generatedAt,
    showcasedProjectsCount: projects.length,
    showcasedProjectTitles: projects.map(project => project.title),
};

export const portfolioData = {
    profile,
    skills,
    projects,
    ui,
    meta,
};

export default portfolioData;
