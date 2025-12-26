import React from 'react'
import { SupportedLanguage } from './CodeEditor'
import { Theme } from '@/lib/theming/ThemeEngine'

interface Settings {
    autocomplete: boolean
    defaultFontSize: number
    defaultLanguage: SupportedLanguage
    theme: Theme
}

interface SettingsPanelProps {
    settings: Settings
    onSettingsChange: (settings: Settings) => void
}

export function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
    const handleToggleAutocomplete = () => {
        onSettingsChange({ ...settings, autocomplete: !settings.autocomplete })
    }

    const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSettingsChange({ ...settings, defaultFontSize: parseInt(e.target.value) || 14 })
    }

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onSettingsChange({ ...settings, defaultLanguage: e.target.value as SupportedLanguage })
    }

    const handleThemeChange = (theme: Theme) => {
        onSettingsChange({ ...settings, theme })
    }

    return (
        <div className="flex flex-col gap-6 p-6 animate-in h-full">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-3 mb-2">
                System Preferences
            </h3>

            <div className="space-y-8">
                {/* Theme Switcher */}
                <div className="space-y-3">
                    <div className="text-xs font-semibold text-slate-300">Visual Theme</div>
                    <div className="flex gap-2 p-1 bg-slate-900 rounded-xl border border-white/5">
                        <button
                            onClick={() => handleThemeChange('dark')}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${settings.theme === 'dark'
                                    ? 'bg-sky-500 text-white shadow-lg'
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            Dark Mode
                        </button>
                        <button
                            onClick={() => handleThemeChange('light')}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${settings.theme === 'light'
                                    ? 'bg-sky-500 text-white shadow-lg'
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            Light Mode
                        </button>
                    </div>
                </div>

                {/* Autocomplete Toggle */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-xs font-semibold text-slate-300">Agentic Autocomplete</div>
                        <div className="text-[10px] text-slate-500">Real-time ghost text suggestions</div>
                    </div>
                    <button
                        onClick={handleToggleAutocomplete}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.autocomplete ? 'bg-emerald-500' : 'bg-slate-700'}`}
                    >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${settings.autocomplete ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                </div>

                {/* Default Font Size */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <div className="text-xs font-semibold text-slate-300">Editor Typography</div>
                        <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full font-mono border border-sky-500/20">{settings.defaultFontSize}px</span>
                    </div>
                    <input
                        type="range"
                        min="8"
                        max="32"
                        value={settings.defaultFontSize}
                        onChange={handleFontSizeChange}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                </div>

                {/* Default Language */}
                <div className="space-y-3">
                    <div className="text-xs font-semibold text-slate-300">Primary Language</div>
                    <select
                        value={settings.defaultLanguage}
                        onChange={handleLanguageChange}
                        className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-300 outline-none focus:border-sky-500 transition-colors appearance-none"
                    >
                        <option value="typescript">TypeScript</option>
                        <option value="javascript">JavaScript</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                        <option value="json">JSON</option>
                        <option value="markdown">Markdown</option>
                    </select>
                </div>
            </div>

            <div className="mt-auto p-4 rounded-2xl bg-sky-500/5 border border-sky-500/10">
                <p className="text-[10px] text-slate-500 italic leading-relaxed">
                    Preferences are stored in your localized environment. Some changes may require a fresh terminal instance.
                </p>
            </div>
        </div>
    )
}
