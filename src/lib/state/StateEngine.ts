/**
 * StateEngine - A lightweight, event-driven state management engine
 * 
 * Features:
 * - Generic state type parameter
 * - Middleware pipeline (pre/post action hooks)
 * - Observer pattern for state subscriptions
 * - Action dispatch with history tracking
 * 
 * @example
 * ```typescript
 * interface AppState {
 *   count: number
 * }
 * 
 * const engine = new StateEngine<AppState>({ count: 0 })
 * 
 * // Add observer
 * engine.subscribe((state) => console.log('Count:', state.count))
 * 
 * // Add middleware
 * engine.use((action, state, next) => {
 *   console.log('Before:', action.type)
 *   next()
 *   console.log('After:', action.type)
 * })
 * 
 * // Define reducer
 * engine.addReducer('increment', (state, payload) => ({
 *   ...state,
 *   count: state.count + (payload ?? 1)
 * }))
 * 
 * // Dispatch action
 * engine.dispatch({ type: 'increment', payload: 5 })
 * ```
 */

export interface Action<T = unknown> {
    type: string
    payload?: T
}

export type Reducer<S, P = unknown> = (state: S, payload?: P) => S

export type Middleware<S> = (
    action: Action,
    state: S,
    next: () => void
) => void

export type Observer<S> = (state: S, prevState: S, action: Action) => void

export type Selector<S, R> = (state: S) => R

export interface StateEngineOptions {
    /** Maximum history depth for undo/redo */
    historyDepth?: number
    /** Enable debug logging */
    debug?: boolean
}

export class StateEngine<S extends object> {
    private state: S
    private initialState: S
    private reducers: Map<string, Reducer<S>> = new Map()
    private middleware: Middleware<S>[] = []
    private observers: Set<Observer<S>> = new Set()
    private history: S[] = []
    private historyIndex = -1
    private historyDepth: number
    private debug: boolean

    constructor(initialState: S, options: StateEngineOptions = {}) {
        this.initialState = { ...initialState }
        this.state = { ...initialState }
        this.historyDepth = options.historyDepth ?? 50
        this.debug = options.debug ?? false
        this.pushHistory()
    }

    /**
     * Get the current state (immutable copy)
     */
    getState(): Readonly<S> {
        return this.state
    }

    /**
     * Subscribe to state changes
     */
    subscribe(observer: Observer<S>): () => void {
        this.observers.add(observer)
        return () => {
            this.observers.delete(observer)
        }
    }

    /**
     * Add middleware to the dispatch pipeline
     */
    use(middleware: Middleware<S>): void {
        this.middleware.push(middleware)
    }

    /**
     * Register a reducer for an action type
     */
    addReducer<P = unknown>(type: string, reducer: Reducer<S, P>): void {
        this.reducers.set(type, reducer as Reducer<S>)
    }

    /**
     * Dispatch an action to update state
     */
    dispatch<P = unknown>(action: Action<P>): void {
        if (this.debug) {
            console.log('[StateEngine] Dispatch:', action.type, action.payload)
        }

        const prevState = this.state
        let index = 0

        const next = () => {
            if (index < this.middleware.length) {
                const mw = this.middleware[index]
                index++
                mw?.(action, this.state, next)
            } else {
                // Apply reducer
                const reducer = this.reducers.get(action.type)
                if (reducer) {
                    this.state = reducer(this.state, action.payload)
                    this.pushHistory()
                } else if (this.debug) {
                    console.warn(`[StateEngine] No reducer for action: ${action.type}`)
                }
            }
        }

        next()

        // Notify observers if state changed
        if (this.state !== prevState) {
            this.notifyObservers(prevState, action)
        }
    }

    /**
     * Select derived state
     */
    select<R>(selector: Selector<S, R>): R {
        return selector(this.state)
    }

    /**
     * Reset state to initial value
     */
    reset(): void {
        const prevState = this.state
        this.state = { ...this.initialState }
        this.history = []
        this.historyIndex = -1
        this.pushHistory()
        this.notifyObservers(prevState, { type: '@@RESET' })
    }

    /**
     * Undo the last action
     */
    undo(): boolean {
        if (this.historyIndex > 0) {
            const prevState = this.state
            this.historyIndex--
            const historyState = this.history[this.historyIndex]
            if (historyState) {
                this.state = { ...historyState }
                this.notifyObservers(prevState, { type: '@@UNDO' })
                return true
            }
        }
        return false
    }

    /**
     * Redo the previously undone action
     */
    redo(): boolean {
        if (this.historyIndex < this.history.length - 1) {
            const prevState = this.state
            this.historyIndex++
            const historyState = this.history[this.historyIndex]
            if (historyState) {
                this.state = { ...historyState }
                this.notifyObservers(prevState, { type: '@@REDO' })
                return true
            }
        }
        return false
    }

    /**
     * Check if undo is available
     */
    canUndo(): boolean {
        return this.historyIndex > 0
    }

    /**
     * Check if redo is available
     */
    canRedo(): boolean {
        return this.historyIndex < this.history.length - 1
    }

    /**
     * Get the current history depth
     */
    getHistoryLength(): number {
        return this.history.length
    }

    private pushHistory(): void {
        // Remove any future history if we're not at the end
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1)
        }

        // Add current state to history
        this.history.push({ ...this.state })
        this.historyIndex = this.history.length - 1

        // Trim history if it exceeds depth
        if (this.history.length > this.historyDepth) {
            this.history.shift()
            this.historyIndex--
        }
    }

    private notifyObservers(prevState: S, action: Action): void {
        this.observers.forEach((observer) => {
            try {
                observer(this.state, prevState, action)
            } catch (error) {
                console.error('[StateEngine] Observer error:', error)
            }
        })
    }
}
