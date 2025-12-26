import type { Extension } from '@codemirror/state'
import type { EditorView } from '@codemirror/view'

/**
 * Supported programming languages for syntax highlighting
 */
export type SupportedLanguage =
    | 'javascript'
    | 'typescript'
    | 'html'
    | 'css'
    | 'json'
    | 'markdown'
    | 'plaintext'

/**
 * Theme configuration using CSS variables
 */
export interface EditorTheme {
    /** Background color of the editor */
    background?: string
    /** Foreground/text color */
    foreground?: string
    /** Cursor color */
    cursor?: string
    /** Selection background color */
    selection?: string
    /** Line number color */
    lineNumbers?: string
    /** Active line background */
    activeLine?: string
    /** Matching bracket background */
    matchingBracket?: string
}

/**
 * Search panel configuration
 */
export interface SearchConfig {
    /** Enable case-sensitive search */
    caseSensitive?: boolean
    /** Enable regex search mode */
    regexp?: boolean
    /** Enable whole word matching */
    wholeWord?: boolean
}

/**
 * Props for the CodeEditor component
 */
export interface CodeEditorProps {
    /** Current document content */
    value?: string
    /** Callback fired when content changes */
    onChange?: (value: string) => void
    /** Programming language for syntax highlighting */
    language?: SupportedLanguage
    /** Custom CodeMirror extensions to inject */
    extensions?: Extension[]
    /** Theme configuration */
    theme?: EditorTheme
    /** Whether the editor is read-only */
    readOnly?: boolean
    /** Placeholder text when empty */
    placeholder?: string
    /** Whether to show line numbers */
    lineNumbers?: boolean
    /** Whether to enable line wrapping */
    lineWrapping?: boolean
    /** Whether to highlight the active line */
    highlightActiveLine?: boolean
    /** Whether to show the search panel */
    showSearch?: boolean
    /** Custom class name for the container */
    className?: string
    /** Minimum height of the editor */
    minHeight?: string
    /** Maximum height of the editor */
    maxHeight?: string
    /** Callback when editor is ready */
    onReady?: (view: EditorView) => void
}

/**
 * Ref handle for imperative control of the editor
 */
export interface CodeEditorRef {
    /** Get the current EditorView instance */
    getView: () => EditorView | null
    /** Get the current document content */
    getValue: () => string
    /** Set the document content */
    setValue: (value: string) => void
    /** Insert text at a specific position */
    insertAt: (pos: number, text: string) => void
    /** Replace a range of text */
    replaceRange: (from: number, to: number, text: string) => void
    /** Get the current selection */
    getSelection: () => { from: number; to: number; text: string }
    /** Select and focus a range */
    focusRange: (from: number, to: number) => void
    /** Focus the editor */
    focus: () => void
    /** Open the search panel */
    openSearch: () => void
    /** Open the search and replace panel */
    openSearchReplace: () => void
    /** Undo the last change */
    undo: () => void
    /** Redo the last undone change */
    redo: () => void
}

/**
 * Search panel state
 */
export interface SearchPanelState {
    isOpen: boolean
    showReplace: boolean
    query: string
    replacement: string
    caseSensitive: boolean
    regexp: boolean
    wholeWord: boolean
    matchCount: number
    currentMatch: number
}

/**
 * Search panel actions
 */
export interface SearchPanelActions {
    setQuery: (query: string) => void
    setReplacement: (replacement: string) => void
    toggleCaseSensitive: () => void
    toggleRegexp: () => void
    toggleWholeWord: () => void
    findNext: () => void
    findPrevious: () => void
    replace: () => void
    replaceAll: () => void
    close: () => void
}
