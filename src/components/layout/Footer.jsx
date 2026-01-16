import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
    return (
        <footer className="py-12 border-t border-white/5 bg-dark-high/50">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric-green opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-electric-green"></span>
                            </span>
                            <span className="font-mono text-[10px] tracking-widest text-electric-green uppercase">
                                System Status: All Systems Operational
                            </span>
                        </div>
                        <p className="text-gray-500 text-xs mt-1">
                            © {new Date().getFullYear()} Designed & Engineered by <span className="text-white">Alberto Medina</span> (Albjav1235).
                        </p>
                    </div>

                    <div className="flex gap-6 font-mono text-[10px] text-gray-400">
                        <div className="flex flex-col items-end">
                            <span className="text-gray-600">LOCATION</span>
                            <span>SPAIN / REMOTE</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-gray-600">VESSEL_ID</span>
                            <span>AUTO_PORT_V2.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
