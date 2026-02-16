import { useState, useEffect } from 'react'
import LandingPage from './pages/LandingPage'
import ScanInputPage from './pages/ScanInputPage'
import DashboardPage from './pages/DashboardPage'
import SignupPage from './pages/SignupPage'
import type { ScanResult } from './types'

function App() {
    const [currentPage, setCurrentPage] = useState<'landing' | 'signup' | 'dashboard' | 'input' | 'results'>(() => {
        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.get('auth') === 'success') {
            return 'input'
        }
        if (urlParams.get('error')) {
            return 'signup'
        }
        return 'landing'
    })
    const [scanData, setScanData] = useState<ScanResult | null>(null)

    // Clean up URL after OAuth redirect
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.get('auth') === 'success') {
            // Clean up URL
            // window.history.replaceState({}, document.title, window.location.pathname)
        }
    }, [])

    const handleGetStarted = () => {
        // Go to Signup
        setCurrentPage('signup')
    }

    const handleScanComplete = (data: ScanResult) => {
        setScanData(data)
        setCurrentPage('dashboard')
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
                />
            )}

            {currentPage === 'signup' && (
                <SignupPage
                    onNavigate={(page) => setCurrentPage(page as any)}
                />
            )}

            {currentPage === 'dashboard' && (
                <DashboardPage
                    onNavigate={(page) => setCurrentPage(page as any)}
                    scanData={scanData}
                    onNewScan={handleNewScan}
                />
            )}

            {currentPage === 'input' && (
                <ScanInputPage
                    onScanComplete={handleScanComplete}
                    onNavigate={(page) => setCurrentPage(page as any)}
                />
            )}
        </>
    )
}

export default App
