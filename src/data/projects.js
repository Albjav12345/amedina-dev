// -------------------------------------------------------------------------
// PROJECT CONFIGURATION CENTER
// -------------------------------------------------------------------------
// INSTRUCTIONS:
// 1. To ADD a project: Copy the "TEMPLATE" block below and paste it into the 'projects' array.
// 2. To REMOVE a project: Delete its block or comment it out.
// 3. To ORDER projects: Rearrange the blocks in the array. The first one appears first.
//
// MEDIA GUIDELINES:
// - thumbnail:  STATIC IMAGE ONLY (.jpg, .png, .webp). This is what shows while the video loads.
//               CRITICAL: Do NOT use .mp4 here, as it will not render in the preview.
// - previewUrl: Short loop video (.mp4). Hardware accelerated, shown on card hover/scroll.
// - demoUrl:    Full quality video (.mp4). Shown inside the modal.
// - gif:        If you use a .gif in 'thumbnail', it will work but won't be as "quiet" or fast.
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
    thumbnail:   IMAGEN ESTÁTICA obligatoria (JPG, PNG, WebP). 
    icon:        Logo pequeño del proyecto (ej: 'Zap' de Lucide o un SVG/enlace).
    previewUrl:  Vídeo corto para la tarjeta (MP4).
    demoUrl:     Vídeo de alta calidad para el modal (MP4).

    --- 🚀 MASTER TEMPLATE (Copiar y pegar al final del array 'projects') ---
    {
        id: 5,
        title: "NOMBRE_DEL_SISTEMA",
        subtitle: "TAGLINE_CORTO_Y_POTENTE",
        problem: "DESCRIPCIÓN_DEL_RETO_TÉCNICO",
        solution: "DESCRIPCIÓN_DE_TU_INGENIERÍA",
        stack: ["TECNOLOGÍA_1", "TECNOLOGÍA_2"],
        arch: ["FLUJO_1", "FLUJO_2", "FLUJO_3"],
        githubLink: "https://github.com/Albjav1235/REPO",
        demoType: "gif",
        thumbnail: "URL_A_IMAGEN_O_GIF",
        icon: "Box"
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
        previewUrl: "/assets/projects/zero-touch-ai.mp4",
        demoUrl: "/assets/projects/zero-touch-ai.mp4",
        thumbnail: "/assets/projects/zero-touch-ai.png"
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
        demoType: "video",
        previewUrl: "/assets/projects/padel-booking.mp4",
        demoUrl: "/assets/projects/padel-booking.mp4",
        thumbnail: "/assets/projects/padel-booking.png",
        icon: "/assets/projects/padel-booking-logo.png"
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
        demoType: "video",
        previewUrl: "/assets/projects/twitch-live.mp4",
        demoUrl: "/assets/projects/twitch-live.mp4",
        thumbnail: "/assets/projects/twitch-live.png"
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
        previewUrl: "/assets/projects/visual-interfaces-short.mp4",
        demoUrl: "/assets/projects/visual-interfaces.mp4",
        thumbnail: "/assets/projects/visual-interfaces.png"
    }
];