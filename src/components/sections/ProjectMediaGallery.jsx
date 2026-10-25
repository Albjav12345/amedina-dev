import React, { useState } from 'react';
import { ArrowUpRight, Play, Images } from 'lucide-react';

export default function ProjectMediaGallery({ project }) {
    const [selected, setSelected] = useState(0);
    const hasDemo = project.demoType === 'video' || project.demoType === 'youtube';
    const screenshots = project.gallery || [];
    const items = [
        ...(hasDemo ? [{ type: 'demo', label: 'Watch demo', src: project.media.poster }] : []),
        ...screenshots.map((shot) => ({ ...shot, type: 'image', label: shot.alt })),
    ];
    const active = items[selected];
    const isDemo = active?.type === 'demo';
    const image = active?.type === 'image' ? active : { src: project.media.poster || project.thumbnail, alt: `${project.title} preview` };

    return (
        <div className="min-w-0 space-y-3">
            <div className="flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-widest text-gray-500">
                <span className="inline-flex items-center gap-2">{isDemo ? <Play className="h-3 w-3" /> : <Images className="h-3 w-3" />}{isDemo ? 'Project demo' : 'Product gallery'}</span>
                {items.length > 1 && <span>{String(selected + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>}
            </div>
            <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl">
                {isDemo && project.demoType === 'youtube' ? (
                    <iframe
                        src={project.demoEmbedUrl}
                        title={`${project.title} demonstration`}
                        className="h-full w-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                    />
                ) : isDemo ? (
                    <video src={project.media.modalVideo} poster={project.media.poster} controls preload="metadata" playsInline className="h-full w-full object-cover object-top" />
                ) : (
                    <a href={image.src} target="_blank" rel="noopener noreferrer" className="group/media block h-full w-full" aria-label={`Open full-size image: ${image.alt}`}>
                        <img src={image.src} alt={image.alt} className="block h-full w-full object-cover object-top" />
                        <span className="absolute right-3 top-3 flex items-center gap-2 rounded-md border border-white/15 bg-black/75 px-2 py-1.5 text-[10px] text-white opacity-80 transition-opacity group-hover/media:opacity-100">Full size <ArrowUpRight className="h-3 w-3" /></span>
                    </a>
                )}
            </div>
            {items.length > 1 && (
                <>
                    <div className="flex gap-2 overflow-x-auto pb-1 panel-scrollbar" aria-label="Choose demo or screenshot">
                        {items.map((item, index) => (
                            <button
                                key={`${item.type}-${item.src}`}
                                type="button"
                                onClick={() => setSelected(index)}
                                aria-label={item.label}
                                aria-pressed={selected === index}
                                className={`relative h-12 w-[72px] shrink-0 cursor-pointer overflow-hidden rounded-md border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan ${selected === index ? 'border-electric-cyan' : 'border-transparent hover:border-white/40'}`}
                            >
                                <img src={item.src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover object-top" />
                                {item.type === 'demo' && <span className="absolute inset-0 flex items-center justify-center bg-black/45"><Play className="h-4 w-4 fill-white text-white" aria-hidden="true" /></span>}
                            </button>
                        ))}
                    </div>
                    <p className="min-h-4 text-xs leading-relaxed text-gray-400" aria-live="polite">{active?.label}</p>
                </>
            )}
        </div>
    );
}
