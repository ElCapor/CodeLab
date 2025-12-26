import {
    Decoration,
    DecorationSet,
    EditorView,
    ViewPlugin,
    ViewUpdate,
    WidgetType,
    keymap
} from '@codemirror/view'
import {
    StateField,
    StateEffect,
    EditorState,
    Extension,
    Prec
} from '@codemirror/state'

/**
 * Effects for updating the ghost text state
 */
export const setGhostText = StateEffect.define<{ text: string; pos: number } | null>()

/**
 * State field to track the current ghost text suggestion
 */
const ghostTextField = StateField.define<{ text: string; pos: number } | null>({
    create: () => null,
    update(value, tr) {
        for (const effect of tr.effects) {
            if (effect.is(setGhostText)) return effect.value
        }
        // Clear on any document change unless it was an explicit effect
        if (tr.docChanged) return null
        return value
    }
})

/**
 * Widget for rendering the ghost text inline
 */
class GhostTextWidget extends WidgetType {
    constructor(readonly text: string) {
        super()
    }

    toDOM() {
        const span = document.createElement('span')
        span.className = 'cm-ghost-text'
        span.textContent = this.text

        // Premium styling via JS-in-DOM for robustness, but classes preferred
        span.style.color = '#94a3b8' // slate-400
        span.style.opacity = '0.7'
        span.style.pointerEvents = 'none'
        span.style.userSelect = 'none'
        span.style.fontFamily = 'var(--font-mono)'

        return span
    }
}

/**
 * Plugin to render the decorations based on the ghost text field
 */
const ghostTextPlugin = ViewPlugin.fromClass(class {
    decorations: DecorationSet

    constructor(view: EditorView) {
        this.decorations = this.getDecorations(view.state)
    }

    update(update: ViewUpdate) {
        if (update.docChanged || update.selectionSet || update.startState.field(ghostTextField) !== update.state.field(ghostTextField)) {
            this.decorations = this.getDecorations(update.state)
        }
    }

    getDecorations(state: EditorState) {
        const suggestion = state.field(ghostTextField)
        if (!suggestion || !suggestion.text) return Decoration.none

        return Decoration.set([
            Decoration.widget({
                widget: new GhostTextWidget(suggestion.text),
                side: 1
            }).range(suggestion.pos)
        ])
    }
}, {
    decorations: v => v.decorations
})

/**
 * Configuration for the completion extension
 */
interface CompletionOptions {
    onAccept?: (text: string, pos: number) => void
    onReject?: () => void
    onManualTrigger?: () => void
}

/**
 * Create the full completion extension
 */
export function createCompletionExtension(options: CompletionOptions = {}): Extension {
    const completionKeymap = keymap.of([
        {
            key: 'Tab',
            run: (view) => {
                const suggestion = view.state.field(ghostTextField)
                if (suggestion) {
                    options.onAccept?.(suggestion.text, suggestion.pos)
                    view.dispatch({
                        changes: { from: suggestion.pos, insert: suggestion.text },
                        effects: setGhostText.of(null),
                        selection: { anchor: suggestion.pos + suggestion.text.length }
                    })
                    return true
                }
                return false
            }
        },
        {
            key: 'Escape',
            run: (view) => {
                const suggestion = view.state.field(ghostTextField)
                if (suggestion) {
                    options.onReject?.()
                    view.dispatch({
                        effects: setGhostText.of(null)
                    })
                    return true
                }
                return false
            }
        },
        {
            key: 'Alt-\\',
            run: () => {
                options.onManualTrigger?.()
                return true
            }
        }
    ])

    return [
        ghostTextField,
        ghostTextPlugin,
        Prec.highest(completionKeymap)
    ]
}
