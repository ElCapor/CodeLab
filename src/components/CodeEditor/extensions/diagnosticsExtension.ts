import { linter, Diagnostic } from '@codemirror/lint'
import { Extension } from '@codemirror/state'

/**
 * Diagnostics Extension - Provides basic code linting/warnings
 */
export function createDiagnosticsExtension(): Extension {
    return linter((view) => {
        const diagnostics: Diagnostic[] = []
        const content = view.state.doc.toString()

        // 1. Check for "TODO" comments (Warning)
        const todoRegex = /TODO:|FIXME:/g
        let match
        while ((match = todoRegex.exec(content)) !== null) {
            diagnostics.push({
                from: match.index,
                to: match.index + match[0].length,
                severity: 'warning',
                message: 'Unresolved task detected. Consider completing this action.',
                actions: [{
                    name: "Remove",
                    apply(view, from, to) { view.dispatch({ changes: { from, to, insert: "" } }) }
                }]
            })
        }

        // 2. Check for common syntax slips (Error - Mock)
        if (content.includes('const ;')) {
            const index = content.indexOf('const ;')
            diagnostics.push({
                from: index,
                to: index + 7,
                severity: 'error',
                message: 'Invalid constant declaration. Expected identifier.',
            })
        }

        // 3. Security Warning: Dangerous functions
        const dangerRegex = /eval\(|innerHTML/g
        while ((match = dangerRegex.exec(content)) !== null) {
            diagnostics.push({
                from: match.index,
                to: match.index + match[0].length,
                severity: 'warning',
                message: 'Potential security risk. Use the Sanitizer or Sandbox instead.',
            })
        }

        return diagnostics
    })
}
