import React from 'react'
import ReactDOM from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import App from './App'
import { HardwareQualityProvider } from './hooks/useHardwareQuality'
import './styles/global.css'

const CvStudio = React.lazy(() => import('./components/cv/CvStudio'))
const isCvStudioRoute = window.location.pathname.replace(/\/+$/, '') === '/cv-studio'

// Keep browser restoration manual so the SPA can restore the intended section route itself.
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

ReactDOM.createRoot(document.getElementById('app')).render(
    <React.StrictMode>
        <MotionConfig reducedMotion="user">
            <HardwareQualityProvider>
                {isCvStudioRoute ? (
                    <React.Suspense fallback={null}>
                        <CvStudio />
                    </React.Suspense>
                ) : <App />}
            </HardwareQualityProvider>
        </MotionConfig>
    </React.StrictMode>,
)
