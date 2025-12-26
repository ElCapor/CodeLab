import { Extension } from '@codemirror/state'
import { keymap } from '@codemirror/view'
import {
    search,
    searchKeymap,
    openSearchPanel,
    closeSearchPanel,
    findNext,
    findPrevious,
    replaceNext,
    replaceAll,
    selectMatches,
    SearchQuery,
    setSearchQuery,
    getSearchQuery,
} from '@codemirror/search'

export {
    openSearchPanel,
    closeSearchPanel,
    findNext,
    findPrevious,
    replaceNext,
    replaceAll,
    selectMatches,
    SearchQuery,
    setSearchQuery,
    getSearchQuery,
}

/**
 * Creates the search extension with keyboard shortcuts
 * - Ctrl+F / Cmd+F: Open search panel
 * - Ctrl+H / Cmd+Option+F: Open search & replace panel
 * - F3 / Ctrl+G: Find next
 * - Shift+F3 / Ctrl+Shift+G: Find previous
 * - Ctrl+Shift+L: Select all matches
 */
export function createSearchExtension(): Extension[] {
    return [
        search({
            top: true, // Show panel at top of editor
        }),
        keymap.of([
            ...searchKeymap,
            // Additional custom keybindings if needed
        ]),
    ]
}

/**
 * Programmatically open the search panel
 */
export function openSearch(view: import('@codemirror/view').EditorView): void {
    openSearchPanel(view)
}

/**
 * Programmatically open the search and replace panel
 */
export function openSearchReplace(view: import('@codemirror/view').EditorView): void {
    // Open search panel - it includes replace functionality
    openSearchPanel(view)
    // The user can toggle replace mode in the panel
}

/**
 * Execute a search query programmatically
 */
export function executeSearch(
    view: import('@codemirror/view').EditorView,
    query: string,
    options?: {
        caseSensitive?: boolean
        regexp?: boolean
        wholeWord?: boolean
    }
): void {
    const searchQuery = new SearchQuery({
        search: query,
        caseSensitive: options?.caseSensitive ?? false,
        regexp: options?.regexp ?? false,
        wholeWord: options?.wholeWord ?? false,
    })

    view.dispatch({
        effects: setSearchQuery.of(searchQuery),
    })
}

/**
 * Get the current search query
 */
export function getCurrentSearchQuery(
    view: import('@codemirror/view').EditorView
): SearchQuery | null {
    return getSearchQuery(view.state)
}
