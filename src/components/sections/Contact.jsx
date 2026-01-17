import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ExternalLink, Cpu, Loader2, CheckCircle2, Github, Linkedin, Copy, Check } from 'lucide-react';
import { fadeInUp, viewportConfig, scaleIn } from '../../utils/animations';

const Contact = () => {
    const [status, setStatus] = useState('idle'); // idle, sending, success
    const [copied, setCopied] = useState(false);
    const email = "amedina.amg.dev@gmail.com";

    const handleCopy = () => {
        navigator.clipboard.writeText(email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleTransmission = (e) => {
        if (status !== 'idle') return;

        setStatus('sending');
        setTimeout(() => {
            setStatus('success');
            setTimeout(() => setStatus('idle'), 3000);
        }, 2000);
    };

    return (
        <section id="contact" className="py-32 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-electric-green/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto glass-card p-6 md:p-12 lg:p-20 border-white/5 relative bg-gradient-to-b from-white/[0.03] to-transparent text-center gpu-accelerated">

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportConfig}
                        variants={scaleIn}
                        className="space-y-8"
                    >
                        <div className="inline-block px-3 py-1 rounded-full bg-electric-green/10 border border-electric-green/20 text-electric-green text-[10px] font-mono uppercase tracking-[0.2em]">
                            Direct Communication Protocol
                        </div>

                        <h2 className="text-3xl md:text-6xl font-bold font-mono tracking-tighter uppercase leading-tight">
                            READY TO <br />
                            <span className="text-electric-green">INTERFACE.</span>
                        </h2>

                        <div className="py-10 space-y-6">
                            <div className="flex flex-col items-center gap-3">
                                <span className="text-[9px] md:text-[10px] font-mono uppercase tracking-[0.3em] text-gray-500">Primary_Endpoint</span>
                                <div className="flex items-center gap-2 md:gap-3 bg-white/5 border border-white/10 px-4 py-3 md:px-6 md:py-4 rounded-xl group/email relative hover:border-electric-green/30 w-full max-w-md md:max-w-none">
                                    <span className="text-sm md:text-2xl font-mono font-bold text-white tracking-tight break-all md:break-normal">{email}</span>
                                    <button
                                        onClick={handleCopy}
                                        className="p-1.5 md:p-2 rounded-lg bg-white/5 hover:bg-electric-green/20 text-gray-400 hover:text-electric-green flex-shrink-0"
                                        title="Copy to clipboard"
                                    >
                                        {copied ? <Check className="w-4 h-4 md:w-5 h-5" /> : <Copy className="w-4 h-4 md:w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-center gap-3 md:gap-6">
                                <a
                                    href="https://github.com/Albjav1235"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 md:p-4 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 flex items-center gap-2 font-mono text-[10px] md:text-xs uppercase"
                                >
                                    <Github className="w-4 h-4 md:w-5 md:h-5" />
                                    GitHub
                                </a>
                                <a
                                    href="#"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 md:p-4 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 flex items-center gap-2 font-mono text-[10px] md:text-xs uppercase"
                                >
                                    <Linkedin className="w-4 h-4 md:w-5 md:h-5" />
                                    LinkedIn
                                </a>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-4 md:gap-6 pt-4 md:pt-8">
                            <button
                                onClick={handleTransmission}
                                className={`group relative px-6 py-3 md:px-10 md:py-4 ${status === 'success' ? 'bg-green-500' : 'bg-electric-green'} text-dark-void font-mono font-bold rounded-lg hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 md:gap-3 overflow-hidden w-full md:min-w-[280px] md:w-auto justify-center`}
                            >
                                <AnimatePresence mode="wait">
                                    {status === 'idle' && (
                                        <motion.div
                                            key="idle"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="flex items-center gap-2"
                                        >
                                            INIT_SECURE_TRANSMISSION
                                            <Mail className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                        </motion.div>
                                    )}
                                    {status === 'sending' && (
                                        <motion.div
                                            key="sending"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="flex items-center gap-2"
                                        >
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            TRANSMITTING_DATA...
                                        </motion.div>
                                    )}
                                    {status === 'success' && (
                                        <motion.div
                                            key="success"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="flex items-center gap-2"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            SIGNAL_RECEIVED
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {status === 'sending' && (
                                    <motion.div
                                        className="absolute bottom-0 left-0 h-1 bg-white/30"
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 2 }}
                                    />
                                )}
                            </button>
                        </div>

                        {/* Technical Meta info below buttons */}
                        <div className="pt-8 md:pt-16 grid grid-cols-2 md:flex justify-center gap-6 md:gap-12 border-t border-white/5 opacity-40 grayscale group">
                            <div className="flex flex-col gap-1 items-center">
                                <span className="text-[8px] md:text-[10px] font-mono uppercase tracking-widest text-gray-500">Latency</span>
                                <span className="text-[10px] md:text-xs font-mono text-white">
                                    {status === 'sending' ? 'SIGNAL_CALC...' : '< 24H_RESP'}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1 items-center">
                                <span className="text-[8px] md:text-[10px] font-mono uppercase tracking-widest text-gray-500">Encryption</span>
                                <span className="text-[10px] md:text-xs font-mono text-white">TLS_1.3</span>
                            </div>
                            <div className="flex flex-col gap-1 items-center md:flex-shrink-0">
                                <span className="text-[8px] md:text-[10px] font-mono uppercase tracking-widest text-gray-500">Uptime</span>
                                <span className="text-[10px] md:text-xs font-mono text-white">99.9%_AVAIL</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
