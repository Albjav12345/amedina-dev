// Equivalences between the skill labels and the project stack/workflow labels
// authored in portfolio-master.xlsx. Never infer usage from a project's title.
const normalize = value => value.toLowerCase().replace(/[^a-z0-9#]/g, '');

const equivalents = {
    'C#': ['C#', 'C# / .NET 8', 'C# Systems'],
    'SQL / NoSQL': ['SQL', 'NoSQL', 'PostgreSQL', 'MongoDB', 'Firebase', 'Firebase Realtime Database', 'Supabase'],
    'Groq (Llama 3)': ['Groq', 'Llama 3', 'Groq Llama 3'],
    'Data Processing': ['Data Processing', 'Tesseract OCR', 'JSON / CSV'],
    'Inference': ['Inference', 'Groq', 'Llama 3', 'Groq Llama 3'],
    'React': ['React', 'React + Vite'],
    'Unity 3D': ['Unity 3D', 'Unity 6', 'Unity Core'],
    'Tailwind CSS': ['Tailwind CSS', 'Tailwind'],
    'Motion Design': ['Motion Design', 'Framer Motion', 'Motion UI'],
    'Firebase': ['Firebase', 'Firebase Realtime Database', 'Firebase Command Bus'],
    'Vite': ['Vite', 'React + Vite'],
};

function isUsedInProject(skill, project) {
    if (skill === 'Git / GitHub') return /^https:\/\/github\.com\//i.test(project.githubLink || '');
    const labels = new Set([...(project.stack || []), ...(project.arch || [])].map(normalize));
    return (equivalents[skill] || [skill]).some(label => labels.has(normalize(label)));
}

export function getSkillProjectEvidence(skills, projects) {
    return projects.map(project => ({
        project,
        skills: skills.filter(skill => isUsedInProject(skill, project)),
    })).filter(reference => reference.skills.length > 0)
        .sort((a, b) => b.skills.length - a.skills.length);
}
