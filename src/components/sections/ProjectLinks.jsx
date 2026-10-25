import React from 'react';
import { Github, ArrowUpRight } from 'lucide-react';
import { siItchdotio, siUnity } from 'simple-icons';

function StoreIcon({ icon }) {
    return <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0" aria-hidden="true"><path d={icon.path} /></svg>;
}

export default function ProjectLinks({ project }) {
    return (
        <div className="project-links pt-8 mt-auto flex flex-wrap gap-3">
            {project.githubLink && (
                <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="btn-system inline-flex min-h-12 items-center justify-center gap-3 px-6 py-3">
                    <Github className="h-5 w-5" aria-hidden="true" />
                    <span>Access repo</span>
                </a>
            )}
            {project.itchLink && (
                <a href={project.itchLink} target="_blank" rel="noopener noreferrer" className="project-store-link project-store-link--active">
                    <StoreIcon icon={siItchdotio} />
                    <span>Get it on itch.io</span>
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
            )}
            {project.assetStoreLink ? (
                <a href={project.assetStoreLink} target="_blank" rel="noopener noreferrer" className="project-store-link">
                    <StoreIcon icon={siUnity} />
                    <span>Unity Asset Store</span>
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
            ) : project.assetStoreComingSoon && (
                <button type="button" disabled className="project-store-link project-store-link--soon">
                    <StoreIcon icon={siUnity} />
                    <span className="text-left">Unity Asset Store<span className="block mt-1 text-[9px] uppercase tracking-widest text-gray-500">Coming soon</span></span>
                </button>
            )}
        </div>
    );
}
