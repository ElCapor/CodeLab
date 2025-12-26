import { useRef, useEffect, useCallback, useState } from 'react'

interface SandboxMessage {
    type: 'success' | 'error' | 'log'
    payload: any
}

interface SandboxOptions {
    timeout?: number
    allowScripts?: boolean
}

/**
 * useSandbox - Hook for interacting with a secure iframe execution environment
 */
export function useSandbox(options: SandboxOptions = {}) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [isReady, setIsReady] = useState(false)
    const [lastResult, setLastResult] = useState<any>(null)
    const [lastError, setLastError] = useState<string | null>(null)

    const execute = useCallback((code: string) => {
        if (!iframeRef.current || !isReady) return

        setLastError(null)
        setLastResult(null)

        iframeRef.current.contentWindow?.postMessage({
            type: 'EXECUTE',
            code,
            timeout: options.timeout ?? 5000
        }, '*')
    }, [isReady, options.timeout])

    const renderHTML = useCallback((html: string) => {
        if (!iframeRef.current || !isReady) return
        iframeRef.current.contentWindow?.postMessage({
            type: 'RENDER_HTML',
            html
        }, '*')
    }, [isReady])

    useEffect(() => {
        const handleMessage = (event: MessageEvent<SandboxMessage>) => {
            if (event.source !== iframeRef.current?.contentWindow) return

            const { type, payload } = event.data

            switch (type) {
                case 'success':
                    setLastResult(payload)
                    break
                case 'error':
                    setLastError(payload)
                    break
                case 'log':
                    console.log('[Sandbox Log]:', payload)
                    break
            }
        }

        window.addEventListener('message', handleMessage)
        return () => window.removeEventListener('message', handleMessage)
    }, [])

    return {
        iframeRef,
        execute,
        renderHTML,
        lastResult,
        lastError,
        isReady,
        onReady: () => setIsReady(true)
    }
}
