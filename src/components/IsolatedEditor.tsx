import { useRef, useEffect, ReactNode, useState } from 'react'
import { createPortal } from 'react-dom'

interface IsolatedEditorProps {
    children: ReactNode
    styles?: string[]
}

/**
 * IsolatedEditor - Wraps content in a Shadow DOM boundary to prevent style leakage
 */
export function IsolatedEditor({ children, styles = [] }: IsolatedEditorProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null)

    useEffect(() => {
        if (!containerRef.current || shadowRoot) return

        // Check if shadowRoot already exists on the element to avoid crash on re-attachment
        const root = containerRef.current.shadowRoot || containerRef.current.attachShadow({ mode: 'open' })

        // Inject styles passed as strings
        if (styles.length > 0) {
            const sheets = styles.map(css => {
                const sheet = new CSSStyleSheet()
                sheet.replaceSync(css)
                return sheet
            })
            root.adoptedStyleSheets = sheets
        }

        setShadowRoot(root)
    }, [styles, shadowRoot])

    return (
        <div ref={containerRef} className="h-full w-full overflow-hidden rounded-2xl">
            {shadowRoot && createPortal(children, shadowRoot as unknown as HTMLElement)}
        </div>
    )
}
