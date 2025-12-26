import { useState, useMemo } from 'react'
import { CodeEditor, type SupportedLanguage } from '@/components/CodeEditor'
import { useCodeEditor } from '@/hooks'
import { createEditorStateEngine } from '@/lib/state'
import { useStateEngine } from '@/hooks/useStateEngine'
import { Sidebar } from '@/components/Sidebar'
import { Breadcrumbs } from '@/components/Breadcrumbs'

const SAMPLE_CODE = `// Welcome to CodeLab Premium 🚀
// A high-performance IDE framework designed for modern web apps.

/**
 * Super Fancy UI Overhaul:
 * - Glassmorphic design system
 * - Multi-layered depth with mesh gradients
 * - Integrated IDE layout with collapsible tools
 * - Refined typography and syntax highlighting
 */

async function initializeProject() {
  const result = await fetch('/api/init');
  const data = await result.json();
  
  console.log("CodeLab is ready.", data);
  return { 
    status: 'success', 
    engine: 'Vite 6',
    ui: 'Premium' 
  };
}

initializeProject();
`

const LANGUAGES: SupportedLanguage[] = [
    'typescript',
    'javascript',
    'html',
    'css',
    'json',
    'markdown',
]

function App() {
    const [code, setCode] = useState(SAMPLE_CODE)
    const [language, setLanguage] = useState<SupportedLanguage>('typescript')
    const { ref, openSearch, getSelection, insertAt, undo: editorUndo, redo: editorRedo } = useCodeEditor()

    // Create editor state engine
    const editorEngine = useMemo(() => createEditorStateEngine({
        content: SAMPLE_CODE,
        language: 'typescript',
    }), [])

    const { dispatch, canUndo, canRedo, undo, redo } = useStateEngine(editorEngine)

    const handleAction = (type: string) => {
        switch (type) {
            case 'search': openSearch(); break;
            case 'undo': if (canUndo) { undo(); editorUndo(); } break;
            case 'redo': if (canRedo) { redo(); editorRedo(); } break;
            case 'timestamp':
                const { from } = getSelection();
                insertAt(from, `/* ${new Date().toLocaleTimeString()} */\n`);
                break;
        }
    }

    return (
        <>
            <Sidebar />

            <main className="flex-1 flex flex-col h-full overflow-hidden bg-transparent">
                {/* Top Header */}
                <header className="flex h-12 items-center justify-between border-b border-white/5 bg-slate-900/40 px-4 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm font-semibold tracking-wide text-slate-100 uppercase italic">CodeLab</h2>
                        <div className="h-4 w-px bg-white/10" />
                        <Breadcrumbs language={language} />
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                            className="appearance-none rounded-lg border border-white/5 bg-slate-800/50 px-3 py-1 text-xs font-semibold text-sky-400 outline-none hover:bg-slate-800 transition-colors"
                        >
                            {LANGUAGES.map((lang) => (
                                <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                            ))}
                        </select>
                        <button className="flex h-7 items-center gap-2 rounded-lg bg-sky-500 px-4 text-xs font-bold text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400 transition-all active:scale-95">
                            DEPLOY
                        </button>
                    </div>
                </header>

                {/* Toolbar */}
                <div className="flex h-10 items-center gap-1 border-b border-white/5 bg-slate-900/20 px-4">
                    <ToolbarButton onClick={() => handleAction('search')} icon={
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    } />
                    <div className="h-4 w-px bg-white/10 mx-2" />
                    <ToolbarButton onClick={() => handleAction('undo')} disabled={!canUndo} icon={
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                    } />
                    <ToolbarButton onClick={() => handleAction('redo')} disabled={!canRedo} icon={
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" /></svg>
                    } />
                    <div className="h-4 w-px bg-white/10 mx-2" />
                    <ToolbarButton onClick={() => handleAction('timestamp')} icon={
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    } />
                </div>

                {/* Workspace */}
                <div className="relative flex-1 p-6 flex flex-col overflow-hidden">
                    <div className="glass-card flex-1 flex flex-col rounded-2xl overflow-hidden border border-white/10 transition-all duration-500 hover:border-sky-500/30">
                        <div className="flex h-8 items-center bg-white/5 px-4 border-b border-white/5">
                            <div className="flex gap-1.5">
                                <div className="h-2.5 w-2.5 rounded-full bg-rose-500/50" />
                                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/50" />
                                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden relative">
                            <CodeEditor
                                ref={ref}
                                value={code}
                                onChange={(newCode) => {
                                    setCode(newCode)
                                    dispatch({ type: 'SET_CONTENT', payload: newCode })
                                }}
                                language={language}
                                className="h-full"
                                minHeight="100%"
                            />
                        </div>
                    </div>
                </div>

                {/* Status Bar */}
                <footer className="flex h-6 items-center justify-between bg-indigo-600 px-4 text-[10px] font-bold uppercase tracking-widest text-white/90">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                            SYSTEM READY
                        </span>
                        <span>{code.length} CHARS</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span>LSP: CONNECTED</span>
                        <span>UTF-8</span>
                    </div>
                </footer>
            </main>
        </>
    )
}

function ToolbarButton({ onClick, icon, disabled }: { onClick: () => void, icon: React.ReactNode, disabled?: boolean }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-white/10 hover:text-white transition-all active:scale-90 disabled:opacity-20"
        >
            {icon}
        </button>
    )
}

export default App
