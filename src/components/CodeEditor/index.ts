export { default as CodeEditor } from './CodeEditor'
export type {
    CodeEditorProps,
    CodeEditorRef,
    EditorTheme,
    SupportedLanguage,
    SearchConfig,
    SearchPanelState,
    SearchPanelActions,
} from './types'
export {
    createBaseExtensions,
    createFullTheme,
    createThemeExtension,
    createSyntaxHighlighting,
    getLanguageExtension,
    getSupportedLanguages,
    isLanguageSupported,
    inferLanguageFromPath,
    createSearchExtension,
    openSearch,
    openSearchReplace,
    executeSearch,
    getCurrentSearchQuery,
} from './extensions'
