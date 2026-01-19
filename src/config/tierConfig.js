export const TIER_CONFIG = {
    1: { // 🥔 POTATO
        name: "Potato",
        emoji: "🥔",
        particles: 0, // Disable ReactiveBackground entirely
        enableBlur: false,
        enableVideos: false, // SmartThumbnail shows static image only
        enableParticleLines: false,
        enableLayoutAnimations: false, // No Framer layoutId
        enableScanLines: false,
        modalAnimation: "instant", // Open instantly, no spring
        cardAnimation: "fade", // Simple opacity fade
        spring: { type: "tween", duration: 0.15, ease: "linear" },
        glassClass: "bg-dark-high", // Solid background
    },
    2: { // 📱 LOW
        name: "Low",
        emoji: "📱",
        particles: 15,
        enableBlur: false,
        enableVideos: false, // Still no videos
        enableParticleLines: false,
        enableLayoutAnimations: false,
        enableScanLines: false,
        modalAnimation: "tween",
        cardAnimation: "slide",
        spring: { type: "tween", duration: 0.25, ease: "circOut" },
        glassClass: "bg-dark-high/95",
    },
    3: { // 💼 MID
        name: "Mid",
        emoji: "💼",
        particles: 50,
        enableBlur: true, // iOS only (checked in component)
        enableVideos: true, // Videos enabled
        enableParticleLines: false, // Still too expensive
        enableLayoutAnimations: false, // Layout projection still heavy
        enableScanLines: true,
        modalAnimation: "spring-simple",
        cardAnimation: "slide",
        spring: { type: "spring", stiffness: 200, damping: 25 },
        glassClass: "backdrop-blur-md bg-dark-high/80",
    },
    4: { // 🚀 HIGH
        name: "High",
        emoji: "🚀",
        particles: 100,
        enableBlur: true,
        enableVideos: true,
        enableParticleLines: true,
        enableLayoutAnimations: true, // Full Framer layoutId
        enableScanLines: true,
        modalAnimation: "spring-full",
        cardAnimation: "spring",
        spring: { type: "spring", stiffness: 350, damping: 30 },
        glassClass: "backdrop-blur-xl bg-dark-high/80",
    },
    5: { // 💎 ULTRA
        name: "Ultra",
        emoji: "💎",
        particles: 200,
        enableBlur: true,
        enableVideos: true,
        enableParticleLines: true,
        enableLayoutAnimations: true,
        enableScanLines: true,
        enableHoverEffects: true, // Extra effects
        modalAnimation: "spring-enhanced",
        cardAnimation: "spring",
        spring: { type: "spring", stiffness: 450, damping: 25 },
        glassClass: "backdrop-blur-2xl bg-dark-high/70",
    }
};
