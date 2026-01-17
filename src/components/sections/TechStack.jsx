import React from 'react';
import { motion } from 'framer-motion';
import {
    Cpu, Brain, Layers, Globe,
    Database, Terminal, Code2,
    Zap, Share2, Box, Wind,
    Flame, Monitor, Layout,
    Smartphone, Network, Lock,
    Server, Cloud, GitBranch,
    Search, MousePointer2
} from 'lucide-react';
import { viewportConfig } from '../../utils/animations';
import portfolioData from '../../../api/portfolio.js';

const { categories: rawCategories } = portfolioData.skills;

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 10 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 260,
            damping: 20
        }
    }
};

const TechNode = ({ name, icon, color = "electric-green" }) => {
    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.05 }}
            className="group relative flex flex-col items-center gap-2 gpu-accelerated"
        >
            <div className={`w-14 h-14 rounded-xl glass-card flex items-center justify-center border-white/5 relative overflow-hidden bg-white/[0.02] active:scale-95 transition-all duration-300`}>
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-${color}/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`}></div>
                <div className={`absolute -inset-[1px] bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>

                <div className={`relative z-10 text-gray-400 group-hover:text-${color} transition-colors duration-300 transform group-hover:scale-110`}>
                    {React.cloneElement(icon, { className: "w-4 h-4" })}
                </div>
            </div>
            <div className="flex flex-col items-center gap-0.5">
                <span className="font-mono text-[8px] text-gray-500 group-hover:text-white uppercase tracking-wider transition-colors text-center px-1">
                    {name}
                </span>
            </div>
        </motion.div>
    );
};

const NodeGroup = ({ title, icon, items, index, color }) => {
    // Map of technology nodes with their sub-icons (if any) or generic
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            variants={containerVariants}
            custom={index}
            className="glass-card p-10 border-white/5 relative overflow-hidden space-y-10 gpu-accelerated"
        >
            <div className="flex items-center gap-4 border-l-2 border-white/5 pl-6">
                <div className={`p-3 rounded-lg bg-black/40 border border-${color}/10 text-${color} shadow-[0_0_20px_rgba(0,255,153,0.05)]`}>
                    {icon}
                </div>
                <div className="flex flex-col">
                    <h3 className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-white/90">{title}</h3>
                    <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mt-1">Classification_Level_{index + 1}</span>
                </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-8 justify-center lg:justify-start">
                {items.map((item) => {
                    // Internal mapping for sub-icons
                    const subIconMap = {
                        "Python": <Terminal />, "C#": <Code2 />, "SQL / NoSQL": <Database />, "Node.js": <Zap />,
                        "React": <Layout />, "Unity 3D": <Box />, "Tailwind CSS": <Wind />, "Motion Design": <Flame />,
                        "Firebase": <Flame />, "Supabase": <Database />, "Vercel": <Cloud />, "Vite": <Zap />,
                        "Groq (Llama 3)": <Brain />, "Tesseract OCR": <Search />, "Selenium": <MousePointer2 />
                    };
                    return <TechNode key={item} name={item} color={color} icon={subIconMap[item] || <Cpu />} />;
                })}
            </div>

            {/* Decorative background number */}
            <span className="absolute bottom-6 right-6 text-[70px] font-mono font-bold text-white/[0.02] pointer-events-none select-none leading-none hidden md:block">
                0{index + 1}
            </span>
        </motion.div>
    );
}

const TechStack = () => {
    const iconMap = {
        Cpu: <Cpu className="w-5 h-5" />,
        Brain: <Brain className="w-5 h-5" />,
        Layers: <Layers className="w-5 h-5" />,
        Globe: <Globe className="w-5 h-5" />
    };

    const categories = rawCategories.map(cat => ({
        ...cat,
        icon: iconMap[cat.icon] || <Cpu className="w-5 h-5" />
    }));

    return (
        <section id="tech-stack" className="py-20 md:py-32 relative overflow-hidden bg-dark-void">
            <div className="container mx-auto px-6">

                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={viewportConfig}
                    className="mb-16"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <span className="font-mono text-xs text-electric-green bg-electric-green/5 border border-electric-green/20 px-3 py-1 rounded">SYS_03</span>
                        <div className="h-[1px] w-20 bg-gradient-to-r from-electric-green/50 to-transparent"></div>
                    </div>
                    <h2 className="text-5xl font-bold font-mono tracking-tighter uppercase text-white">
                        Technical <br />
                        <span className="text-electric-green">Arsenal.</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {categories.map((cat, i) => (
                        <NodeGroup
                            key={cat.title}
                            title={cat.title}
                            icon={cat.icon}
                            items={cat.items}
                            index={i}
                            color={cat.color === 'electric-green' ? 'electric-green' : 'electric-cyan'}
                        />
                    ))}
                </div>

            </div>
        </section>
    );
};

export default TechStack;
