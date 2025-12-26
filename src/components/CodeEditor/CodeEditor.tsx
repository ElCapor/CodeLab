import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
    useCallback,
} from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import type { CodeEditorProps, CodeEditorRef } from './types'
import {
    createBaseExtensions,
    createFullTheme,
    getLanguageExtension,
    createSearchExtension,
    openSearchPanel,
} from './extensions'
import { undo, redo } from '@codemirror/commands'

/**
 * CodeEditor - A modular CodeMirror 6 wrapper component
 * 
 * Features:
 * - Syntax highlighting for multiple languages
 * - Custom extension injection
 * - Theme customization via CSS variables
 * - Search and replace functionality
 * - Imperative API for external control
 */
const CodeEditor = forwardRef<CodeEditorRef, CodeEditorProps>(function CodeEditor(
    {
        value = '',
        onChange,
        language = 'plaintext',
        extensions: customExtensions = [],
        theme,
        readOnly = false,
        placeholder,
        lineNumbers = true,
        lineWrapping = false,
        highlightActiveLine = true,
        showSearch = true,
        className = '',
        minHeight = '200px',
        maxHeight,
        onReady,
    },
    ref
) {
    const containerRef = useRef<HTMLDivElement>(null)
    const viewRef = useRef<EditorView | null>(null)
    const [isReady, setIsReady] = useState(false)

    // Memoize update listener
    const updateListener = useCallback(() => {
        return EditorView.updateListener.of((update) => {
            if (update.docChanged && onChange) {
                onChange(update.state.doc.toString())
            }
        })
    }, [onChange])

    // Initialize editor
    useEffect(() => {
        if (!containerRef.current) return

        // Build extensions array
        const allExtensions = [
            // Base functionality
            ...createBaseExtensions({
                lineNumbers,
                highlightActiveLine,
                readOnly,
            }),

            // Theme
            ...createFullTheme(theme),

            // Language support
            getLanguageExtension(language),

            // Search functionality
            ...(showSearch ? createSearchExtension() : []),

            // Line wrapping
            ...(lineWrapping ? [EditorView.lineWrapping] : []),

            // Placeholder
            ...(placeholder ? [EditorView.contentAttributes.of({ 'data-placeholder': placeholder })] : []),

            // Update listener for onChange
            updateListener(),

            // Custom extensions
            ...customExtensions,
        ]

        const state = EditorState.create({
            doc: value,
            extensions: allExtensions,
        })

        const view = new EditorView({
            state,
            parent: containerRef.current,
        })

        viewRef.current = view
        setIsReady(true)
        onReady?.(view)

        return () => {
            view.destroy()
            viewRef.current = null
            setIsReady(false)
        }
        // Only recreate on core prop changes, not value
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language, readOnly, lineNumbers, lineWrapping, highlightActiveLine, showSearch])

    // Update value when it changes externally
    useEffect(() => {
        const view = viewRef.current
        if (!view || !isReady) return

        const currentValue = view.state.doc.toString()
        if (value !== currentValue) {
            view.dispatch({
                changes: {
                    from: 0,
                    to: view.state.doc.length,
                    insert: value,
                },
            })
        }
    }, [value, isReady])

    // Expose imperative API
    useImperativeHandle(ref, () => ({
        getView: () => viewRef.current,

        getValue: () => {
            return viewRef.current?.state.doc.toString() ?? ''
        },

        setValue: (newValue: string) => {
            const view = viewRef.current
            if (!view) return
            view.dispatch({
                changes: {
                    from: 0,
                    to: view.state.doc.length,
                    insert: newValue,
                },
            })
        },

        insertAt: (pos: number, text: string) => {
            const view = viewRef.current
            if (!view) return
            view.dispatch({
                changes: { from: pos, insert: text },
            })
        },

        replaceRange: (from: number, to: number, text: string) => {
            const view = viewRef.current
            if (!view) return
            view.dispatch({
                changes: { from, to, insert: text },
            })
        },

        getSelection: () => {
            const view = viewRef.current
            if (!view) {
                return { from: 0, to: 0, text: '' }
            }
            const { from, to } = view.state.selection.main
            const text = view.state.sliceDoc(from, to)
            return { from, to, text }
        },

        focusRange: (from: number, to: number) => {
            const view = viewRef.current
            if (!view) return
            view.dispatch({
                selection: { anchor: from, head: to },
            })
            view.focus()
        },

        focus: () => {
            viewRef.current?.focus()
        },

        openSearch: () => {
            const view = viewRef.current
            if (!view) return
            openSearchPanel(view)
        },

        openSearchReplace: () => {
            const view = viewRef.current
            if (!view) return
            openSearchPanel(view)
        },
        undo: () => {
            const view = viewRef.current
            if (view) undo(view)
        },
        redo: () => {
            const view = viewRef.current
            if (view) redo(view)
        },
    }), [])

    return (
        <div
            ref={containerRef}
            className={`codelab-editor ${className}`}
            style={{
                minHeight,
                maxHeight,
                overflow: maxHeight ? 'auto' : undefined,
            }}
        />
    )
})

export default CodeEditor
