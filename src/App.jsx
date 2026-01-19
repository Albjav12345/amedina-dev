import React, { useEffect } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import Lenis from 'lenis'
import Hero from './components/sections/Hero'
import About from './components/sections/About'
import FeaturedProjects from './components/sections/FeaturedProjects'
import TechStack from './components/sections/TechStack'
import Contact from './components/sections/Contact'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ReactiveBackground from './components/common/ReactiveBackground'

function App() {
    useEffect(() => {
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
        }
    }, [])

    return (
        <div className="bg-dark-void min-h-screen selection:bg-electric-green selection:text-dark-void">
            <ReactiveBackground />
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
