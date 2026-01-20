// -------------------------------------------------------------------------
// GLOBAL UI CONFIGURATION
// -------------------------------------------------------------------------

export const ui = {
    // Navigation & Header
    navigation: {
        brand: {
            first: "AMEDINA",
            last: ".DEV",
            logoIcon: "Terminal" // Lucide icon name
        },
        links: [
            { name: 'Start', href: '#home', id: 'home', num: '01' },
            { name: 'About', href: '#about', id: 'about', num: '02' },
            { name: 'Systems', href: '#projects', id: 'projects', num: '03' },
            { name: 'Stack', href: '#tech-stack', id: 'tech-stack', num: '04' },
            { name: 'Contact', href: '#contact', id: 'contact', num: '05' },
        ],
        terminalButton: "TERM_ACCESS"
    },

    // Hero Section
    hero: {
        priorityLabel: "Priority: Level 1 Alpha",
        title: {
            white: "ALBERTO",
            green: "MEDINA"
        },
        handle: "@Albjav1235",
        description: "Full-Stack Developer & Automation Specialist. Engineering high-performance systems and deterministic solutions since age 10.",
        buttons: {
            terminal: "ACCESS_TERMINAL",
            cv: "GET_MANIFEST.PDF"
        },
        metadata: [
            { label: "Stack_Focus", value: "PYTHON / REACT / UNITY" },
            { label: "Exp_Runtime", value: "10+ YEARS" }
        ]
    },

    // Terminal Window
    terminal: {
        headerTitle: "zsh — port-folio",
        welcomeMessage: "Click to access system...",
        initialLines: [
            { text: ">>> SYSTEM_CHECK: OPTIMAL", color: "electric-green" },
            { text: ">>> DETECTED_VISITOR: AUTH_PENDING...", color: "white" },
            { text: ">>> HINT: This is an interactive neural interface.", color: "electric-cyan" },
            { text: ">>> COMMANDS_AVAILABLE: ['chat', 'explore', 'connect']", color: "gray" },
            { text: ">>> STATUS: WAITING_FOR_INPUT...", color: "electric-green" },
            { text: "$ ./init_session.sh --interactive", color: "white" }
        ],
        consoleGretting: [
            { text: "> INITIALIZING GUEST SESSION...", color: "electric-green" },
            { text: "> ACCESS GRANTED. AWAITING INPUT...", color: "electric-green" }
        ],
        tooltip: {
            title: "System Architecture",
            description: "Powered by Llama-3-70b via Groq Cloud.",
            capabilities: [
                "Accesses live website content & GitHub repos.",
                "Performs autonomous navigation.",
                "Controls system interface."
            ],
            usage: 'Try asking about "projects" or type "help".'
        }
    },

    // Section Headers (Labes & Titles)
    sections: {
        about: {
            id: "SYS_01",
            line1: "Identity",
            line2: "Protocol."
        },
        projects: {
            id: "SYS_02",
            line1: "Project",
            line2: "Ecosystems."
        },
        tech: {
            id: "SYS_03",
            line1: "Technical",
            line2: "Arsenal."
        },
        console: { // Mobile console header
            id: "SYS_00",
            line1: "SYSTEM",
            line2: "CONSOLE"
        }
    },

    // Contact Section
    contact: {
        label: "Direct Communication Protocol",
        titleLine1: "READY TO",
        titleLine2: "INTERFACE.",
        description: "Ready to override standard boundaries? Whether you have a specific system in mind or just want to discuss automation protocols, the transmission line is open.",
        endpointLabel: "Primary_Endpoint",
        email: "amedina.amg.dev@gmail.com",
        social: [
            { name: "GitHub", url: "https://github.com/Albjav12345", icon: "Github" },
            { name: "LinkedIn", url: "#", icon: "Linkedin" }
        ],
        form: {
            name: {
                label: "USER_IDENTITY.src",
                placeholder: "Enter your name..."
            },
            email: {
                label: "RETURN_PATH.void",
                placeholder: "your@email.com"
            },
            message: {
                label: "DATA_PAYLOAD.txt",
                placeholder: "Describe your protocol or project..."
            },
            submit: {
                idle: "EXECUTE_TRANSMISSION",
                sending: "TRANSMITTING...",
                success: "SUCCESS_CONFIRMED",
                error: "PROTOCOL_FAILURE"
            }
        },
        metadata: [
            { label: "Latency", value: "< 24H_RESP", activeValue: "SIGNAL_CALC..." },
            { label: "Encryption", value: "TLS_1.3" },
            { label: "Uptime", value: "99.9%_AVAIL" }
        ]
    },

    // Footer
    footer: {
        status: "System Status: All Systems Operational",
        location: "SPAIN / REMOTE",
        vesselId: "AUTO_PORT_V2.0"
    }
};
