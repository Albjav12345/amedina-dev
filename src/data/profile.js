// -------------------------------------------------------------------------
// PROFILE & SKILLS CONFIGURATION
// -------------------------------------------------------------------------

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
        testimonials: [
            {
                text: "Alberto built a custom Unity Editor tool that saved us hours every week. It was clean, practical, and easy to adopt straight away.",
                author: "Unity Client (USA)",
                project: "Custom Tooling Architecture",
                avatarUrl: "/assets/testimonials/client1.png"
            },
            {
                text: "Fast, precise, and easy to work with. He handled a messy automation problem and turned it into a workflow we could actually rely on.",
                author: "Automation Client",
                project: "Python Automation Pipeline",
                avatarUrl: "/assets/testimonials/client2.png"
            },
            {
                text: "Great communication and strong technical judgment. He fixed a C# issue we had been stuck on and explained the solution clearly.",
                author: "Indie Game Studio",
                project: "Unity Game Systems",
                avatarUrl: "/assets/testimonials/client3.png"
            },
            {
                text: "Exactly what we needed: clean code, clear structure, and a delivery that was easy to maintain after handoff.",
                author: "Tech Startup",
                project: "Backend Optimization",
                avatarUrl: "/assets/testimonials/client4.png"
            }
        ]
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
