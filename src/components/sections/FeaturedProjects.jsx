import React from 'react';
import { motion } from 'framer-motion';
import { Code2, ArrowUpRight, Play, Terminal } from 'lucide-react';
import WorkflowDiagram from '../common/WorkflowDiagram';
import { projects } from '../../data/projects';

const ProjectCard = ({ project, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2, margin: "0px 0px -100px 0px" }}
            transition={{ delay: index * 0.1 }}
            className="md:col-span-6 lg:col-span-12 glass-card border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-0 flex flex-col lg:flex-row min-h-[400px]"
        >
            {/* Narrative Section */}
            <div className="flex-1 p-8 lg:p-12 space-y-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-gray-600">0{index + 1} // PROJECT_MANIFEST</span>
                        <div className="h-[1px] w-8 bg-white/10"></div>
                    </div>
                    <h3 className="text-3xl font-bold tracking-tighter text-white">{project.title}</h3>
                    <p className="text-electric-green font-mono text-xs uppercase tracking-widest">{project.subtitle}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest border-b border-white/5 block pb-1">Context_Problem</span>
                        <p className="text-sm text-gray-400 leading-relaxed font-medium">{project.problem}</p>
                    </div>
                    <div className="space-y-2">
                        <span className="text-[10px] font-mono text-electric-green/60 uppercase tracking-widest border-b border-white/5 block pb-1">Engineered_Solution</span>
                        <p className="text-sm text-gray-400 leading-relaxed font-medium">{project.solution}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest border-b border-white/5 block pb-1">System_Arch_Flow</span>
                    <WorkflowDiagram steps={project.workflow} />
                </div>

                <div className="pt-4 flex flex-wrap gap-3">
                    {project.stack.map(tech => (
                        <span key={tech} className="px-3 py-1 bg-white/5 border border-white/10 rounded-md font-mono text-[10px] text-gray-300">
                            {tech}
                        </span>
                    ))}
                </div>
            </div>

            {/* Terminal Media Section */}
            <div className="w-full lg:w-2/5 p-4 lg:p-8 bg-black/40 flex items-center justify-center relative overflow-hidden">
                {/* Decorative Grid Overlay for Media */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

                <div className="w-full h-full glass-card border-white/20 bg-dark-high relative overflow-hidden group/terminal aspect-video lg:aspect-square flex items-center justify-center">
                    {/* Terminal Header */}
                    <div className="absolute top-0 left-0 w-full h-6 bg-white/5 border-b border-white/10 flex items-center px-4 gap-1 z-10">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500/30"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/30"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500/30"></div>
                        <span className="ml-2 font-mono text-[8px] text-gray-500 uppercase tracking-widest flex items-center gap-1">
                            <Terminal className="w-2.5 h-2.5" />
                            live_demo_v2.01.bin
                        </span>
                    </div>

                    {/* Media Content */}
                    <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center group cursor-pointer">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-electric-green/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
                            <Play className="w-12 h-12 text-electric-green relative z-10 opacity-60 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100" />
                        </div>
                        <div className="mt-4 space-y-1 relative z-10">
                            <p className="font-mono text-[10px] text-electric-green uppercase tracking-widest font-bold">Initialize Visual Demo</p>
                            <p className="font-mono text-[8px] text-gray-500 uppercase">{project.id}_payload.{project.mediaType}</p>
                        </div>
                    </div>

                    {/* Scanning Line Effect */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-electric-green/10 shadow-[0_0_15px_rgba(0,255,153,0.5)] animate-scan pointer-events-none"></div>
                </div>

                {/* Technical Metadata Overlay */}
                <div className="absolute bottom-10 right-10 flex flex-col items-end gap-1 opacity-20">
                    <span className="font-mono text-[8px] text-white">CRC32: AX7822-B</span>
                    <span className="font-mono text-[8px] text-white">PKT_LOSS: 0.00%</span>
                </div>
            </div>
        </motion.div>
    );
};

const FeaturedProjects = () => {
    return (
        <section id="projects" className="py-32 relative">
            <div className="container mx-auto px-6">

                {/* Section Title */}
                <div className="flex flex-col mb-20">
                    <div className="flex items-center gap-4 mb-4">
                        <span className="font-mono text-xs text-electric-green bg-electric-green/10 border border-electric-green/20 px-2 py-1 rounded">SYS_02</span>
                        <div className="h-px w-20 bg-electric-green/30"></div>
                    </div>
                    <h2 className="text-5xl font-bold font-mono tracking-tighter uppercase leading-none">
                        Project <br />
                        <span className="text-electric-green">Ecosystems.</span>
                    </h2>
                </div>

                {/* Projects List (Bento-fied) */}
                <div className="grid grid-cols-1 gap-12">
                    {projects.map((project, index) => (
                        <ProjectCard key={project.id} project={project} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedProjects;
