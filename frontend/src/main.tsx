import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import axios from 'axios'

// Configure global axios defaults for authentication
axios.defaults.withCredentials = true
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
