/**
 * Standardized Framer Motion animations for the Engineered UI.
 * Focuses on high-performance, physics-based transitions.
 */

export const viewportConfig = {
    once: true,
    amount: 0.3, // Triggers when 30% of the element is visible
};

export const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1]
        }
    },
};

export const staggerContainer = {
    initial: {},
    whileInView: {
        transition: {
            staggerChildren: 0.1,
        }
    }
};

export const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    whileInView: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1]
        }
    },
};

export const slideInLeft = {
    initial: { opacity: 0, x: -40 },
    whileInView: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1]
        }
    },
};
