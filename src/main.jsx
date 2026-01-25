import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'

// ALLOW BROWSER TO HANDLE SCROLL RESTORATION
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'auto';
}

ReactDOM.createRoot(document.getElementById('app')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
