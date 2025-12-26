export type Theme = 'dark' | 'light'

const THEME_KEY = 'codelab_theme'

export const ThemeEngine = {
    getTheme(): Theme {
        return (localStorage.getItem(THEME_KEY) as Theme) || 'dark'
    },

    setTheme(theme: Theme) {
        localStorage.setItem(THEME_KEY, theme)
        document.documentElement.setAttribute('data-theme', theme)
    },

    initialize() {
        const theme = this.getTheme()
        this.setTheme(theme)
    }
}
