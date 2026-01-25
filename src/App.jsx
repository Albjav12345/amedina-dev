import React, { useEffect, Suspense } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import Lenis from 'lenis'

// Eagerly loaded critical components for instant LCP/FCP
import Hero from './components/sections/Hero'
import Navbar from './components/layout/Navbar'

// Safe Lazy Loading for Named Exports
// Pattern: React.lazy(() => import('path').then(module => ({ default: module.ComponentByName })))

const ReactiveBackground = React.lazy(() =>
    import('./components/common/ReactiveBackground').then(module => ({ default: module.ReactiveBackground }))
)

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

const Footer = React.lazy(() =>
    import('./components/layout/Footer').then(module => ({ default: module.Footer }))
)


function App() {
    useEffect(() => {
        // Force scroll to top on mount (refresh)
        window.scrollTo(0, 0);

        // Detect iOS devices (iPhone, iPad, iPod) including iPads masquerading as desktop
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
            || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

        // ONLY initialize Lenis on Non-iOS devices (Desktop, Android)
        if (!isIOS) {
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
            })

            window.lenis = lenis;

            function raf(time) {
                lenis.raf(time)
                requestAnimationFrame(raf)
            }

            requestAnimationFrame(raf)

            return () => {
                lenis.destroy()
                window.lenis = null;
            }
        } else {
            // iOS: Force native hardware-accelerated scroll
            document.documentElement.style.overflowY = 'auto';
            document.documentElement.style.webkitOverflowScrolling = 'touch';
            window.lenis = null; // Ensure lenis is not available
        }
    }, [])

    return (
        <div className="bg-dark-void min-h-screen selection:bg-electric-green selection:text-dark-void overflow-x-hidden">
            <Suspense fallback={null}>
                <ReactiveBackground />
            </Suspense>
            <Navbar />
            <main>
                <Hero />

                {/* wrapper renders IMMEDIATELY -> Document has height -> Scroll is restored */}
                <div id="about-wrapper" style={{ minHeight: '80vh' }}>
                    <Suspense fallback={null}>
                        <About />
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

                <div id="contact-wrapper" style={{ minHeight: '50vh' }}>
                    <Suspense fallback={null}>
                        <Contact />
                    </Suspense>
                </div>
            </main>
            <Suspense fallback={null}>
                <Footer />
            </Suspense>
            <Analytics />
            <SpeedInsights />
        </div>
    )
}

export default App
