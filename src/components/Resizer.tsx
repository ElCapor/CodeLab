import { Separator } from 'react-resizable-panels'

interface ResizerProps {
    className?: string
    id?: string
    direction?: 'horizontal' | 'vertical'
}

export function Resizer({ className = '', id, direction = 'horizontal' }: ResizerProps) {
    return (
        <Separator
            id={id}
            className={`resizer-handle relative flex items-center justify-center ${direction === 'horizontal' ? 'w-1 h-full cursor-col-resize' : 'h-1 w-full cursor-row-resize'
                } ${className}`}
        >
            <div className={`bg-white/20 rounded-full ${direction === 'horizontal' ? 'w-0.5 h-8' : 'h-0.5 w-8'}`} />
        </Separator>
    )
}
