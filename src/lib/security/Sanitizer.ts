/**
 * Sanitizer Rule Type
 */
export type SanitizerRule = (input: string) => string

/**
 * Deterministic Sanitization Engine
 */
export class Sanitizer {
    private rules: SanitizerRule[] = []

    /**
     * Add a sanitization rule to the pipeline
     */
    use(rule: SanitizerRule): this {
        this.rules.push(rule)
        return this
    }

    /**
     * Sanitize input through the registered rules
     */
    sanitize(input: string): string {
        return this.rules.reduce((acc, rule) => rule(acc), input)
    }

    /**
     * Clear all rules
     */
    clear(): void {
        this.rules = []
    }
}

/**
 * Default global sanitizer instance
 */
export const defaultSanitizer = new Sanitizer()
