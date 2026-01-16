import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ExternalLink, Cpu, Loader2, CheckCircle2 } from 'lucide-react';

const Contact = () => {
    const [status, setStatus] = useState('idle'); // idle, sending, success

    const handleTransmission = (e) => {
        if (status !== 'idle') return;

        // Prevent immediate mailto to show animation
        e.preventDefault();
        setStatus('sending');

        setTimeout(() => {
            setStatus('success');
            setTimeout(() => {
                setStatus('idle');
                // Optional: actually trigger the mailto after animation
                // window.location.href = "mailto:contact@example.com";
            }, 3000);
        }, 2000);
    };

    return (
        <section id="contact" className="py-32 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-electric-green/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto glass-card p-12 lg:p-20 border-white/5 relative bg-gradient-to-b from-white/[0.03] to-transparent text-center">

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.2, margin: "0px 0px -100px 0px" }}
                        className="space-y-8"
                    >
                        <div className="inline-block px-3 py-1 rounded-full bg-electric-green/10 border border-electric-green/20 text-electric-green text-[10px] font-mono uppercase tracking-[0.2em]">
                            Signal Transmission Ready
                        </div>

                        <h2 className="text-4xl md:text-6xl font-bold font-mono tracking-tighter uppercase leading-tight">
                            LET’S BUILD <br />
                            <span className="text-electric-green">SOMETHING EFFICIENT.</span>
                        </h2>

                        <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">
                            Whether you need a complex automation architecture, a high-performance AI pipeline, or a high-fidelity interface, I'm ready to interface.
                        </p>

                        <div className="flex flex-wrap justify-center gap-6 pt-8">
                            <button
                                onClick={handleTransmission}
                                className={`group relative px-8 py-4 ${status === 'success' ? 'bg-green-500' : 'bg-electric-green'} text-dark-void font-mono font-bold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3 overflow-hidden min-w-[240px] justify-center`}
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
                                            INIT_COMMUNICATION
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
                                            TRANSMITTING...
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
                                            SIGNAL_SENT
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

                            <a
                                href="https://upwork.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group px-8 py-4 border border-white/10 hover:border-electric-green/50 hover:bg-electric-green/5 text-white font-mono font-bold rounded-lg transition-all flex items-center gap-3"
                            >
                                VIEW_UPWORK_PROFILE
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>

                        {/* Technical Meta info below buttons */}
                        <div className="pt-16 flex justify-center gap-12 border-t border-white/5 opacity-40 grayscale group">
                            <div className="flex flex-col gap-1 items-center">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Latency</span>
                                <span className="text-xs font-mono text-white">
                                    {status === 'sending' ? 'SIGNAL_CALC...' : '< 24H_RESP'}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1 items-center">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Encryption</span>
                                <span className="text-xs font-mono text-white">TLS_1.3_AUTH</span>
                            </div>
                            <div className="flex flex-col gap-1 items-center">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Uptime</span>
                                <span className="text-xs font-mono text-white">99.99%_AVAIL</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
