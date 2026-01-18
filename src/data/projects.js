// -------------------------------------------------------------------------
// PROJECT CONFIGURATION CENTER
// -------------------------------------------------------------------------
// INSTRUCTIONS:
// 1. To ADD a project: Copy the "TEMPLATE" block below and paste it into the 'projects' array.
// 2. To REMOVE a project: Delete its block or comment it out.
// 3. To ORDER projects: Rearrange the blocks in the array. The first one appears first.
//
// MEDIA GUIDELINES:
// - GIF/Video URLs: Can be from anywhere (Giphy, YouTube, etc.) or local files.
// - Local Files: Put files in 'public/assets/projects/' and reference them as '/assets/projects/filename.mp4'
// -------------------------------------------------------------------------

/*
    --- PROJECT TEMPLATE (Copy this) ---
    {
        id: 99,                                     // Unique number
        title: "Project Name",                      // Main title
        subtitle: "Short tagline",                  // Appears below title
        problem: "What problem did you solve?",     // Description part 1
        solution: "How did you solve it?",          // Description part 2
        stack: ["React", "Node", "Python"],         // Tech tags
        arch: ["Frontend", "Backend", "AI"],        // Architecture tags (for the list view)
        githubLink: "https://github.com/...",       // Button link
        demoType: "gif",                            // 'gif' or 'video'
        thumbnail: "https://url-to-gif.gif"         // The visual media URL
        // demoUrl: "/assets/projects/video.mp4"    // OPTIONAL: Use if demoType is 'video'
    },
*/

export const projects = [
    {
        id: 1,
        title: "ZeroTouch AI",
        subtitle: "Autonomous Corporate Email Triage",
        problem: "Corporate email management consumes 30% of work hours, causing bottlenecks.",
        solution: "Full Stack AI platform using Groq (Llama 3) to semantically analyze and draft responses.",
        stack: ["Python", "Flask", "Llama 3", "Supabase"],
        arch: ["Outlook", "Python Backend", "Groq Llama 3", "Web UI"],
        githubLink: "https://github.com/Albjav1235/zerotouch-ai",
        demoType: "video",
        demoUrl: "/assets/projects/zero-touch-ai.mp4",
        thumbnail: "/assets/projects/zero-touch-ai.gif"
    },
    {
        id: 2,
        title: "Padel Sync",
        subtitle: "Atomic Booking Engine & Native UI",
        problem: "Race conditions between legacy web and new mobile app caused double-bookings.",
        solution: "Engineered a 'Double-Lock' Transaction Protocol with Firestore and Deterministic IDs.",
        stack: ["Android", "Firebase", "React", "Atomic Locking"],
        arch: ["Firebase Store", "Kotlin Logic", "Double-Lock", "React Hub"],
        githubLink: "https://github.com/Albjav1235/padel-sync",
        demoType: "gif",
        thumbnail: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHNoMTF5ZW5yNjd6YmJ6M3B0bDZ6ZXZ4ZXV4ZXV4ZXV4ZXV4ZXV4ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26tn33aiTi1jkl6H6/giphy.gif"
    },
    {
        id: 3,
        title: "Twitch Live Analytics",
        subtitle: "Real-time Streamer Detection",
        problem: "Manual detection of live streamers in Fortnite matches is slow and error-prone.",
        solution: "Automated Python utility combining Screen Capture, OCR, and Twitch API.",
        stack: ["Python", "Tesseract OCR", "Twitch API", "Tkinter"],
        arch: ["Screen Capture", "Tesseract OCR", "Twitch API", "Dashboard"],
        githubLink: "https://github.com/Albjav1235/twitch-analytics",
        demoType: "gif",
        thumbnail: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHNoMTF5ZW5yNjd6YmJ6M3B0bDZ6ZXZ4ZXV4ZXV4ZXV4ZXV4ZXV4ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/L8Krcdov0cE1V2UveY/giphy.gif"
    },
    {
        id: 4,
        title: "Visual Interfaces",
        subtitle: "High-Fidelity Unity UX",
        problem: "Demonstrating capability to build complex, non-standard visual interfaces.",
        solution: "Polished, interactive mini-interfaces built with Unity Engine demonstrating shader prowess.",
        stack: ["Unity 3D", "C#", "HLSL Shaders", "Motion Design"],
        arch: ["Unity Core", "C# Systems", "HLSL Shaders", "Motion UI"],
        githubLink: "https://github.com/Albjav1235/unity-interfaces",
        demoType: "video",
        demoUrl: "/assets/projects/visual-interfaces.mp4",
        thumbnail: "/assets/projects/visual-interfaces.gif"
    }
];
