import { useState, useEffect } from 'react'
import { LayoutDashboard, Shield, Activity, Target, LogOut } from 'lucide-react'
import LogoIcon from './LogoIcon'

interface SidebarProps {
    activeTab: 'dashboard' | 'scans' | 'risks' | 'targets' | 'settings'
    onTabChange: (tab: 'dashboard' | 'scans' | 'risks' | 'targets' | 'settings') => void
    onLogout: () => void
}

export default function Sidebar({ activeTab, onTabChange, onLogout }: SidebarProps) {
    const [user, setUser] = useState<{ name: string } | null>(null)

    useEffect(() => {
        const storedUser = localStorage.getItem('defendx_current_user')
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
    }, [])

    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U'
    const shortName = user?.name ? (user.name.split(' ').length > 1 ? `${user.name.split(' ')[0][0]}. ${user.name.split(' ').slice(-1)[0]}` : user.name) : 'User'

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'scans', label: 'Scans', icon: Shield },
        { id: 'risks', label: 'Risks', icon: Activity },
        { id: 'targets', label: 'Targets', icon: Target },
    ] as const

    return (
        <div className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-40">
            {/* Logo */}
            <div className="p-8 flex items-center gap-3">
                <LogoIcon size={32} />
                <span className="text-xl font-bold text-slate-900">
                    DefendX
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${activeTab === item.id
                            ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm border border-blue-100'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                            }`}
                    >
                        <item.icon className={`w-5 h-5 transition-colors ${activeTab === item.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'
                            }`} />
                        <span className="text-sm">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Simple User Profile & Exit */}
            <div className="p-4 border-t border-slate-100 flex flex-col gap-4">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-[10px] font-black shadow-sm">
                        {userInitial}
                    </div>
                    <span className="text-sm font-bold text-slate-900 truncate">{shortName}</span>
                </div>

                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all group"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="font-semibold text-sm">Sign Out</span>
                </button>
            </div>
        </div>
    )
}
