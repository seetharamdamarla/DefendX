import { useState } from 'react'
import { AlertCircle, Loader2, ShieldCheck, Zap, Search, ArrowRight, CheckCircle2 } from 'lucide-react'
import axios from 'axios'
import type { ScanResult } from '../types'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { BackgroundBeams } from "@/components/ui/background-beams"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { SpotlightCard } from "@/components/ui/spotlight-card"

interface ScanInputPageProps {
    onScanComplete: (result: ScanResult) => void
    onNavigate: (page: string) => void
}

export default function ScanInputPage({ onScanComplete, onNavigate }: ScanInputPageProps) {
    const [url, setUrl] = useState('')
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [isScanning, setIsScanning] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [scanMode, setScanMode] = useState('standard')

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" as const }
        }
    }

    const handleScan = async () => {
        if (!url) {
            setError('Please enter a target URL')
            return
        }
        if (!isAuthorized) {
            setError('Authorization required')
            return
        }

        setIsScanning(true)
        setError(null)

        try {
            let targetUrl = url
            if (!targetUrl.startsWith('http')) {
                targetUrl = `https://${targetUrl}`
            }

            const response = await axios.post('/api/scan', {
                url: targetUrl,
                authorized: isAuthorized,
                mode: scanMode
            })

            if (response.data) {
                onScanComplete(response.data)
            }
        } catch (err: any) {
            console.error('Scan failed:', err)
            if (err.response?.data?.error) {
                setError(err.response.data.error)
            } else {
                setError('Failed to initiate scan. Please check connection.')
            }
        } finally {
            setIsScanning(false)
        }
    }

    return (
        <section className="relative min-h-screen w-full bg-[#070708] text-white overflow-hidden flex flex-col items-center justify-center p-4">

            {/* Back Button */}
            <button
                onClick={() => onNavigate('dashboard')}
                className="absolute top-6 left-6 z-50 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-white/20 transition-all group backdrop-blur-sm"
            >
                <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
            </button>

            {/* Premium Background Beams */}
            <BackgroundBeams className="opacity-40" />

            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/5 blur-[120px]" />
            </div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="relative z-10 w-full max-w-4xl"
            >
                {/* Header */}
                <div className="text-center mb-12 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md mb-6 shadow-2xl shadow-blue-500/10"
                    >
                        <ShieldCheck className="w-8 h-8 text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    </motion.div>

                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
                        Analyze Target Security
                    </h1>
                    <p className="text-zinc-500 text-lg max-w-xl mx-auto leading-relaxed">
                        Deploy advanced scanners to identify vulnerabilities and assess risk exposure in real-time.
                    </p>
                </div>

                {/* Main Card */}
                <div className="rounded-3xl p-1 shadow-2xl shadow-black/50 bg-[#121214] border border-white/5">
                    <div className="bg-[#070708]/80 backdrop-blur-xl rounded-[1.25rem] p-6 md:p-10 relative overflow-hidden">

                        <div className="relative space-y-8">

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl flex items-center gap-3 text-sm"
                                    >
                                        <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* URL Input */}
                            <div className="space-y-3">
                                <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1 tracking-wider">Target Endpoint</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                        <Search className="w-5 h-5 text-zinc-500 transition-colors group-focus-within:text-blue-500" />
                                    </div>
                                    <input
                                        type="text"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="https://example.com"
                                        className="w-full h-16 bg-zinc-900/50 border border-white/5 rounded-2xl pl-12 pr-4 text-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-mono shadow-inner"
                                        disabled={isScanning}
                                    />
                                </div>
                            </div>

                            {/* Scan Modes with Spotlight Effect */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { id: 'discovery', label: 'Discovery', icon: Search, desc: 'Quick surface mapping' },
                                    { id: 'standard', label: 'Standard', icon: Zap, desc: 'Balanced check' },
                                    { id: 'deep', label: 'Deep Scan', icon: ShieldCheck, desc: 'Full analysis' }
                                ].map((mode) => (
                                    <SpotlightCard
                                        key={mode.id}
                                        className={cn(
                                            "cursor-pointer transition-all duration-300 bg-[#121214] border border-white/5 hover:border-blue-500/30",
                                            scanMode === mode.id ? "ring-1 ring-blue-500/50 bg-blue-500/5 shadow-lg shadow-blue-500/10" : ""
                                        )}
                                    >
                                        <button
                                            onClick={() => setScanMode(mode.id)}
                                            disabled={isScanning}
                                            className="w-full h-full p-5 text-left flex flex-col items-start relative z-10"
                                        >
                                            <div className={cn(
                                                "p-2 rounded-lg mb-3 transition-colors",
                                                scanMode === mode.id ? "bg-blue-500 text-white" : "bg-white/5 text-zinc-500 group-hover:text-zinc-300"
                                            )}>
                                                <mode.icon className="w-5 h-5" />
                                            </div>
                                            <span className={cn(
                                                "font-bold text-sm block mb-1 tracking-tight",
                                                scanMode === mode.id ? "text-blue-100" : "text-zinc-300"
                                            )}>
                                                {mode.label}
                                            </span>
                                            <span className="text-xs text-zinc-500 leading-relaxed font-medium">
                                                {mode.desc}
                                            </span>
                                        </button>
                                    </SpotlightCard>
                                ))}
                            </div>

                            {/* Authorization & Action */}
                            <div className="pt-4 flex flex-col md:flex-row gap-6 items-center justify-between border-t border-slate-800/50">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={isAuthorized}
                                            onChange={(e) => setIsAuthorized(e.target.checked)}
                                            className="peer sr-only"
                                            disabled={isScanning}
                                        />
                                        <div className={cn(
                                            "w-5 h-5 rounded border border-white/10 bg-zinc-900 transition-all flex items-center justify-center",
                                            isAuthorized ? "bg-blue-600 border-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]" : "peer-focus:ring-2 peer-focus:ring-blue-500/20"
                                        )}>
                                            {isAuthorized && <CheckCircle2 className="w-3.5 h-3.5" />}
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">
                                        I am authorized to scan this target.
                                    </span>
                                </label>

                                <div className="w-full md:w-auto">
                                    <ShimmerButton
                                        onClick={handleScan}
                                        disabled={isScanning || !isAuthorized}
                                        className="w-full md:w-auto"
                                    >
                                        {isScanning ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                <span>Initializing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Start Security Scan</span>
                                                <ArrowRight className="w-4 h-4 ml-2 opacity-70" />
                                            </>
                                        )}
                                    </ShimmerButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Text */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-zinc-600 text-xs mt-8"
                >
                    Secured by DefendX Engine v2.4.0 • Encrypted Connection
                </motion.p>
            </motion.div>
        </section>
    )
}
