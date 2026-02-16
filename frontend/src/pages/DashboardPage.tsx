import { useState, useEffect } from 'react'
import axios from 'axios'
import { ArrowUpRight, Shield, AlertTriangle, CheckCircle, Activity, Play, Globe, Loader, Search, Bell, MoreHorizontal, ArrowRight, TrendingUp, TrendingDown, FileText, ChevronDown, ExternalLink, Download } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import VulnerabilityDetailModal from '../components/VulnerabilityDetailModal'
import { DashboardData, RecentScanItem, RiskItem, TargetItem, ScanResult, Vulnerability } from '../types'

interface DashboardPageProps {
    onNavigate: (page: string) => void
    scanData?: ScanResult | null
    onNewScan?: () => void
}

export default function DashboardPage({ onNavigate, scanData, onNewScan }: DashboardPageProps) {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'scans' | 'risks' | 'targets' | 'results' | 'settings'>('dashboard')
    const [user, setUser] = useState<{ name: string, email: string, profilePicture?: string } | null>(null)
    const [selectedVuln, setSelectedVuln] = useState<any | null>(null)
    const [viewedScan, setViewedScan] = useState<ScanResult | null>(scanData || null)

    // New Features States
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [notifications, setNotifications] = useState<any[]>([])

    // Search Animation Effect
    useEffect(() => {
        if (searchQuery) {
            setIsSearching(true)
            const timer = setTimeout(() => setIsSearching(false), 800)
            return () => clearTimeout(timer)
        } else {
            setIsSearching(false)
        }
    }, [searchQuery])

    // Clear search on tab change
    useEffect(() => {
        setSearchQuery('')
    }, [activeTab])

    const getSearchPlaceholder = () => {
        switch (activeTab) {
            case 'dashboard': return 'Search recent activity...'
            case 'scans': return 'Search scan history...'
            case 'risks': return 'Search vulnerabilities...'
            case 'targets': return 'Search monitored targets...'
            case 'results': return 'Search within results...'
            default: return 'Search...'
        }
    }

    // Fetch current user data
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get('/api/auth/user')
                if (response.data.success) {
                    setUser(response.data.user)
                }
            } catch (error) {
                console.error('Failed to fetch user:', error)
            }
        }
        fetchUser()
    }, [])


    // Switch to results tab if scan data is present
    useEffect(() => {
        if (scanData) {
            setViewedScan(scanData)
            setActiveTab('results')

            // Add a notification for the completed scan
            const newNotif = {
                id: Date.now(),
                title: 'Scan Completed',
                message: `Analysis for ${scanData.target_url} is ready`,
                time: 'Just now',
                type: 'success'
            }
            setNotifications(prev => [newNotif, ...prev])
        }
    }, [scanData])

    const handleViewScan = async (scanId: string) => {
        try {
            const response = await axios.get(`/api/scan/${scanId}`)
            if (response.data.success) {
                const result = response.data.result
                if (result) {
                    setViewedScan(result as ScanResult)
                    setActiveTab('results')
                }
            }
        } catch (error) {
            console.error("Failed to load scan:", error)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans flex overflow-hidden selection:bg-purple-500/30">
            <Sidebar
                activeTab={activeTab}
                onTabChange={(tab) => setActiveTab(tab)}
                onLogout={async () => {
                    try {
                        await axios.get('/api/auth/logout')
                    } catch (e) {
                        console.error('Logout failed:', e)
                    }
                    onNavigate('landing')
                }}
                showResults={!!viewedScan}
            />

            {/* Main Content */}
            <main className="flex-1 p-8 relative overflow-y-auto h-screen custom-scrollbar bg-black" onClick={() => showNotifications && setShowNotifications(false)}>
                {/* Global Header */}
                <header className="flex justify-between items-center mb-10 relative z-40">
                    <div>
                        <h1 className="text-3xl font-bold capitalize text-white tracking-tight">
                            {activeTab === 'dashboard' ? 'Overview' : activeTab === 'results' ? 'Scan Results' : activeTab}
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1">Welcome back, {user?.name?.split(' ')[0] || 'Analyst'}</p>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Search Bar */}
                        <div className="relative hidden md:block group">
                            {isSearching ? (
                                <Loader className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500 animate-spin transition-colors" />
                            ) : (
                                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${searchQuery ? 'text-white' : 'text-zinc-500'}`} />
                            )}
                            <input
                                type="text"
                                placeholder={getSearchPlaceholder()}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-zinc-900/50 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm w-64 focus:outline-none focus:border-white/20 focus:bg-zinc-900 transition-all text-white placeholder:text-zinc-600"
                            />
                        </div>

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setShowNotifications(!showNotifications)
                                }}
                                className={`relative p-2.5 rounded-full hover:bg-white/10 transition-all ${showNotifications ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'}`}
                            >
                                <Bell className="w-5 h-5" />
                                {notifications.length > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-black/50"></span>}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 top-full mt-4 w-80 bg-[#111113]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                                        <h3 className="font-bold text-sm text-white">Notifications</h3>
                                        <button onClick={() => setNotifications([])} className="text-xs text-zinc-500 hover:text-white transition-colors">Clear all</button>
                                    </div>
                                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-zinc-500 text-xs">No new notifications</div>
                                        ) : (
                                            notifications.map((notif) => (
                                                <div key={notif.id} className="p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 flex gap-3 group items-start">
                                                    <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 shadow-[0_0_8px_currentColor] ${notif.type === 'error' ? 'bg-red-500 text-red-500' : notif.type === 'success' ? 'bg-emerald-500 text-emerald-500' : 'bg-blue-500 text-blue-500'}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-bold text-white mb-0.5 group-hover:text-purple-400 transition-colors">{notif.title}</h4>
                                                        <p className="text-xs text-zinc-400 leading-relaxed break-words">{notif.message}</p>
                                                        <span className="text-[10px] text-zinc-600 mt-2 block font-mono">{notif.time}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Profile */}
                        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                            <div className="relative group cursor-pointer">
                                <div className="absolute inset-0 bg-purple-500 blur-md opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                                {/* User Profile */}
                                <div className="flex items-center gap-3">
                                    <div className="relative shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold overflow-hidden shadow-inner border border-white/10 text-sm">
                                            {user?.profilePicture ? (
                                                <div className="relative w-full h-full flex items-center justify-center">
                                                    <img
                                                        src={user.profilePicture}
                                                        alt=""
                                                        className="absolute inset-0 w-full h-full object-cover z-10"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                        }}
                                                    />
                                                    <span className="z-0 text-sm font-bold">
                                                        {user?.email?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm font-bold">{user?.email?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="hidden sm:block">
                                        <span className="block text-sm font-bold text-white">{user?.name || 'Loading...'}</span>
                                        <span className="block text-sm text-zinc-500">{user?.email || 'Pro Account'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {activeTab === 'dashboard' && <DashboardHome onNavigate={onNavigate} onViewScan={handleViewScan} searchQuery={searchQuery} isSearching={isSearching} />}
                {activeTab === 'scans' && <ScansView onViewScan={handleViewScan} searchQuery={searchQuery} isSearching={isSearching} />}
                {activeTab === 'risks' && <RisksView onRiskClick={(risk) => setSelectedVuln(risk)} searchQuery={searchQuery} isSearching={isSearching} />}
                {activeTab === 'targets' && <TargetsView searchQuery={searchQuery} isSearching={isSearching} />}
                {activeTab === 'results' && viewedScan && <ResultsView scanData={viewedScan} onNewScan={onNewScan} searchQuery={searchQuery} isSearching={isSearching} />}

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

function DashboardHome({ onNavigate, onViewScan, searchQuery = '', isSearching = false }: { onNavigate: (page: string) => void, onViewScan: (id: string) => void, searchQuery?: string, isSearching?: boolean }) {
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

    if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-white" /></div>
    if (error || !data) return <div className="text-red-400 p-12 text-center">{error}</div>

    // Calculations for the UI
    const healthScore = data.stats.health_score?.health_score || Math.max(0, 100 - (data.stats.critical_risks * 5))
    const letterGrade = data.stats.health_score?.letter_grade || 'A'

    // Filter recent scans
    const filteredRecentScans = data.recent_scans.filter(scan =>
        scan.target_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scan.scan_id.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Top Section: Quick Stats & Health Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Stat Cards (Simulating "Assets") */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-white tracking-tight">Security Command</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Total Scans Card */}
                        <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 relative group overflow-hidden hover:border-purple-500/20 transition-all duration-500 shadow-xl shadow-black/20">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                                        <Activity className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Total Scans</span>
                                        <span className="block text-xs text-zinc-400">Lifetime</span>
                                    </div>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-zinc-700 group-hover:text-purple-400 transition-colors" />
                            </div>
                            <div className="relative z-10">
                                <span className="text-3xl font-bold text-white tracking-tight">{data.stats.total_scans}</span>
                                <div className="flex items-center gap-2 text-xs mt-2">
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold flex items-center border border-emerald-500/20"><TrendingUp className="w-3 h-3 mr-1" />+12%</span>
                                    <span className="text-zinc-600">vs last month</span>
                                </div>
                            </div>
                        </div>

                        {/* Critical Risks Card */}
                        <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 relative group overflow-hidden hover:border-red-500/20 transition-all duration-500 shadow-xl shadow-black/20">
                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 group-hover:scale-110 transition-transform duration-300">
                                        <AlertTriangle className="w-5 h-5 text-red-400" />
                                    </div>
                                    <div>
                                        <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Risks</span>
                                        <span className="block text-xs text-zinc-400">Critical</span>
                                    </div>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-zinc-700 group-hover:text-red-400 transition-colors" />
                            </div>
                            <div className="relative z-10">
                                <span className="text-3xl font-bold text-white tracking-tight">{data.stats.critical_risks}</span>
                                <div className="flex items-center gap-2 text-xs mt-2">
                                    <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-bold flex items-center border border-red-500/20"><TrendingDown className="w-3 h-3 mr-1" />+2</span>
                                    <span className="text-zinc-600">new detected</span>
                                </div>
                            </div>
                        </div>

                        {/* Active Targets Card */}
                        <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 relative group overflow-hidden hover:border-blue-500/20 transition-all duration-500 shadow-xl shadow-black/20">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                                        <Globe className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Targets</span>
                                        <span className="block text-xs text-zinc-400">Monitored</span>
                                    </div>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-zinc-700 group-hover:text-blue-400 transition-colors" />
                            </div>
                            <div className="relative z-10">
                                <span className="text-3xl font-bold text-white tracking-tight">{data.stats.active_targets}</span>
                                <div className="flex items-center gap-2 text-xs mt-2">
                                    <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold flex items-center border border-blue-500/20">Stable</span>
                                    <span className="text-zinc-600">active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Health Score */}
                <div className="bg-gradient-to-b from-[#18181b] to-black border border-white/10 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between min-h-[300px] hover:border-purple-500/30 transition-all duration-500 shadow-2xl">
                    {/* Background Effects */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/5 rounded-full blur-[60px] pointer-events-none"></div>

                    <div className="flex justify-between items-start relative z-10">
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-zinc-300" />
                            <span className="font-bold text-base text-zinc-200 tracking-tight">DefendX Shield</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-zinc-400 border border-white/5 uppercase tracking-wide">Live</span>
                    </div>

                    <div className="relative z-10 mt-8 text-center flex-1 flex flex-col items-center justify-center">
                        <div className="relative mb-4">
                            <div className={`text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b ${letterGrade === 'A' ? 'from-emerald-300 to-emerald-600' :
                                letterGrade === 'B' ? 'from-blue-300 to-blue-600' :
                                    letterGrade === 'C' ? 'from-yellow-300 to-yellow-600' : 'from-red-300 to-red-600'
                                }`}>
                                {healthScore}
                            </div>
                            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Health Score</div>
                        </div>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${letterGrade === 'A' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                            letterGrade === 'B' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${letterGrade === 'A' ? 'bg-emerald-400' :
                                letterGrade === 'B' ? 'bg-blue-400' : 'bg-red-400'
                                } animate-pulse`}></div>
                            <span className="text-xs font-bold">Grade {letterGrade} Security</span>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 relative z-10">
                        <button
                            onClick={() => onNavigate('input')}
                            className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/5"
                        >
                            <Play size={14} fill="black" />
                            Run New Analysis
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Recent Scans */}
            <div className="bg-[#121214] border border-white/5 rounded-3xl p-8 shadow-xl shadow-black/20">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Live Feed</span>
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Recent Activity</h2>
                    </div>
                </div>

                <div className="space-y-3">
                    {isSearching ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader className="w-8 h-8 text-purple-500 animate-spin" />
                        </div>
                    ) : filteredRecentScans.length > 0 ? (
                        filteredRecentScans.slice(0, 3).map((scan, i) => (
                            <div key={i} className="group p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 transition-all duration-300 flex items-center justify-between cursor-pointer">
                                {/* Left: Icon & Target */}
                                <div className="flex items-center gap-4 w-1/3">
                                    <div className="w-10 h-10 rounded-xl bg-[#0f0f11] flex items-center justify-center text-zinc-400 font-bold text-sm border border-white/5 group-hover:border-purple-500/30 group-hover:text-purple-400 transition-colors">
                                        {scan.target_url.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="text-zinc-200 font-bold text-sm tracking-tight mb-0.5 group-hover:text-white transition-colors">{scan.target_url.replace(/^https?:\/\//, '')}</h4>
                                        <span className="text-[10px] text-zinc-600 font-mono">ID: {scan.scan_id.substring(0, 8)}</span>
                                    </div>
                                </div>

                                {/* Middle: Stats */}
                                <div className="hidden md:flex items-center gap-12">
                                    <div className="text-right min-w-[80px]">
                                        <span className="block text-[10px] text-zinc-600 font-bold uppercase mb-0.5">Issues</span>
                                        <span className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">{scan.vuln_count}</span>
                                    </div>
                                    <div className="text-left w-[100px]">
                                        <span className="block text-[10px] text-zinc-600 font-bold uppercase mb-1">Status</span>
                                        {scan.vuln_count > 0 ? (
                                            <div className="flex items-center gap-1.5 text-red-400">
                                                <AlertTriangle size={12} />
                                                <span className="text-xs font-bold">Risk</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-emerald-400">
                                                <CheckCircle size={12} />
                                                <span className="text-xs font-bold">Secure</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Actions */}
                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden sm:block">
                                        <span className="block text-[10px] text-zinc-600 font-bold uppercase mb-0.5">Scanned</span>
                                        <span className="text-xs text-zinc-400 font-mono">{new Date(scan.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <div
                                        onClick={() => onViewScan(scan.scan_id)}
                                        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-purple-500 text-purple-400 group-hover:text-white transition-all"
                                    >
                                        <ArrowUpRight size={16} />
                                    </div>
                                </div>
                            </div>
                        ))) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mb-4 text-zinc-600">
                                <Activity size={32} />
                            </div>
                            <h3 className="text-white font-bold mb-1">No Activity Yet</h3>
                            <p className="text-zinc-500 text-sm max-w-xs mx-auto mb-6">Start your first security scan to see real-time analytics and insights.</p>
                            <button
                                onClick={() => onNavigate('input')}
                                className="px-6 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-sm transition-all"
                            >
                                Start First Scan
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function ScansView({ onViewScan, searchQuery = '', isSearching = false }: { onViewScan: (id: string) => void, searchQuery?: string, isSearching?: boolean }) {
    const [scans, setScans] = useState<RecentScanItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get('/api/scans').then(res => {
            if (res.data.success) setScans(res.data.scans)
        }).finally(() => setLoading(false))
    }, [])

    if (loading) return <Loader className="animate-spin m-auto text-white" />

    const filteredScans = scans.filter(scan =>
        scan.target_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scan.scan_id.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="bg-[#121214] border border-white/5 rounded-3xl overflow-hidden animate-fadeIn shadow-xl shadow-black/20">
            <table className="w-full text-left border-collapse">
                <thead className="bg-white/[0.02] text-zinc-500 text-[10px] uppercase tracking-widest border-b border-white/5">
                    <tr>
                        <th className="p-6 font-bold">Target</th>
                        <th className="p-6 font-bold">Date</th>
                        <th className="p-6 text-center font-bold">Risk Score</th>
                        <th className="p-6 text-center font-bold">Issues</th>
                        <th className="p-6"></th>
                    </tr>
                </thead>
                <tbody className="text-sm divide-y divide-white/5">
                    {isSearching ? (
                        <tr><td colSpan={5} className="p-12 text-center"><Loader className="w-8 h-8 text-purple-500 animate-spin mx-auto" /></td></tr>
                    ) : filteredScans.length > 0 ? (
                        filteredScans.map((scan) => (
                            <tr
                                key={scan.scan_id}
                                className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                                onClick={() => onViewScan(scan.scan_id)}
                            >
                                <td className="p-6">
                                    <div className="font-bold text-zinc-200 text-sm group-hover:text-white transition-colors">{scan.target_url}</div>
                                </td>
                                <td className="p-6 text-zinc-500 text-xs font-mono">{new Date(scan.timestamp).toLocaleString()}</td>
                                <td className="p-6 text-center">
                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider border uppercase ${scan.risk_score === 'HIGH' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                        scan.risk_score === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        }`}>{scan.risk_score}</span>
                                </td>
                                <td className="p-6 text-center text-zinc-400 font-bold text-sm group-hover:text-purple-400 transition-colors">{scan.vuln_count}</td>
                                <td className="p-6 text-right">
                                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))) : (
                        <tr><td colSpan={5} className="p-12 text-center text-zinc-600 text-sm">No scans match your search</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

function RisksView({ onRiskClick, searchQuery = '', isSearching = false }: { onRiskClick: (risk: RiskItem) => void, searchQuery?: string, isSearching?: boolean }) {
    const [risks, setRisks] = useState<RiskItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get('/api/risks').then(res => {
            if (res.data.success) setRisks(res.data.risks)
        }).finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-white" /></div>

    const filteredRisks = risks.filter(risk =>
        risk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        risk.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
        risk.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="bg-[#121214] border border-white/5 rounded-3xl overflow-hidden animate-fadeIn shadow-xl shadow-black/20">
            <table className="w-full text-left">
                <thead className="bg-white/[0.02] text-zinc-500 text-[10px] uppercase tracking-widest border-b border-white/5">
                    <tr>
                        <th className="p-6 font-bold text-center w-32">Severity</th>
                        <th className="p-6 font-bold">Vulnerability</th>
                        <th className="p-6 font-bold">Target</th>
                        <th className="p-6 font-bold">Detected</th>
                        <th className="p-6"></th>
                    </tr>
                </thead>
                <tbody className="text-sm divide-y divide-white/5">
                    {isSearching ? (
                        <tr><td colSpan={5} className="p-12 text-center"><Loader className="w-8 h-8 text-purple-500 animate-spin mx-auto" /></td></tr>
                    ) : filteredRisks.length > 0 ? (
                        filteredRisks.map((risk, i) => (
                            <tr
                                key={i}
                                className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                                onClick={() => onRiskClick(risk)}
                            >
                                <td className="p-6 text-center">
                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider border uppercase ${risk.severity === 'HIGH' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                        risk.severity === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>{risk.severity}</span>
                                </td>
                                <td className="p-6">
                                    <div className="font-bold text-zinc-200 text-sm group-hover:text-white transition-colors">{risk.title}</div>
                                    <div className="text-[10px] text-zinc-500 font-mono mt-1 uppercase tracking-tight">{risk.category}</div>
                                </td>
                                <td className="p-6">
                                    <span className="text-zinc-500 text-xs font-mono group-hover:text-zinc-400 transition-colors">{risk.target}</span>
                                </td>
                                <td className="p-6 text-zinc-500 text-xs font-mono">{new Date(risk.discovered_at).toLocaleDateString()}</td>
                                <td className="p-6 text-right">
                                    <ArrowRight size={14} className="text-zinc-600 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100" />
                                </td>
                            </tr>
                        ))) : (
                        <tr><td colSpan={5} className="p-12 text-center text-zinc-600 text-sm">No risks match your search</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

function TargetsView({ searchQuery = '', isSearching = false }: { searchQuery?: string, isSearching?: boolean }) {
    const [targets, setTargets] = useState<TargetItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get('/api/targets').then(res => {
            if (res.data.success) setTargets(res.data.targets)
        }).finally(() => setLoading(false))
    }, [])

    if (loading) return <Loader className="animate-spin m-auto text-white" />

    const filteredTargets = targets.filter(target =>
        target.url.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {isSearching ? (
                <div className="col-span-full flex justify-center py-20">
                    <Loader className="w-10 h-10 text-purple-500 animate-spin" />
                </div>
            ) : filteredTargets.length > 0 ? (
                filteredTargets.map((target, i) => (
                    <div key={i} className="bg-[#121214] border border-white/5 rounded-3xl p-8 hover:border-purple-500/20 transition-all duration-500 group relative overflow-hidden shadow-xl shadow-black/20">
                        <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                            <Globe className="w-32 h-32 text-purple-500/10" />
                        </div>

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5 group-hover:bg-purple-500/10 group-hover:border-purple-500/20 transition-colors">
                                <Globe className="w-5 h-5 text-zinc-400 group-hover:text-purple-400 transition-colors" />
                            </div>
                            <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wide ${target.risk_score === 'HIGH' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                }`}>{target.risk_score} Risk</div>
                        </div>

                        <div className="relative z-10 mb-8">
                            <h3 className="text-lg font-bold mb-1 truncate text-white tracking-tight" title={target.url}>{target.url}</h3>
                            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wide">Last Scan: {new Date(target.last_scan).toLocaleDateString()}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6 relative z-10">
                            <div>
                                <span className="text-2xl font-bold block text-white tracking-tight">{target.total_vulns}</span>
                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Active Issues</span>
                            </div>
                            <div>
                                <span className="text-2xl font-bold block text-white tracking-tight">{target.scans_count}</span>
                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Total Scans</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 relative z-10">
                            <button className="w-full py-3 rounded-xl bg-white/5 border border-white/5 text-zinc-400 text-xs font-bold hover:bg-white hover:text-black transition-all">
                                View Details
                            </button>
                        </div>
                    </div>
                ))) : (
                <div className="col-span-full p-12 text-center text-zinc-600 text-sm">No targets match your search</div>
            )}
        </div>
    )
}

function ResultsView({ scanData, onNewScan, searchQuery = '', isSearching = false }: { scanData: ScanResult, onNewScan?: () => void, searchQuery?: string, isSearching?: boolean }) {
    const { results, target_url, timestamp } = scanData
    const { summary, vulnerabilities, attack_surface } = results
    const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null)

    const filteredVulnerabilities = vulnerabilities.filter(vuln =>
        vuln.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vuln.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vuln.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getSeverityColor = (severity: string) => {
        switch (severity.toUpperCase()) {
            case 'HIGH': return 'text-red-400 bg-red-500/10 border-red-500/20'
            case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
            case 'LOW': return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
            default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20'
        }
    }

    const getRiskScoreColor = (score: string) => {
        switch (score.toUpperCase()) {
            case 'HIGH': return 'from-red-600 to-red-800 shadow-red-500/20'
            case 'MEDIUM': return 'from-yellow-400 to-orange-600 shadow-orange-500/20'
            case 'LOW': return 'from-green-500 to-emerald-700 shadow-emerald-500/20'
            default: return 'from-zinc-400 to-zinc-600'
        }
    }

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                <div>
                    <div className="flex items-center gap-2 text-sm text-zinc-400 mt-1">
                        <span className="font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10 text-zinc-300">{target_url}</span>
                        <span>•</span>
                        <span>{new Date(timestamp).toLocaleString()}</span>
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
                        className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-white/10 hover:bg-zinc-800 rounded-xl text-zinc-400 font-bold transition-all text-xs"
                    >
                        <Download className="w-4 h-4" />
                        Export JSON
                    </button>
                    <button
                        onClick={onNewScan}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold transition-all text-xs shadow-lg shadow-white/10"
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
                    <div className="h-full bg-[#121214] rounded-3xl border border-white/5 p-6 flex flex-col items-center justify-center relative overflow-hidden group shadow-xl shadow-black/20">
                        <h3 className="text-zinc-500 font-bold mb-6 text-[10px] uppercase tracking-widest">Overall Risk Score</h3>

                        <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                            {/* Animated Rings */}
                            <div className="absolute inset-0 rounded-full border-4 border-white/5"></div>
                            <div className={`absolute inset-0 rounded-full border-4 border-t-current border-r-current border-b-transparent border-l-transparent animate-spin-slow opacity-30 ${summary.risk_score === 'HIGH' ? 'text-red-500' : summary.risk_score === 'MEDIUM' ? 'text-yellow-500' : 'text-green-500'}`}></div>

                            <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getRiskScoreColor(summary.risk_score)} flex items-center justify-center shadow-2xl`}>
                                <span className="text-4xl font-black text-white tracking-tighter">{summary.risk_score}</span>
                            </div>
                        </div>

                        <p className="text-center text-xs text-zinc-500 px-4">
                            Based on {summary.total_vulnerabilities} findings
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="md:col-span-8 lg:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* High Severity */}
                    <div className="bg-[#121214] rounded-3xl border border-white/5 p-6 relative overflow-hidden group hover:border-red-500/20 transition-all duration-500 shadow-xl shadow-black/20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-red-500/10 transition-all duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <span className="text-red-400 font-bold tracking-widest text-[10px] uppercase">Critical</span>
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                            </div>
                            <div className="flex items-end gap-3">
                                <span className="text-5xl font-black text-white tracking-tighter">{summary.by_severity.HIGH}</span>
                                <span className="text-xs text-zinc-500 mb-2 font-bold uppercase tracking-wide">Issues</span>
                            </div>
                        </div>
                    </div>

                    {/* Medium Severity */}
                    <div className="bg-[#121214] rounded-3xl border border-white/5 p-6 relative overflow-hidden group hover:border-yellow-500/20 transition-all duration-500 shadow-xl shadow-black/20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-yellow-500/10 transition-all duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <span className="text-yellow-400 font-bold tracking-widest text-[10px] uppercase">Warning</span>
                                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            </div>
                            <div className="flex items-end gap-3">
                                <span className="text-5xl font-black text-white tracking-tighter">{summary.by_severity.MEDIUM}</span>
                                <span className="text-xs text-zinc-500 mb-2 font-bold uppercase tracking-wide">Issues</span>
                            </div>
                        </div>
                    </div>

                    {/* Low Severity / Attack Surface */}
                    <div className="bg-[#121214] rounded-3xl border border-white/5 p-6 relative overflow-hidden group hover:border-blue-500/20 transition-all duration-500 shadow-xl shadow-black/20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/10 transition-all duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <span className="text-blue-400 font-bold tracking-widest text-[10px] uppercase">Surface</span>
                                <ExternalLink className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="flex items-end gap-3">
                                <span className="text-5xl font-black text-white tracking-tighter">{attack_surface.url_count}</span>
                                <span className="text-xs text-zinc-500 mb-2 font-bold uppercase tracking-wide">URLs</span>
                            </div>
                        </div>
                    </div>

                    {/* Low Severity Count */}
                    <div className="col-span-full bg-[#121214] rounded-2xl p-5 flex items-center justify-between border border-white/5 shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="w-1 h-8 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                            <div>
                                <p className="text-white font-bold text-sm">Low Severity / Informational</p>
                                <p className="text-xs text-zinc-500">Best practices and minor configurations</p>
                            </div>
                        </div>
                        <span className="text-lg font-bold text-blue-400">{summary.by_severity.LOW} Finding{summary.by_severity.LOW !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>

            {/* Vulnerabilities Table Section */}
            <div className="bg-[#121214] rounded-3xl border border-white/5 overflow-hidden shadow-xl shadow-black/20">
                <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20">
                            <FileText className="w-5 h-5 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white tracking-tight">Detailed Findings</h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span>Sort by: Severity (High to Low)</span>
                    </div>
                </div>

                <div className="divide-y divide-white/5">
                    {isSearching ? (
                        <div className="flex justify-center py-20">
                            <Loader className="w-10 h-10 text-purple-500 animate-spin" />
                        </div>
                    ) : filteredVulnerabilities.length === 0 ? (
                        <div className="p-12 text-center">
                            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-bold text-white mb-2">{vulnerabilities.length === 0 ? 'Target Secure' : 'No findings match'}</h3>
                            <p className="text-zinc-500 text-sm">{vulnerabilities.length === 0 ? 'No rule-based vulnerabilities were detected during this scan.' : 'Try adjusting your search query.'}</p>
                        </div>
                    ) : (
                        filteredVulnerabilities.map((vuln: Vulnerability, index: number) => (
                            <div
                                key={index}
                                onClick={() => setSelectedVuln(vuln)}
                                className="p-5 hover:bg-white/[0.02] transition-colors cursor-pointer group border-b border-white/5 last:border-0"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Status Icon */}
                                    <div className="mt-1">
                                        {vuln.severity === 'HIGH' && <AlertTriangle className="w-5 h-5 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />}
                                        {vuln.severity === 'MEDIUM' && <AlertTriangle className="w-5 h-5 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />}
                                        {vuln.severity === 'LOW' && <Shield className="w-5 h-5 text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="text-sm font-bold text-zinc-200 group-hover:text-purple-400 transition-colors truncate">
                                                {vuln.title}
                                            </h4>
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase border ${getSeverityColor(vuln.severity)}`}>
                                                {vuln.severity}
                                            </span>
                                        </div>
                                        <p className="text-zinc-500 text-xs line-clamp-1 mb-2">
                                            {vuln.description.split('\n')[0]}
                                        </p>
                                        <div className="flex items-center gap-4 text-[10px] text-zinc-600 font-mono">
                                            <span className="uppercase tracking-wider font-bold">{vuln.category}</span>
                                            {vuln.evidence?.url && (
                                                <span className="flex items-center gap-1 truncate max-w-md text-zinc-600">
                                                    <span className="w-1 h-1 bg-zinc-600 rounded-full"></span>
                                                    {vuln.evidence.url}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="self-center">
                                        <div className="p-2 rounded-lg group-hover:bg-white/5 transition-colors text-zinc-600 group-hover:text-white">
                                            <ChevronDown className="w-4 h-4 -rotate-90" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
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
