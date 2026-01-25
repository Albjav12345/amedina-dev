import React, { useEffect, Suspense } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import Lenis from 'lenis'

// Components
import Hero from './components/sections/Hero'
import Navbar from './components/layout/Navbar'
import About from './components/sections/About'
import FeaturedProjects from './components/sections/FeaturedProjects'
import TechStack from './components/sections/TechStack'
import Contact from './components/sections/Contact'
import Footer from './components/layout/Footer'

// Keep Background Lazy to unblock initial paint if possible, or revert if causing issues. 
// User instruction said "Keep: You can keep ReactiveBackground as lazy/suspense IF it works".
// I will keep it lazy for now as it wasn't reported as missing, but checking imports.
const ReactiveBackground = React.lazy(() => import('./components/common/ReactiveBackground'))

function App() {
    useEffect(() => {
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
                <About />
                <FeaturedProjects />
                <TechStack />
                <Contact />
            </main>
            <Footer />
            <Analytics />
            <SpeedInsights />
        </div>
    )
}

export default App
