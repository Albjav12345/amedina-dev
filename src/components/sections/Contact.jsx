import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ExternalLink, Loader2, CheckCircle2, Github, Linkedin, Copy, Check, Twitter, MessageSquare, User, Send } from 'lucide-react';
import { fadeInUp, viewportConfig, scaleIn } from '../../utils/animations';
import portfolioData from '../../data/portfolio';
import { containWheelOnOverflow } from '../../utils/scrolling';
import { recordOpsRun } from '../../utils/opsTelemetry';

const initialFormState = {
    name: '',
    email: '',
    message: '',
    company: ''
};

const Contact = () => {
    const { contact } = portfolioData.ui;
    const { form, metadata, social, email } = contact;
    const [status, setStatus] = useState('idle');
    const [copied, setCopied] = useState(false);
    const [prefillSource, setPrefillSource] = useState('');
    const [formState, setFormState] = useState(initialFormState);

    const iconMap = {
        Github: <Github className="w-4 h-4 md:w-5 md:h-5" />,
        Linkedin: <Linkedin className="w-4 h-4 md:w-5 md:h-5" />,
        Twitter: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
        Upwork: (
            <svg viewBox="0 0 512 512" fill="currentColor" className="w-[1.5rem] h-[1.5rem] md:w-[1.85rem] md:h-[1.85rem]">
                <path d="M357.2,296.9c-17,0-33-7.2-47.4-18.9l3.5-16.6l0.1-.6c3.2-17.6,13.1-47.2,43.8-47.2c23,0,41.7,18.7,41.7,41.7S380.2,296.9,357.2,296.9L357.2,296.9z M357.2,171.4c-39.2,0-69.5,25.4-81.9,67.3c-18.8-28.3-33.1-62.2-41.4-90.8h-42.2v109.7c0,21.7-17.6,39.3-39.3,39.3s-39.3-17.6-39.3-39.3V147.8H71v109.7c0,44.9,36.5,81.8,81.4,81.8s81.4-36.9,81.4-81.8v-18.4c8.2,17.1,18.2,34.4,30.4,49.6l-25.8,121.4h43.1l18.7-88c16.4,10.5,35.2,17.1,56.8,17.1c46.2,0,83.8-37.8,83.8-84.1C440.9,209,403.4,171.4,357.2,171.4" />
            </svg>
        )
    };

    useEffect(() => {
        const handlePrefill = (event) => {
            const nextMessage = event.detail?.message;
            if (!nextMessage) return;

            setFormState(prev => ({ ...prev, message: nextMessage }));
            setPrefillSource(event.detail?.source || 'ARCHITECT_BRIEF');
        };

        window.addEventListener('prefill-contact', handlePrefill);
        return () => window.removeEventListener('prefill-contact', handlePrefill);
    }, []);

    const updateField = (field, value) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(email);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (status === 'sending' || formState.company) return;
        const startedAt = new Date().toISOString();
        const startedAtMs = Date.now();

        setStatus('sending');

        const formData = new FormData();
        formData.append('name', formState.name.trim());
        formData.append('email', formState.email.trim());
        formData.append('message', formState.message.trim());
        formData.append('_subject', 'Portfolio contact request');

        try {
            const response = await fetch('https://formspree.io/f/xreepwgw', {
                method: 'POST',
                body: formData,
                headers: {
                    Accept: 'application/json'
                }
            });

            if (!response.ok) {
                const payload = await response.json();
                throw new Error(payload?.errors?.[0]?.message || 'FORMSPREE_REQUEST_FAILED');
            }

            setStatus('success');
            setFormState(initialFormState);
            setPrefillSource('');
            recordOpsRun({
                channel: 'contact',
                title: 'Contact Relay Submission',
                status: 'success',
                startedAt,
                completedAt: new Date().toISOString(),
                latencyMs: Date.now() - startedAtMs,
                input: formState.message,
                output: 'Contact message accepted by the Formspree relay.',
                decision: 'External contact relay accepted payload',
                approval: 'Outbound contact request delivered',
                tools: ['Formspree Relay', 'Client Validation'],
                steps: [
                    { key: 'ingress', label: 'REQUEST ENTERS', detail: 'Contact form payload dispatched from the client.', state: 'complete', at: startedAt },
                    { key: 'validation', label: 'VALIDATION', detail: 'Required fields and honeypot guard passed.', state: 'complete', at: startedAt },
                    { key: 'response', label: 'RESPONSE', detail: 'Formspree accepted the transmission.', state: 'complete', at: new Date().toISOString() },
                ],
            });
            setTimeout(() => setStatus('idle'), 5000);
        } catch (error) {
            console.error('[ContactForm] Error:', error);
            setStatus('error');
            recordOpsRun({
                channel: 'contact',
                title: 'Contact Relay Submission',
                status: 'error',
                startedAt,
                completedAt: new Date().toISOString(),
                latencyMs: Date.now() - startedAtMs,
                input: formState.message,
                output: 'Contact submission failed before confirmation.',
                decision: error.message || 'Contact relay failure',
                approval: 'No confirmation returned from external relay',
                tools: ['Formspree Relay'],
                steps: [
                    { key: 'ingress', label: 'REQUEST ENTERS', detail: 'Contact form payload dispatched from the client.', state: 'complete', at: startedAt },
                    { key: 'validation', label: 'VALIDATION', detail: 'The external relay rejected or failed the submission.', state: 'error', at: new Date().toISOString() },
                ],
            });
            setTimeout(() => setStatus('idle'), 3500);
        }
    };

    return (
        <section id="contact" className="py-20 md:py-32 relative overflow-hidden px-0">
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] md:w-[1200px] md:h-[1200px] pointer-events-none opacity-40"
                style={{ background: 'radial-gradient(circle, rgba(0, 255, 153, 0.2) 0%, transparent 55%)' }}
            />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <motion.div initial="hidden" whileInView="visible" viewport={viewportConfig} variants={fadeInUp} className="space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left max-w-xl mx-auto lg:mx-0">
                        <div className="inline-block px-3 py-1 rounded-full bg-electric-green/10 border border-electric-green/20 text-electric-green text-[9px] md:text-[10px] font-mono uppercase tracking-[0.2em]">
                            {contact.label}
                        </div>

                        <h2 className="text-4xl md:text-6xl font-bold font-mono tracking-tighter uppercase leading-tight text-white">
                            {contact.titleLine1} <br />
                            <span className="text-electric-green">{contact.titleLine2}</span>
                        </h2>

                        <p className="text-gray-300 font-medium max-w-md leading-relaxed">
                            {contact.description}
                        </p>

                        <div className="w-full space-y-6 pt-4 flex flex-col items-center lg:items-start">
                            <div className="flex flex-col items-center lg:items-start gap-2">
                                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-gray-400">{contact.endpointLabel}</span>
                                <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl group/email relative hover:border-electric-green/30 transition-all">
                                    <span className="text-sm md:text-lg font-mono font-bold text-white tracking-tight">{email}</span>
                                    <button onClick={handleCopy} className="p-1.5 rounded-lg bg-white/5 hover:bg-electric-green/20 text-gray-300 hover:text-electric-green transition-colors" title="Copy to clipboard">
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                {social.map((item, index) => (
                                    <a key={index} href={item.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:border-electric-green/50 hover:bg-electric-green/5 flex items-center justify-center transition-all group" title={item.name}>
                                        <div className="group-hover:scale-110 transition-transform">
                                            {iconMap[item.icon] || <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />}
                                        </div>
                                    </a>
                                ))}
                            </div>

                            {prefillSource && (
                                <div className="inline-flex items-center gap-2 rounded-full border border-electric-cyan/20 bg-electric-cyan/10 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-electric-cyan">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Brief_Loaded: {prefillSource}
                                </div>
                            )}
                        </div>

                        <div className="w-full pt-8 flex flex-wrap justify-center lg:justify-start gap-8 md:gap-12 border-t border-white/5 opacity-40">
                            {metadata.map((item, index) => (
                                <div key={index} className="flex flex-col gap-1 items-center lg:items-start">
                                    <span className="text-[9px] font-mono uppercase tracking-widest text-gray-400">{item.label}</span>
                                    <span className="text-[10px] font-mono text-white">
                                        {status === 'sending' && item.activeValue ? item.activeValue : item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div initial="hidden" whileInView="visible" viewport={viewportConfig} variants={scaleIn} className="glass-card p-6 md:p-10 border-white/10 relative bg-gradient-to-br from-white/[0.05] to-transparent gpu-accelerated lg:max-w-lg w-full">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <input
                                type="text"
                                value={formState.company}
                                onChange={(event) => updateField('company', event.target.value)}
                                tabIndex="-1"
                                autoComplete="off"
                                className="hidden"
                                aria-hidden="true"
                            />

                            <div className="space-y-4">
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-mono uppercase tracking-widest text-gray-400 group-focus-within:text-electric-green transition-colors flex items-center gap-2">
                                        <User className="w-3 h-3" /> {form.name.label}
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={formState.name}
                                        onChange={(event) => updateField('name', event.target.value)}
                                        placeholder={form.name.placeholder}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-electric-green/50 focus:bg-white/[0.08] transition-all font-mono text-sm"
                                    />
                                </div>

                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-mono uppercase tracking-widest text-gray-400 group-focus-within:text-electric-cyan transition-colors flex items-center gap-2">
                                        <Mail className="w-3 h-3" /> {form.email.label}
                                    </label>
                                    <input
                                        required
                                        type="email"
                                        value={formState.email}
                                        onChange={(event) => updateField('email', event.target.value)}
                                        placeholder={form.email.placeholder}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-electric-cyan/50 focus:bg-white/[0.08] transition-all font-mono text-sm"
                                    />
                                </div>

                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-mono uppercase tracking-widest text-gray-400 group-focus-within:text-electric-green transition-colors flex items-center gap-2">
                                        <MessageSquare className="w-3 h-3" /> {form.message.label}
                                    </label>
                                    <div className="rounded-xl border border-white/10 bg-white/5 pr-1.5 overflow-hidden transition-all focus-within:border-electric-green/50 focus-within:bg-white/[0.08]">
                                        <textarea
                                            required
                                            rows="6"
                                            value={formState.message}
                                            onChange={(event) => updateField('message', event.target.value)}
                                            onWheelCapture={containWheelOnOverflow}
                                            placeholder={form.message.placeholder}
                                            className="block w-full panel-scrollbar bg-transparent border-0 px-6 pt-6 pb-5 pr-9 text-white placeholder:text-gray-500 focus:outline-none transition-all font-mono text-sm leading-[1.7] resize-none overflow-y-auto"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={status !== 'idle' && status !== 'error'} className={`w-full relative group px-6 py-4 overflow-hidden rounded-xl font-mono font-bold uppercase tracking-widest transition-all ${status === 'success' ? 'bg-green-500 text-white cursor-default' : status === 'error' ? 'bg-red-500 text-white cursor-pointer' : status === 'sending' ? 'cursor-wait bg-electric-green/90 text-dark-void' : 'bg-electric-green text-dark-void hover:scale-[1.01] active:scale-[0.99] cursor-pointer'}`}>
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

                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-shimmer pointer-events-none"></div>
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export { Contact };
