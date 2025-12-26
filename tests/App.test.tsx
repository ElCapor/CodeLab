import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../src/App'

describe('App', () => {
    it('renders CodeLab brand heading', () => {
        render(<App />)
        // Check for the brand name in the header
        expect(screen.getByText(/CodeLab/i, { selector: 'h2' })).toBeInTheDocument()
    })

    it('shows language selector', () => {
        render(<App />)
        expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('renders sidebar with explorer icon', () => {
        render(<App />)
        expect(screen.getByTitle(/Explorer/i)).toBeInTheDocument()
    })

    it('renders breadcrumbs', () => {
        render(<App />)
        // Use getAllByText and check the first one (usually the UI element)
        expect(screen.getAllByText(/src/i).length).toBeGreaterThan(0)
        // Check for filename in breadcrumbs (specifically the span)
        const fileLabels = screen.getAllByText(/App/i)
        expect(fileLabels.length).toBeGreaterThan(0)
    })
})
