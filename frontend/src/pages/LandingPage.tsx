import { Shield, Target, Search, Lock, Zap, Code, Server } from 'lucide-react'
import LogoIcon from '../components/LogoIcon'
import { GLSLHills } from '../components/ui/glsl-hills'
import { ButtonCta } from '../components/ui/button-shiny'
import RadialOrbitalTimeline from '../components/ui/radial-orbital-timeline'
import { Timeline } from '../components/ui/timeline'
import HoverFooter from '../components/HoverFooter'

interface LandingPageProps {
    onGetStarted: () => void
}

const timelineData = [
    {
        id: 1,
        title: "Scan Target",
        date: "Phase 1",
        content: "Enter your target URL and configure scan parameters for comprehensive security analysis.",
        category: "Input",
        icon: Target,
        relatedIds: [2],
        status: "completed" as const,
        energy: 100,
    },
    {
        id: 2,
        title: "Deep Analysis",
        date: "Phase 2",
        content: "AI-powered vulnerability scanner analyzes your application for OWASP Top 10 threats.",
        category: "Scanning",
        icon: Search,
        relatedIds: [1, 3],
        status: "in-progress" as const,
        energy: 85,
    },
    {
        id: 3,
        title: "Threat Detection",
        date: "Phase 3",
        content: "Identify SQL Injection, XSS, CSRF, and other critical security vulnerabilities.",
        category: "Detection",
        icon: Shield,
        relatedIds: [2, 4],
        status: "in-progress" as const,
        energy: 70,
    },
    {
        id: 4,
        title: "Risk Assessment",
        date: "Phase 4",
        content: "Categorize vulnerabilities by severity level and potential impact on your system.",
        category: "Analysis",
        icon: Zap,
        relatedIds: [3, 5],
        status: "pending" as const,
        energy: 45,
    },
    {
        id: 5,
        title: "Secure Deploy",
        date: "Phase 5",
        content: "Receive actionable recommendations and deploy security patches with confidence.",
        category: "Remediation",
        icon: Lock,
        relatedIds: [4],
        status: "pending" as const,
        energy: 20,
    },
];

const journeyData = [
    {
        title: "AI-Powered Detection",
        content: (
            <div>
                <p className="text-white text-xs md:text-sm font-normal mb-8">
                    <span className="font-bold text-white">Machine Learning at Scale</span> - DefendX leverages advanced AI algorithms to identify vulnerabilities with unprecedented accuracy. Our engine learns from millions of attack patterns to detect both known and zero-day exploits.
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <Zap className="w-8 h-8 text-white mb-2" />
                        <h4 className="text-white font-bold mb-1">Real-time Analysis</h4>
                        <p className="text-gray-400 text-xs">Instant vulnerability detection as you scan</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <Code className="w-8 h-8 text-white mb-2" />
                        <h4 className="text-white font-bold mb-1">Pattern Recognition</h4>
                        <p className="text-gray-400 text-xs">Detects complex attack vectors automatically</p>
                    </div>
                </div>
            </div>
        ),
    },
    {
        title: "OWASP Top 10 Coverage",
        content: (
            <div>
                <p className="text-white text-xs md:text-sm font-normal mb-4">
                    <span className="font-bold text-white">Complete Security Assessment</span> - DefendX provides comprehensive coverage of all OWASP Top 10 vulnerabilities and beyond.
                </p>
                <div className="mb-8">
                    <div className="flex gap-2 items-center text-white text-xs md:text-sm mb-2">
                        ✅ Injection Attacks (SQL, NoSQL, Command)
                    </div>
                    <div className="flex gap-2 items-center text-white text-xs md:text-sm mb-2">
                        ✅ Broken Authentication & Session Management
                    </div>
                    <div className="flex gap-2 items-center text-white text-xs md:text-sm mb-2">
                        ✅ Cross-Site Scripting (XSS) - Stored, Reflected, DOM
                    </div>
                    <div className="flex gap-2 items-center text-white text-xs md:text-sm mb-2">
                        ✅ Security Misconfiguration & Exposure
                    </div>
                    <div className="flex gap-2 items-center text-white text-xs md:text-sm mb-2">
                        ✅ CSRF, XXE, Insecure Deserialization & More
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="bg-white rounded-lg p-6 shadow-[0_0_24px_rgba(255,255,255,0.1)]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-xs font-mono text-gray-400">SQL INJECTION</div>
                            <div className="px-2 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded">CRITICAL</div>
                        </div>
                        <h4 className="text-black font-bold text-sm mb-2">Database Query Exploit</h4>
                        <p className="text-gray-600 text-xs mb-3">Malicious SQL statements inserted into entry fields</p>
                        <div className="bg-black/5 rounded p-2 font-mono text-xs text-gray-700">
                            SELECT * FROM users WHERE id='1' OR '1'='1'
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-[0_0_24px_rgba(255,255,255,0.1)]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-xs font-mono text-gray-400">XSS ATTACK</div>
                            <div className="px-2 py-1 bg-orange-500/10 text-orange-500 text-xs font-bold rounded">HIGH</div>
                        </div>
                        <h4 className="text-black font-bold text-sm mb-2">Script Injection</h4>
                        <p className="text-gray-600 text-xs mb-3">Malicious scripts injected into trusted websites</p>
                        <div className="bg-black/5 rounded p-2 font-mono text-xs text-gray-700">
                            {'<script>alert("XSS")</script>'}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-[0_0_24px_rgba(255,255,255,0.1)]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-xs font-mono text-gray-400">CSRF TOKEN</div>
                            <div className="px-2 py-1 bg-yellow-500/10 text-yellow-600 text-xs font-bold rounded">MEDIUM</div>
                        </div>
                        <h4 className="text-black font-bold text-sm mb-2">Cross-Site Request Forgery</h4>
                        <p className="text-gray-600 text-xs mb-3">Unauthorized commands from trusted user</p>
                        <div className="bg-black/5 rounded p-2 font-mono text-xs text-gray-700">
                            POST /transfer?amount=1000
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-[0_0_24px_rgba(255,255,255,0.1)]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-xs font-mono text-gray-400">AUTH BYPASS</div>
                            <div className="px-2 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded">CRITICAL</div>
                        </div>
                        <h4 className="text-black font-bold text-sm mb-2">Broken Authentication</h4>
                        <p className="text-gray-600 text-xs mb-3">Weak session management and credentials</p>
                        <div className="bg-black/5 rounded p-2 font-mono text-xs text-gray-700">
                            admin:admin / Session ID predictable
                        </div>
                    </div>
                </div>
            </div>
        ),
    },
    {
        title: "Detailed Reports",
        content: (
            <div>
                <p className="text-white text-xs md:text-sm font-normal mb-8">
                    <span className="font-bold text-white">Actionable Intelligence</span> - Get comprehensive security reports with CVSS scores, proof-of-concept exploits, and step-by-step remediation guidance. Export reports in multiple formats for compliance and tracking.
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <Shield className="w-8 h-8 text-white mb-2" />
                        <h4 className="text-white font-bold mb-1">Risk Prioritization</h4>
                        <p className="text-gray-400 text-xs">Severity-based vulnerability ranking</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <Server className="w-8 h-8 text-white mb-2" />
                        <h4 className="text-white font-bold mb-1">Compliance Ready</h4>
                        <p className="text-gray-400 text-xs">Export reports for audits & compliance</p>
                    </div>
                </div>
            </div>
        ),
    },
];

export default function LandingPage({ onGetStarted }: LandingPageProps) {

    const handleStartScan = () => {
        onGetStarted()
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white/10 selection:text-white scroll-smooth">
            {/* Navbar - Transparent & Integrated */}
            <nav className="absolute top-0 left-0 right-0 z-50">
                <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center">
                    <div className="flex items-center gap-2">
                        <LogoIcon size={28} />
                        <span className="text-xl font-black text-white tracking-tight">DefendX</span>
                    </div>
                </div>
            </nav>

            {/* Hero Section with GLSL Hills Background */}
            <section className="relative pt-32 pb-56 px-6 lg:px-8 h-screen overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 z-0">
                    <GLSLHills speed={0.3} />
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col items-center justify-center text-center">
                    <div className="space-y-10">
                        <h1 className="text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
                            Automated Vulnerability <br />
                            <span className="text-gray-400">Detection Engine</span>
                        </h1>
                        <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
                            Secure your web infrastructure against modern threats.
                            DefendX automates detection of OWASP Top 10 vulnerabilities, including SQL Injection, XSS, and misconfigurations.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-5 justify-center">
                            <ButtonCta
                                label="Start Scan"
                                onClick={handleStartScan}
                                className="w-full sm:w-auto px-10 h-16 text-2xl font-black tracking-widest hover:scale-105 font-['Space_Grotesk']"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Timeline Section */}
            <section id="features" className="relative bg-black">
                <Timeline data={journeyData} />
            </section>

            {/* Radial Orbital Timeline Section */}
            <section className="relative">
                <RadialOrbitalTimeline timelineData={timelineData} />
            </section>

            {/* Hover Footer */}
            <HoverFooter />
        </div>
    )
}
