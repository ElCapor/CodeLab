import { EditorView } from '@codemirror/view'
import { Extension } from '@codemirror/state'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import type { EditorTheme } from '../types'

/**
 * Premium Dark Theme - Sky & Slate Palette
 */
const defaultTheme: Required<EditorTheme> = {
    background: 'transparent',
    foreground: '#cbd5e1', // slate-300
    cursor: '#38bdf8',     // sky-400
    selection: 'rgba(56, 189, 248, 0.25)',
    lineNumbers: '#475569', // slate-600
    activeLine: 'rgba(255, 255, 255, 0.03)',
    matchingBracket: 'rgba(56, 189, 248, 0.3)',
}

/**
 * Creates the editor theme extension
 */
export function createThemeExtension(theme: EditorTheme = {}): Extension {
    const merged = { ...defaultTheme, ...theme }

    return EditorView.theme({
        '&': {
            backgroundColor: merged.background,
            color: merged.foreground,
        },
        '.cm-content': {
            caretColor: merged.cursor,
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            lineHeight: '1.7',
            padding: '10px 0',
        },
        '.cm-cursor, .cm-dropCursor': {
            borderLeftColor: merged.cursor,
            borderLeftWidth: '2px',
        },
        '&.cm-focused .cm-selectionBackground': {
            backgroundColor: 'rgba(56, 189, 248, 0.3) !important',
        },
        '.cm-selectionBackground': {
            backgroundColor: 'rgba(56, 189, 248, 0.2) !important',
        },
        '.cm-content ::selection': {
            backgroundColor: 'rgba(56, 189, 248, 0.3)',
            color: 'inherit !important',
        },
        '.cm-line *::selection': {
            backgroundColor: 'rgba(56, 189, 248, 0.3)',
            color: 'inherit !important',
        },
        '.cm-activeLine': {
            backgroundColor: merged.activeLine,
        },
        '.cm-gutters': {
            backgroundColor: 'transparent',
            color: merged.lineNumbers,
            border: 'none',
            paddingRight: '12px',
        },
        '.cm-activeLineGutter': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: '#94a3b8',
        },
        '.cm-foldPlaceholder': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#94a3b8',
        },
        // Search Panel Styling (Modern SaaS Style)
        '.cm-panels': {
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '8px',
        },
        '.cm-textfield': {
            backgroundColor: '#1e293b',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            color: '#f8fafc',
            padding: '4px 10px',
            outline: 'none',
            transition: 'border-color 0.2s',
        },
        '.cm-textfield:focus': {
            borderColor: '#38bdf8',
        },
        '.cm-button': {
            backgroundColor: '#334155',
            backgroundImage: 'none',
            border: 'none',
            borderRadius: '6px',
            color: '#f8fafc',
            cursor: 'pointer',
            padding: '4px 12px',
            fontSize: '11px',
            fontWeight: '600',
            transition: 'background-color 0.2s',
        },
        '.cm-button:hover': {
            backgroundColor: '#475569',
        },
        '.cm-button:active': {
            transform: 'scale(0.95)',
        }
    }, { dark: true })
}

/**
 * Premium Syntax Highlighting
 */
export function createSyntaxHighlighting(): Extension {
    const highlightStyle = HighlightStyle.define([
        { tag: tags.keyword, color: '#f472b6', fontWeight: '600' }, // Pink-400
        { tag: tags.operator, color: '#38bdf8' },                  // Sky-400
        { tag: tags.variableName, color: '#e2e8f0' },               // Slate-200
        { tag: tags.typeName, color: '#818cf8' },                  // Indigo-400
        { tag: tags.atom, color: '#fbbf24' },                      // Amber-400
        { tag: tags.number, color: '#fbbf24' },
        { tag: tags.className, color: '#2dd4bf' },                 // Teal-400
        { tag: tags.function(tags.variableName), color: '#60a5fa' }, // Blue-400
        { tag: tags.propertyName, color: '#94a3b8' },               // Slate-400
        { tag: tags.comment, color: '#64748b', fontStyle: 'italic' }, // Slate-500
        { tag: tags.string, color: '#34d399' },                    // Emerald-400
        { tag: tags.regexp, color: '#f472b6' },
        { tag: tags.tagName, color: '#f472b6' },
        { tag: tags.attributeName, color: '#fbbf24' },
        { tag: tags.heading, color: '#38bdf8', fontWeight: 'bold' },
    ])

    return syntaxHighlighting(highlightStyle)
}

/**
 * Combined theme extension
 */
export function createFullTheme(theme?: EditorTheme): Extension[] {
    return [
        createThemeExtension(theme),
        createSyntaxHighlighting(),
    ]
}
