import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the page', () => {
  render(<App />);
  const linkElement = screen.getByText(/PDGA Numbers/i);
  expect(linkElement).toBeInTheDocument();
});
