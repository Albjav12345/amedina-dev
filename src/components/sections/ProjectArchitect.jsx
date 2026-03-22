import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Brain, CheckCircle2, ChevronDown, Copy, Loader2, Send, Shield, Sparkles, WandSparkles } from 'lucide-react';
import { fadeInUp, scaleIn, viewportConfig } from '../../utils/animations';
import { useHardwareQuality } from '../../hooks/useHardwareQuality';
import portfolioData from '../../data/portfolio';
import { containWheelOnOverflow } from '../../utils/scrolling';

const projectTypes = [['web-platform', 'Web Platform', 'Client apps, SaaS, portals, and productized services.'], ['ai-agent', 'AI Agent', 'LLM systems with tools, retrieval, or approval loops.'], ['automation-system', 'Automation System', 'Pipelines, sync engines, and repetitive workflow automation.'], ['internal-tool', 'Internal Tool', 'Ops panels, admin systems, and internal workflows.'], ['creative-interface', 'Creative Interface', 'Visually distinctive interactive experiences and launches.']];
const userScopes = [['solo-team', 'Solo Team', 'For founders, freelancers, or very small operators.'], ['department', 'Department', 'For one internal business unit with shared workflows.'], ['public-users', 'Public Users', 'For external end users where UX and clarity matter most.'], ['clients', 'Client Portal', 'For B2B collaboration, approvals, and delivery visibility.'], ['mixed', 'Mixed Audience', 'For systems serving internal teams and external users.']];
const timelines = [['asap', 'ASAP', 'Best when speed matters most and scope must stay very tight.'], ['month', 'Within 30 Days', 'Strong fit for an MVP or focused first phase.'], ['quarter', 'This Quarter', 'Best when you want stronger architecture and more iteration room.'], ['flexible', 'Flexible', 'Use this when quality matters more than calendar pressure.']];
const complexities = [['focused-mvp', 'Focused MVP', 'One high-value workflow first.'], ['production-build', 'Production Build', 'A polished launch-ready system.'], ['multi-system', 'Multi-System Rollout', 'A wider platform with several moving parts.']];

const examples = [
    { id: 'sales', name: 'Sales Inbox AI', summary: 'Classify inbound leads, draft replies, and route urgent opportunities.', values: { brief: 'We need an internal AI inbox that receives incoming sales and partnership emails, classifies urgency, drafts first-pass replies, and routes high-value leads to the correct person. The interface should be clean, fast, and easy for our team to supervise.', projectType: 'ai-agent', userScope: 'department', timeline: 'month', complexity: 'production-build', constraints: 'There must be a human approval step before any external reply is sent.' } },
    { id: 'portal', name: 'Client Portal', summary: 'Requests, approvals, status tracking, and cleaner communication.', values: { brief: 'We want a premium client portal where customers can submit requests, track delivery status, approve milestones, and centralize project communication. It should feel polished and reduce the current email chaos.', projectType: 'web-platform', userScope: 'clients', timeline: 'quarter', complexity: 'production-build', constraints: 'The first release must support role-based access and leave room for billing or reporting later.' } },
    { id: 'ops', name: 'Ops Automation', summary: 'Capture requests, apply rules, sync systems, and report exceptions.', values: { brief: 'We need an automation system that captures requests from multiple channels, normalizes them, applies business rules, updates our operational tools, and reports exceptions to the team. The main objective is reducing repetitive manual work without losing visibility.', projectType: 'automation-system', userScope: 'mixed', timeline: 'quarter', complexity: 'multi-system', constraints: 'The system must be auditable, reliable, and designed to surface failures instead of hiding them.' } },
    { id: 'launch', name: 'Premium Launch', summary: 'A distinctive visual launch site with strong conversion intent.', values: { brief: 'We need a highly polished launch website for a premium digital product. It should feel distinctive, fast, and visually memorable while guiding visitors into a clear conversion path.', projectType: 'creative-interface', userScope: 'public-users', timeline: 'month', complexity: 'focused-mvp', constraints: 'The design has to stand out immediately, feel expensive, and still load well across mobile and desktop.' } }
];

const initialState = { brief: '', projectType: 'web-platform', userScope: 'mixed', timeline: 'flexible', complexity: 'production-build', constraints: '' };

const stackMap = { 'web-platform': ['React', 'Node.js', 'PostgreSQL', 'Vercel'], 'ai-agent': ['React', 'Python', 'Groq / LLM', 'Supabase'], 'automation-system': ['Python', 'Node.js', 'APIs', 'Queue Workers'], 'internal-tool': ['React', 'Firebase', 'Role-Based Access', 'Analytics'], 'creative-interface': ['React', 'Framer Motion', 'Canvas / WebGL', 'Vite'] };
const architectureMap = { 'web-platform': [['Experience Layer', 'A premium responsive frontend that keeps the main workflow frictionless.'], ['Application Core', 'Business logic, validation rules, and state orchestration live here.'], ['Data Layer', 'Structured models support reporting, permissions, and future automation.'], ['Integration Layer', 'External services connect without tightly coupling them to the UI.']], 'ai-agent': [['Operator Interface', 'Users launch requests, inspect outputs, and approve sensitive actions.'], ['Agent Runtime', 'Prompting, tool routing, guardrails, and execution logic stay contained.'], ['Knowledge & Memory', 'Context and documents remain useful across sessions.'], ['Human Review Layer', 'High-impact outputs pass through approval checkpoints.']], 'automation-system': [['Input Capture', 'Triggers arrive from forms, inboxes, webhooks, or schedules.'], ['Processing Engine', 'Payloads are normalized, routed, and executed deterministically.'], ['Exception Handling', 'Failures and retries stay visible instead of disappearing.'], ['Reporting Layer', 'Throughput, savings, and bottlenecks remain measurable.']], 'internal-tool': [['Ops Dashboard', 'A clear internal interface for approvals and visibility.'], ['Permissions Layer', 'Role-aware access control keeps the system safe as usage grows.'], ['Business Logic', 'Workflow rules stay centralized and consistent.'], ['Operational Data', 'History and records support auditability and optimization.']], 'creative-interface': [['Immersive Frontend', 'High-fidelity motion creates a distinctive first impression.'], ['Interaction Engine', 'Animation timing and transitions make the interface feel premium.'], ['Content Control', 'Structured content remains editable without redesigning the whole surface.'], ['Performance Layer', 'Progressive enhancement preserves polish on desktop and mobile.']] };

function fallbackBrief(formState) {
    const title = projectTypes.find(([v]) => v === formState.projectType)?.[1] || 'Project System';
    return {
        briefId: `ARCH-LOCAL-${Date.now().toString(36).toUpperCase()}`,
        solutionFit: formState.projectType === 'ai-agent' || formState.projectType === 'automation-system' ? 'High' : 'Strong',
        headline: `${title} Architecture Brief`,
        summary: `This looks like a ${title.toLowerCase()} where the first release should stay tightly centered on one valuable workflow. The safest approach is to keep the user experience premium while isolating integrations, approvals, and future automation into explicit layers.`,
        recommendedStack: stackMap[formState.projectType] || stackMap['web-platform'],
        architecture: (architectureMap[formState.projectType] || architectureMap['web-platform']).map(([titleText, detail]) => ({ title: titleText, detail })),
        deliveryPlan: [{ phase: 'Discovery & Scope Lock', detail: 'Turn the brief into exact workflows, permissions, and integration boundaries.', duration: formState.timeline === 'asap' ? '2-3 days' : '1 week' }, { phase: 'Core Build', detail: 'Ship the primary interface, core logic, and minimum integrations for the first live workflow.', duration: formState.complexity === 'focused-mvp' ? '1-2 weeks' : '2-4 weeks' }, { phase: 'Hardening & QA', detail: 'Validate edge cases, tighten permissions, and prepare analytics and operational monitoring.', duration: '4-7 days' }],
        quickWins: ['Define one primary user journey and optimize the first release around that path.', 'Instrument the product from the start so performance and conversion are measurable.', 'Keep the first release smaller than the long-term vision.'],
        risks: ['If integrations are added too early, delivery slows and stability drops.', 'Timeline pressure should narrow scope rather than weaken architecture.', formState.constraints ? `Constraint to respect from day one: ${formState.constraints}` : 'Key constraints should be confirmed early so architecture choices are not blind.'],
        aiOpportunities: ['Use AI for summarization, triage, drafting, or classification only where it saves repetitive effort.', 'Keep human approval for outputs that affect clients, revenue, or external communication.', 'Log outcomes so the AI layer can be improved safely over time.'],
        nextStep: 'Turn this outline into a scoped execution plan with exact integrations, approval rules, and launch milestones.'
    };
}

function formatBrief(result, formState) {
    return [`[AI Project Architect] ${result.briefId}`, '', 'Original brief:', formState.brief, '', 'Summary:', result.summary, '', `Recommended stack: ${result.recommendedStack.join(', ')}`, '', 'Architecture:', ...result.architecture.map(item => `- ${item.title}: ${item.detail}`), '', 'Delivery plan:', ...result.deliveryPlan.map(item => `- ${item.phase} (${item.duration}): ${item.detail}`), '', `Next step: ${result.nextStep}`].join('\n');
}

function SelectField({ label, value, options, helper, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const active = options.find(([v]) => v === value) || options[0];

    useEffect(() => {
        const close = (event) => {
            if (!ref.current?.contains(event.target)) setOpen(false);
        };
        window.addEventListener('mousedown', close);
        return () => window.removeEventListener('mousedown', close);
    }, []);

    return (
        <div ref={ref} className="space-y-2 relative">
            <label className="text-[10px] font-mono uppercase tracking-[0.22em] text-gray-500">{label}</label>
            <button type="button" onClick={() => setOpen(prev => !prev)} className={`w-full rounded-xl border px-4 py-3.5 text-left font-mono text-sm flex items-center justify-between gap-4 transition-all cursor-pointer ${open ? 'border-electric-green/50 bg-electric-green/[0.08] text-white' : 'border-white/10 bg-white/5 text-white hover:border-electric-cyan/35 hover:bg-white/[0.07]'}`}>
                <span className="truncate">{active[1]}</span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180 text-electric-green' : 'text-gray-500'}`} />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.18 }} className="absolute left-0 right-0 top-full z-30 mt-2 rounded-2xl border border-white/10 bg-[#0d0e12] shadow-[0_24px_60px_rgba(0,0,0,0.55)] overflow-hidden">
                        <div className="p-2">
                            {options.map(([optionValue, optionLabel, optionDescription]) => {
                                const isActive = optionValue === value;
                                return (
                                    <button key={optionValue} type="button" onClick={() => { onChange(optionValue); setOpen(false); }} className={`w-full rounded-xl px-4 py-3 text-left transition-colors cursor-pointer ${isActive ? 'bg-electric-green/10 border border-electric-green/20' : 'border border-transparent hover:bg-white/[0.05]'}`}>
                                        <div className={`font-mono text-sm ${isActive ? 'text-electric-green' : 'text-white'}`}>{optionLabel}</div>
                                        <div className="mt-1 text-xs leading-relaxed text-gray-500">{optionDescription}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <p className="text-[11px] leading-relaxed text-gray-500 min-h-[2rem]">{helper}</p>
        </div>
    );
}

const ProjectArchitect = () => {
    const quality = useHardwareQuality();
    const { architect } = portfolioData.ui.sections;
    const [formState, setFormState] = useState(initialState);
    const [result, setResult] = useState(null);
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [showExamples, setShowExamples] = useState(false);

    const updateField = (field, value) => setFormState(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (status === 'loading') return;
        setStatus('loading');
        setError('');
        try {
            const response = await fetch('/api/architect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formState) });
            const raw = await response.text();
            const payload = raw ? JSON.parse(raw) : null;
            if (!response.ok) throw new Error(payload?.message || 'ARCHITECT_REQUEST_FAILED');
            setResult(payload);
            setStatus('success');
        } catch {
            setResult(fallbackBrief(formState));
            setStatus('success');
        }
    };

    const handleCopy = async () => {
        if (!result) return;
        try {
            await navigator.clipboard.writeText(formatBrief(result, formState));
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {}
    };

    const handleSendToContact = () => {
        if (!result) return;
        window.dispatchEvent(new CustomEvent('prefill-contact', { detail: { source: result.briefId, message: formatBrief(result, formState) } }));
        const target = document.getElementById('contact');
        if (!target) return;
        if (window.lenis) window.lenis.scrollTo(target, { offset: -50, duration: 1.4 });
        else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <section id="architect" className="py-20 md:py-32 lg:pb-40 relative overflow-visible render-optimize">
            {!quality.simplePhysics && <div className="absolute top-[20%] right-0 w-[600px] h-[600px] md:w-[1000px] md:h-[1000px] pointer-events-none opacity-40 translate-x-1/2" style={{ background: 'radial-gradient(circle, rgba(0, 255, 153, 0.13) 0%, transparent 70%)' }} />}
            <div className="container mx-auto px-6 relative z-10">
                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={viewportConfig} className="mb-16">
                    <div className="flex items-center gap-4 mb-4"><span className="font-mono text-xs text-electric-green bg-electric-green/10 border border-electric-green/20 px-2 py-1 rounded">{architect.id}</span><div className="h-px flex-grow bg-gradient-to-r from-electric-green/30 to-transparent"></div></div>
                    <h2 className="text-5xl font-bold font-mono tracking-tighter uppercase text-white">{architect.line1} <br /><span className="text-electric-green">{architect.line2}</span></h2>
                </motion.div>

                <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-8 items-stretch">
                    <motion.div initial="hidden" whileInView="visible" viewport={viewportConfig} variants={fadeInUp} className={`rounded-2xl border border-white/10 p-8 md:p-10 h-full ${quality.glassClass}`}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-cyan/10 border border-electric-cyan/20 text-electric-cyan text-[10px] font-mono uppercase tracking-[0.22em]"><WandSparkles className="w-3 h-3" />AI_PreSales_Mode</div>
                        <div className="mt-8 space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">Turn a raw idea into a build-ready technical brief.</h3>
                                <p className="text-gray-400 text-lg leading-relaxed max-w-2xl">Share the goal, operating constraints, and delivery context. The architect returns a concrete outline with stack, architecture, phases, risks, and next step.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{[['Structured Intake', 'Discovery Flow'], ['Architecture Brief', 'Output'], ['Pre-Sales Qualified', 'Use Case']].map(([value, label]) => <div key={label} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-5"><div className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">{label}</div><div className="mt-3 text-sm font-semibold text-white">{value}</div></div>)}</div>
                            <div className="rounded-2xl border border-white/10 bg-black/30 p-6"><div className="font-mono text-[10px] uppercase tracking-[0.22em] text-electric-green">Decision_Guide</div><div className="mt-3 text-xl font-semibold text-white">Use the right selectors to sharpen the architecture, not to make the idea sound bigger.</div><div className="mt-4 space-y-3 text-sm text-gray-400 leading-relaxed"><p>Pick the first release you can actually ship, the real audience it must serve, and the timeline pressure you truly have.</p><p>The more honest this intake is, the more useful the generated brief becomes for scoping, pricing, and deciding what to build first.</p></div></div>
                            <div className="rounded-2xl border border-white/10 bg-black/30 p-6"><div className="font-mono text-[10px] uppercase tracking-[0.22em] text-electric-green">Context_Layer</div><div className="mt-3 text-xl font-semibold text-white">Aligned with your live showcase.</div><p className="mt-2 text-sm text-gray-400 leading-relaxed">The generator uses your {portfolioData.meta.showcasedProjectsCount} showcased systems as reference context, so the output stays close to the kind of engineering work you actually want to sell.</p></div>
                        </div>
                    </motion.div>

                    <motion.div initial="hidden" whileInView="visible" viewport={viewportConfig} variants={scaleIn} className={`rounded-2xl border border-white/10 p-6 md:p-8 h-full flex flex-col ${quality.glassClass}`}>
                        <div className="flex items-center justify-between gap-4 mb-6"><div><div className="font-mono text-[10px] uppercase tracking-[0.22em] text-electric-green">Intake_Interface</div><h3 className="mt-2 text-2xl font-bold text-white">Project intake</h3></div><button type="button" onClick={() => setShowExamples(prev => !prev)} className="px-4 py-2 rounded-lg border border-white/10 bg-white/[0.04] hover:border-electric-cyan/40 hover:bg-electric-cyan/10 text-xs font-mono uppercase tracking-[0.18em] text-gray-300 transition-colors cursor-pointer">Load Example</button></div>

                        <AnimatePresence>
                            {showExamples && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.18 }} className="mb-5 rounded-2xl border border-white/10 bg-black/35 p-3">
                                    <div className="px-2 pt-1 pb-3"><div className="font-mono text-[10px] uppercase tracking-[0.22em] text-electric-cyan">Preset_Examples</div><p className="mt-2 text-sm text-gray-400">Choose one of these prebuilt examples to understand how the intake behaves across different project types.</p></div>
                                    <div className="grid grid-cols-1 gap-3">{examples.map(example => <button key={example.id} type="button" onClick={() => { setFormState(example.values); setShowExamples(false); setError(''); }} className="w-full rounded-xl border border-white/10 bg-white/[0.03] hover:border-electric-green/35 hover:bg-electric-green/[0.06] text-left px-4 py-4 transition-colors cursor-pointer"><div className="flex items-center justify-between gap-4"><div><div className="text-sm font-semibold text-white">{example.name}</div><div className="mt-1 text-xs leading-relaxed text-gray-500">{example.summary}</div></div><ArrowRight className="w-4 h-4 text-electric-green shrink-0" /></div></button>)}</div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2"><label className="text-[10px] font-mono uppercase tracking-[0.22em] text-gray-500">Mission_Brief</label><div className="rounded-xl border border-white/10 bg-white/5 pr-1.5 overflow-hidden transition-all focus-within:border-electric-green/50 focus-within:bg-white/[0.08]"><textarea required rows="6" value={formState.brief} onChange={(event) => updateField('brief', event.target.value)} onWheelCapture={containWheelOnOverflow} placeholder="Describe the system you want to build, who it serves, the workflow it must support, and the result you care about." className="block w-full panel-scrollbar bg-transparent border-0 px-6 pt-6 pb-5 pr-9 text-white placeholder:text-gray-600 focus:outline-none transition-all font-mono text-sm leading-[1.7] resize-none overflow-y-auto" /></div><p className="text-[11px] leading-relaxed text-gray-500">Write the business problem first, then the workflow, then the result that should improve.</p></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <SelectField label="Project_Type" value={formState.projectType} options={projectTypes} helper="Pick the closest system category so the architecture is grounded in the right product shape." onChange={(v) => updateField('projectType', v)} />
                                <SelectField label="Audience_Scope" value={formState.userScope} options={userScopes} helper="Choose who the first version mainly serves: internal team, clients, public users, or a mix." onChange={(v) => updateField('userScope', v)} />
                                <SelectField label="Timeline_Window" value={formState.timeline} options={timelines} helper="Use the real delivery pressure. Faster timelines usually mean narrower first releases." onChange={(v) => updateField('timeline', v)} />
                                <SelectField label="Delivery_Depth" value={formState.complexity} options={complexities} helper="Choose how ambitious phase one should be: MVP, production launch, or broader rollout." onChange={(v) => updateField('complexity', v)} />
                            </div>
                            <div className="space-y-2"><label className="text-[10px] font-mono uppercase tracking-[0.22em] text-gray-500">Constraints_Notes</label><div className="rounded-xl border border-white/10 bg-white/5 pr-1.5 overflow-hidden transition-all focus-within:border-electric-green/50 focus-within:bg-white/[0.08]"><textarea rows="3" value={formState.constraints} onChange={(event) => updateField('constraints', event.target.value)} onWheelCapture={containWheelOnOverflow} placeholder="Optional: compliance, integrations, delivery risks, team limitations, or non-negotiables." className="block w-full panel-scrollbar bg-transparent border-0 px-6 pt-6 pb-5 pr-9 text-white placeholder:text-gray-600 focus:outline-none transition-all font-mono text-sm leading-[1.7] resize-none overflow-y-auto" /></div><p className="text-[11px] leading-relaxed text-gray-500">Use this for hard constraints the architecture cannot ignore.</p></div>
                            <button type="submit" disabled={status === 'loading'} className="w-full relative group px-6 py-4 overflow-hidden rounded-xl font-mono font-bold uppercase tracking-widest transition-all bg-electric-green text-dark-void hover:scale-[1.01] active:scale-[0.99] disabled:cursor-wait disabled:opacity-80 cursor-pointer"><div className="relative z-10 flex items-center justify-center gap-3">{status === 'loading' ? <><Loader2 className="w-4 h-4 animate-spin" /><span>ANALYZING_SYSTEM</span></> : <><span>GENERATE_BRIEF</span><ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /></>}</div><div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-shimmer pointer-events-none"></div></button>
                            {error && <div className="min-h-[3.75rem] rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
                        </form>
                    </motion.div>
                </div>

                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }} transition={{ duration: 0.35 }} className="mt-10">
                            <div className={`rounded-2xl border border-white/10 p-6 md:p-8 ${quality.glassClass}`}>
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                                    <div className="space-y-4 max-w-3xl"><div className="flex flex-wrap items-center gap-3"><span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-green/10 border border-electric-green/20 text-electric-green text-[10px] font-mono uppercase tracking-[0.2em]"><Brain className="w-3 h-3" />{result.briefId}</span><span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-cyan/10 border border-electric-cyan/20 text-electric-cyan text-[10px] font-mono uppercase tracking-[0.2em]">Solution_Fit: {result.solutionFit}</span></div><h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{result.headline}</h3><p className="text-gray-400 text-base md:text-lg leading-relaxed">{result.summary}</p></div>
                                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:min-w-[220px]"><button type="button" onClick={handleCopy} className="btn-system inline-flex items-center justify-center gap-3 px-6 py-4 text-sm cursor-pointer">{copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? 'COPIED_BRIEF' : 'COPY_BRIEF'}</button><button type="button" onClick={handleSendToContact} className="px-6 py-4 rounded-xl bg-white/5 border border-white/10 hover:border-electric-cyan/40 hover:bg-electric-cyan/10 text-white font-mono text-sm uppercase tracking-[0.16em] transition-colors inline-flex items-center justify-center gap-3 cursor-pointer"><Send className="w-4 h-4 text-electric-cyan" />SEND_TO_CONTACT</button></div>
                                </div>
                                <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"><div className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-4">Recommended_Stack</div><div className="flex flex-wrap gap-2">{result.recommendedStack.map(item => <span key={item} className="px-3 py-1.5 bg-electric-green/10 border border-electric-green/20 rounded text-[10px] font-mono uppercase tracking-[0.16em] text-electric-green">{item}</span>)}</div><div className="mt-6 space-y-3">{result.architecture.map(item => <div key={item.title} className="rounded-xl border border-white/10 bg-black/20 p-4"><div className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric-green mb-2">{item.title}</div><p className="text-sm text-gray-300 leading-relaxed">{item.detail}</p></div>)}</div></div>
                                    <div className="space-y-6">
                                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"><div className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-4">Delivery_Plan</div><div className="space-y-4">{result.deliveryPlan.map(item => <div key={item.phase} className="rounded-xl border border-white/10 bg-black/20 p-4"><div className="flex items-center justify-between gap-3 mb-2"><div className="text-base font-semibold text-white">{item.phase}</div><div className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric-cyan">{item.duration}</div></div><p className="text-sm text-gray-300 leading-relaxed">{item.detail}</p></div>)}</div></div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"><div className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric-green mb-4">Quick_Wins</div><div className="space-y-3">{result.quickWins.map(item => <div key={item} className="text-sm text-gray-300 leading-relaxed">{item}</div>)}</div></div><div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"><div className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric-cyan mb-4">AI_Opportunities</div><div className="space-y-3">{result.aiOpportunities.map(item => <div key={item} className="text-sm text-gray-300 leading-relaxed flex gap-2"><Sparkles className="w-4 h-4 text-electric-cyan mt-0.5 shrink-0" /><span>{item}</span></div>)}</div></div></div>
                                    </div>
                                </div>
                                <div className="mt-6 grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-4"><div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"><div className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-4">Execution_Risks</div><div className="space-y-3">{result.risks.map(item => <div key={item} className="text-sm text-gray-300 leading-relaxed flex gap-2"><Shield className="w-4 h-4 text-electric-cyan mt-0.5 shrink-0" /><span>{item}</span></div>)}</div></div><div className="rounded-2xl border border-electric-green/20 bg-electric-green/10 px-5 py-4"><div className="font-mono text-[10px] uppercase tracking-[0.22em] text-electric-green mb-2">Next_Step</div><p className="text-sm md:text-base text-white leading-relaxed">{result.nextStep}</p></div></div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

export { ProjectArchitect };
