import { useState, useEffect } from 'react'
import axios from 'axios'
import { Activity, ArrowUpRight, CheckCircle, AlertTriangle, Play, Loader, Globe } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import VulnerabilityDetailModal from '../components/VulnerabilityDetailModal'
import type { DashboardData, RiskItem, TargetItem, RecentScanItem } from '../types'

interface DashboardPageProps {
    onNavigate: (page: string) => void
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'scans' | 'risks' | 'targets'>('dashboard')
    const [selectedVuln, setSelectedVuln] = useState<any | null>(null)

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex overflow-hidden">
            <Sidebar
                activeTab={activeTab as any}
                onTabChange={(tab: any) => setActiveTab(tab)}
                onLogout={() => {
                    onNavigate('landing')
                }}
            />

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 relative overflow-y-auto h-screen custom-scrollbar">
                {/* Global Header */}
                <header className="flex justify-between items-center mb-8 relative z-10">
                    <div>
                        <h1 className="text-3xl font-bold capitalize text-slate-900">
                            {activeTab === 'dashboard' ? 'Security Operations Center' : activeTab}
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Real-time Threat Monitoring & Analysis</p>
                    </div>
                    <div className="flex items-center gap-4 relative">
                        {/* New Scan Button - Only on Scans Page */}
                        {activeTab === 'scans' && (
                            <button
                                onClick={() => onNavigate('input')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 font-semibold group animate-fadeIn"
                            >
                                <Play size={16} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                                <span>New Scan</span>
                            </button>
                        )}

                        {/* Simplified User Identity */}
                        <div className="flex items-center gap-4">
                            <span className="text-base font-black text-slate-900 tracking-tight">Analyst</span>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-blue-600 blur-md opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                                <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-base font-black border-2 border-white shadow-xl transform group-hover:scale-105 transition-all duration-300 cursor-default">
                                    A
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {activeTab === 'dashboard' && <DashboardHome />}
                {activeTab === 'scans' && <ScansView />}
                {activeTab === 'risks' && <RisksView onRiskClick={(risk) => setSelectedVuln(risk)} />}
                {activeTab === 'targets' && <TargetsView />}

                {selectedVuln && (
                    <VulnerabilityDetailModal
                        vulnerability={selectedVuln as any}
                        onClose={() => setSelectedVuln(null)}
                    />
                )}
            </main>
        </div>
    )
}

function DashboardHome() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/dashboard')
                if (response.data.success) {
                    setData({
                        stats: response.data.stats,
                        recent_scans: response.data.recent_scans
                    })
                }
            } catch (err) {
                console.error(err)
                setError('Failed to load dashboard data')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-purple-500" /></div>
    if (error || !data) return <div className="text-red-400 p-12 text-center">{error}</div>

    const maxGraphValue = Math.max(...data.stats.trends.map(t => t.count), 5)
    const totalRisks = data.stats.severity_distribution.HIGH + data.stats.severity_distribution.MEDIUM + data.stats.severity_distribution.LOW
    const highPct = totalRisks ? (data.stats.severity_distribution.HIGH / totalRisks) * 100 : 0
    const medPct = totalRisks ? (data.stats.severity_distribution.MEDIUM / totalRisks) * 100 : 0

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Scans */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-300 transition-all shadow-sm">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity text-blue-500 group-hover:bg-blue-50 rounded-bl-3xl"><Activity size={64} className="group-hover:scale-75 transition-transform" /></div>
                    <h3 className="text-slate-500 text-sm font-medium mb-2">Total Scans</h3>
                    <div className="flex items-end gap-3">
                        <span className="text-3xl font-bold text-slate-900">{data.stats.total_scans}</span>
                        <span className="flex items-center text-xs px-2.5 py-1 rounded-full mb-1 bg-green-100 text-green-700 border border-green-200">
                            <ArrowUpRight size={12} className="mr-1" />Active
                        </span>
                    </div>
                </div>
                {/* Critical Risks */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden group hover:border-red-300 transition-all shadow-sm">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity text-red-500 group-hover:bg-red-50 rounded-bl-3xl"><AlertTriangle size={64} className="group-hover:scale-75 transition-transform" /></div>
                    <h3 className="text-slate-500 text-sm font-medium mb-2">Critical Risks</h3>
                    <div className="flex items-end gap-3">
                        <span className="text-3xl font-bold text-red-600">{data.stats.critical_risks}</span>
                        <span className="text-xs text-red-600/70 mb-1">Action Required</span>
                    </div>
                </div>
                {/* Active Targets */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden group hover:border-indigo-300 transition-all shadow-sm">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity text-indigo-500 group-hover:bg-indigo-50 rounded-bl-3xl"><CheckCircle size={64} className="group-hover:scale-75 transition-transform" /></div>
                    <h3 className="text-slate-500 text-sm font-medium mb-2">Active Targets</h3>
                    <div className="flex items-end gap-3">
                        <span className="text-3xl font-bold text-slate-900">{data.stats.active_targets}</span>
                        <span className="text-xs text-slate-400 mb-1">Monitored</span>
                    </div>
                </div>
                {/* Security Health Score - Professional Grade */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-blue-300 transition-all shadow-sm">

                    {data.stats.health_score ? (
                        <div className="flex flex-col items-center gap-4 w-full">
                            {/* Title */}
                            <h3 className="text-slate-500 text-xs font-medium uppercase tracking-wider">Security Health</h3>

                            {/* Letter Grade Circle */}
                            <div className={`w-28 h-28 rounded-full flex items-center justify-center border-[6px] transition-all ${data.stats.health_score.grade_color === 'emerald' || data.stats.health_score.grade_color === 'green' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-emerald-200' :
                                data.stats.health_score.grade_color === 'lime' || data.stats.health_score.grade_color === 'yellow' ? 'bg-yellow-50 border-yellow-500 text-yellow-700 shadow-yellow-200' :
                                    data.stats.health_score.grade_color === 'amber' || data.stats.health_score.grade_color === 'orange' ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-orange-200' :
                                        'bg-red-50 border-red-500 text-red-700 shadow-red-200'
                                } shadow-lg`}>
                                <div className="text-center">
                                    <div className="text-4xl font-black tracking-tight">{data.stats.health_score.letter_grade}</div>
                                    <div className="text-xs font-bold mt-1 opacity-75">{data.stats.health_score.health_score}</div>
                                </div>
                            </div>

                            {/* Status Section */}
                            <div className="text-center space-y-1">
                                <div className="flex items-center gap-2 justify-center">
                                    {/* Color Indicator Dot */}
                                    <div className={`w-2 h-2 rounded-full ${data.stats.health_score.grade_color === 'emerald' || data.stats.health_score.grade_color === 'green' ? 'bg-emerald-500' :
                                        data.stats.health_score.grade_color === 'lime' || data.stats.health_score.grade_color === 'yellow' ? 'bg-yellow-500' :
                                            data.stats.health_score.grade_color === 'amber' || data.stats.health_score.grade_color === 'orange' ? 'bg-orange-500' :
                                                'bg-red-500'
                                        }`}></div>
                                    <span className="text-sm font-bold text-slate-900 tracking-wide">{data.stats.health_score.status}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium tracking-wide">
                                    {data.stats.health_score.risk_points} Risk Points
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Fallback to old simple score
                        <div className="flex flex-col items-center gap-4 w-full">
                            <h3 className="text-slate-500 text-xs font-medium uppercase tracking-wider">Security Health</h3>
                            <div className="relative w-32 h-16">
                                <svg viewBox="0 0 100 50" className="w-full h-full">
                                    <path
                                        d="M 10 45 A 40 40 0 0 1 90 45"
                                        fill="transparent"
                                        stroke="#f1f5f9"
                                        strokeWidth="10"
                                        strokeLinecap="round"
                                    />
                                    <path
                                        d="M 10 45 A 40 40 0 0 1 90 45"
                                        fill="transparent"
                                        stroke="#22c55e"
                                        strokeWidth="10"
                                        strokeLinecap="round"
                                        strokeDasharray="126"
                                        strokeDashoffset={126 - (Math.max(0, 100 - (data.stats.critical_risks * 5)) / 100) * 126}
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center pb-1">
                                    <span className="text-2xl font-bold text-slate-900">{Math.max(0, 100 - (data.stats.critical_risks * 5))}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[420px]">
                {/* Charts */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col h-full group transition-all shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-slate-900">Scan Activity</h3>
                        <div className="flex gap-2 text-xs">
                            <span className="flex items-center gap-1 text-slate-500"><div className="w-2 h-2 rounded-full bg-blue-500"></div>Scans</span>
                        </div>
                    </div>

                    <div className="flex-1 flex items-end justify-center gap-4 px-4 pb-2 border-b border-slate-100">
                        {data.stats.trends.map((t, i) => (
                            <div key={i} className="flex-1 flex flex-col justify-end gap-2 group/bar relative h-full max-w-[48px]">
                                <div
                                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm transition-all duration-500 opacity-80 group-hover/bar:opacity-100 shadow-lg shadow-blue-500/20"
                                    style={{ height: `${Math.max(4, (t.count / maxGraphValue) * 100)}%` }}
                                ></div>
                                {/* Tooltip */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-xs opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-xl text-white">
                                    <span className="font-bold">{t.count}</span> Scans
                                    <div className="text-[10px] text-gray-400">{t.date}</div>
                                </div>
                            </div>
                        ))}
                        {data.stats.trends.length === 0 && <div className="text-slate-400 text-sm m-auto">No activity yet</div>}
                    </div>
                    {/* Dates */}
                    <div className="flex justify-between px-4 pt-4 text-xs text-slate-400 font-mono">
                        {data.stats.trends.map((t, i) => <span key={i}>{t.date.split('-').slice(1).join('/')}</span>)}
                    </div>
                </div>

                {/* Right Column */}
                <div className="grid grid-rows-2 gap-6 h-full">
                    {/* Donut */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center relative transition-all shadow-sm">
                        <h3 className="absolute top-6 left-6 font-bold text-sm text-slate-500">Distribution</h3>
                        <div className="relative w-36 h-36 mt-4">
                            <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray={`${highPct}, 100`} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray={`${medPct}, 100`} strokeDashoffset={`-${highPct}`} strokeLinecap="round" className="transition-all duration-1000 ease-out delay-100" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-bold text-slate-900">{totalRisks}</span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Issues</span>
                            </div>
                        </div>
                    </div>
                    {/* List */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col min-h-0 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-900">Recent Scans</h3>
                        </div>
                        <div className="overflow-y-auto custom-scrollbar space-y-2 pr-1 -mr-2">
                            {data.recent_scans.slice(0, 5).map((s, i) => (
                                <div key={i} className="text-xs bg-slate-50 p-3 rounded-lg flex items-center justify-between border border-transparent hover:border-slate-200 transition-colors group">
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-medium text-slate-700 truncate max-w-[140px] group-hover:text-blue-600 transition-colors">{s.target_url.replace(/^https?:\/\//, '')}</span>
                                        <span className="text-[10px] text-slate-500">{new Date(s.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.vuln_count > 0 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'
                                        }`}>
                                        {s.vuln_count} Issues
                                    </span>
                                </div>
                            ))}
                            {data.recent_scans.length === 0 && <div className="text-center text-slate-400 py-4 text-xs">No recent scans</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ScansView() {
    const [scans, setScans] = useState<RecentScanItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get('/api/scans').then(res => {
            if (res.data.success) setScans(res.data.scans)
        }).finally(() => setLoading(false))
    }, [])

    if (loading) return <Loader className="animate-spin m-auto" />

    return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                    <tr>
                        <th className="p-4 font-medium">Target</th>
                        <th className="p-4 font-medium">Date</th>
                        <th className="p-4 text-center font-medium">Risk Score</th>
                        <th className="p-4 text-center font-medium">Issues</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {scans.map((scan) => (
                        <tr key={scan.scan_id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-medium text-slate-900">{scan.target_url}</td>
                            <td className="p-4 text-slate-500 text-sm">{new Date(scan.timestamp).toLocaleString()}</td>
                            <td className="p-4 text-center">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${scan.risk_score === 'HIGH' ? 'bg-red-50 text-red-600 border border-red-100' :
                                    scan.risk_score === 'MEDIUM' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' : 'bg-green-50 text-green-600 border border-green-100'
                                    }`}>{scan.risk_score}</span>
                            </td>
                            <td className="p-4 text-center font-mono text-slate-600">{scan.vuln_count}</td>
                        </tr>
                    ))}
                    {scans.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-400">No scans found</td></tr>}
                </tbody>
            </table>
        </div>
    )
}

function RisksView({ onRiskClick }: { onRiskClick: (risk: RiskItem) => void }) {
    const [risks, setRisks] = useState<RiskItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get('/api/risks').then(res => {
            if (res.data.success) setRisks(res.data.risks)
        }).finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-purple-500" /></div>

    return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                    <tr>
                        <th className="p-4 font-medium text-center w-24">Severity</th>
                        <th className="p-4 font-medium">Vulnerability</th>
                        <th className="p-4 font-medium">Target</th>
                        <th className="p-4 font-medium">Detected</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {risks.map((risk, i) => (
                        <tr
                            key={i}
                            className="hover:bg-slate-50 transition-colors cursor-pointer group"
                            onClick={() => onRiskClick(risk)}
                        >
                            <td className="p-4 text-center">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${risk.severity === 'HIGH' ? 'bg-red-50 text-red-600 border border-red-100' :
                                    risk.severity === 'MEDIUM' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                    }`}>{risk.severity}</span>
                            </td>
                            <td className="p-4">
                                <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{risk.title}</div>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-tight">{risk.category}</div>
                            </td>
                            <td className="p-4">
                                <span className="text-slate-600 text-sm font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{risk.target}</span>
                            </td>
                            <td className="p-4 text-slate-400 text-xs font-medium">{new Date(risk.discovered_at).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    {risks.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-400">No risks identified</td></tr>}
                </tbody>
            </table>
        </div>
    )
}

function TargetsView() {
    const [targets, setTargets] = useState<TargetItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get('/api/targets').then(res => {
            if (res.data.success) setTargets(res.data.targets)
        }).finally(() => setLoading(false))
    }, [])

    if (loading) return <Loader className="animate-spin m-auto" />

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {targets.map((target, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-300 transition-all group shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                            <Globe className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-bold ${target.risk_score === 'HIGH' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'
                            }`}>{target.risk_score} Risk</div>
                    </div>
                    <h3 className="text-lg font-bold mb-1 truncate text-slate-900" title={target.url}>{target.url}</h3>
                    <p className="text-xs text-slate-500 mb-4">Last scanned: {new Date(target.last_scan).toLocaleDateString()}</p>

                    <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                        <div>
                            <span className="text-2xl font-bold block text-slate-900">{target.total_vulns}</span>
                            <span className="text-xs text-slate-400">Total Issues</span>
                        </div>
                        <div>
                            <span className="text-2xl font-bold block text-slate-900">{target.scans_count}</span>
                            <span className="text-xs text-slate-400">Total Scans</span>
                        </div>
                    </div>
                </div>
            ))}
            {targets.length === 0 && <div className="col-span-full p-12 text-center text-slate-400">No targets monitored</div>}
        </div>
    )
}
