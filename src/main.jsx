import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'

// DISABLE NATIVE RESTORATION -> We handle it manually in App.jsx
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

ReactDOM.createRoot(document.getElementById('app')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
