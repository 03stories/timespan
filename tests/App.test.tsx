import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../src/App';

vi.mock('../electron/scanMedia', () => ({
  scanMedia: vi.fn(async () => [])
}));

describe('App', () => {
  it('renders button', () => {
    render(<App />);
    expect(screen.getByText('Pick Directory')).toBeDefined();
  });
});
