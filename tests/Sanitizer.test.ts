import { describe, it, expect } from 'vitest'
import { Sanitizer } from '../src/lib/security/Sanitizer'
import {
    stripScripts,
    stripEventHandlers,
    encodeHTML,
    standardSecurityPipeline
} from '../src/lib/security/sanitizerRules'

describe('Sanitizer & Rules', () => {
    const sanitizer = new Sanitizer()

    describe('stripScripts', () => {
        it('removes script tags and content', () => {
            const input = '<div>Hello</div><script>alert("XSS")</script><span>World</span>'
            expect(stripScripts(input)).toBe('<div>Hello</div><span>World</span>')
        })
    })

    describe('stripEventHandlers', () => {
        it('removes onclick and other event handlers', () => {
            const input = '<button onclick="doEvil()" onmouseover="stealData()">Click</button>'
            const result = stripEventHandlers(input)
            expect(result).not.toContain('onclick')
            expect(result).not.toContain('onmouseover')
            expect(result).toContain('<button')
            expect(result).toContain('Click</button>')
        })
    })

    describe('encodeHTML', () => {
        it('encodes special characters', () => {
            const input = '<div>"Hello" & \'World\'</div>'
            expect(encodeHTML(input)).toBe('&lt;div&gt;&quot;Hello&quot; &amp; &#039;World&#039;&lt;/div&gt;')
        })
    })

    describe('standardSecurityPipeline', () => {
        it('runs multiple rules sequentially', () => {
            standardSecurityPipeline.forEach(rule => sanitizer.use(rule))
            const input = '<div onclick="alert(1)">Text<script>evil()</script> <a href="javascript:code()">Link</a></div>'
            const output = sanitizer.sanitize(input)

            expect(output).not.toContain('onclick')
            expect(output).not.toContain('<script>')
            expect(output).not.toContain('javascript:')
            expect(output).toContain('Text')
            expect(output).toContain('Link')
            expect(output).toContain('<div')
        })
    })
})
