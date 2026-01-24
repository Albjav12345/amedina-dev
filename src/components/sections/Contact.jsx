import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ExternalLink, Loader2, CheckCircle2, Github, Linkedin, Copy, Check, Twitter, MessageSquare, User, Send } from 'lucide-react';
import { fadeInUp, viewportConfig, scaleIn } from '../../utils/animations';
import portfolioData from '../../data/portfolio';

const Contact = () => {
    const { contact } = portfolioData.ui;
    const { form, metadata, social, email } = contact;
    const [status, setStatus] = useState('idle'); // idle, sending, success, error
    const [copied, setCopied] = useState(false);

    const iconMap = {
        Github: <Github className="w-4 h-4 md:w-5 md:h-5" />,
        Linkedin: <Linkedin className="w-4 h-4 md:w-5 md:h-5" />,
        Twitter: <Twitter className="w-4 h-4 md:w-5 md:h-5" />
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (status === 'sending') return;

        setStatus('sending');

        const formData = new FormData(e.target);

        try {
            // Updated with user's real Formspree ID: xreepwgw
            const response = await fetch("https://formspree.io/f/xreepwgw", {
                method: "POST",
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                console.log("[Formspree] Success: Message sent correctly.");
                setStatus('success');
                e.target.reset();
                setTimeout(() => setStatus('idle'), 5000);
            } else {
                const errorData = await response.json();
                console.error("[Formspree] Error Status:", response.status);
                console.error("[Formspree] Error Details:", errorData);
                setStatus('error');
                setTimeout(() => setStatus('idle'), 3000);
            }
        } catch (error) {
            console.error("[ContactForm] Critical Error:", error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return (
        <section id="contact" className="py-20 md:py-32 relative overflow-hidden px-0">
            {/* Background Decor - Standardized GPU-Friendly Glow */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] md:w-[1200px] md:h-[1200px] pointer-events-none opacity-40"
                style={{ background: "radial-gradient(circle, rgba(0, 255, 153, 0.2) 0%, transparent 50%)" }}
            />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* Left Side: Info & Socials */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportConfig}
                        variants={fadeInUp}
                        className="space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left max-w-xl mx-auto lg:mx-0"
                    >
                        <div className="inline-block px-3 py-1 rounded-full bg-electric-green/10 border border-electric-green/20 text-electric-green text-[9px] md:text-[10px] font-mono uppercase tracking-[0.2em]">
                            {contact.label}
                        </div>

                        <h2 className="text-4xl md:text-6xl font-bold font-mono tracking-tighter uppercase leading-tight text-white">
                            {contact.titleLine1} <br />
                            <span className="text-electric-green">{contact.titleLine2}</span>
                        </h2>

                        <p className="text-gray-400 font-medium max-w-md leading-relaxed">
                            {contact.description}
                        </p>

                        <div className="w-full space-y-6 pt-4 flex flex-col items-center lg:items-start">
                            <div className="flex flex-col items-center lg:items-start gap-2">
                                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-gray-500">{contact.endpointLabel}</span>
                                <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl group/email relative hover:border-electric-green/30 transition-all">
                                    <span className="text-sm md:text-lg font-mono font-bold text-white tracking-tight">{email}</span>
                                    <button
                                        onClick={handleCopy}
                                        className="p-1.5 rounded-lg bg-white/5 hover:bg-electric-green/20 text-gray-400 hover:text-electric-green transition-colors"
                                        title="Copy to clipboard"
                                    >
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                {social.map((s, i) => (
                                    <a
                                        key={i}
                                        href={s.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-electric-green/50 hover:bg-electric-green/5 flex items-center justify-center transition-all group"
                                        title={s.name}
                                    >
                                        <div className="group-hover:scale-110 transition-transform">
                                            {iconMap[s.icon] || <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />}
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="w-full pt-8 flex flex-wrap justify-center lg:justify-start gap-8 md:gap-12 border-t border-white/5 opacity-40">
                            {metadata.map((item, i) => (
                                <div key={i} className="flex flex-col gap-1 items-center lg:items-start">
                                    <span className="text-[9px] font-mono uppercase tracking-widest text-gray-500">{item.label}</span>
                                    <span className="text-[10px] font-mono text-white">
                                        {status === 'sending' && item.activeValue ? item.activeValue : item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Side: High-Fidelity Form */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportConfig}
                        variants={scaleIn}
                        className="glass-card p-6 md:p-10 border-white/10 relative bg-gradient-to-br from-white/[0.05] to-transparent gpu-accelerated lg:max-w-lg w-full"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                {/* Name Input */}
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-mono uppercase tracking-widest text-gray-500 group-focus-within:text-electric-green transition-colors flex items-center gap-2">
                                        <User className="w-3 h-3" /> {form.name.label}
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        name="name"
                                        placeholder={form.name.placeholder}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-electric-green/50 focus:bg-white/[0.08] transition-all font-mono text-sm"
                                    />
                                </div>

                                {/* Email Input */}
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-mono uppercase tracking-widest text-gray-500 group-focus-within:text-electric-cyan transition-colors flex items-center gap-2">
                                        <Mail className="w-3 h-3" /> {form.email.label}
                                    </label>
                                    <input
                                        required
                                        type="email"
                                        name="email"
                                        placeholder={form.email.placeholder}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-electric-cyan/50 focus:bg-white/[0.08] transition-all font-mono text-sm"
                                    />
                                </div>

                                {/* Message Input */}
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-mono uppercase tracking-widest text-gray-500 group-focus-within:text-electric-green transition-colors flex items-center gap-2">
                                        <MessageSquare className="w-3 h-3" /> {form.message.label}
                                    </label>
                                    <textarea
                                        required
                                        name="message"
                                        rows="5"
                                        placeholder={form.message.placeholder}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-electric-green/50 focus:bg-white/[0.08] transition-all font-mono text-sm resize-none"
                                    ></textarea>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={status !== 'idle' && status !== 'error'}
                                className={`w-full relative group px-6 py-4 overflow-hidden rounded-xl font-mono font-bold uppercase tracking-widest transition-all
                                    ${status === 'success' ? 'bg-green-500 text-white cursor-default' :
                                        status === 'error' ? 'bg-red-500 text-white cursor-pointer' :
                                            status === 'sending' ? 'cursor-wait' :
                                                'bg-electric-green text-dark-void hover:scale-[1.01] active:scale-[0.99] cursor-pointer'}
                                `}
                            >
                                <div className="relative z-10 flex items-center justify-center gap-3">
                                    <AnimatePresence mode="wait">
                                        {status === 'idle' && (
                                            <motion.div key="idle" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="flex items-center gap-2">
                                                <span>{form.submit.idle}</span>
                                                <Send className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                            </motion.div>
                                        )}
                                        {status === 'sending' && (
                                            <motion.div key="sending" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>{form.submit.sending}</span>
                                            </motion.div>
                                        )}
                                        {status === 'success' && (
                                            <motion.div key="success" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>{form.submit.success}</span>
                                            </motion.div>
                                        )}
                                        {status === 'error' && (
                                            <motion.div key="error" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="flex items-center gap-2">
                                                <span>{form.submit.error}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Animated background effect for submit button */}
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-shimmer pointer-events-none"></div>
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
