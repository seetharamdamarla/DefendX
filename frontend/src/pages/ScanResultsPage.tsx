import { useState } from 'react'
import { Shield, AlertTriangle, CheckCircle, FileText, ChevronDown, ExternalLink, Download, ArrowLeft } from 'lucide-react'
import VulnerabilityDetailModal from '../components/VulnerabilityDetailModal'
import type { ScanResult, Vulnerability } from '../types'
import LogoIcon from '../components/LogoIcon'

interface ScanResultsPageProps {
    scanData: ScanResult | null
    onNewScan: () => void
    onBack: () => void
}

/**
 * Scan Results Page
 * Modern, premium design with glassmorphism and gradient aesthetics
 */
export default function ScanResultsPage({ scanData, onNewScan, onBack }: ScanResultsPageProps) {
    const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null)

    if (!scanData || !scanData.results) {
        return (
            <div className="fixed inset-0 min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
                <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-md w-full shadow-xl shadow-slate-200/50">
                    <div className="bg-slate-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-10 h-10 text-slate-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">No Results Found</h2>
                    <p className="text-slate-500 mb-8">There is no active scan data to display.</p>
                    <button
                        onClick={onNewScan}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-200"
                    >
                        Start New Scan
                    </button>
                </div>
            </div>
        )
    }

    const { results, target_url, timestamp } = scanData
    const { summary, vulnerabilities, attack_surface } = results

    const getSeverityColor = (severity: string) => {
        switch (severity.toUpperCase()) {
            case 'HIGH': return 'text-red-700 bg-red-50 border-red-100'
            case 'MEDIUM': return 'text-yellow-700 bg-yellow-50 border-yellow-100'
            case 'LOW': return 'text-blue-700 bg-blue-50 border-blue-100'
            default: return 'text-slate-600 bg-slate-50 border-slate-200'
        }
    }

    const getRiskScoreColor = (score: string) => {
        switch (score.toUpperCase()) {
            case 'HIGH': return 'from-red-500 to-red-600 shadow-red-200'
            case 'MEDIUM': return 'from-yellow-400 to-orange-500 shadow-orange-200'
            case 'LOW': return 'from-green-500 to-emerald-600 shadow-green-200'
            default: return 'from-slate-400 to-slate-500'
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 md:px-8 relative overflow-x-hidden font-sans">
            <button
                onClick={onBack}
                className="mb-8 flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-xl border border-slate-200 transition-all shadow-sm w-fit"
            >
                <ArrowLeft size={18} />
                <span className="font-medium text-sm">Back to Dashboard</span>
            </button>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-blue-300 transition-colors" onClick={() => window.location.reload()}>
                            <LogoIcon size={40} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Security Assessment Report</h1>
                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{target_url}</span>
                                <span>•</span>
                                <span>{new Date(timestamp).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                const dataStr = JSON.stringify(scanData, null, 2)
                                const dataBlob = new Blob([dataStr], { type: 'application/json' })
                                const url = URL.createObjectURL(dataBlob)
                                const link = document.createElement('a')
                                link.href = url
                                link.download = `defendx-report-${new Date().toISOString()}.json`
                                link.click()
                            }}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-medium transition-all text-sm shadow-sm hover:text-slate-900"
                        >
                            <Download className="w-4 h-4" />
                            Export JSON
                        </button>
                        <button
                            onClick={onNewScan}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-200 text-sm"
                        >
                            <Shield className="w-4 h-4" />
                            New Assessment
                        </button>
                    </div>
                </div>

                {/* Score & Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
                    {/* Risk Score Card - Large */}
                    <div className="md:col-span-4 lg:col-span-3">
                        <div className="h-full bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center relative overflow-hidden group shadow-sm">
                            <h3 className="text-slate-500 font-medium mb-4 uppercase tracking-wider text-sm">Overall Risk Score</h3>

                            <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                                {/* Animated Rings */}
                                <div className="absolute inset-0 rounded-full border-4 border-slate-50"></div>
                                <div className={`absolute inset-0 rounded-full border-4 border-t-current border-r-current border-b-transparent border-l-transparent animate-spin-slow opacity-20 ${summary.risk_score === 'HIGH' ? 'text-red-500' : summary.risk_score === 'MEDIUM' ? 'text-yellow-500' : 'text-green-500'}`}></div>

                                <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getRiskScoreColor(summary.risk_score)} flex items-center justify-center shadow-lg`}>
                                    <span className="text-3xl font-black text-white">{summary.risk_score}</span>
                                </div>
                            </div>

                            <p className="text-center text-sm text-slate-500 px-4">
                                Based on {summary.total_vulnerabilities} findings
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="md:col-span-8 lg:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {/* High Severity */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 relative overflow-hidden group hover:border-red-200 transition-all shadow-sm">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-red-100 transition-all"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-red-600 font-bold tracking-wide text-sm">CRITICAL</span>
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                </div>
                                <div className="flex items-end gap-3">
                                    <span className="text-4xl font-bold text-slate-900">{summary.by_severity.HIGH}</span>
                                    <span className="text-sm text-slate-500 mb-1.5">Issues found</span>
                                </div>
                            </div>
                        </div>

                        {/* Medium Severity */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 relative overflow-hidden group hover:border-yellow-200 transition-all shadow-sm">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-yellow-100 transition-all"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-yellow-600 font-bold tracking-wide text-sm">WARNING</span>
                                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                </div>
                                <div className="flex items-end gap-3">
                                    <span className="text-4xl font-bold text-slate-900">{summary.by_severity.MEDIUM}</span>
                                    <span className="text-sm text-slate-500 mb-1.5">Issues found</span>
                                </div>
                            </div>
                        </div>

                        {/* Low Severity / Attack Surface */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 relative overflow-hidden group hover:border-blue-200 transition-all shadow-sm">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-100 transition-all"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-blue-600 font-bold tracking-wide text-sm">SURFACE</span>
                                    <ExternalLink className="w-5 h-5 text-blue-500" />
                                </div>
                                <div className="flex items-end gap-3">
                                    <span className="text-4xl font-bold text-slate-900">{attack_surface.url_count}</span>
                                    <span className="text-sm text-slate-500 mb-1.5">URLs Scanned</span>
                                </div>
                            </div>
                        </div>

                        {/* Low Severity Count (Hidden visual, used for logic) */}
                        <div className="col-span-full bg-white rounded-xl p-4 flex items-center justify-between border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                                <div>
                                    <p className="text-slate-900 font-medium">Low Severity / Informational</p>
                                    <p className="text-xs text-slate-500">Best practices and minor configurations</p>
                                </div>
                            </div>
                            <span className="text-xl font-bold text-blue-600">{summary.by_severity.LOW} Finding{summary.by_severity.LOW !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                </div>

                {/* Vulnerabilities Table Section */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <FileText className="w-5 h-5 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Detailed Findings</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span>Sort by: Severity (High to Low)</span>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {vulnerabilities.length === 0 ? (
                            <div className="p-12 text-center">
                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 opacity-80" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Target Secure</h3>
                                <p className="text-slate-500">No rule-based vulnerabilities were detected during this scan.</p>
                            </div>
                        ) : (
                            vulnerabilities.map((vuln: Vulnerability, index: number) => (
                                <div
                                    key={index}
                                    onClick={() => setSelectedVuln(vuln)}
                                    className="p-5 hover:bg-slate-50 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Status Icon */}
                                        <div className="mt-1">
                                            {vuln.severity === 'HIGH' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                                            {vuln.severity === 'MEDIUM' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                                            {vuln.severity === 'LOW' && <Shield className="w-5 h-5 text-blue-500" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                                    {vuln.title}
                                                </h4>
                                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${getSeverityColor(vuln.severity)}`}>
                                                    {vuln.severity}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 text-sm line-clamp-1 mb-2">
                                                {vuln.description.split('\n')[0]}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                                                <span>{vuln.category}</span>
                                                {vuln.evidence?.url && (
                                                    <span className="flex items-center gap-1 truncate max-w-md text-slate-400">
                                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                        {vuln.evidence.url}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="self-center">
                                            <div className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-900">
                                                <ChevronDown className="w-5 h-5 -rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {selectedVuln && (
                <VulnerabilityDetailModal
                    vulnerability={selectedVuln}
                    onClose={() => setSelectedVuln(null)}
                />
            )}
        </div>
    )
}
