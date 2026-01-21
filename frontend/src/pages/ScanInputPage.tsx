import { useState, useEffect } from 'react'
import { AlertTriangle, Loader, ArrowLeft } from 'lucide-react'
import axios from 'axios'
import type { ScanResult } from '../types'

interface ScanInputPageProps {
    onScanComplete: (result: ScanResult) => void
    onBack: () => void
}

export default function ScanInputPage({ onScanComplete, onBack }: ScanInputPageProps) {
    const [url, setUrl] = useState('')
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [isScanning, setIsScanning] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [disclaimer, setDisclaimer] = useState<{ disclaimer: string; requirements: string[] } | null>(null)

    useEffect(() => {
        // Fetch disclaimer from backend
        const fetchDisclaimer = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/scan/disclaimer')
                setDisclaimer(response.data)
            } catch (err) {
                console.error('Failed to fetch disclaimer:', err)
                // Fallback disclaimer if backend fails
                setDisclaimer({
                    disclaimer: "This tool is intended for authorized security testing only. You must have explicit permission to scan the target.",
                    requirements: [
                        "You own the target system",
                        "You have written authorization",
                        "Testing in a controlled environment"
                    ]
                })
            }
        }
        fetchDisclaimer()
    }, [])

    const handleBack = () => {
        onBack()
    }

    const handleScan = async () => {
        if (!url) {
            setError('Please enter a target URL')
            return
        }
        if (!isAuthorized) {
            setError('You must confirm authorization to proceed')
            return
        }

        setIsScanning(true)
        setError(null)

        try {
            // Normalize URL
            let targetUrl = url
            if (!targetUrl.startsWith('http')) {
                targetUrl = `https://${targetUrl}`
            }

            const response = await axios.post('http://localhost:5000/api/scan', {
                url: targetUrl,
                authorized: isAuthorized
            })

            if (response.data) {
                onScanComplete(response.data)
            }
        } catch (err: any) {
            console.error('Scan failed:', err)
            if (err.response?.data?.error) {
                setError(err.response.data.error)
            } else {
                setError('Failed to initiate scan. Please check the backend connection.')
            }
        } finally {
            setIsScanning(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans flex flex-col items-center justify-center relative">
            <button
                onClick={handleBack}
                className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-xl border border-slate-200 transition-all z-10 shadow-sm"
            >
                <ArrowLeft size={18} />
                <span className="font-medium text-sm">Back to Dashboard</span>
            </button>

            <div className="w-full max-w-4xl">
                <div className="text-center mb-12 max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                        Security Assessment Scanner
                    </h1>
                    <p className="text-xl text-slate-500">
                        Advanced vulnerability detection and risk analysis engine.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                    <div className="p-8">
                        <div className="mb-8">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Target URL
                            </label>
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com"
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:bg-white transition-all font-mono text-lg"
                                disabled={isScanning}
                            />
                        </div>

                        {/* Scan Configuration */}
                        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { id: 'discovery', label: 'Discovery', desc: 'Fast surface mapping' },
                                { id: 'standard', label: 'Standard', desc: 'Balanced assessment' },
                                { id: 'deep', label: 'Deep Scan', desc: 'Full vulnerability suite' }
                            ].map((mode) => (
                                <div
                                    key={mode.id}
                                    className="relative"
                                >
                                    <input
                                        type="radio"
                                        name="scanMode"
                                        id={mode.id}
                                        value={mode.id}
                                        defaultChecked={mode.id === 'standard'}
                                        disabled={isScanning}
                                        className="peer sr-only"
                                    />
                                    <label
                                        htmlFor={mode.id}
                                        className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-100 bg-white cursor-pointer hover:border-slate-300 peer-checked:border-blue-500 peer-checked:bg-blue-50/50 transition-all h-full"
                                    >
                                        <span className="font-semibold text-slate-900 text-sm mb-1">{mode.label}</span>
                                        <span className="text-[10px] text-slate-500 text-center">{mode.desc}</span>
                                    </label>
                                </div>
                            ))}
                        </div>

                        {disclaimer && (
                            <div className="mb-8">
                                <label className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-200 transition-all cursor-pointer group">
                                    <div className="relative flex items-center mt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={isAuthorized}
                                            onChange={(e) => setIsAuthorized(e.target.checked)}
                                            className="w-5 h-5 border-2 border-slate-300 rounded checked:bg-blue-600 checked:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all bg-white"
                                            disabled={isScanning}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-slate-900 text-sm">I confirm authorization to scan this target.</span>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed">
                                            By proceeding, you verify that you own the target system or have explicit written permission.
                                            <span className="block mt-0.5 text-slate-400">
                                                Unauthorized usage is strictly prohibited.
                                            </span>
                                        </p>
                                    </div>
                                </label>
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handleScan}
                            disabled={isScanning || !url.trim() || !isAuthorized}
                            className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-200 disabled:shadow-none flex items-center justify-center gap-3"
                        >
                            {isScanning ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    <span>Initializing Scanner...</span>
                                </>
                            ) : (
                                <span>Initiate Security Assessment</span>
                            )}
                        </button>

                        {isScanning && (
                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm text-slate-500 mb-2">
                                        <span>Scan Progress</span>
                                        <span className="animate-pulse text-blue-600 font-medium">Processing...</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-1/2 animate-[shimmer_2s_infinite]"></div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-xs text-slate-500 font-mono">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                            Validation
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                            Port Scan
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
                                            Vuln Check
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                            Reports
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
