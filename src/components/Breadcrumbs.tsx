export function Breadcrumbs({ language }: { language: string }) {
    return (
        <div className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-400">
            <div className="flex items-center gap-1.5 hover:text-slate-200 cursor-pointer transition-colors">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span>src</span>
            </div>
            <span className="text-slate-600">/</span>
            <div className="flex items-center gap-1.5 hover:text-slate-200 cursor-pointer transition-colors">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>App.{language === 'typescript' ? 'tsx' : 'jsx'}</span>
            </div>

            <div className="ml-auto flex items-center gap-4">
                <div className="flex items-center gap-1.5 rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-sky-400 border border-sky-500/20">
                    <span className="h-1 w-1 rounded-full bg-sky-400 animate-pulse" />
                    {language}
                </div>
            </div>
        </div>
    )
}
