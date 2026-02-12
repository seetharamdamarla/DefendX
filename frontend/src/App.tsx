import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import ScanInputPage from './pages/ScanInputPage'
import ScanResultsPage from './pages/ScanResultsPage'
import DashboardPage from './pages/DashboardPage'
import type { ScanResult } from './types'

function App() {
    const [currentPage, setCurrentPage] = useState<'landing' | 'dashboard' | 'input' | 'results'>('landing')
    const [scanData, setScanData] = useState<ScanResult | null>(null)

    const handleGetStarted = () => {
        // Direct access to Dashboard
        setCurrentPage('dashboard')
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
                />
            )}

            {currentPage === 'dashboard' && (
                <DashboardPage onNavigate={(page) => {
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
