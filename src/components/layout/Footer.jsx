import React from 'react';
import { motion } from 'framer-motion';
import portfolioData from '../../data/portfolio';

const Footer = () => {
    const { footer } = portfolioData.ui;
    const { name } = portfolioData.profile;

    return (
        <footer className="py-12 border-t border-white/5 bg-dark-high/50">
            <div className="container mx-auto px-10 md:px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric-green opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-electric-green"></span>
                            </span>
                            <span className="font-mono text-[10px] tracking-widest text-electric-green uppercase">
                                {footer.status}
                            </span>
                        </div>
                        <p className="text-gray-400 text-[8px] md:text-xs mt-1 whitespace-nowrap">
                            © {new Date().getFullYear()} Engineered by <span className="text-white">{name}</span>.
                        </p>
                    </div>

                    <div className="flex gap-4 md:gap-6 font-mono text-[8px] md:text-[10px] text-gray-400 whitespace-nowrap">
                        <div className="flex flex-col items-center md:items-end">
                            <span className="text-gray-500">LOCATION</span>
                            <span>{footer.location}</span>
                        </div>
                        <div className="flex flex-col items-center md:items-end">
                            <span className="text-gray-500">VESSEL_ID</span>
                            <span>{footer.vesselId}</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
