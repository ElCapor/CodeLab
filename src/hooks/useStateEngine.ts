import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { StateEngine, Action, Selector } from '@/lib/state'

/**
 * Hook for integrating StateEngine with React components
 * 
 * Features:
 * - Automatic subscription/unsubscription on mount/unmount
 * - Selector support for derived state
 * - Memoized dispatch function
 * 
 * @example
 * ```tsx
 * function Counter() {
 *   const { state, dispatch } = useStateEngine(counterEngine)
 *   
 *   return (
 *     <div>
 *       <span>{state.count}</span>
 *       <button onClick={() => dispatch({ type: 'increment' })}>+</button>
 *     </div>
 *   )
 * }
 * ```
 * 
 * @example With selector
 * ```tsx
 * function CountDisplay() {
 *   const { state } = useStateEngine(counterEngine, (s) => s.count)
 *   return <span>Count: {state}</span>
 * }
 * ```
 */
export function useStateEngine<S extends object, R = S>(
    engine: StateEngine<S>,
    selector?: Selector<S, R>
): {
    state: R
    dispatch: <P = unknown>(action: Action<P>) => void
    undo: () => boolean
    redo: () => boolean
    canUndo: boolean
    canRedo: boolean
    reset: () => void
} {
    // Track the previous selector result for comparison
    const selectorRef = useRef(selector)
    selectorRef.current = selector

    const getSelectedState = useCallback((): R => {
        const fullState = engine.getState()
        return selectorRef.current ? selectorRef.current(fullState) : (fullState as unknown as R)
    }, [engine])

    const [state, setState] = useState<R>(getSelectedState)
    const [canUndo, setCanUndo] = useState(engine.canUndo())
    const [canRedo, setCanRedo] = useState(engine.canRedo())

    useEffect(() => {
        const unsubscribe = engine.subscribe((newState, prevState) => {
            const newSelected = selectorRef.current ? selectorRef.current(newState) : (newState as unknown as R)
            const prevSelected = selectorRef.current ? selectorRef.current(prevState) : (prevState as unknown as R)

            // Only update if selected state changed
            if (newSelected !== prevSelected) {
                setState(newSelected)
            }

            // Update undo/redo availability
            setCanUndo(engine.canUndo())
            setCanRedo(engine.canRedo())
        })

        // Sync state on mount
        setState(getSelectedState())
        setCanUndo(engine.canUndo())
        setCanRedo(engine.canRedo())

        return unsubscribe
    }, [engine, getSelectedState])

    const dispatch = useCallback(<P = unknown>(action: Action<P>) => {
        engine.dispatch(action)
    }, [engine])

    const undo = useCallback(() => {
        return engine.undo()
    }, [engine])

    const redo = useCallback(() => {
        return engine.redo()
    }, [engine])

    const reset = useCallback(() => {
        engine.reset()
    }, [engine])

    return useMemo(() => ({
        state,
        dispatch,
        undo,
        redo,
        canUndo,
        canRedo,
        reset,
    }), [state, dispatch, undo, redo, canUndo, canRedo, reset])
}
