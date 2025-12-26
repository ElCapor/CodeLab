import { useState } from 'react'

interface SidebarIconProps {
    icon: React.ReactNode
    label: string
    active?: boolean
    onClick?: () => void
}

function SidebarIcon({ icon, label, active, onClick }: SidebarIconProps) {
    return (
        <div
            onClick={onClick}
            className={`group relative flex h-12 w-12 cursor-pointer items-center justify-center transition-all duration-300 ${active
                    ? 'text-sky-400'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
            title={label}
        >
            <div className={`absolute left-0 h-6 w-1 rounded-r-full bg-sky-400 transition-all duration-300 ${active ? 'opacity-100' : 'opacity-0'
                }`} />
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${active ? 'bg-sky-500/10' : 'group-hover:bg-slate-800/50'
                }`}>
                {icon}
            </div>

            {/* Tooltip placeholder logic can go here */}
        </div>
    )
}

export function Sidebar() {
    const [activeTab, setActiveTab] = useState('files')

    return (
        <aside className="glass-panel flex h-full w-16 flex-col items-center py-4 border-r border-white/5 z-20">
            <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 shadow-lg shadow-sky-500/20">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            </div>

            <div className="flex flex-1 flex-col gap-2">
                <SidebarIcon
                    label="Explorer"
                    active={activeTab === 'files'}
                    onClick={() => setActiveTab('files')}
                    icon={
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                    }
                />
                <SidebarIcon
                    label="Search"
                    active={activeTab === 'search'}
                    onClick={() => setActiveTab('search')}
                    icon={
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    }
                />
                <SidebarIcon
                    label="Extensions"
                    active={activeTab === 'extensions'}
                    onClick={() => setActiveTab('extensions')}
                    icon={
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a2 2 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 011 1V4z" />
                        </svg>
                    }
                />
            </div>

            <div className="mt-auto flex flex-col gap-2">
                <SidebarIcon
                    label="Settings"
                    icon={
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    }
                />
                <div className="h-10 w-10 overflow-hidden rounded-full border border-white/10 p-0.5">
                    <div className="h-full w-full rounded-full bg-gradient-to-br from-indigo-400 to-purple-500" />
                </div>
            </div>
        </aside>
    )
}
