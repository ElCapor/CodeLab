import { useState, useEffect, useRef } from 'react'

export interface Command {
    id: string
    name: string
    description?: string
    shortcut?: string
    action: () => void
}

interface CommandPaletteProps {
    isOpen: boolean
    onClose: () => void
    commands: Command[]
}

/**
 * CommandPalette - Premium CMD+K Search Interface
 */
export function CommandPalette({ isOpen, onClose, commands }: CommandPaletteProps) {
    const [search, setSearch] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)

    const filteredCommands = commands.filter(cmd =>
        cmd.name.toLowerCase().includes(search.toLowerCase()) ||
        cmd.description?.toLowerCase().includes(search.toLowerCase())
    )

    useEffect(() => {
        if (isOpen) {
            setSearch('')
            setSelectedIndex(0)
            setTimeout(() => inputRef.current?.focus(), 10)
        }
    }, [isOpen])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return

            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedIndex(prev => (prev + 1) % filteredCommands.length)
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length)
            }
            if (e.key === 'Enter') {
                e.preventDefault()
                if (filteredCommands[selectedIndex]) {
                    filteredCommands[selectedIndex].action()
                    onClose()
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, filteredCommands, selectedIndex, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="w-full max-w-xl glass-panel rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-in slide-in-from-top-4 duration-300"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center px-4 border-b border-white/5">
                    <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search commands (e.g. 'Run', 'Format')..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="flex-1 h-14 px-4 bg-transparent outline-none text-slate-100 placeholder-slate-500 text-sm"
                    />
                    <div className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] text-slate-400 font-sans">ESC</kbd>
                    </div>
                </div>

                <div className="max-h-[300px] overflow-y-auto py-2">
                    {filteredCommands.length === 0 ? (
                        <div className="px-6 py-10 text-center text-slate-500 text-sm">
                            No commands found for "{search}"
                        </div>
                    ) : (
                        filteredCommands.map((cmd, i) => (
                            <div
                                key={cmd.id}
                                className={`group flex items-center justify-between px-4 py-3 mx-2 rounded-xl cursor-pointer transition-all duration-200 ${i === selectedIndex ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'hover:bg-white/5 text-slate-300'
                                    }`}
                                onClick={() => {
                                    cmd.action()
                                    onClose()
                                }}
                            >
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">{cmd.name}</span>
                                    {cmd.description && (
                                        <span className={`text-[11px] ${i === selectedIndex ? 'text-white/70' : 'text-slate-500'}`}>
                                            {cmd.description}
                                        </span>
                                    )}
                                </div>
                                {cmd.shortcut && (
                                    <div className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${i === selectedIndex ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'
                                        }`}>
                                        {cmd.shortcut}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className="px-4 py-3 bg-white/5 border-top border-white/5 flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <div className="flex items-center gap-1">
                        <kbd className="p-1 rounded border border-white/10">↑↓</kbd> Navigate
                    </div>
                    <div className="flex items-center gap-1">
                        <kbd className="p-1 rounded border border-white/10">Enter</kbd> Select
                    </div>
                </div>
            </div>
        </div>
    )
}
