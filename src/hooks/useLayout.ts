import { useCallback } from 'react'

const STORAGE_KEY = 'codelab_layout_v1'

/**
 * useLayout - Ultra-stable bridge for react-resizable-panels storage behavior.
 * Drops all internal state to prevent render loops.
 */
export function useLayout() {
    // Native Storage Provider for the library
    const layoutStorage = {
        getItem: () => localStorage.getItem(STORAGE_KEY),
        setItem: (value: string) => localStorage.setItem(STORAGE_KEY, value),
    }

    const onLayoutChange = useCallback((layout: number[]) => {
        // We don't need to sync state here anymore because the library 
        // handles its own internal sizing. We only log or track if needed.
        // The storage provider handles the persistence.
    }, [])

    return {
        layoutStorage,
        onLayoutChange,
        STORAGE_ID: STORAGE_KEY
    }
}
