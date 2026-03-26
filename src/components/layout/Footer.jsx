import React from 'react';
import portfolioData from '../../data/portfolio';

const Footer = ({ onOpenControlPanel }) => {
    const { footer } = portfolioData.ui;
    const { name } = portfolioData.profile;

    return (
        <footer className="py-12 border-t border-white/5 bg-dark-high/50">
            <div className="container mx-auto px-10 md:px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={onOpenControlPanel}
                            className="flex items-center gap-3 rounded-full border border-electric-green/20 bg-electric-green/10 px-3 py-1.5 transition-colors hover:border-electric-cyan/30 hover:bg-electric-cyan/10 cursor-pointer"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric-green opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-electric-green"></span>
                            </span>
                            <span className="font-mono text-[10px] tracking-widest text-electric-green uppercase">
                                {footer.status}
                            </span>
                        </button>
                        <p className="mt-1 whitespace-nowrap text-[10px] text-gray-300 md:text-xs">
                            &copy; {new Date().getFullYear()} Engineered by <span className="text-white">{footer.name || name}</span>.
                        </p>
                    </div>

                    <div className="flex gap-4 md:gap-6 font-mono text-[10px] text-gray-300 whitespace-nowrap">
                        <div className="flex flex-col items-center md:items-end">
                            <span className="text-gray-400">LOCATION</span>
                            <span>{footer.location}</span>
                        </div>
                        <div className="flex flex-col items-center md:items-end">
                            <span className="text-gray-400">VESSEL_ID</span>
                            <span>{footer.vesselId}</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export { Footer };
