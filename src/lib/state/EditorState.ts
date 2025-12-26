import { StateEngine, StateEngineOptions } from './StateEngine'

/**
 * Editor-specific state shape
 */
export interface EditorStateShape {
    /** Current document content */
    content: string
    /** Cursor position */
    cursorPosition: number
    /** Selection range */
    selection: { from: number; to: number }
    /** File path (optional) */
    filePath: string | null
    /** Programming language */
    language: string
    /** Whether the document has unsaved changes */
    isDirty: boolean
    /** Last saved content for dirty comparison */
    lastSavedContent: string
}

/**
 * Editor action types
 */
export type EditorAction =
    | { type: 'SET_CONTENT'; payload: string }
    | { type: 'SET_CURSOR'; payload: number }
    | { type: 'SET_SELECTION'; payload: { from: number; to: number } }
    | { type: 'SET_FILE_PATH'; payload: string | null }
    | { type: 'SET_LANGUAGE'; payload: string }
    | { type: 'MARK_SAVED' }
    | { type: 'INSERT_TEXT'; payload: { position: number; text: string } }
    | { type: 'DELETE_RANGE'; payload: { from: number; to: number } }
    | { type: 'REPLACE_RANGE'; payload: { from: number; to: number; text: string } }

/**
 * Create the initial editor state
 */
export function createInitialEditorState(
    overrides: Partial<EditorStateShape> = {}
): EditorStateShape {
    return {
        content: '',
        cursorPosition: 0,
        selection: { from: 0, to: 0 },
        filePath: null,
        language: 'plaintext',
        isDirty: false,
        lastSavedContent: '',
        ...overrides,
    }
}

/**
 * Create an editor state engine with pre-configured reducers
 */
export function createEditorStateEngine(
    initialState: Partial<EditorStateShape> = {},
    options: StateEngineOptions = {}
): StateEngine<EditorStateShape> {
    const engine = new StateEngine(createInitialEditorState(initialState), options)

    // Register reducers
    engine.addReducer<string>('SET_CONTENT', (state, payload) => ({
        ...state,
        content: payload ?? '',
        isDirty: payload !== state.lastSavedContent,
    }))

    engine.addReducer<number>('SET_CURSOR', (state, payload) => ({
        ...state,
        cursorPosition: payload ?? 0,
    }))

    engine.addReducer<{ from: number; to: number }>('SET_SELECTION', (state, payload) => ({
        ...state,
        selection: payload ?? { from: 0, to: 0 },
    }))

    engine.addReducer<string | null>('SET_FILE_PATH', (state, payload) => ({
        ...state,
        filePath: payload ?? null,
    }))

    engine.addReducer<string>('SET_LANGUAGE', (state, payload) => ({
        ...state,
        language: payload ?? 'plaintext',
    }))

    engine.addReducer('MARK_SAVED', (state) => ({
        ...state,
        isDirty: false,
        lastSavedContent: state.content,
    }))

    engine.addReducer<{ position: number; text: string }>('INSERT_TEXT', (state, payload) => {
        if (!payload) return state
        const { position, text } = payload
        const newContent =
            state.content.slice(0, position) + text + state.content.slice(position)
        return {
            ...state,
            content: newContent,
            cursorPosition: position + text.length,
            isDirty: newContent !== state.lastSavedContent,
        }
    })

    engine.addReducer<{ from: number; to: number }>('DELETE_RANGE', (state, payload) => {
        if (!payload) return state
        const { from, to } = payload
        const newContent = state.content.slice(0, from) + state.content.slice(to)
        return {
            ...state,
            content: newContent,
            cursorPosition: from,
            selection: { from, to: from },
            isDirty: newContent !== state.lastSavedContent,
        }
    })

    engine.addReducer<{ from: number; to: number; text: string }>('REPLACE_RANGE', (state, payload) => {
        if (!payload) return state
        const { from, to, text } = payload
        const newContent = state.content.slice(0, from) + text + state.content.slice(to)
        return {
            ...state,
            content: newContent,
            cursorPosition: from + text.length,
            selection: { from: from + text.length, to: from + text.length },
            isDirty: newContent !== state.lastSavedContent,
        }
    })

    return engine
}

export { StateEngine } from './StateEngine'
export type { Action, Reducer, Middleware, Observer, Selector, StateEngineOptions } from './StateEngine'
