import { useState, useEffect } from 'react'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import ScanInputPage from './pages/ScanInputPage'
import ScanResultsPage from './pages/ScanResultsPage'
import DashboardPage from './pages/DashboardPage'
import type { ScanResult } from './types'

function App() {
    const [currentPage, setCurrentPage] = useState<'landing' | 'auth' | 'dashboard' | 'input' | 'results'>('landing')
    const [scanData, setScanData] = useState<ScanResult | null>(null)
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        const user = localStorage.getItem('defendx_current_user')
        if (user) {
            setIsLoggedIn(true)
            setCurrentPage('dashboard')
        }
    }, [])

    const handleGetStarted = () => {
        // Redirect to Auth for a professional user experience
        setCurrentPage('auth')
    }

    const handleScanComplete = (data: ScanResult) => {
        setScanData(data)
        setCurrentPage('results')
    }

    const handleNewScan = () => {
        setScanData(null)
        setCurrentPage('input')
    }

    return (
        <>
            {currentPage === 'landing' && (
                <LandingPage
                    onGetStarted={handleGetStarted}
                    isLoggedIn={isLoggedIn}
                />
            )}

            {currentPage === 'auth' && (
                <AuthPage
                    onLoginSuccess={() => {
                        setIsLoggedIn(true)
                        setCurrentPage('dashboard')
                    }}
                    onBack={() => setCurrentPage('landing')}
                />
            )}

            {currentPage === 'dashboard' && (
                <DashboardPage onNavigate={(page) => {
                    if (page === 'landing') {
                        setIsLoggedIn(false)
                        localStorage.removeItem('defendx_current_user')
                    }
                    setCurrentPage(page as any)
                }} />
            )}

            {currentPage === 'input' && (
                <ScanInputPage
                    onScanComplete={handleScanComplete}
                    onBack={() => setCurrentPage('dashboard')}
                />
            )}

            {currentPage === 'results' && (
                <ScanResultsPage
                    scanData={scanData}
                    onNewScan={handleNewScan}
                    onBack={() => setCurrentPage('dashboard')}
                />
            )}
        </>
    )
}

export default App
