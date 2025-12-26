import { Extension } from '@codemirror/state'
import { javascript } from '@codemirror/lang-javascript'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { json } from '@codemirror/lang-json'
import { markdown } from '@codemirror/lang-markdown'
import type { SupportedLanguage } from '../types'

/**
 * Registry of language support extensions
 */
const languageRegistry: Record<SupportedLanguage, () => Extension> = {
    javascript: () => javascript(),
    typescript: () => javascript({ typescript: true }),
    html: () => html(),
    css: () => css(),
    json: () => json(),
    markdown: () => markdown(),
    plaintext: () => [],
}

/**
 * Get the language extension for a given language identifier
 */
export function getLanguageExtension(language: SupportedLanguage): Extension {
    const factory = languageRegistry[language]
    if (!factory) {
        console.warn(`Unknown language: ${language}, falling back to plaintext`)
        return []
    }
    return factory()
}

/**
 * Check if a language is supported
 */
export function isLanguageSupported(language: string): language is SupportedLanguage {
    return language in languageRegistry
}

/**
 * Get list of all supported languages
 */
export function getSupportedLanguages(): SupportedLanguage[] {
    return Object.keys(languageRegistry) as SupportedLanguage[]
}

/**
 * Infer language from file extension
 */
export function inferLanguageFromPath(path: string): SupportedLanguage {
    const ext = path.split('.').pop()?.toLowerCase()

    const extensionMap: Record<string, SupportedLanguage> = {
        js: 'javascript',
        jsx: 'javascript',
        mjs: 'javascript',
        cjs: 'javascript',
        ts: 'typescript',
        tsx: 'typescript',
        mts: 'typescript',
        cts: 'typescript',
        html: 'html',
        htm: 'html',
        css: 'css',
        scss: 'css',
        less: 'css',
        json: 'json',
        jsonc: 'json',
        md: 'markdown',
        mdx: 'markdown',
        txt: 'plaintext',
    }

    return extensionMap[ext ?? ''] ?? 'plaintext'
}
