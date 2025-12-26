export { createBaseExtensions } from './baseExtensions'
export { createThemeExtension, createSyntaxHighlighting, createFullTheme } from './themeExtension'
export {
    getLanguageExtension,
    isLanguageSupported,
    getSupportedLanguages,
    inferLanguageFromPath,
} from './languageExtensions'
export {
    createSearchExtension,
    openSearch,
    openSearchReplace,
    executeSearch,
    getCurrentSearchQuery,
    openSearchPanel,
    closeSearchPanel,
    findNext,
    findPrevious,
    replaceNext,
    replaceAll,
    selectMatches,
} from './searchExtension'
export { createCompletionExtension, setGhostText } from './completionExtension'
export { createDiagnosticsExtension } from './diagnosticsExtension'
