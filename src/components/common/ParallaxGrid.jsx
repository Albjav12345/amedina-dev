import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const ParallaxGrid = () => {
    const { scrollY } = useScroll();

    // Infinite Parallax Logic:
    // 1. We move the grid UP as we scroll down (negative Y) to create depth.
    // 2. To prevent the div from running out, we use modulo % 50 (the grid size).
    // 3. This snaps the position back to 0 every 50px, creating an illusion of infinite scrolling.
    // 4. We start at -50 to have a buffer.
    const y = useTransform(scrollY, v => -((v * 0.15) % 50));

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-dark-void">
            {/* Layer 1: Infinite Moving Grid */}
            <motion.div
                style={{ y }}
                className="absolute -top-[50px] -left-[50px] w-[calc(100%+100px)] h-[calc(100vh+100px)] gpu-accelerated"
            >
                <div
                    className="w-full h-full"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(0, 255, 153, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0, 255, 153, 0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '50px 50px',
                        backgroundRepeat: 'repeat'
                    }}
                />
            </motion.div>

            {/* Layer 2: Static Vignette (Does not move) */}
            <div
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at 50% 50%, transparent 40%, #0b0c10 100%)'
                }}
            />
        </div>
    );
};

export default ParallaxGrid;
