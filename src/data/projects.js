// -------------------------------------------------------------------------
// PROJECT CONFIGURATION CENTER
// -------------------------------------------------------------------------
// INSTRUCTIONS:
// 1. To add a project: copy the template block below and paste it into the
//    'projects' array.
// 2. To remove a project: delete its block or comment it out.
// 3. To reorder projects: rearrange the blocks in the array.
//
// MEDIA GUIDELINES:
// - GIF/video URLs can be external or local.
// - Local files should live in 'public/assets/projects/' and be referenced as
//   '/assets/projects/filename.mp4'
// -------------------------------------------------------------------------

/*
--- FIELD GUIDE ---
id:          Unique number.
title:       Project name.
subtitle:    Short descriptive line shown under the title.
problem:     What technical or product problem did you solve?
solution:    How did you solve it?
stack:       Technology tags.
arch:        System flow steps shown in the modal diagram.
githubLink:  Repository URL.
demoType:    'video' or 'gif'.
thumbnail:   Cover image (required).
icon:        Small project icon.
iconFit:     Optional. Use 'auto' if the icon should keep its natural shape.
iconScale:   Optional. Increase scale to trim transparent padding.

--- MASTER TEMPLATE ---
{
    id: 5,
    title: "SYSTEM_NAME",
    subtitle: "SHORT_TAGLINE",
    problem: "WHAT WAS THE PROBLEM?",
    solution: "HOW DID YOU SOLVE IT?",
    stack: ["TECH_1", "TECH_2"],
    arch: ["STEP_1", "STEP_2", "STEP_3"],
    githubLink: "https://github.com/Albjav12345/REPO",
    demoType: "gif",
    thumbnail: "IMAGE_OR_GIF_URL",
    icon: "Box"
},
*/

export const projects = [
    {
        id: 1,
        title: "Unity Developer",
        subtitle: "High-Fidelity Unity UX",
        problem: "A lot of developers can build tools. Far fewer can build custom interfaces that feel intentional inside a real-time engine.",
        solution: "I built polished Unity interfaces and supporting shader work to show that I can design and implement unusual UI systems, not just standard app screens.",
        stack: ["Unity 3D", "C#", "HLSL Shaders", "Motion Design"],
        arch: ["Unity Core", "C# Systems", "HLSL Shaders", "Motion UI"],
        githubLink: "https://github.com/Albjav12345/unity-interfaces",
        demoType: "video",
        previewUrl: "/assets/projects/visual-interfaces-short.mp4",
        demoUrl: "/assets/projects/visual-interfaces.mp4",
        thumbnail: "/assets/projects/visual-interfaces.png",
        icon: "/assets/projects/unity.webp",
        iconScale: 1.3
    },
    {
        id: 2,
        title: "Smart Inbox Manager",
        subtitle: "Autonomous Corporate Email Triage",
        problem: "Sales and partnership inboxes become noisy fast, and teams lose time triaging the same messages manually.",
        solution: "I built a full-stack AI workflow that classifies incoming emails, drafts first replies, and keeps a human in control where it matters.",
        stack: ["Python", "Flask", "Llama 3", "Supabase"],
        arch: ["Outlook", "Python Backend", "Groq Llama 3", "Web UI"],
        githubLink: "https://github.com/Albjav12345/zero_touch_email_bot",
        demoType: "video",
        previewUrl: "/assets/projects/zero-touch-ai.mp4",
        demoUrl: "/assets/projects/zero-touch-ai.mp4",
        thumbnail: "/assets/projects/zero-touch-ai.png",
        icon: "/assets/projects/outlook-icon.webp",
        iconFit: "auto",
        iconScale: 1.25
    },
    {
        id: 3,
        title: "Paddle Booking App",
        subtitle: "Reactive State & Live Synchronization",
        problem: "Manual booking created conflicts, stale availability, and too much back-and-forth for users.",
        solution: "I shipped a serverless PWA with real-time sync and validation so availability updates instantly and booking conflicts are resolved at the system level.",
        stack: ["React + Vite", "Firebase", "Tailwind", "Framer Motion"],
        arch: ["Serverless", "Event Listeners", "PWA Cache", "Reactive State"],
        githubLink: "https://github.com/Albjav12345/padel-sync",
        demoType: "video",
        previewUrl: "/assets/projects/padel-booking.mp4",
        demoUrl: "/assets/projects/padel-booking.mp4",
        thumbnail: "/assets/projects/padel-booking.png",
        icon: "/assets/projects/padel-booking-logo.png"
    },
    {
        id: 4,
        title: "Twitch Live Analytics",
        subtitle: "Real-time Streamer Detection",
        problem: "Finding live streamers in Fortnite lobbies manually was slow, repetitive, and easy to get wrong.",
        solution: "I automated the workflow with screen capture, OCR, and Twitch API checks so detection became fast, repeatable, and much easier to monitor.",
        stack: ["Python", "Tesseract OCR", "Twitch API", "Tkinter"],
        arch: ["Screen Capture", "Tesseract OCR", "Twitch API", "Dashboard"],
        githubLink: "https://github.com/Albjav12345/Fortnite-Lobby-Stream-Finder",
        demoType: "video",
        previewUrl: "/assets/projects/twitch-live.mp4",
        demoUrl: "/assets/projects/twitch-live.mp4",
        thumbnail: "/assets/projects/twitch-live.png",
        icon: "/assets/projects/twitch-icon.webp",
        iconScale: 1.3
    },
    {
        id: 5,
        title: "USB Exfiltration",
        subtitle: "Adversary Emulation & Headless Acquisition",
        problem: "Red team USB collection often fails because of file locks, user friction, and the need to stay quiet on the host.",
        solution: "I built a stealth-focused Windows payload for controlled security research, combining native WMI polling and low-friction background collection.",
        stack: ["PowerShell", "Batch", "WMI/CIM", "OPSEC"],
        arch: ["Background Polling", "UAC Evasion", "File-Lock Bypass", "Encrypted Exfiltration"],
        githubLink: "https://github.com/Albjav12345/Automated-USB-Exfiltration",
        demoType: "video",
        previewUrl: "/assets/projects/usb-extraction.mp4",
        demoUrl: "/assets/projects/usb-extraction.mp4",
        thumbnail: "/assets/projects/usb-extraction.png",
        icon: "/assets/projects/terminal.ico",
        iconFit: "auto"
    }
];
