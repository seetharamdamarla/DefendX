import { Shield, Activity, FileText, Github, Linkedin } from 'lucide-react'
import LogoIcon from '../components/LogoIcon'

interface LandingPageProps {
    onGetStarted: () => void
    isLoggedIn?: boolean
}

export default function LandingPage({ onGetStarted, isLoggedIn }: LandingPageProps) {

    const handleStartScan = () => {
        onGetStarted()
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 scroll-smooth">
            {/* Navbar - Transparent & Integrated */}
            <nav className="absolute top-0 left-0 right-0 z-50">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <LogoIcon size={40} />
                        <span className="text-3xl font-black text-slate-900 tracking-tighter">DefendX</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <button onClick={onGetStarted} className="text-base font-bold text-slate-700 hover:text-blue-600 transition-all">
                            {isLoggedIn ? 'Dashboard' : 'Login'}
                        </button>
                        <button
                            onClick={onGetStarted}
                            className="hidden md:block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                        >
                            {isLoggedIn ? 'Go to Dashboard' : 'Get Started'}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-56 px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row items-center gap-20">
                    <div className="flex-1 space-y-10 text-center lg:text-left">
                        <h1 className="text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                            Automated Vulnerability <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Detection Engine</span>
                        </h1>
                        <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                            Secure your web infrastructure against modern threats.
                            DefendX automates detection of OWASP Top 10 vulnerabilities, including SQL Injection, XSS, and misconfigurations.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start">
                            <button
                                onClick={handleStartScan}
                                className="w-full sm:w-auto px-10 py-5 bg-blue-600 text-white rounded-xl font-bold text-xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 hover:scale-105"
                            >
                                {isLoggedIn ? 'Go to Dashboard' : 'Start Security Audit'}
                            </button>
                        </div>
                    </div>

                    {/* Impressive 3D Security Visual */}
                    <div className="flex-1 w-full max-w-xl lg:max-w-none relative">
                        <div className="relative aspect-square flex items-center justify-center">
                            {/* Deep Glowing Background Layers */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-blue-600/10 blur-[150px] rounded-full"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-cyan-400/15 blur-[100px] rounded-full animate-pulse"></div>

                            {/* Glassmorphic 3D Shield Container */}
                            <div className="relative z-10 w-72 h-72 md:w-96 md:h-96 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-2xl border border-white/30 rounded-[60px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] flex items-center justify-center transform hover:rotate-3 hover:scale-110 transition-all duration-1000 cursor-default group overflow-hidden">
                                {/* Lens Flare Effect */}
                                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/20 to-transparent rotate-45 pointer-events-none"></div>

                                {/* Centered Shield Icon with Intense Glow */}
                                <div className="bg-blue-600/10 p-12 rounded-full relative group-hover:scale-110 transition-transform duration-700">
                                    <Shield size={160} className="text-blue-600 drop-shadow-[0_0_50px_rgba(37,99,235,0.4)] animate-[pulse_3s_infinite]" />
                                    {/* Rotating scan element */}
                                    <div className="absolute inset-0 border-2 border-dashed border-blue-400/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
                                </div>

                                {/* Digital Grid Background subtle */}
                                <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-10"></div>
                            </div>

                            {/* Floating Info Cards for depth */}
                            <div className="absolute top-4 -right-4 p-5 bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl border border-slate-100 animate-[bounce_5s_infinite] delay-1000 z-20">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                        <Activity size={20} className="text-green-600" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Health Status</span>
                                        <span className="text-sm font-extrabold text-slate-900">Protected</span>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -bottom-4 -left-4 p-5 bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl border border-slate-100 animate-[bounce_4s_infinite] z-20">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                        <div className="w-3 h-3 rounded-full bg-blue-600 animate-ping"></div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Scanning</span>
                                        <span className="text-sm font-extrabold text-slate-900">Live Traffic</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-extrabold text-slate-900 mb-6">Comprehensive <span className="text-blue-600">Threat Coverage</span></h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            Our engine is constantly updated to detect the latest vulnerabilities defined by industry standards.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Shield className="text-current" size={28} />}
                            title="OWASP Top 10"
                            desc="Automatically checks for the most critical web application security risks, including Injection and Broken Auth."
                        />
                        <FeatureCard
                            icon={<Activity className="text-current" size={28} />}
                            title="Real-time Monitoring"
                            desc="Continuous active scanning ensures new threats are detected as soon as they emerge."
                        />
                        <FeatureCard
                            icon={<FileText className="text-current" size={28} />}
                            title="Compliance Ready"
                            desc="Generate detailed audit reports compatible with GDPR, SOC2, and HIPAA requirements."
                        />
                    </div>
                </div>
            </section>

            {/* Why Choose DefendX - Comparison Section */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Why Choose <span className="text-blue-600">DefendX?</span></h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            Stop relying on outdated, manual security practices. Switch to the future of automated vulnerability management.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Traditional Way */}
                        <div className="bg-slate-50 p-10 rounded-3xl border border-slate-200 relative overflow-hidden group hover:border-red-200 transition-colors">
                            <div className="absolute top-0 right-0 p-6 opacity-10">
                                <FileText size={120} className="text-slate-400 rotate-12" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-700 mb-2">Traditional Manual Audits</h3>
                            <p className="text-slate-500 mb-8 text-sm uppercase tracking-wider font-semibold">Slow & Expensive</p>

                            <ul className="space-y-6">
                                <li className="flex items-start gap-4 text-slate-600">
                                    <div className="bg-red-100 p-1 rounded-full text-red-500 mt-1 flex-shrink-0">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                    </div>
                                    <span className="leading-relaxed">Weeks often required to schedule and complete a single audit.</span>
                                </li>
                                <li className="flex items-start gap-4 text-slate-600">
                                    <div className="bg-red-100 p-1 rounded-full text-red-500 mt-1 flex-shrink-0">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                    </div>
                                    <span className="leading-relaxed">Static reports that become outdated the moment new code is pushed.</span>
                                </li>
                                <li className="flex items-start gap-4 text-slate-600">
                                    <div className="bg-red-100 p-1 rounded-full text-red-500 mt-1 flex-shrink-0">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                    </div>
                                    <span className="leading-relaxed">High cost per scan, making it impossible to check every deployment.</span>
                                </li>
                            </ul>
                        </div>

                        {/* DefendX Way */}
                        <div className="bg-slate-900 p-10 rounded-3xl border border-blue-500/30 relative overflow-hidden shadow-2xl h-full">
                            {/* Gradient Background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 opacity-90"></div>

                            {/* Content */}
                            <div className="relative z-10 text-white">
                                <h3 className="text-2xl font-bold mb-2">DefendX Automated Engine</h3>
                                <p className="text-blue-200 mb-8 text-sm uppercase tracking-wider font-semibold border-b border-blue-400/30 pb-4 inline-block">Fast & Intelligent</p>

                                <ul className="space-y-6">
                                    <li className="flex items-start gap-4">
                                        <div className="bg-green-500/20 p-1 rounded-full text-green-300 mt-1 flex-shrink-0 border border-green-500/50 shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                        </div>
                                        <span className="leading-relaxed text-blue-50 font-medium">Instant results in minutes, integrated directly into your workflow.</span>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="bg-green-500/20 p-1 rounded-full text-green-300 mt-1 flex-shrink-0 border border-green-500/50 shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                        </div>
                                        <span className="leading-relaxed text-blue-50 font-medium">Continuous 24/7 monitoring that catches vulnerabilities in real-time.</span>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="bg-green-500/20 p-1 rounded-full text-green-300 mt-1 flex-shrink-0 border border-green-500/50 shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                        </div>
                                        <span className="leading-relaxed text-blue-50 font-medium">Unlimited scans included, ensuring every single commit is secure.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="relative rounded-3xl p-16 overflow-hidden text-center group">
                        {/* Dynamic Background */}
                        <div className="absolute inset-0 bg-slate-900">
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none"></div>
                        </div>

                        {/* Decorative Rings */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-blue-500/10 rounded-full animate-[spin_10s_linear_infinite] pointer-events-none"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-blue-400/10 rounded-full animate-[spin_15s_linear_infinite_reverse] pointer-events-none"></div>

                        <div className="relative z-10 space-y-8">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                                Ready to secure your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">application?</span>
                            </h2>
                            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                                Join thousands of developers who trust DefendX to keep their infrastructure safe from emerging threats.
                            </p>
                            <div className="flex justify-center">
                                <button
                                    onClick={handleStartScan}
                                    className="group relative px-14 py-4 bg-white text-slate-900 rounded-2xl font-black text-lg hover:scale-110 transition-all duration-500 shadow-[0_20px_50px_-10px_rgba(255,255,255,0.2)] overflow-hidden"
                                >
                                    {/* Shine reflection effect */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out"></div>

                                    <span className="relative z-10 tracking-[0.2em] uppercase">
                                        {isLoggedIn ? 'Go to Dashboard' : 'Protect'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white py-20 border-t border-slate-100">
                <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-2xl">
                            <LogoIcon size={40} />
                        </div>
                        <span className="text-3xl font-bold text-slate-900 tracking-tight">DefendX</span>
                    </div>

                    <p className="text-slate-500 leading-relaxed text-lg max-w-2xl mx-auto">
                        Intelligent security infrastructure for modern web applications.
                        Built to automate vulnerability detection, ensure compliance, and scale your defense with confidence.
                    </p>

                    <div className="flex items-center justify-center gap-6 pt-4">
                        <a href="https://github.com/seetharamdamarla" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-900 transition-colors p-2 hover:bg-slate-50 rounded-xl">
                            <Github size={28} />
                        </a>
                        <a href="https://www.linkedin.com/in/seetharamdamarla" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-xl">
                            <Linkedin size={28} />
                        </a>
                    </div>

                    <div className="pt-8 text-sm text-slate-400">
                        &copy; {new Date().getFullYear()} DefendX Security. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden">
            {/* Hover Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

            {/* Decorative blob */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-100/50 rounded-full blur-2xl group-hover:bg-blue-200/50 transition-colors"></div>

            <div className="relative z-10">
                {/* Icon Container - Clean & Professional */}
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                    <div className="text-blue-600 group-hover:text-white transition-colors duration-300">
                        {icon}
                    </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">{title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{desc}</p>


            </div>
        </div>
    )
}
