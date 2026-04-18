// -------------------------------------------------------------------------
// GLOBAL UI CONFIGURATION
// -------------------------------------------------------------------------

import { isArchitectSectionEnabled } from '../config/siteFeatures.js';

const baseNavigationLinks = [
    { name: 'Start', href: '/', id: 'home' },
    { name: 'About', href: '/about', id: 'about' },
    { name: 'Systems', href: '/projects', id: 'projects' },
    { name: 'Stack', href: '/stack', id: 'tech-stack' },
    { name: 'Architect', href: '/architect', id: 'architect' },
    { name: 'Contact', href: '/contact', id: 'contact' },
];

export const ui = {
    navigation: {
        brand: {
            first: "AMEDINA",
            last: ".DEV",
            logoIcon: "Terminal"
        },
        links: baseNavigationLinks
            .filter((link) => link.id !== 'architect' || isArchitectSectionEnabled)
            .map((link, index) => ({
                ...link,
                num: String(index + 1).padStart(2, '0'),
            })),
        terminalButton: "TERM_ACCESS"
    },

    hero: {
        priorityLabel: "SYSTEMS / AUTOMATION / AI",
        title: {
            white: "ALBERTO",
            green: "MEDINA"
        },
        handle: "@Albjav12345",
        description: "I build full-stack products, automation workflows, and AI systems that solve real operational problems and still feel polished to use.",
        buttons: {
            terminal: "ACCESS_TERMINAL",
            cv: "GET_MANIFEST.PDF",
            cvPending: "MANIFEST_PENDING",
            cvHref: "/manifest-test.pdf"
        },
        metadata: [
            { label: "Stack_Focus", value: "PYTHON / REACT / UNITY" },
            { label: "Exp_Runtime", value: "5+ YEARS SHIPPING" }
        ]
    },

    terminal: {
        headerTitle: "zsh - port-folio",
        welcomeMessage: "Click to access system...",
        initialLines: [
            { text: ">>> SYSTEM_CHECK: READY", color: "electric-green" },
            { text: ">>> DETECTED_VISITOR: AUTH_PENDING...", color: "white" },
            { text: ">>> LIVE_GITHUB_SYNC: ACTIVE", color: "electric-cyan" },
            { text: ">>> HINT: Ask about recent builds, stack decisions, or current GitHub activity.", color: "electric-cyan" },
            { text: ">>> COMMANDS: ['chat', 'explore', 'github']", color: "gray" },
            { text: ">>> STATUS: WAITING_FOR_INPUT...", color: "electric-green" },
            { text: "$ ./init_session.sh --interactive", color: "white" }
        ],
        consoleGretting: [
            { text: "> INITIALIZING GUEST SESSION...", color: "electric-green" },
            { text: "> ACCESS GRANTED. AWAITING INPUT...", color: "electric-green" }
        ],
        tooltip: {
            title: "Terminal Agent",
            description: "Backed by Groq-hosted Llama 3 with live portfolio context.",
            capabilities: [
                "Reads live portfolio content and current GitHub activity.",
                "Can navigate the site and move between sections.",
                "Answers technical questions about projects, stack, and experience.",
                "Can help scope incoming project briefs and technical direction."
            ],
            usage: 'Try asking "What have you built recently?" or "help me scope a system".'
        }
    },

        sections: {
        about: {
            id: "SYS_01",
            line1: "Identity",
            line2: "Background."
        },
        projects: {
            id: "SYS_02",
            line1: "Personal",
            line2: "Projects."
        },
        tech: {
            id: "SYS_03",
            line1: "Technical",
            line2: "Stack."
        },
        architect: {
            id: "SYS_04",
            line1: "Project",
            line2: "Architect."
        },
        console: {
            id: "SYS_00",
            line1: "SYSTEM",
            line2: "CONSOLE"
        }
    },

    contact: {
        label: "Direct Communication",
        titleLine1: "READY TO",
        titleLine2: "BUILD.",
        description: "If you already know what you want to build, we can scope it properly. If not, we can start from the problem and work forward.",
        endpointLabel: "Primary_Contact",
        email: "amedina.amg.dev@gmail.com",
        social: [
            { name: "GitHub", url: "https://github.com/Albjav12345", icon: "Github" },
            { name: "LinkedIn", url: "https://www.linkedin.com/in/alberto-medina-dev/", icon: "Linkedin" },
            { name: "X", url: "https://x.com/Albjav12345", icon: "Twitter" },
            { name: "Upwork", url: "https://www.upwork.com/freelancers/~0177774c838e1e7798", icon: "Upwork" }
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
                placeholder: "Describe your project, system, or idea..."
            },
            submit: {
                idle: "EXECUTE_TRANSMISSION",
                sending: "TRANSMITTING...",
                success: "SUCCESS_CONFIRMED",
                error: "TRANSMISSION_ERROR"
            }
        },
        metadata: [
            { label: "Latency", value: "< 24H_RESP", activeValue: "SIGNAL_CALC..." },
            { label: "Encryption", value: "TLS_1.3" },
            { label: "Uptime", value: "99.9%_AVAIL" }
        ]
    },

    footer: {
        name: "Alberto Medina Garcia",
        status: "System Status: All Systems Operational",
        location: "SPAIN / REMOTE",
        vesselId: "AUTO_PORT_V2.0"
    }
};
