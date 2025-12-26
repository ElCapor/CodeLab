import { useState, useMemo, useEffect, useCallback } from 'react'
import {
    CodeEditor,
    Sandbox,
    Sidebar,
    Breadcrumbs,
    CommandPalette,
    SettingsPanel,
    Resizer
} from '@/components'
import { useCodeEditor, useStateEngine, useSandbox, useAI, useLayout } from '@/hooks'
import { createEditorStateEngine } from '@/lib/state'
import { defaultSanitizer, standardSecurityPipeline } from '@/lib'
import { createCompletionExtension, setGhostText } from '@/components/CodeEditor/extensions'
import { Group, Panel } from 'react-resizable-panels'
import { ThemeEngine, Theme } from '@/lib/theming/ThemeEngine'

const SAMPLE_CODE = `// Phase 4: Stability & Responsiveness 🚀
// Try resizing your browser window or dragging panels!

function stabilityTest() {
  console.log("UI Shaking: RESOLVED");
  console.log("Orientation: ADAPTIVE");
  return "Enjoy the flicker-free experience.";
}

stabilityTest();
`

const LANGUAGES = ['typescript', 'javascript', 'html', 'css', 'json', 'markdown'] as const

function App() {
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('codelab_settings')
        return saved ? JSON.parse(saved) : {
            autocomplete: true,
            defaultFontSize: 14,
            defaultLanguage: 'typescript' as const,
            theme: 'dark' as Theme
        }
    })

    const [code, setCode] = useState(SAMPLE_CODE)
    const [language, setLanguage] = useState<typeof LANGUAGES[number]>(settings.defaultLanguage)
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
    const [fontSize, setFontSize] = useState(settings.defaultFontSize)
    const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('codelab_gemini_key') || '')
    const [activeTab, setActiveTab] = useState('files')

    // Adaptive Orientation Logic
    const [isVertical, setIsVertical] = useState(() => window.innerWidth < 768)
    useEffect(() => {
        const handleResize = () => setIsVertical(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Ultra-stable Layout Persistence
    const { layoutStorage, STORAGE_ID } = useLayout()

    // Sync Settings & Theme
    useEffect(() => {
        localStorage.setItem('codelab_settings', JSON.stringify(settings))
        if (settings.theme) {
            ThemeEngine.setTheme(settings.theme)
        }
    }, [settings])

    useEffect(() => {
        ThemeEngine.initialize()
    }, [])

    useEffect(() => {
        setFontSize(settings.defaultFontSize)
    }, [settings.defaultFontSize])

    useEffect(() => {
        setLanguage(settings.defaultLanguage)
    }, [settings.defaultLanguage])

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

    const triggerAI = useCallback(() => {
        const view = getView()
        if (view) {
            const pos = view.state.selection.main.head
            const context = view.state.doc.toString()
            requestSuggestion(context, pos, true, language)
        }
    }, [getView, requestSuggestion, language])

    const editorEngine = useMemo(() => createEditorStateEngine({
        content: SAMPLE_CODE,
        language: 'typescript',
    }), [])

    const { canUndo, canRedo, undo, redo } = useStateEngine(editorEngine)

    const completionExt = useMemo(() => createCompletionExtension({
        onAccept: handleAccept,
        onReject: handleReject,
        onManualTrigger: triggerAI,
    }), [handleAccept, handleReject, triggerAI])

    useEffect(() => {
        standardSecurityPipeline.forEach(rule => defaultSanitizer.use(rule))
    }, [])

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
        if (!settings.autocomplete) return
        const view = getView()
        if (view) {
            const pos = view.state.selection.main.head
            requestSuggestion(newCode, pos, false, language)
        }
    }, [getView, requestSuggestion, language, settings.autocomplete])

    const handleAction = (type: string) => {
        switch (type) {
            case 'search': openSearch(); break;
            case 'undo': if (canUndo) { undo(); editorUndo(); } break;
            case 'redo': if (canRedo) { redo(); editorRedo(); } break;
            case 'run': execute(defaultSanitizer.sanitize(code)); break;
            case 'clear_ai': clearSuggestion(); break;
        }
    }

    const commands = [
        { id: 'run', name: 'Run Code Securely', description: 'Execute the current buffer', shortcut: '⌘R', action: () => handleAction('run') },
        { id: 'search', name: 'Search & Replace', description: 'Open search panel', shortcut: '⌘F', action: () => handleAction('search') },
        { id: 'undo', name: 'Undo Change', description: 'Revert last edit', shortcut: '⌘Z', action: () => handleAction('undo') },
        { id: 'redo', name: 'Redo Change', description: 'Apply next edit', shortcut: '⇧⌘Z', action: () => handleAction('redo') },
        { id: 'predict', name: 'Predict Next Steps', description: 'Manual AI trigger', shortcut: '⌥\\', action: triggerAI },
        {
            id: 'theme_toggle',
            name: 'Toggle Theme',
            description: 'Switch between light and dark mode',
            action: () => setSettings((s: any) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }))
        },
        {
            id: 'set_gemini',
            name: 'Set Gemini API Key',
            description: 'Configure API key',
            action: () => {
                const key = prompt('Enter your Google Gemini API Key:', geminiApiKey)
                if (key !== null) setGeminiApiKey(key)
            }
        },
        { id: 'font_inc', name: 'Increase Font Size', shortcut: '⌘+', action: () => setFontSize((s: number) => Math.min(s + 1, 32)) },
        { id: 'font_dec', name: 'Decrease Font Size', shortcut: '⌘-', action: () => setFontSize((s: number) => Math.max(s - 1, 8)) },
    ]

    return (
        <Group
            autoSaveId={STORAGE_ID}
            storage={layoutStorage}
            orientation={isVertical ? "vertical" : "horizontal"}
            className="h-full w-full bg-slate-950"
        >
            {/* Sidebar Panel */}
            <Panel
                id="sidebar"
                order={1}
                collapsible
                minSize={isVertical ? 5 : 5}
                maxSize={isVertical ? 40 : 40}
                defaultSize={20}
                className="z-10"
            >
                <div className="h-full w-full md:p-0">
                    <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
                </div>
            </Panel>

            <Resizer direction={isVertical ? "vertical" : "horizontal"} />

            {/* Main Area */}
            <Panel id="main" order={2} className="flex flex-col h-full overflow-hidden">
                <main className="flex-1 flex flex-col h-full overflow-hidden bg-transparent">
                    {/* Header */}
                    <header className="flex h-12 flex-shrink-0 items-center justify-between border-b border-white/5 bg-slate-900/40 px-4 backdrop-blur-md">
                        <div className="flex items-center gap-4">
                            <h2 className="text-sm font-semibold tracking-wide text-slate-100 uppercase italic">CodeLab</h2>
                            <div className="hidden sm:block h-4 w-px bg-white/10" />
                            <div className="hidden sm:block"><Breadcrumbs language={language} /></div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsCommandPaletteOpen(true)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-slate-300 hover:text-white"
                            >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                </svg>
                                <span className="hidden md:inline text-[10px] font-bold uppercase tracking-wider">Commands</span>
                            </button>
                            <div className="hidden sm:block h-4 w-px bg-white/10 mx-1" />
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
                                RUN
                            </button>
                        </div>
                    </header>

                    {/* Content Area */}
                    <div className="flex-1 overflow-hidden">
                        <Group
                            autoSaveId={`${STORAGE_ID}-inner`}
                            storage={layoutStorage}
                            orientation={isVertical ? "vertical" : "horizontal"}
                        >
                            <Panel id="editor" order={1} defaultSize={isVertical ? 60 : 70} minSize={20} className="relative group p-2">
                                <div className="h-full glass-card rounded-2xl overflow-hidden flex flex-col">
                                    <div className="flex h-8 items-center bg-white/5 px-4 border-b border-white/5">
                                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Workspace / {language.toUpperCase()}</span>
                                    </div>
                                    <div className="flex-1 relative">
                                        <CodeEditor
                                            ref={ref}
                                            value={code}
                                            onChange={handleCodeChange}
                                            language={language}
                                            fontSize={fontSize}
                                            extensions={[completionExt]}
                                            className="h-full"
                                        />
                                    </div>
                                </div>
                            </Panel>

                            <Resizer direction={isVertical ? "vertical" : "horizontal"} />

                            <Panel
                                id="intelligence"
                                order={2}
                                defaultSize={isVertical ? 40 : 30}
                                minSize={15}
                                className="p-2"
                            >
                                <div className="h-full glass-card rounded-2xl overflow-hidden flex flex-col">
                                    <div className="flex h-8 items-center bg-white/5 px-4 border-b border-white/5">
                                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                                            {activeTab === 'settings' ? 'Settings' : 'Execution'}
                                        </span>
                                    </div>
                                    <div className="flex-1 overflow-auto flex flex-col min-h-0">
                                        {/* Settings view */}
                                        <div className={activeTab === 'settings' ? 'block' : 'hidden'}>
                                            <SettingsPanel settings={settings} onSettingsChange={setSettings} />
                                        </div>

                                        {/* AI & Sandbox view (Keep mounted!) */}
                                        <div className={activeTab !== 'settings' ? 'flex flex-col h-full flex-1' : 'hidden'}>
                                            <div className="h-1/2 min-h-[150px] border-b border-white/5 relative bg-slate-950/20">
                                                <Sandbox ref={iframeRef} onReady={onReady} />
                                                {lastResult !== null && (
                                                    <div className="absolute bottom-2 left-2 right-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono z-20 overflow-hidden text-ellipsis whitespace-nowrap">
                                                        RESULT: {JSON.stringify(lastResult)}
                                                    </div>
                                                )}
                                                {lastError && (
                                                    <div className="absolute bottom-2 left-2 right-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400 font-mono z-20 overflow-hidden text-ellipsis">
                                                        ERROR: {lastError}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">AI Status</span>
                                                    <span className={`text-[9px] font-mono px-1.5 rounded transition-all ${geminiApiKey ? 'bg-sky-500/10 text-sky-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                        {geminiApiKey ? 'CONNECTED' : 'UNCONFIGURED'}
                                                    </span>
                                                </div>
                                                {geminiApiKey && (
                                                    <div className="text-[9px] text-slate-500 bg-white/5 p-3 rounded-xl border border-white/5 leading-relaxed">
                                                        <span className="text-sky-400 font-bold uppercase tracking-wider block mb-1">Agent Info</span>
                                                        Using Google Gemini 2.5 Flash for agentic completions.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Panel>
                        </Group>
                    </div>

                    {/* Footer */}
                    <footer className="flex h-6 flex-shrink-0 items-center justify-between bg-sky-600 px-4 text-[10px] font-bold uppercase tracking-widest text-white/90">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <span className={`h-1.5 w-1.5 rounded-full bg-white ${isThinking ? 'animate-pulse' : ''}`} />
                                {isThinking ? 'THINKING' : 'IDLE'}
                            </span>
                            <span className="hidden sm:inline">{code.length} CHARS</span>
                        </div>
                        <span className="hidden xs:inline">SANDBOXED EXECUTION</span>
                    </footer>
                </main>
            </Panel>

            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={() => setIsCommandPaletteOpen(false)}
                commands={commands}
            />
        </Group>
    )
}

export default App
