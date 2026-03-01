import React from 'react'
import { render, screen } from '@testing-library/react'
import ComponentTemplate from '../src/components/ComponentTemplate'

test('renders component template title', () => {
  render(<ComponentTemplate title="Hello" />)
  expect(screen.getByText('Hello')).toBeInTheDocument()
})
