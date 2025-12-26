import { useState, useMemo, useEffect, useCallback } from 'react'
import {
    CodeEditor,
    Sandbox,
    Sidebar,
    Breadcrumbs,
    IsolatedEditor,
    CommandPalette
} from '@/components'
import { useCodeEditor, useStateEngine, useSandbox, useAI } from '@/hooks'
import { createEditorStateEngine } from '@/lib/state'
import { defaultSanitizer, standardSecurityPipeline } from '@/lib'
import { createCompletionExtension, setGhostText } from '@/components/CodeEditor/extensions'

const SAMPLE_CODE = `// Phase 3: Intelligence & Protocols 🧠
// Try typing 'const' or 'function' to see ghost suggestions!

function greet() {
  const name = "Developer";
  return \`Hello \${name}! This is agentic intelligence.\`;
}

// TODO: Implement real-time LSP protocols
console.log(greet());
`

const LANGUAGES = ['typescript', 'javascript', 'html', 'css', 'json', 'markdown'] as const

function App() {
    const [code, setCode] = useState(SAMPLE_CODE)
    const [language, setLanguage] = useState<typeof LANGUAGES[number]>('typescript')
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
    const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('codelab_gemini_key') || '')

    // Persist API key
    useEffect(() => {
        if (geminiApiKey) localStorage.setItem('codelab_gemini_key', geminiApiKey)
        else localStorage.removeItem('codelab_gemini_key')
    }, [geminiApiKey])

    // Hooks
    const { ref, openSearch, undo: editorUndo, redo: editorRedo, getView } = useCodeEditor()
    const { iframeRef, execute, onReady, lastResult, lastError } = useSandbox({ timeout: 3000 })
    const {
        suggestion,
        isThinking,
        error: aiError,
        requestSuggestion,
        handleAccept,
        handleReject,
        clearSuggestion
    } = useAI(geminiApiKey)

    // Manual AI trigger callback
    const triggerAI = useCallback(() => {
        const view = getView()
        if (view) {
            const pos = view.state.selection.main.head
            const context = view.state.doc.toString()
            requestSuggestion(context, pos, true)
        }
    }, [getView, requestSuggestion])

    // State Engine
    const editorEngine = useMemo(() => createEditorStateEngine({
        content: SAMPLE_CODE,
        language: 'typescript',
    }), [])

    const { canUndo, canRedo, undo, redo } = useStateEngine(editorEngine)

    // Completion Extension with callbacks
    const completionExt = useMemo(() => createCompletionExtension({
        onAccept: () => handleAccept(),
        onReject: () => handleReject(),
        onManualTrigger: () => triggerAI(),
    }), [handleAccept, handleReject, triggerAI])

    // Sanitizer Setup
    useEffect(() => {
        standardSecurityPipeline.forEach(rule => defaultSanitizer.use(rule))
    }, [])

    // Global Keybindings (Cmd+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setIsCommandPaletteOpen(prev => !prev)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    // Sync AI suggestions with Editor Ghost Text
    useEffect(() => {
        const view = getView()
        if (view) {
            view.dispatch({
                effects: setGhostText.of(suggestion ? { text: suggestion.text, pos: suggestion.pos } : null)
            })
        }
    }, [suggestion, getView])

    const handleCodeChange = useCallback((newCode: string) => {
        setCode(newCode)

        // Trigger AI thinking as the user types
        const view = getView()
        if (view) {
            const pos = view.state.selection.main.head
            requestSuggestion(newCode, pos)
        }
    }, [getView, requestSuggestion])

    const handleAction = (type: string) => {
        switch (type) {
            case 'search': openSearch(); break;
            case 'undo': if (canUndo) { undo(); editorUndo(); } break;
            case 'redo': if (canRedo) { redo(); editorRedo(); } break;
            case 'run':
                const safeCode = defaultSanitizer.sanitize(code)
                execute(safeCode)
                break;
            case 'clear_ai': clearSuggestion(); break;
        }
    }

    const commands = [
        { id: 'run', name: 'Run Code Securely', description: 'Execute the current buffer in the sandbox', shortcut: '⌘R', action: () => handleAction('run') },
        { id: 'search', name: 'Search & Replace', description: 'Open the global search panel', shortcut: '⌘F', action: () => handleAction('search') },
        { id: 'undo', name: 'Undo Change', description: 'Revert last edit', shortcut: '⌘Z', action: () => handleAction('undo') },
        { id: 'redo', name: 'Redo Change', description: 'Apply next edit', shortcut: '⇧⌘Z', action: () => handleAction('redo') },
        {
            id: 'predict',
            name: 'Predict Next Steps',
            description: 'Manually trigger AI code completion',
            shortcut: '⌥\\',
            action: () => triggerAI()
        },
        {
            id: 'set_gemini',
            name: 'Set Gemini API Key',
            description: 'Configure your Google Gemini API key for agentic completion',
            action: () => {
                const key = prompt('Enter your Google Gemini API Key:', geminiApiKey)
                if (key !== null) setGeminiApiKey(key)
            }
        },
    ]

    return (
        <>
            <Sidebar />

            <main className="flex-1 flex flex-col h-full overflow-hidden bg-transparent animate-in">
                <header className="flex h-12 items-center justify-between border-b border-white/5 bg-slate-900/40 px-4 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm font-semibold tracking-wide text-slate-100 uppercase italic">CodeLab</h2>
                        <div className="h-4 w-px bg-white/10" />
                        <Breadcrumbs language={language} />
                    </div>

                    <div className="flex items-center gap-3">
                        {!geminiApiKey && (
                            <button
                                onClick={() => setIsCommandPaletteOpen(true)}
                                className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                            >
                                <div className="h-2 w-2 rounded-full bg-amber-400" />
                                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest leading-none">Gemini Missing</span>
                            </button>
                        )}
                        {geminiApiKey && aiError && (
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
                                <div className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
                                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest leading-none">Rate Limited</span>
                            </div>
                        )}
                        {geminiApiKey && isThinking && !aiError && (
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 animate-pulse">
                                <div className="h-2 w-2 rounded-full bg-sky-400" />
                                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest leading-none">Thinking...</span>
                            </div>
                        )}
                        {geminiApiKey && !isThinking && !aiError && (
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest leading-none">Gemini Active</span>
                            </div>
                        )}
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as any)}
                            className="appearance-none rounded-lg border border-white/5 bg-slate-800/50 px-3 py-1 text-xs font-semibold text-sky-400 outline-none hover:bg-slate-800 transition-colors"
                        >
                            {LANGUAGES.map((lang) => (
                                <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => handleAction('run')}
                            className="flex h-7 items-center gap-2 rounded-lg bg-sky-500 px-4 text-xs font-bold text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400 transition-all active:scale-95"
                        >
                            RUN SECURE
                        </button>
                    </div>
                </header>

                <div className="flex h-10 items-center gap-1 border-b border-white/5 bg-slate-900/20 px-4">
                    <ToolbarButton onClick={() => handleAction('search')} icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>} />
                    <div className="h-4 w-px bg-white/10 mx-2" />
                    <ToolbarButton onClick={() => handleAction('undo')} disabled={!canUndo} icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>} />
                    <ToolbarButton onClick={() => handleAction('redo')} disabled={!canRedo} icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" /></svg>} />
                </div>

                <div className="relative flex-1 p-6 flex gap-6 overflow-hidden">
                    <div className="flex-1 glass-card flex flex-col rounded-2xl overflow-hidden border border-white/10 transition-all duration-500 hover:border-sky-500/30">
                        <div className="flex h-8 items-center bg-white/5 px-4 border-b border-white/5">
                            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Workspace</span>
                            {suggestion && (
                                <div className="ml-auto flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-sky-500/70 border border-sky-500/20 px-1.5 rounded uppercase">Tab to accept</span>
                                    <span className="text-[9px] font-bold text-rose-500/70 border border-rose-500/20 px-1.5 rounded uppercase">Esc to reject</span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 overflow-hidden relative">
                            <IsolatedEditor>
                                <CodeEditor
                                    ref={ref}
                                    value={code}
                                    onChange={handleCodeChange}
                                    language={language}
                                    className="h-full"
                                    minHeight="100%"
                                    extensions={[completionExt]}
                                    showDiagnostics={true}
                                />
                            </IsolatedEditor>
                        </div>
                    </div>

                    <div className="w-80 glass-card flex flex-col rounded-2xl overflow-hidden border border-white/10">
                        <div className="flex h-8 items-center bg-white/5 px-4 border-b border-white/5">
                            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Output & Intelligence</span>
                        </div>
                        <div className="flex-1 p-4 overflow-auto font-mono text-sm relative">
                            <Sandbox ref={iframeRef} onReady={onReady} className="absolute inset-0 opacity-0 pointer-events-none" />
                            <div className="space-y-4 relative z-10">
                                {lastResult !== null && (
                                    <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400">
                                        <div className="text-[10px] text-emerald-500/50 uppercase font-bold mb-1">Success</div>
                                        {JSON.stringify(lastResult, null, 2)}
                                    </div>
                                )}
                                {lastError && (
                                    <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-400">
                                        <div className="text-[10px] text-rose-500/50 uppercase font-bold mb-1">Error</div>
                                        {lastError}
                                    </div>
                                )}
                                <div className="p-4 rounded-2xl bg-white/5 space-y-3 border border-white/5">
                                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2 flex items-center justify-between">
                                        <span>Agent Intelligence</span>
                                        {geminiApiKey && (
                                            <button
                                                onClick={() => {
                                                    const key = prompt('Update Gemini API Key:', geminiApiKey)
                                                    if (key !== null) setGeminiApiKey(key)
                                                }}
                                                className="text-[9px] text-sky-400 hover:underline"
                                            >
                                                Change Key
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Provider</span>
                                            <span className="text-slate-300 font-bold">Google Gemini</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Model</span>
                                            <span className="text-slate-300">gemini-2.5-flash</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Status</span>
                                            {geminiApiKey ? (
                                                aiError ? (
                                                    <span className="text-rose-400 font-bold">RATE LIMITED</span>
                                                ) : (
                                                    <span className="text-emerald-400 font-bold">CONNECTED</span>
                                                )
                                            ) : (
                                                <span className="text-amber-400 font-bold italic underline cursor-pointer" onClick={() => setIsCommandPaletteOpen(true)}>SETUP REQUIRED</span>
                                            )}
                                        </div>
                                    </div>
                                    {aiError && (
                                        <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400 animate-in italic leading-tight">
                                            {aiError.message}
                                        </div>
                                    )}
                                    {geminiApiKey && (
                                        <div className="text-[9px] text-slate-500 bg-white/5 p-2 rounded-lg border border-white/5">
                                            <span className="text-sky-400 font-bold uppercase tracking-wider">Pro Tip:</span> Use <kbd className="bg-slate-800 px-1 rounded text-slate-300">Alt + \</kbd> to trigger completion manually and save quota.
                                        </div>
                                    )}
                                    {!geminiApiKey && (
                                        <p className="text-[10px] text-slate-500 leading-relaxed mt-2 italic">
                                            Set your Gemini API key in the command palette (CMD+K) to enable real code intelligence.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="flex h-6 items-center justify-between bg-sky-600 px-4 text-[10px] font-bold uppercase tracking-widest text-white/90">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                            INTELLIGENCE ACTIVE
                        </span>
                        <span>{code.length} CHARS</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span>ENVIRONMENT: SANDBOXED</span>
                        <span>UTF-8</span>
                    </div>
                </footer>
            </main>

            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={() => setIsCommandPaletteOpen(false)}
                commands={commands}
            />
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
