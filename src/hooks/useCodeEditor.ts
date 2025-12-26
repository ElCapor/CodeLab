import { useRef, useCallback, useMemo } from 'react'
import type { CodeEditorRef } from '@/components/CodeEditor'

/**
 * Hook for controlling a CodeEditor instance imperatively
 * 
 * @example
 * ```tsx
 * function MyEditor() {
 *   const { ref, insertAt, focusRange, getValue } = useCodeEditor()
 *   
 *   const handleInsertTimestamp = () => {
 *     const pos = ref.current?.getSelection().from ?? 0
 *     insertAt(pos, new Date().toISOString())
 *   }
 *   
 *   return (
 *     <>
 *       <CodeEditor ref={ref} value={code} onChange={setCode} />
 *       <button onClick={handleInsertTimestamp}>Insert Timestamp</button>
 *     </>
 *   )
 * }
 * ```
 */
export function useCodeEditor() {
    const ref = useRef<CodeEditorRef>(null)

    const getValue = useCallback(() => {
        return ref.current?.getValue() ?? ''
    }, [])

    const setValue = useCallback((value: string) => {
        ref.current?.setValue(value)
    }, [])

    const insertAt = useCallback((pos: number, text: string) => {
        ref.current?.insertAt(pos, text)
    }, [])

    const replaceRange = useCallback((from: number, to: number, text: string) => {
        ref.current?.replaceRange(from, to, text)
    }, [])

    const getSelection = useCallback(() => {
        return ref.current?.getSelection() ?? { from: 0, to: 0, text: '' }
    }, [])

    const focusRange = useCallback((from: number, to: number) => {
        ref.current?.focusRange(from, to)
    }, [])

    const focus = useCallback(() => {
        ref.current?.focus()
    }, [])

    const openSearch = useCallback(() => {
        ref.current?.openSearch()
    }, [])

    const openSearchReplace = useCallback(() => {
        ref.current?.openSearchReplace()
    }, [])

    const getView = useCallback(() => {
        return ref.current?.getView() ?? null
    }, [])

    const undo = useCallback(() => {
        ref.current?.undo()
    }, [])

    const redo = useCallback(() => {
        ref.current?.redo()
    }, [])

    return useMemo(() => ({
        ref,
        getValue,
        setValue,
        insertAt,
        replaceRange,
        getSelection,
        focusRange,
        focus,
        openSearch,
        openSearchReplace,
        undo,
        redo,
        getView,
    }), [
        getValue,
        setValue,
        insertAt,
        replaceRange,
        getSelection,
        focusRange,
        focus,
        openSearch,
        openSearchReplace,
        undo,
        redo,
        getView,
    ])
}
