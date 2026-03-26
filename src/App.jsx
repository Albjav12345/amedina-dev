import React, { useEffect, Suspense, useRef, useState } from 'react'

// Eagerly loaded critical components for instant LCP/FCP
import Hero from './components/sections/Hero'
import Navbar from './components/layout/Navbar'
import ParallaxGrid from './components/common/ParallaxGrid'

// Safe Lazy Loading for Named Exports
// Pattern: React.lazy(() => import('path').then(module => ({ default: module.ComponentByName })))



const About = React.lazy(() =>
    import('./components/sections/About').then(module => ({ default: module.About }))
)

const FeaturedProjects = React.lazy(() =>
    import('./components/sections/FeaturedProjects').then(module => ({ default: module.FeaturedProjects }))
)

const TechStack = React.lazy(() =>
    import('./components/sections/TechStack').then(module => ({ default: module.TechStack }))
)

const Contact = React.lazy(() =>
    import('./components/sections/Contact').then(module => ({ default: module.Contact }))
)

const ProjectArchitect = React.lazy(() =>
    import('./components/sections/ProjectArchitect').then(module => ({ default: module.ProjectArchitect }))
)

const ControlPlane = React.lazy(() =>
    import('./components/sections/ControlPlane').then(module => ({ default: module.ControlPlane }))
)

const Footer = React.lazy(() =>
    import('./components/layout/Footer').then(module => ({ default: module.Footer }))
)


function App() {
    const [isControlOpen, setIsControlOpen] = useState(false);
    const [AnalyticsComponent, setAnalyticsComponent] = useState(null);
    const [SpeedInsightsComponent, setSpeedInsightsComponent] = useState(null);
    const lenisRef = useRef(null);
    const lenisRafRef = useRef(null);
    const isControlOpenRef = useRef(false);

    useEffect(() => {
        // Force scroll to top on mount (refresh)
        window.scrollTo(0, 0);

        // Detect iOS devices (iPhone, iPad, iPod) including iPads masquerading as desktop
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
            || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

        if (isIOS) {
            // iOS: Force native hardware-accelerated scroll
            document.documentElement.style.overflowY = 'auto';
            document.documentElement.style.webkitOverflowScrolling = 'touch';
            window.lenis = null; // Ensure lenis is not available
            return undefined;
        }

        let cancelled = false;
        let loadListener = null;
        let idleId = null;
        let timeoutId = null;

        const initLenis = async () => {
            const { default: Lenis } = await import('lenis');
            if (cancelled) return;

            const lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                orientation: 'vertical',
                gestureOrientation: 'vertical',
                smoothWheel: true,
                wheelMultiplier: 1,
                smoothTouch: false,
                touchMultiplier: 2,
                infinite: false,
            });

            lenisRef.current = lenis;
            window.lenis = lenis;

            const raf = (time) => {
                if (lenisRef.current && !isControlOpenRef.current) {
                    lenisRef.current.raf(time);
                }
                lenisRafRef.current = requestAnimationFrame(raf);
            };

            lenisRafRef.current = requestAnimationFrame(raf);
        };

        const scheduleLenis = () => {
            if (cancelled) return;

            if ('requestIdleCallback' in window) {
                idleId = window.requestIdleCallback(() => {
                    idleId = null;
                    void initLenis();
                }, { timeout: 1200 });
                return;
            }

            timeoutId = window.setTimeout(() => {
                timeoutId = null;
                void initLenis();
            }, 250);
        };

        if (document.readyState === 'complete') {
            scheduleLenis();
        } else {
            loadListener = () => {
                loadListener = null;
                scheduleLenis();
            };
            window.addEventListener('load', loadListener, { once: true });
        }

        return () => {
            cancelled = true;

            if (loadListener) {
                window.removeEventListener('load', loadListener);
            }

            if (idleId !== null && 'cancelIdleCallback' in window) {
                window.cancelIdleCallback(idleId);
            }

            if (timeoutId !== null) {
                clearTimeout(timeoutId);
            }

            if (lenisRafRef.current) {
                cancelAnimationFrame(lenisRafRef.current);
            }

            lenisRef.current?.destroy();
            lenisRef.current = null;
            window.lenis = null;
        };
    }, [])

    useEffect(() => {
        let cancelled = false;
        let loadListener = null;
        let idleId = null;
        let timeoutId = null;

        const loadTelemetry = async () => {
            const [{ Analytics }, { SpeedInsights }] = await Promise.all([
                import('@vercel/analytics/react'),
                import('@vercel/speed-insights/react'),
            ]);

            if (cancelled) return;

            setAnalyticsComponent(() => Analytics);
            setSpeedInsightsComponent(() => SpeedInsights);
        };

        const scheduleTelemetry = () => {
            if (cancelled) return;

            if ('requestIdleCallback' in window) {
                idleId = window.requestIdleCallback(() => {
                    idleId = null;
                    void loadTelemetry();
                }, { timeout: 2200 });
                return;
            }

            timeoutId = window.setTimeout(() => {
                timeoutId = null;
                void loadTelemetry();
            }, 1200);
        };

        if (document.readyState === 'complete') {
            scheduleTelemetry();
        } else {
            loadListener = () => {
                loadListener = null;
                scheduleTelemetry();
            };
            window.addEventListener('load', loadListener, { once: true });
        }

        return () => {
            cancelled = true;

            if (loadListener) {
                window.removeEventListener('load', loadListener);
            }

            if (idleId !== null && 'cancelIdleCallback' in window) {
                window.cancelIdleCallback(idleId);
            }

            if (timeoutId !== null) {
                clearTimeout(timeoutId);
            }
        };
    }, []);

    useEffect(() => {
        isControlOpenRef.current = isControlOpen;

        if (!lenisRef.current) return;

        if (isControlOpen) {
            lenisRef.current.stop?.();
        } else {
            lenisRef.current.start?.();
        }
    }, [isControlOpen]);

    useEffect(() => {
        const openPanel = () => setIsControlOpen(true);
        const closePanel = () => setIsControlOpen(false);

        window.addEventListener('open-control-panel', openPanel);
        window.addEventListener('close-control-panel', closePanel);

        return () => {
            window.removeEventListener('open-control-panel', openPanel);
            window.removeEventListener('close-control-panel', closePanel);
        };
    }, []);

    return (
        <div className="min-h-screen selection:bg-electric-green selection:text-dark-void overflow-x-hidden">


            <ParallaxGrid isFrozen={isControlOpen} />
            <Navbar />
            <main>
                <Hero isUiFrozen={isControlOpen} />

                {/* wrapper renders IMMEDIATELY -> Document has height -> Scroll is restored */}
                <div id="about-wrapper" style={{ minHeight: '80vh' }}>
                    <Suspense fallback={null}>
                        <About isUiFrozen={isControlOpen} />
                    </Suspense>
                </div>

                <div id="projects-wrapper" style={{ minHeight: '100vh' }}>
                    <Suspense fallback={null}>
                        <FeaturedProjects />
                    </Suspense>
                </div>

                <div id="tech-stack-wrapper" style={{ minHeight: '60vh' }}>
                    <Suspense fallback={null}>
                        <TechStack />
                    </Suspense>
                </div>

                <div id="architect-wrapper" style={{ minHeight: '70vh' }}>
                    <Suspense fallback={null}>
                        <ProjectArchitect />
                    </Suspense>
                </div>

                <div id="contact-wrapper" style={{ minHeight: '50vh' }}>
                    <Suspense fallback={null}>
                        <Contact />
                    </Suspense>
                </div>
            </main>
            <Suspense fallback={null}>
                <Footer onOpenControlPanel={() => setIsControlOpen(true)} />
            </Suspense>
            <Suspense fallback={null}>
                <ControlPlane
                    isOpen={isControlOpen}
                    onOpen={() => setIsControlOpen(true)}
                    onClose={() => setIsControlOpen(false)}
                />
            </Suspense>
            {AnalyticsComponent ? <AnalyticsComponent /> : null}
            {SpeedInsightsComponent ? <SpeedInsightsComponent /> : null}
        </div>
    )
}

export default App
