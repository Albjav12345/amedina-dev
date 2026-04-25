// -------------------------------------------------------------------------
// PROFILE & SKILLS CONFIGURATION
// -------------------------------------------------------------------------

import { featuredTestimonials, testimonialsSection } from './testimonials.js';

export const profile = {
    name: "Alberto Medina Garcia",
    role: "Full-Stack Developer & Automation Engineer",
    tagline: "I build reliable products, automation workflows, and AI systems with clear product thinking.",
    about: {
        avatarUrl: "/assets/logo.svg",
        title: "Logic first. Built to be used.",
        bio: [
            "I started in game development with Unity and C#, where I learned to care about how systems feel in the hands of the user, not just how they work under the hood.",
            "That same mindset now drives my work in full-stack development, automation, and AI tooling. I like building systems that solve real operational problems, feel polished to use, and stay understandable as they grow."
        ],
        philosophy: {
            label: "AI Philosophy",
            quote: "AI does not replace good engineers. It exposes weak ones. The value is not in using it, but in knowing how to think with it, control it, and build reliable systems around it."
        },
        stats: [
            { label: "Projects Delivered", value: "25+", id: "projects" },
            { label: "On-Time Delivery", value: "100%", id: "delivery" },
            { label: "Global Clients", value: "12+", id: "global" },
            { label: "Years Experience", value: "5+", id: "years" }
        ],
        testimonialsSection,
        testimonials: featuredTestimonials
    },
    social: {
        github: "https://github.com/Albjav12345",
        linkedin: "https://www.linkedin.com/in/alberto-medina-dev/"
    }
};

export const skills = {
    categories: [
        {
            title: "Core Development",
            icon: "Cpu",
            color: "electric-green",
            items: ["Python", "C#", "SQL / NoSQL", "Node.js", "Multithreading", "API Design"]
        },
        {
            title: "AI & Vision Workflows",
            icon: "Brain",
            color: "electric-cyan",
            items: ["Groq (Llama 3)", "Tesseract OCR", "Selenium", "Data Processing", "Inference"]
        },
        {
            title: "Frontend & Interactive Systems",
            icon: "Layers",
            color: "electric-green",
            items: ["React", "Unity 3D", "Tailwind CSS", "Motion Design", "HLSL Shaders"]
        },
        {
            title: "Infra & Delivery",
            icon: "Globe",
            color: "electric-cyan",
            items: ["Firebase", "Supabase", "Git / GitHub", "Vercel", "Vite", "Postman"]
        }
    ]
};
