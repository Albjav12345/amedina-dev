import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Brain, Layers, Globe } from 'lucide-react';
import { fadeInUp, viewportConfig, scaleIn, containerVariants } from '../../utils/animations';

const TechNode = ({ name, icon, index, color = "electric-green" }) => {
    return (
        <motion.div
            variants={scaleIn}
            whileHover={{ y: -5, scale: 1.05 }}
            className="group relative flex flex-col items-center gap-2 gpu-accelerated"
        >
            <div className={`w-14 h-14 rounded-lg glass-card flex items-center justify-center border-white/10 group-hover:border-${color}/50 transition-all duration-300 relative overflow-hidden bg-white/[0.03]`}>
                <div className={`absolute inset-0 bg-${color}/5 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                {/* Placeholder for Icon - using name if icon not provided */}
                <span className={`text-[10px] font-mono font-bold text-gray-500 group-hover:text-${color} transition-colors uppercase`}>
                    {name.substring(0, 3)}
                </span>
            </div>
            <span className="font-mono text-[9px] text-gray-500 group-hover:text-white uppercase tracking-tighter transition-colors">
                {name}
            </span>
        </motion.div>
    );
};

const NodeGroup = ({ title, icon, items, index, color }) => {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            variants={fadeInUp}
            className="glass-card p-8 border-white/5 relative overflow-hidden space-y-8 gpu-accelerated"
        >
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className={`p-2 rounded bg-${color}/10 text-${color}`}>
                    {icon}
                </div>
                <h3 className="font-mono text-sm font-bold uppercase tracking-widest">{title}</h3>
            </div>

            <motion.div
                variants={containerVariants}
                className="flex flex-wrap gap-4 justify-center md:justify-start"
            >
                {items.map((item, i) => (
                    <TechNode key={item} name={item} index={i} color={color} />
                ))}
            </motion.div>

            {/* Decorative background number */}
            <span className="absolute bottom-4 right-4 text-6xl font-mono font-bold opacity-[0.02] pointer-events-none select-none">
                0{index + 1}
            </span>
        </motion.div>
    );
}

const TechStack = () => {
    const categories = [
        {
            title: "Core Automation Engine",
            icon: <Cpu className="w-5 h-5" />,
            color: "electric-green",
            items: ["Python", "C#", "SQL / NoSQL", "Node.js", "Multithreading", "API Design"]
        },
        {
            title: "AI & Computer Vision",
            icon: <Brain className="w-5 h-5" />,
            color: "electric-cyan",
            items: ["Groq (Llama 3)", "Tesseract OCR", "Selenium", "Data Processing", "Inference"]
        },
        {
            title: "Visual & Interface Systems",
            icon: <Layers className="w-5 h-5" />,
            color: "electric-green",
            items: ["React", "Unity 3D", "Tailwind CSS", "Motion Design", "HLSL Shaders"]
        },
        {
            title: "Infrastructure & Tools",
            icon: <Globe className="w-5 h-5" />,
            color: "electric-cyan",
            items: ["Firebase", "Supabase", "Git / GitHub", "Vercel", "Vite", "Postman"]
        }
    ];

    return (
        <section id="tech-stack" className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-6">

                {/* Section Header */}
                <div className="mb-16">
                    <div className="flex items-center gap-4 mb-4">
                        <span className="font-mono text-xs text-secondary bg-white/5 px-2 py-1 rounded">SYS_03</span>
                        <div className="h-px flex-grow bg-gradient-to-r from-white/10 to-transparent"></div>
                    </div>
                    <h2 className="text-4xl font-bold font-mono tracking-tighter uppercase">Technical Arsenal.</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
