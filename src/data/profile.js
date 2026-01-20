// -------------------------------------------------------------------------
// PROFILE & SKILLS CONFIGURATION
// -------------------------------------------------------------------------

export const profile = {
    name: "Alberto Medina",
    role: "Solutions Engineer (Unity + AI + Automation)",
    tagline: "Engineering high-performance systems and deterministic solutions.",
    about: {
        avatarUrl: "https://github.com/Albjav1235.png",
        title: "Engineering Logic. Artistic Vision.",
        bio: [
            "I don't just write code; I engineer digital ecosystems. My journey started with game development, mastering the intricacies of Unity and C#, but my curiosity didn't stop at rendering frames.",
            "Today, I leverage that visual expertise to build full-stack automated systems, bridging the gap between immersive user interfaces and intelligent backend logic. Whether it's a custom Unity Editor tool or an AI-driven workflow, I build for efficiency."
        ],
        // "Verified Platform" Metrics
        stats: [
            { label: "Projects Delivered", value: "25+", id: "projects" },
            { label: "On-Time Delivery", value: "100%", id: "delivery" },
            { label: "Average Rating", value: "4.9/5", id: "rating" },
            { label: "Years Experience", value: "5+", id: "years" }
        ],
        testimonials: [
            {
                text: "Alberto created a professional Unity Editor window that saved us hours of workflow. His understanding of UI Toolkit is top-tier.",
                author: "Unity Client (USA)",
                project: "Custom Tooling Architecture"
            },
            {
                text: "Fast, efficient, and technically precise. He handled the complex metadata automation perfectly.",
                author: "Automation Client",
                project: "Python Automation Pipeline"
            },
            {
                text: "Great communication and high-quality game assets. He solved a complex C# bug no one else could fix.",
                author: "Indie Game Studio",
                project: "Unity Game Systems"
            },
            {
                text: "The delivery was exactly what we needed. Clean code, well documented, and delivered ahead of schedule.",
                author: "Tech Startup",
                project: "Backend Optimization"
            }
        ]
    },
    social: {
        github: "https://github.com/Albjav1235",
        linkedin: "#"
    }
};

export const skills = {
    categories: [
        {
            title: "Core Automation Engine",
            icon: "Cpu",
            color: "electric-green",
            items: ["Python", "C#", "SQL / NoSQL", "Node.js", "Multithreading", "API Design"]
        },
        {
            title: "AI & Computer Vision",
            icon: "Brain",
            color: "electric-cyan",
            items: ["Groq (Llama 3)", "Tesseract OCR", "Selenium", "Data Processing", "Inference"]
        },
        {
            title: "Visual & UI Systems",
            icon: "Layers",
            color: "electric-green",
            items: ["React", "Unity 3D", "Tailwind CSS", "Motion Design", "HLSL Shaders"]
        },
        {
            title: "Infrastructure & Tools",
            icon: "Globe",
            color: "electric-cyan",
            items: ["Firebase", "Supabase", "Git / GitHub", "Vercel", "Vite", "Postman"]
        }
    ]
};
