import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LogoIcon from '../components/LogoIcon';
import { useState, useEffect } from 'react';
import { Loader2, ArrowRight, X, AlertOctagon } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

interface SignupPageProps {
    onNavigate: (page: string) => void;
}

export default function SignupPage({ onNavigate }: SignupPageProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Clear error after 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleGoogleSignup = () => {
        setIsLoading(true);
        const base = import.meta.env.VITE_API_URL.replace(/\/$/, "");
        window.location.href = `${base}/api/auth/google/login`;
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const response = await axios.post('/api/auth/signup', {
                email,
                password
            });

            if (response.data.success) {
                // Navigate to scan input page on success
                onNavigate('input');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || 'Signup failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="bg-[#111111] h-screen selection:bg-purple-500/30 font-sans relative overflow-hidden flex flex-col items-center justify-center">

            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[100px]" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[100px]" />
            </div>

            {/* Back Button */}
            <button
                onClick={() => onNavigate('landing')}
                className="absolute top-6 left-6 z-50 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-white/20 transition-all group backdrop-blur-sm"
            >
                <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
            </button>

            {/* Error Toast Popup */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -20, x: '-50%' }}
                        className="fixed top-10 left-1/2 z-50 flex items-center gap-4 bg-red-500/10 border border-red-500/20 backdrop-blur-md px-6 py-4 rounded-xl shadow-2xl shadow-red-500/10 min-w-[320px]"
                    >
                        <div className="p-2 bg-red-500/20 rounded-full text-red-500">
                            <AlertOctagon size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-red-500 font-bold text-sm">Authentication Error</h4>
                            <p className="text-red-200 text-xs mt-0.5">{error}</p>
                        </div>
                        <button
                            onClick={() => setError('')}
                            className="p-1 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 flex flex-col items-center gap-y-8 shadow-2xl relative z-10"
            >
                <div className="flex flex-col items-center gap-y-2">
                    {/* Logo */}
                    <div className="flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/5 mb-4">
                        <LogoIcon size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">DefendX</h1>
                    <p className="text-zinc-500 text-sm">Enter your email below to create your account</p>
                </div>

                <form onSubmit={handleSignup} className="flex w-full flex-col gap-4">
                    <div className="space-y-4">
                        <Input
                            type="email"
                            placeholder="name@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-black/50 border-white/10 text-white placeholder:text-zinc-600 h-12 rounded-xl focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50 transition-all"
                        />
                        <Input
                            type="password"
                            placeholder="Create a password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={6}
                            className="bg-black/50 border-white/10 text-white placeholder:text-zinc-600 h-12 rounded-xl focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50 transition-all"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="mt-2 w-full bg-white text-black hover:bg-zinc-200 h-12 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-white/20"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            'Create an account'
                        )}
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#0f0f11] px-2 text-zinc-500">Or continue with</span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full bg-transparent border-white/10 text-white hover:bg-white/5 h-12 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                        onClick={handleGoogleSignup}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Connecting...
                            </>
                        ) : (
                            <>
                                <svg className="h-5 w-5" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                    <path fill="none" d="M0 0h48v48H0z"></path>
                                </svg>
                                Sign up with Google
                            </>
                        )}
                    </Button>
                </form>

                <div className="text-zinc-500 text-sm flex gap-1">
                    <p>Already have an account?</p>
                    <button
                        className="text-white font-bold hover:underline hover:text-purple-400 transition-colors"
                        onClick={() => onNavigate('dashboard')}
                    >
                        Sign In
                    </button>
                </div>
            </motion.div>
        </section>
    );
};
