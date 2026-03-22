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
    --- 💡 GUÍA DE CAMPOS ---
    id:          Número único (ej: 5, 6, 7...).
    title:       Nombre del proyecto (se resalta en verde al pasar el ratón).
    subtitle:    Frase corta descriptiva (aparece debajo del título).
    problem:     Contexto: ¿Qué reto técnico resolviste?
    solution:    Implementación: ¿Cómo lo solucionaste con ingeniería?
    stack:       Etiquetas de lenguajes (ej: ["Python", "React"]).
    arch:        Pasos del flujo de datos (se muestran en el diagrama del modal).
    githubLink:  Enlace a tu repositorio.
    demoType:    Tipo de medio: 'video' (local .mp4) o 'gif' (enlace externo).
    thumbnail:   Imagen de portada (obligatoria).
    icon:        Logo pequeño del proyecto (ej: 'Zap' de Lucide o un SVG/enlace).
    iconFit:     Opcional. Si pones 'auto', el recuadro se ajustará a la forma del PNG en lugar de ser un cuadrado fijo.
    demoUrl:     Vídeo de alta calidad (opcional, solo si demoType es 'video').

    --- 🚀 MASTER TEMPLATE (Copiar y pegar al final del array 'projects') ---
    {
        id: 5,
        title: "NOMBRE_DEL_SISTEMA",
        subtitle: "TAGLINE_CORTO_Y_POTENTE",
        problem: "DESCRIPCIÓN_DEL_RETO_TÉCNICO",
        solution: "DESCRIPCIÓN_DE_TU_INGENIERÍA",
        stack: ["TECNOLOGÍA_1", "TECNOLOGÍA_2"],
        arch: ["FLUJO_1", "FLUJO_2", "FLUJO_3"],
        githubLink: "https://github.com/Albjav12345/REPO",
        demoType: "gif",
        thumbnail: "URL_A_IMAGEN_O_GIF",
        icon: "Box"
    },
*/

export const projects = [
    {
        id: 1,
        title: "Unity Developer",
        subtitle: "High-Fidelity Unity UX",
        problem: "Demonstrating capability to build complex, non-standard visual interfaces.",
        solution: "Polished, interactive mini-interfaces built with Unity Engine demonstrating shader prowess.",
        stack: ["Unity 3D", "C#", "HLSL Shaders", "Motion Design"],
        arch: ["Unity Core", "C# Systems", "HLSL Shaders", "Motion UI"],
        githubLink: "https://github.com/Albjav12345/unity-interfaces",
        demoType: "video",
        previewUrl: "/assets/projects/visual-interfaces-short.mp4",
        demoUrl: "/assets/projects/visual-interfaces.mp4",
        thumbnail: "/assets/projects/visual-interfaces.png",
        icon: "/assets/projects/unity.webp"
    },
    {
        id: 2,
        title: "Smart Inbox Manager",
        subtitle: "Autonomous Corporate Email Triage",
        problem: "Corporate email management consumes 30% of work hours, causing bottlenecks.",
        solution: "Full Stack AI platform using Groq (Llama 3) to semantically analyze and draft responses.",
        stack: ["Python", "Flask", "Llama 3", "Supabase"],
        arch: ["Outlook", "Python Backend", "Groq Llama 3", "Web UI"],
        githubLink: "https://github.com/Albjav12345/zero_touch_email_bot",
        demoType: "video",
        previewUrl: "/assets/projects/zero-touch-ai.mp4",
        demoUrl: "/assets/projects/zero-touch-ai.mp4",
        thumbnail: "/assets/projects/zero-touch-ai.png"
    },
    {
        id: 3,
        title: "Booking App",
        subtitle: "Reactive State & Live Synchronization",
        problem: "Asynchronous manual booking led to concurrency conflicts and lack of instant availability feedback.",
        solution: "Deployed a serverless PWA with Firestore listeners for sub-second state synchronization and dynamic validation rules.",
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
        problem: "Manual detection of live streamers in Fortnite matches is slow and error-prone.",
        solution: "Automated Python utility combining Screen Capture, OCR, and Twitch API.",
        stack: ["Python", "Tesseract OCR", "Twitch API", "Tkinter"],
        arch: ["Screen Capture", "Tesseract OCR", "Twitch API", "Dashboard"],
        githubLink: "https://github.com/Albjav12345/Fortnite-Lobby-Stream-Finder",
        demoType: "video",
        previewUrl: "/assets/projects/twitch-live.mp4",
        demoUrl: "/assets/projects/twitch-live.mp4",
        thumbnail: "/assets/projects/twitch-live.png"
    },
    {
        id: 5,
        title: "USB Exfiltration",
        subtitle: "Adversary Emulation & Headless Acquisition",
        problem: "Physical penetration tests require stealthy, artifact-free data acquisition methods that bypass OS file locks and avoid triggering UAC or user awareness.",
        solution: "Engineered a headless Windows payload for authorized Red Team operations. It executes silently in the background, utilizing native WMI polling and Zero-Wait I/O to exfiltrate target data without alerting the user.",
        stack: ["PowerShell", "Batch", "WMI/CIM", "OPSEC"],
        arch: ["Background Polling", "UAC Evasion", "File-Lock Bypass", "Encrypted Exfiltration"],
        githubLink: "https://github.com/Albjav12345/Secure-USB-Vault-Agent",
        demoType: "video",
        previewUrl: "/assets/projects/usb-extraction.mp4",
        demoUrl: "/assets/projects/usb-extraction.mp4",
        thumbnail: "/assets/projects/usb-extraction.png",
        icon: "/assets/projects/terminal.ico",
        iconFit: "auto"
    }
];