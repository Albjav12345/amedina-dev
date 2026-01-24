import React, { useEffect, Suspense, lazy } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import Lenis from 'lenis'
import Hero from './components/sections/Hero'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ReactiveBackground from './components/common/ReactiveBackground'

// Lazy Load Heavy Sections to optimize Initial Load (LCP)
const About = lazy(() => import('./components/sections/About'))
const FeaturedProjects = lazy(() => import('./components/sections/FeaturedProjects'))
const TechStack = lazy(() => import('./components/sections/TechStack'))
const Contact = lazy(() => import('./components/sections/Contact'))

function App() {
    useEffect(() => {
        // Check if device is strictly a Mobile/Tablet OS (Android/iOS) or iPad masquerading as Desktop
        const isMobileOS = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPad Pro check

        // Only initialize Lenis on Desktop (including touch laptops)
        if (!isMobileOS) {
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
        }
    }, [])

    return (
        <div className="bg-dark-void min-h-screen selection:bg-electric-green selection:text-dark-void overflow-x-hidden">
            <ReactiveBackground />
            <Navbar />
            <main>
                <Hero />
                {/* Defer loading of below-fold content */}
                <Suspense fallback={<div className="h-screen w-full bg-dark-void"></div>}>
                    <About />
                    <FeaturedProjects />
                    <TechStack />
                    <Contact />
                </Suspense>
            </main>
            <Footer />
            <Analytics />
            <SpeedInsights />
        </div>
    )
}

export default App
