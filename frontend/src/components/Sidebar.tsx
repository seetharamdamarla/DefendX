import { useState } from 'react'
import { LayoutDashboard, Shield, Activity, Target, LogOut, ChevronsRight, FileText } from 'lucide-react'
import LogoIcon from './LogoIcon'

interface SidebarProps {
    activeTab: 'dashboard' | 'scans' | 'risks' | 'targets' | 'settings' | 'results'
    onTabChange: (tab: 'dashboard' | 'scans' | 'risks' | 'targets' | 'settings' | 'results') => void
    onLogout: () => void
    showResults?: boolean
}

export default function Sidebar({ activeTab, onTabChange, onLogout, showResults }: SidebarProps) {
    const [open, setOpen] = useState(true)

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'scans', label: 'Scans', icon: Shield },
        // Conditionally add Results item if showResults is true or activeTab is results
        ...(showResults || activeTab === 'results' ? [{ id: 'results', label: 'Scan Results', icon: FileText }] : []),
        { id: 'risks', label: 'Risks', icon: Activity },
        { id: 'targets', label: 'Targets', icon: Target },
    ] as const

    return (
        <nav
            className={`sticky top-0 h-screen shrink-0 border-r border-white/5 bg-[#070708] transition-all duration-300 ease-in-out ${open ? 'w-64' : 'w-20'
                } flex flex-col`}
        >
            <div className="flex-1 flex flex-col p-4 space-y-6">
                {/* Title / Logo Section */}
                <div className="flex items-center gap-3 px-2">
                    <LogoIcon size={32} />
                    {open && (
                        <div className="flex flex-col animate-fadeIn">
                            <span className="font-bold text-white text-lg tracking-tight">DefendX</span>
                            <span className="text-xs text-zinc-500 font-medium tracking-wide">Security Ops</span>
                        </div>
                    )}
                </div>

                {/* Main Navigation */}
                <div className="space-y-1">
                    {menuItems.map((item) => (
                        <Option
                            key={item.id}
                            Icon={item.icon}
                            title={item.label}
                            selected={activeTab === item.id}
                            onClick={() => onTabChange(item.id as any)}
                            open={open}
                        />
                    ))}
                </div>

                {/* Footer Section (Account/Settings) */}
                <div className="mt-auto pt-4 border-t border-white/10 space-y-1">


                    <button
                        onClick={onLogout}
                        className={`relative flex h-11 w-full items-center rounded-lg transition-all duration-200 group hover:bg-red-500/10 hover:text-red-400 text-zinc-400`}
                    >
                        <div className="grid h-full w-12 place-content-center shrink-0">
                            <LogOut className="h-5 w-5 transition-transform group-hover:scale-110" />
                        </div>
                        {open && (
                            <span className="text-sm font-medium animate-fadeIn ml-1">
                                Sign Out
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Toggle Button */}
            <div className="p-4 border-t border-white/5">
                <button
                    onClick={() => setOpen(!open)}
                    className="flex w-full items-center justify-center rounded-xl p-2 text-zinc-600 hover:bg-white/5 hover:text-zinc-300 transition-all duration-300 group"
                >
                    <ChevronsRight
                        className={`h-4 w-4 transition-transform duration-500 ${open ? "rotate-180" : "group-hover:scale-110"
                            }`}
                    />
                </button>
            </div>
        </nav>
    )
}

function Option({ Icon, title, selected, onClick, open, notifs }: { Icon: any, title: string, selected: boolean, onClick: () => void, open: boolean, notifs?: number }) {
    return (
        <button
            onClick={onClick}
            className={`relative flex h-11 w-full items-center rounded-xl transition-all duration-300 group overflow-hidden ${selected
                ? "bg-gradient-to-r from-purple-500/20 to-transparent text-white"
                : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
                }`}
        >
            {/* Active Indicator Line */}
            {selected && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-purple-500 rounded-r-full shadow-[0_0_10px_#a855f7]" />
            )}

            <div className="grid h-full w-14 place-content-center shrink-0 z-10">
                <Icon
                    className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${selected ? "text-purple-400 drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]" : "group-hover:text-zinc-300"
                        }`}
                />
            </div>

            {open && (
                <span className={`text-sm tracking-wide whitespace-nowrap ml-1 text-left flex-1 truncate transition-opacity duration-300 z-10 ${selected ? "font-bold" : "font-medium"
                    }`}>
                    {title}
                </span>
            )}

            {notifs && open && (
                <span className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white font-bold shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                    {notifs}
                </span>
            )}

            {/* Hover Glow Effect for inactive items */}
            {!selected && (
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            )}
        </button>
    )
}
