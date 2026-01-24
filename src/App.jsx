import React, { useEffect, Suspense } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import Lenis from 'lenis'

// Eagerly loaded critical components for instant LCP/FCP
import Hero from './components/sections/Hero'
import Navbar from './components/layout/Navbar'
import ReactiveBackground from './components/common/ReactiveBackground'

// Lazy loaded below-the-fold components
const About = React.lazy(() => import('./components/sections/About'))
const FeaturedProjects = React.lazy(() => import('./components/sections/FeaturedProjects'))
const TechStack = React.lazy(() => import('./components/sections/TechStack'))
const Contact = React.lazy(() => import('./components/sections/Contact'))
const Footer = React.lazy(() => import('./components/layout/Footer'))

function App() {
    useEffect(() => {
        // Force scroll to top on mount to ensure Terminal animation is visible & layout stability
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
            <ReactiveBackground />
            <Navbar />
            <main>
                <Hero /> {/* Instant Paint */}
                <Suspense fallback={<div className="min-h-screen bg-dark-void" />}>
                    <About />
                    <FeaturedProjects />
                    <TechStack />
                    <Contact />
                </Suspense>
            </main>
            <Suspense fallback={<div className="h-40 bg-dark-void" />}>
                <Footer />
            </Suspense>
            <Analytics />
            <SpeedInsights />
        </div>
    )
}

export default App
