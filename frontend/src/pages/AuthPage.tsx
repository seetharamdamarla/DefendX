import { useState } from 'react'
import { Shield, Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react'
import LogoIcon from '../components/LogoIcon'

interface AuthPageProps {
    onLoginSuccess: () => void
    onBack: () => void
}

/**
 * DefendX Auth Page
 * Sophisticated 3D glassmorphic design for a premium first impression.
 * Optimized for hackathon demos with 'Demo Login' feature.
 */
export default function AuthPage({ onLoginSuccess, onBack }: AuthPageProps) {
    const [mode, setMode] = useState<'login' | 'signup'>('login')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        // Mock Auth Logic using localStorage
        setTimeout(() => {
            const usersJson = localStorage.getItem('defendx_users')
            const users = usersJson ? JSON.parse(usersJson) : []

            if (mode === 'signup') {
                // Check if user already exists
                if (users.find((u: any) => u.email === formData.email)) {
                    setError('An account with this email already exists.')
                    setIsLoading(false)
                    return
                }

                // Register new user
                const newUser = {
                    email: formData.email,
                    password: formData.password,
                    name: formData.name
                }
                localStorage.setItem('defendx_users', JSON.stringify([...users, newUser]))
                localStorage.setItem('defendx_current_user', JSON.stringify(newUser))
                setIsLoading(false)
                onLoginSuccess()
            } else {
                // Login check
                const user = users.find((u: any) => u.email === formData.email && u.password === formData.password)

                if (user) {
                    localStorage.setItem('defendx_current_user', JSON.stringify(user))
                    setIsLoading(false)
                    onLoginSuccess()
                } else {
                    setError('Invalid email or password. Please register if you haven\'t already.')
                    setIsLoading(false)
                }
            }
        }, 1200)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }



    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* 3D Background Elements - Matching Landing Page Aesthetic */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-400/10 blur-[120px] rounded-full"></div>

            <button
                onClick={onBack}
                className="absolute top-8 left-8 text-slate-500 hover:text-slate-900 flex items-center gap-2 transition-all group z-20"
            >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:border-blue-200 group-hover:bg-blue-50 shadow-sm transition-all">
                    <ArrowLeft size={20} />
                </div>
                <span className="font-bold text-sm tracking-wide">Back to Home</span>
            </button>

            <div className="w-full max-w-md relative z-10">
                {/* Logo & Heading */}
                <div className="flex flex-col items-center mb-10">
                    <div className="bg-white p-4 rounded-3xl shadow-xl shadow-blue-600/10 border border-slate-100 mb-6 group hover:scale-110 transition-transform duration-500">
                        <LogoIcon size={48} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        {mode === 'login' ? 'Secure Login' : 'Create Account'}
                    </h1>
                    <p className="text-slate-500 mt-2 text-center text-sm">
                        {mode === 'login'
                            ? 'Access your unified security command center'
                            : 'Join the next generation of vulnerability management'}
                    </p>
                </div>

                {/* Glassmorphic Card */}
                <div className="bg-white/70 backdrop-blur-xl rounded-[40px] p-10 border border-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {mode === 'signup' && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className="w-full bg-white border-2 border-slate-100 rounded-2xl px-12 py-4 text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:outline-none transition-all"
                                        required
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                                        <Shield size={20} />
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="name@company.com"
                                    className="w-full bg-white border-2 border-slate-100 rounded-2xl px-12 py-4 text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:outline-none transition-all"
                                    required
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                                    <Mail size={20} />
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between px-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                                {mode === 'login' && (
                                    <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700">Forgot?</a>
                                )}
                            </div>
                            <div className="relative group">
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full bg-white border-2 border-slate-100 rounded-2xl px-12 py-4 text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:outline-none transition-all"
                                    required
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                                    <Lock size={20} />
                                </span>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-100 animate-shake">
                                <AlertCircle size={16} />
                                <p>{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white rounded-2xl py-4 font-bold text-lg hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>{mode === 'login' ? 'Authenticate' : 'Create Command Center'}</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-400">
                            {mode === 'login' ? "Don't have an account?" : "Already a member?"}{' '}
                            <button
                                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                className="text-blue-600 font-bold hover:underline"
                            >
                                {mode === 'login' ? 'Register Now' : 'Login instead'}
                            </button>
                        </p>
                    </div>
                </div>

                {/* Footer links */}
                <div className="mt-10 flex justify-center gap-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <a href="#" className="hover:text-slate-600">Privacy</a>
                    <a href="#" className="hover:text-slate-600">Terms</a>
                    <a href="#" className="hover:text-slate-600">Compliance</a>
                </div>
            </div>
        </div>
    )
}
