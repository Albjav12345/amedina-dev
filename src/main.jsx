import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'

// Force scroll to top on refresh to preserve intro animation stability
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

ReactDOM.createRoot(document.getElementById('app')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
