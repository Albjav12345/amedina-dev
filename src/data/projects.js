export const projects = [
    {
        id: 'zerotouch',
        title: 'ZeroTouch AI',
        subtitle: 'Autonomous Corporate Email Triage System',
        problem: 'Corporate email management consumes 30% of work hours, causing bottlenecks in support and operations.',
        solution: 'A Full Stack AI platform using Groq (Llama 3) to semantically analyze, prioritize, and draft responses for incoming emails automatically.',
        workflow: ['Outlook', 'Python Backend', 'Groq Llama 3', 'Web UI'],
        stack: ['Python', 'Flask', 'Llama 3', 'Supabase', 'Vanilla JS'],
        features: ['90% Time Reduction', 'Semantic Urgency Scoring', 'Glassmorphism UI', 'Bulk Actions'],
        links: {
            demo: '#',
            repo: '#'
        },
        mediaType: 'gif',
        orientation: 'horizontal'
    },
    {
        id: 'padelsync',
        title: 'Padel Sync',
        subtitle: 'Atomic Booking Engine & Native Android UI',
        problem: 'Race conditions between legacy web and new mobile app caused double-bookings and data corruption.',
        solution: 'Engineered a "Double-Lock" Transaction Protocol with Firestore and a Deterministic ID system to enforce atomic uniqueness.',
        workflow: ['Firebase Store', 'Kotlin Logic', 'Double-Lock', 'React Hub'],
        stack: ['Android (Kotlin)', 'Firebase', 'React', 'Atomic Locking'],
        features: ['100% Conflict Elimination', 'Silent Sync Pattern', 'Native Animations', 'Legacy Interop'],
        links: {
            demo: '#',
            repo: '#'
        },
        mediaType: 'gif',
        orientation: 'horizontal'
    },
    {
        id: 'twitchtool',
        title: 'Twitch Live Analytics',
        subtitle: 'Real-time Streamer Detection Tool',
        problem: 'Manual detection of live streamers in Fortnite matches is slow and error-prone.',
        solution: 'Automated Python utility combining Screen Capture, OCR (Tesseract), and Twitch API to identify broadcasters in real-time.',
        workflow: ['Screen Capture', 'Tesseract OCR', 'Twitch API', 'GUI Dashboard'],
        stack: ['Python', 'Tesseract OCR', 'Twitch API', 'Tkinter'],
        features: ['Real-time Detection', 'Multi-threaded', 'Computer Vision', 'Automated Scrolling'],
        links: {
            demo: '#',
            repo: '#'
        },
        mediaType: 'gif',
        orientation: 'horizontal'
    },
    {
        id: 'unityui',
        title: 'Visual Interfaces',
        subtitle: 'High-Fidelity Unity UX Experiments',
        problem: 'Demonstrating capability to build complex, non-standard visual interfaces beyond web constraints.',
        solution: 'A collection of highly polished, interactive mini-interfaces built with Unity Engine demonstrating shader prowess and UX motion.',
        workflow: ['Unity Core', 'C# Systems', 'HLSL Shaders', 'Motion UI'],
        stack: ['Unity 3D', 'C#', 'HLSL Shaders', 'Motion Design'],
        features: ['60FPS Animations', 'Complex State Machines', 'Particle Systems', '3D Interactions'],
        links: {
            demo: '#',
            repo: '#'
        },
        mediaType: 'video',
        orientation: 'horizontal'
    }
];
