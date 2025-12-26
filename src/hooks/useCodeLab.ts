import { useCallback } from 'react'

interface CodeLabAPI {
    runCode: () => void
    toggleSidebar: () => void
    toggleIntelligence: () => void
    openCommandPalette: () => void
    setTheme: (theme: 'dark' | 'light') => void
}

export function useCodeLab(api: CodeLabAPI) {
    // This hook acts as a bridge for external plugins or components
    // to interact with the core IDE state.

    const executeAction = useCallback((action: keyof CodeLabAPI) => {
        if (typeof api[action] === 'function') {
            (api[action] as Function)()
        }
    }, [api])

    return {
        ...api,
        executeAction
    }
}
