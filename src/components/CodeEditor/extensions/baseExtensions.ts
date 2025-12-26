import {
    keymap,
    highlightSpecialChars,
    drawSelection,
    highlightActiveLine as cmHighlightActiveLine,
    dropCursor,
    rectangularSelection,
    crosshairCursor,
    lineNumbers as cmLineNumbers,
    highlightActiveLineGutter,
} from '@codemirror/view'
import { Extension, EditorState } from '@codemirror/state'
import {
    defaultHighlightStyle,
    syntaxHighlighting,
    indentOnInput,
    bracketMatching,
    foldGutter,
    foldKeymap,
} from '@codemirror/language'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete'
import { lintKeymap } from '@codemirror/lint'

/**
 * Creates the base set of extensions for a functional code editor
 */
export function createBaseExtensions(options: {
    lineNumbers?: boolean
    highlightActiveLine?: boolean
    readOnly?: boolean
}): Extension[] {
    const extensions: Extension[] = [
        // Core functionality
        highlightSpecialChars(),
        history(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        bracketMatching(),
        closeBrackets(),
        rectangularSelection(),
        crosshairCursor(),

        // Folding
        foldGutter(),

        // Keymaps
        keymap.of([
            ...closeBracketsKeymap,
            ...defaultKeymap,
            ...historyKeymap,
            ...foldKeymap,
            ...completionKeymap,
            ...lintKeymap,
            indentWithTab,
        ]),
    ]

    // Optional line numbers
    if (options.lineNumbers !== false) {
        extensions.push(cmLineNumbers())
        extensions.push(highlightActiveLineGutter())
    }

    // Optional active line highlighting
    if (options.highlightActiveLine !== false) {
        extensions.push(cmHighlightActiveLine())
    }

    // Read-only mode
    if (options.readOnly) {
        extensions.push(EditorState.readOnly.of(true))
    }

    return extensions
}
