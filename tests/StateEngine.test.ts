import { describe, it, expect, vi } from 'vitest'
import { StateEngine } from '../src/lib/state/StateEngine'

interface TestState {
    count: number
    name: string
}

describe('StateEngine', () => {
    it('initializes with initial state', () => {
        const engine = new StateEngine<TestState>({ count: 0, name: 'test' })
        expect(engine.getState()).toEqual({ count: 0, name: 'test' })
    })

    it('dispatches actions through reducers', () => {
        const engine = new StateEngine<TestState>({ count: 0, name: 'test' })
        engine.addReducer<number>('increment', (state, payload) => ({
            ...state,
            count: state.count + (payload ?? 1),
        }))

        engine.dispatch({ type: 'increment', payload: 5 })
        expect(engine.getState().count).toBe(5)
    })

    it('notifies observers on state change', () => {
        const engine = new StateEngine<TestState>({ count: 0, name: 'test' })
        const observer = vi.fn()
        engine.subscribe(observer)

        engine.addReducer<number>('increment', (state, payload) => ({
            ...state,
            count: state.count + (payload ?? 1),
        }))

        engine.dispatch({ type: 'increment' })
        expect(observer).toHaveBeenCalled()
    })

    it('supports middleware', () => {
        const engine = new StateEngine<TestState>({ count: 0, name: 'test' })
        const middlewareFn = vi.fn((_action, _state, next) => next())
        engine.use(middlewareFn)

        engine.addReducer('noop', (state) => state)
        engine.dispatch({ type: 'noop' })

        expect(middlewareFn).toHaveBeenCalled()
    })

    it('supports undo/redo', () => {
        const engine = new StateEngine<TestState>({ count: 0, name: 'test' })
        engine.addReducer<number>('set', (state, payload) => ({
            ...state,
            count: payload ?? 0,
        }))

        engine.dispatch({ type: 'set', payload: 1 })
        engine.dispatch({ type: 'set', payload: 2 })
        engine.dispatch({ type: 'set', payload: 3 })

        expect(engine.getState().count).toBe(3)

        engine.undo()
        expect(engine.getState().count).toBe(2)

        engine.undo()
        expect(engine.getState().count).toBe(1)

        engine.redo()
        expect(engine.getState().count).toBe(2)
    })

    it('resets to initial state', () => {
        const engine = new StateEngine<TestState>({ count: 0, name: 'test' })
        engine.addReducer<number>('set', (state, payload) => ({
            ...state,
            count: payload ?? 0,
        }))

        engine.dispatch({ type: 'set', payload: 100 })
        expect(engine.getState().count).toBe(100)

        engine.reset()
        expect(engine.getState().count).toBe(0)
    })
})
