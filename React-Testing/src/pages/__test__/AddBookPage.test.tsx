/**
 * @file Test suite for the AddBookPage component.
 * It verifies that the component renders the book form in "add" mode
 * and correctly handles form submission by calling the `addBook` prop.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AddBookPage from '../../pages/AddBookPage';
import type { Book } from '../../types';

// Mock the logger to prevent console output during tests.
vi.mock('../../utils/logger', () => ({
  logger: { info: vi.fn() },
}));

// Mock the DatePicker component to a simple, controllable input.
// This avoids the complexity of interacting with a calendar popup in tests,
// making the test more stable and focused on the form's logic.
vi.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({ label, onChange }: { label: string, value: Date | null, onChange: (date: Date | null) => void }) => (
    <div>
      <label htmlFor="publication-date">{label}</label>
      <input
        id="publication-date"
        type="date"
        onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : null)}
      />
    </div>
  ),
}));

// Mock react-router's navigate function to isolate the component.
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('AddBookPage', () => {
  // Define mock props for the component.
  const mockAddBook = vi.fn();
  const mockUpdateBook = vi.fn();
  const mockBooks: Book[] = [];

  beforeEach(() => {
    vi.clearAllMocks(); // Clean up mocks between tests.
  });

  it('should render the form in "Add Book" mode and submit new data', async () => {
    const user = userEvent.setup();
    // Arrange: Render the component within a MemoryRouter to provide routing context.
    render(
      <MemoryRouter initialEntries={['/add']}>
        <AddBookPage books={mockBooks} addBook={mockAddBook} updateBook={mockUpdateBook} />
      </MemoryRouter>
    );

    // Assert: Check that the correct heading is displayed.
    expect(screen.getByRole('heading', { name: /add a new book/i })).toBeInTheDocument();
    
    // Act: Simulate a user filling out the form.
    await user.type(screen.getByLabelText(/title/i), 'New Test Book');
    await user.type(screen.getByLabelText(/author/i), 'Test Author');
    await user.type(screen.getByLabelText(/isbn/i), '123-456');
    await user.type(screen.getByLabelText(/publication date/i), '2023-05-10');
    
    // Act: Simulate selecting a genre from the dropdown.
    await user.click(screen.getByLabelText(/genre/i));
    await user.click(await screen.findByRole('option', { name: 'Fiction' }));
    
    // Act: Simulate submitting the form.
    await user.click(screen.getByRole('button', { name: /add book/i }));
    
    // Assert: Verify that the `addBook` prop function was called with the correct form data.
    expect(mockAddBook).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New Test Book',
        author: 'Test Author',
        isbn: '123-456',
        genre: 'fiction',
        pubDate: '2023-05-10'
      })
    );
  });
});