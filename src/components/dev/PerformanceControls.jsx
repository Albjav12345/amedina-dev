import React from 'react';
import { usePerformance } from '../../context/PerformanceContext';
import { TIER_CONFIG } from '../../config/tierConfig';

const PerformanceControls = () => {
    const {
        tier,
        fps,
        manualOverride,
        setManualOverride,
        detectedTier,
        config,
        isWatchdogActive,
        setWatchdogActive
    } = usePerformance();

    // Hide in production
    if (import.meta.env.PROD) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[9999] bg-black/90 backdrop-blur-sm border border-electric-green/30 rounded-lg p-4 font-mono text-xs text-white shadow-2xl max-w-xs">
            {/* Header */}
            <div className="mb-3 border-b border-white/10 pb-2">
                <div className="text-electric-green font-bold mb-1 flex items-center gap-2">
                    ⚡ PERFORMANCE MONITOR
                </div>
            </div>

            {/* Metrics */}
            <div className="space-y-1.5 mb-3">
                <div className="flex justify-between gap-4">
                    <span className="text-gray-400">FPS:</span>
                    <span className={`font-bold ${fps < 30 ? 'text-red-500' :
                            fps < 55 ? 'text-yellow-500' :
                                'text-green-500'
                        }`}>
                        {fps}
                    </span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-gray-400">Detected:</span>
                    <span className="text-gray-300">
                        {detectedTier} {TIER_CONFIG[detectedTier].emoji} {TIER_CONFIG[detectedTier].name}
                    </span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-gray-400">Active:</span>
                    <span className="text-electric-green font-bold">
                        {tier} {config.emoji} {config.name}
                    </span>
                </div>
            </div>

            {/* Manual Override Controls */}
            <div className="border-t border-white/10 pt-3">
                <div className="text-gray-400 mb-2 text-[10px] uppercase tracking-wider">Manual Override:</div>
                <div className="grid grid-cols-5 gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(t => (
                        <button
                            key={t}
                            onClick={() => setManualOverride(t)}
                            className={`px-2 py-1.5 rounded text-[10px] transition-all font-bold ${manualOverride === t
                                    ? 'bg-electric-green text-black shadow-lg'
                                    : 'bg-white/10 hover:bg-white/20 text-white'
                                }`}
                            title={TIER_CONFIG[t].name}
                        >
                            {TIER_CONFIG[t].emoji}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setManualOverride(null)}
                    className="w-full px-2 py-1.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-[10px] transition-all font-medium"
                >
                    🔄 Reset to Auto
                </button>
            </div>

            {/* Watchdog Toggle */}
            <div className="border-t border-white/10 pt-3 mt-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={isWatchdogActive}
                        onChange={(e) => setWatchdogActive(e.target.checked)}
                        className="w-3 h-3 accent-electric-green"
                    />
                    <span className="text-[10px] text-gray-300">
                        {isWatchdogActive ? '🟢' : '🔴'} FPS Watchdog
                    </span>
                </label>
                {manualOverride !== null && (
                    <div className="mt-2 text-[9px] text-yellow-500/80">
                        ⚠️ Watchdog disabled (manual mode)
                    </div>
                )}
            </div>

            {/* Feature Flags Display */}
            <div className="border-t border-white/10 pt-3 mt-3">
                <div className="text-gray-400 mb-1.5 text-[10px] uppercase tracking-wider">Active Features:</div>
                <div className="grid grid-cols-2 gap-1 text-[9px]">
                    <div className={config.particles > 0 ? 'text-green-500' : 'text-red-500'}>
                        {config.particles > 0 ? '✓' : '✗'} Particles ({config.particles})
                    </div>
                    <div className={config.enableBlur ? 'text-green-500' : 'text-red-500'}>
                        {config.enableBlur ? '✓' : '✗'} Blur
                    </div>
                    <div className={config.enableVideos ? 'text-green-500' : 'text-red-500'}>
                        {config.enableVideos ? '✓' : '✗'} Videos
                    </div>
                    <div className={config.enableLayoutAnimations ? 'text-green-500' : 'text-red-500'}>
                        {config.enableLayoutAnimations ? '✓' : '✗'} Layout Anim
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceControls;
