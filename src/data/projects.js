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
        githubLink: "https://github.com/Albjav1235/REPO",
        demoType: "gif",
        thumbnail: "URL_A_IMAGEN_O_GIF",
        icon: "Box"
    },
*/

export const projects = [
    // --- LOTE 1: ANTERIORES DE PRUEBA (IDs 1-8) ---
    {
        id: 1,
        title: "Cloud Native Pipeline",
        subtitle: "Automated CI/CD Orchestration",
        problem: "Deployment times were over 45 minutes with high failure rates.",
        solution: "Implemented a Kubernetes-based pipeline reducing deploy time to 5 minutes.",
        stack: ["Docker", "Kubernetes", "AWS", "Jenkins"],
        arch: ["Git Push", "Docker Build", "K8s Cluster", "Load Balancer"],
        githubLink: "https://github.com/test/cloud-pipeline",
        demoType: "video",
        previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        demoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg",
        icon: "Cloud"
    },
    {
        id: 2,
        title: "FinTech Ledger",
        subtitle: "High-Frequency Trading Bot",
        problem: "Market latency prevented capturing micro-arbitrage opportunities.",
        solution: "Rust-based engine with direct memory access and sub-millisecond execution.",
        stack: ["Rust", "Tokio", "gRPC", "PostgreSQL"],
        arch: ["Market Feed", "Rust Engine", "Risk Check", "Order Gateway"],
        githubLink: "https://github.com/test/fintech-ledger",
        demoType: "video",
        previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        demoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg",
        icon: "TrendingUp"
    },
    {
        id: 3,
        title: "Neural Vision Core",
        subtitle: "Edge Computing Object Detection",
        problem: "Cloud-based inference was too slow for autonomous drone navigation.",
        solution: "Optimized YOLOv8 models running on Jetson Nano with TensorRT.",
        stack: ["PyTorch", "C++", "CUDA", "OpenCV"],
        arch: ["Camera Input", "TensorRT Engine", "Control Logic", "Motor Output"],
        githubLink: "https://github.com/test/neural-vision",
        demoType: "video",
        previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        demoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg",
        icon: "Eye"
    },
    {
        id: 4,
        title: "BlockChain Voting",
        subtitle: "Decentralized Governance DAO",
        problem: "Lack of transparency in community governance votes.",
        solution: "Smart contracts on Ethereum ensuring immutable and verifiable voting records.",
        stack: ["Solidity", "Web3.js", "React", "Hardhat"],
        arch: ["User Wallet", "Web3 Provider", "Smart Contract", "IPFS Storage"],
        githubLink: "https://github.com/test/blockchain-vote",
        demoType: "video",
        previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        demoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
        icon: "Link"
    },
    {
        id: 5,
        title: "Sintel Render Engine",
        subtitle: "Open Source Graphics Core",
        problem: "Proprietary rendering engines were too expensive for indie studios.",
        solution: "Developed a Vulkan-based physically based rendering (PBR) engine.",
        stack: ["C++", "Vulkan", "GLSL", "Python"],
        arch: ["Asset Loader", "Geometry Pass", "Lighting Pass", "Post-Processing"],
        githubLink: "https://github.com/test/sintel-engine",
        demoType: "video",
        previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        demoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg",
        icon: "Cpu"
    },
    {
        id: 6,
        title: "Escape Velocity",
        subtitle: "Physics Simulation Framework",
        problem: "Existing physics engines lacked precision for orbital mechanics.",
        solution: "Created a deterministic n-body simulation loop using fixed-point math.",
        stack: ["Rust", "WASM", "WebGL", "TypeScript"],
        arch: ["Simulation Loop", "Collision Detection", "Integrator", "Render State"],
        githubLink: "https://github.com/test/escape-velocity",
        demoType: "video",
        previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        demoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg",
        icon: "Globe"
    },
    {
        id: 7,
        title: "JoyRide Social",
        subtitle: "Graph-based Event Discovery",
        problem: "Users struggled to find spontaneous local events relevant to their interests.",
        solution: "Built a geospatial recommendation engine using Neo4j and elasticsearch.",
        stack: ["Node.js", "Neo4j", "GraphQL", "React Native"],
        arch: ["User Location", "Geo-Index", "Graph Query", "Feed Service"],
        githubLink: "https://github.com/test/joyride-social",
        demoType: "video",
        previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        demoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg",
        icon: "MapPin"
    },
    {
        id: 8,
        title: "Cyber Meltdown",
        subtitle: "Incident Response Dashboard",
        problem: "Security teams were overwhelmed by false-positive alerts during attacks.",
        solution: "Developed an alert correlation engine to group related security events.",
        stack: ["Go", "Kafka", "Elasticsearch", "Vue.js"],
        arch: ["Log Ingest", "Correlation Engine", "Risk Scoring", "Admin Panel"],
        githubLink: "https://github.com/test/cyber-meltdown",
        demoType: "video",
        previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
        demoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
        thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg",
        icon: "ShieldAlert"
    },

    // --- LOTE 2: NUEVOS 8 PROYECTOS (IDs 9-16) ---
    {
        id: 9,
        title: "EcoSense IoT",
        subtitle: "Agricultural Sensor Network",
        problem: "Farmers needed real-time soil data to optimize water usage in remote areas.",
        solution: "LoRaWAN mesh network collecting humidity/temp data visualized in Grafana.",
        stack: ["C++ (Arduino)", "LoRaWAN", "InfluxDB", "Grafana"],
        arch: ["Sensor Node", "LoRa Gateway", "MQTT Broker", "Dashboard"],
        githubLink: "https://github.com/test/eco-sense",
        demoType: "video",
        previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4", // Reused
        demoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg",
        icon: "Leaf"
    },
    {
        id: 10,
        title: "Quantum Key Dist",
        subtitle: "Post-Quantum Cryptography",
        problem: "Standard RSA encryption is vulnerable to future quantum computing attacks.",
        solution: "Simulated QKD protocol implementation using lattice-based cryptography.",
        stack: ["Python", "Qiskit", "NumPy", "Flask"],
        arch: ["Alice Node", "Quantum Channel", "Bob Node", "Key Exchange"],
        githubLink: "https://github.com/test/quantum-key",
        demoType: "video",
        previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", // Reused
        demoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg",
        icon: "Lock"
    },
    {
        id: 11,
        title: "MediScan Pro",
        subtitle: "MRI Anomaly Detection",
        problem: "Radiologists miss 15% of micro-fractures in early stage X-rays.",
        solution: "Convolutional Neural Network trained on 50k datasets to highlight anomalies.",
        stack: ["TensorFlow", "Keras", "Python", "React"],
        arch: ["DICOM Ingest", "Preprocessing", "CNN Inference", "Overlay UI"],
        githubLink: "https://github.com/test/mediscan",
        demoType: "video",
        previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", // Reused
        demoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg",
        icon: "Activity"
    },
    {
        id: 12,
        title: "HyperLoop OS",
        subtitle: "Maglev Control System",
        problem: "Managing magnetic levitation stability at speeds over 600km/h.",
        solution: "Real-time PID controller implementation in embedded C with redundant safety.",
        stack: ["C", "FreeRTOS", "MATLAB", "Simulink"],
        arch: ["Sensor Array", "PID Controller", "Actuators", "Telemetry"],
        githubLink: "https://github.com/test/hyperloop",
        demoType: "video",
        previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", // Reused
        demoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg",
        icon: "Zap"
    },
    {
        id: 13,
        title: "Urban Traffic AI",
        subtitle: "Smart City Flow Control",
        problem: "Congestion in downtown areas caused by static traffic light timing.",
        solution: "Reinforcement Learning agent controlling traffic lights based on live camera feeds.",
        stack: ["Python", "PyTorch", "OpenCV", "Sumo Traffic"],
        arch: ["CCTV Input", "Vehicle Count", "RL Model", "Light Signal"],
        githubLink: "https://github.com/test/urban-traffic",
        demoType: "video",
        previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", // Reused
        demoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg",
        icon: "Truck"
    },
    {
        id: 14,
        title: "AeroDynamics Sim",
        subtitle: "CFD Analysis Tool",
        problem: "Commercial CFD software was too heavy for quick iterative prototyping.",
        solution: "WebAssembly-based fluid dynamics solver running directly in the browser.",
        stack: ["Rust", "WebAssembly", "WebGL", "TypeScript"],
        arch: ["Mesh Gen", "Solver Core", "WASM Bridge", "Visualization"],
        githubLink: "https://github.com/test/aero-sim",
        demoType: "video",
        previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", // Reused
        demoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg",
        icon: "Wind"
    },
    {
        id: 15,
        title: "DeepSea Sonar",
        subtitle: "Underwater Mapping",
        problem: "Mapping ocean floor topography requires expensive specialized hardware.",
        solution: "Signal processing algorithm to reconstruct 3D terrain from single-beam sonar.",
        stack: ["Matlab", "C++", "OpenGL", "Python"],
        arch: ["Raw Sonar", "Noise Filter", "Depth Map", "3D Render"],
        githubLink: "https://github.com/test/deep-sea",
        demoType: "video",
        previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", // Reused
        demoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
        thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg",
        icon: "Anchor"
    },
    {
        id: 16,
        title: "Voice Assistant",
        subtitle: "Natural Language Processor",
        problem: "Off-the-shelf voice assistants compromised user privacy via cloud processing.",
        solution: "Fully offline voice recognition engine running on Raspberry Pi.",
        stack: ["Python", "Vosk", "Kaldi", "Node-RED"],
        arch: ["Mic Input", "Wake Word", "STT Engine", "Command Exec"],
        githubLink: "https://github.com/test/voice-assist",
        demoType: "video",
        previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", // Reused
        demoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
        icon: "Mic"
    }
];