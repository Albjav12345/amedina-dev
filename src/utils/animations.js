/**
 * Standardized Framer Motion animations for the Engineered UI.
 * Performance Optimized: Uses simple triggers and manual stagger support.
 */

export const viewportConfig = {
    once: true,
    amount: 0.2, // Robust threshold
    margin: "0px" // Fail-safe margin for smooth scrolling
};

export const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    }
};

export const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: "easeOut"
        }
    }
};
