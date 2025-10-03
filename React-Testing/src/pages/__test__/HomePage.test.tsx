/**
 * @file Test suite for the HomePage component.
 * Verifies that the main heading, subtitle, and navigation cards are rendered
 * and that clicking on a card triggers the correct navigation action.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../../pages/HomePage';

// Mock react-router's navigate function to assert navigation calls
// without needing a full router implementation.
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Reset mocks before each test.
  });

  const renderHomePage = () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
  };

  it('should render the main heading and subtitle', () => {
    renderHomePage();
    expect(screen.getByRole('heading', { name: /book management system/i })).toBeInTheDocument();
    expect(screen.getByText(/your personal library at your fingertips/i)).toBeInTheDocument();
  });

  it('should render all three menu cards', () => {
    renderHomePage();
    expect(screen.getByText('Add New Book')).toBeInTheDocument();
    expect(screen.getByText('View All Books')).toBeInTheDocument();
    expect(screen.getByText('Delete a Book')).toBeInTheDocument();
  });

  // Use `it.each` to run the same test logic for each navigation card, reducing code duplication.
  it.each([
    { cardName: 'Add New Book', path: '/add' },
    { cardName: 'View All Books', path: '/view' },
    { cardName: 'Delete a Book', path: '/delete' },
  ])('should navigate to $path when the "$cardName" card is clicked', async ({ cardName, path }) => {
    const user = userEvent.setup();
    renderHomePage();
    
    // Find the card by its text and then find the closest parent button element.
    // This works because the component was fixed to render the CardActionArea as a button.
    const card = screen.getByText(cardName).closest('button');
    expect(card).toBeInTheDocument();

    // Act: Simulate a user clicking the card.
    await user.click(card!);
    
    // Assert: Verify that navigate was called with the correct path.
    expect(mockedNavigate).toHaveBeenCalledWith(path);
  });
});