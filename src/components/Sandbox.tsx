import { forwardRef } from 'react'

interface SandboxProps {
    onReady?: () => void
    title?: string
    className?: string
}

/**
 * Sandbox Component - A highly restricted iframe for code execution
 */
export const Sandbox = forwardRef<HTMLIFrameElement, SandboxProps>((
    { onReady, title = 'Execution Sandbox', className = '' },
    ref
) => {
    const srcDoc = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline';">
            <style>
                body { font-family: sans-serif; color: #f8fafc; margin: 0; padding: 10px; font-size: 13px; }
            </style>
        </head>
        <body>
            <div id="output" style="white-space: pre-wrap; word-break: break-all;"></div>
            <script>
                const output = document.getElementById('output');
                
                const logToUI = (msg, type = 'info') => {
                    const line = document.createElement('div');
                    line.style.padding = '2px 0';
                    line.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
                    if (type === 'error') line.style.color = '#fb7185';
                    if (type === 'result') line.style.color = '#38bdf8';
                    line.textContent = msg;
                    output.appendChild(line);
                };

                // Polyfill for logs
                console.log = (...args) => {
                    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
                    logToUI(msg);
                    window.parent.postMessage({ type: 'log', payload: msg }, '*');
                };

                window.addEventListener('message', (event) => {
                    const data = event.data;
                    const type = data.type;
                    
                    if (type === 'EXECUTE') {
                        const code = data.code;
                        output.innerHTML = ''; 
                        try {
                            // Wrap in async IIFE to support top-level await and capture return
                            const executor = new Function("return (async () => { " + code + " })()");
                            const result = executor();
                            
                            result.then(val => {
                                if (val !== undefined) {
                                    logToUI('>> ' + (typeof val === 'object' ? JSON.stringify(val) : val), 'result');
                                    window.parent.postMessage({ type: 'success', payload: val }, '*');
                                }
                            }).catch(err => {
                                logToUI(err.message, 'error');
                                window.parent.postMessage({ type: 'error', payload: err.message }, '*');
                            });
                        } catch (e) {
                            logToUI(e.message, 'error');
                            window.parent.postMessage({ type: 'error', payload: e.message }, '*');
                        }
                    }

                    if (type === 'RENDER_HTML') {
                        output.innerHTML = data.html || data.payload || '';
                        window.parent.postMessage({ type: 'success', payload: 'HTML Rendered' }, '*');
                    }
                });

                window.parent.postMessage({ type: 'READY' }, '*');
            </script>
        </body>
        </html>
    `

    return (
        <iframe
            ref={ref}
            title={title}
            className={`w-full h-full border-none rounded-lg bg-slate-900/50 ${className}`}
            sandbox="allow-scripts"
            srcDoc={srcDoc}
            onLoad={onReady}
        />
    )
})

Sandbox.displayName = 'Sandbox'
