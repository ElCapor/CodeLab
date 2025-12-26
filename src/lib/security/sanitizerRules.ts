import { SanitizerRule } from './Sanitizer'

/**
 * Strip all HTML script tags and their content
 */
export const stripScripts: SanitizerRule = (input: string) => {
    return input.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '')
}

/**
 * Strip HTML event handlers (e.g. onclick, onload)
 */
export const stripEventHandlers: SanitizerRule = (input: string) => {
    return input.replace(/on\w+="[^"]*"/gim, '')
        .replace(/on\w+='[^']*'/gim, '')
        .replace(/on\w+=\w+/gim, '')
}

/**
 * Basic HTML entity encoding
 */
export const encodeHTML: SanitizerRule = (input: string) => {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

/**
 * Sanitize URLs to prevent javascript: pseudo-protocol
 */
export const sanitizeURLs: SanitizerRule = (input: string) => {
    return input.replace(/(href|src|action)\s*=\s*(['"])?javascript:[^'">]*\2/gim, '$1=$2#$2')
}

/**
 * Standard security pipeline: Strip scripts, event handlers, and sanitize URLs
 */
export const standardSecurityPipeline: SanitizerRule[] = [
    stripScripts,
    stripEventHandlers,
    sanitizeURLs
]
