import { useState, useCallback, useRef, useEffect } from 'react'
import { GoogleGenAI } from '@google/genai'

interface AISuggestion {
    text: string
    pos: number
}

interface AIError {
    message: string
    type: 'quota' | 'network' | 'unknown'
    retryAfter?: number
}

/**
 * useAI - Hook for managing AI completion and agentic suggestions with quota protection
 */
export function useAI(apiKey?: string) {
    const [suggestion, setSuggestion] = useState<AISuggestion | null>(null)
    const [isThinking, setIsThinking] = useState(false)
    const [error, setError] = useState<AIError | null>(null)
    const activeRequestId = useRef<number>(0)
    const lastRequestTime = useRef<number>(0)
    const debounceTimer = useRef<any>(null)

    // Clear error after timeout
    useEffect(() => {
        if (!error) return
        const timer = setTimeout(() => setError(null), error.retryAfter || 5000)
        return () => clearTimeout(timer)
    }, [error])

    const requestSuggestion = useCallback(async (context: string, pos: number, isManual = false, language = 'typescript') => {
        if (!apiKey || context.length < 5) return
        if (error && !isManual) return // Don't auto-retry if in error state

        // Standardized debounce for standard typing: 1200ms
        // Manual trigger bypasses debounce
        const debounceDelay = isManual ? 0 : 1200

        // Clear existing timer
        if (debounceTimer.current) clearTimeout(debounceTimer.current)

        const startRequest = async () => {
            const now = Date.now()
            // Even with manual, prevent spamming: min 1s between any request
            if (now - lastRequestTime.current < 1000 && !isManual) return
            lastRequestTime.current = now

            setIsThinking(true)
            setError(null)
            const requestId = ++activeRequestId.current

            try {
                const client = new GoogleGenAI({ apiKey })

                const before = context.slice(0, pos)
                const after = context.slice(pos)

                // Refined professional prompt with language awareness
                const prompt = `
                    You are a professional IDE assistant specialized in ${language}. 
                    Complete the code insertion at the cursor.
                    
                    CONTEXT (Language: ${language}):
                    BEFORE CURSOR:
                    ${before}
                    
                    AFTER CURSOR:
                    ${after}
                    
                    INSTRUCTION:
                    - Return ONLY the exact characters to insert.
                    - No markdown, no commentary, no triple backticks.
                    - Maintain indentation and style of the existing code.
                    - Be extremely concise.
                    - If no obvious completion, return empty.
                `

                const response = await client.models.generateContent({
                    model: 'gemini-2.5-flash', // More stable free tier than 2.0/2.5 for RPM
                    contents: [prompt]
                })

                const text = response.text?.trim() || ''

                if (requestId !== activeRequestId.current) return

                if (text) {
                    const cleanText = text.replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '').trim()
                    setSuggestion({ text: cleanText, pos })
                } else {
                    setSuggestion(null)
                }
            } catch (err: any) {
                if (requestId !== activeRequestId.current) return

                const errorMessage = err?.message || ''
                if (errorMessage.includes('429') || errorMessage.includes('quota')) {
                    setError({
                        message: 'Rate limit exceeded (Free Tier). Pausing AI...',
                        type: 'quota',
                        retryAfter: 30000 // 30s cooldown
                    })
                } else {
                    setError({ message: 'AI connection failed', type: 'network' })
                }
                setSuggestion(null)
            } finally {
                if (requestId === activeRequestId.current) {
                    setIsThinking(false)
                }
            }
        }

        if (debounceDelay === 0) {
            startRequest()
        } else {
            debounceTimer.current = setTimeout(startRequest, debounceDelay)
        }
    }, [apiKey, error])

    const clearSuggestion = useCallback(() => {
        setSuggestion(null)
        setIsThinking(false)
        if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }, [])

    const handleAccept = useCallback(() => {
        setSuggestion(null)
    }, [])

    const handleReject = useCallback(() => {
        setSuggestion(null)
    }, [])

    return {
        suggestion,
        isThinking,
        error,
        requestSuggestion,
        clearSuggestion,
        handleAccept,
        handleReject
    }
}
