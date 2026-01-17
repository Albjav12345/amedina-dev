/**
 * Standardized Framer Motion animations for the Engineered UI.
 * Focuses on high-performance, physics-based transitions and strict inheritance.
 */

export const viewportConfig = {
    once: true,
    amount: 0.2, // Slightly lower threshold for faster response
    margin: "-100px" // More robust margin for smooth scrolling
};

// Orchestrator for staggered groups
export const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2
        }
    }
};

// Item variant for staggered children
export const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut"
        }
    }
};

// Legacy support / Single item variants
export const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut"
        }
    },
};

export const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    },
};
