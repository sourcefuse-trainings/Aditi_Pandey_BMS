import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AddBookPage from '../../pages/AddBookPage';
import type { Book } from '../../types';

// Mock the logger
vi.mock('../../utils/logger', () => ({
  logger: { info: vi.fn() },
}));

// Mock the DatePicker to be a simple, controllable input
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

// Mock useNavigate
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('AddBookPage', () => {
  const mockAddBook = vi.fn();
  const mockUpdateBook = vi.fn();
  const mockBooks: Book[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the form in "Add Book" mode and submit new data', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/add']}>
        <AddBookPage books={mockBooks} addBook={mockAddBook} updateBook={mockUpdateBook} />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /add a new book/i })).toBeInTheDocument();
    
    // Fill out the form
    await user.type(screen.getByLabelText(/title/i), 'New Test Book');
    await user.type(screen.getByLabelText(/author/i), 'Test Author');
    await user.type(screen.getByLabelText(/isbn/i), '123-456');
    await user.type(screen.getByLabelText(/publication date/i), '2023-05-10');
    
    // Select a genre
    await user.click(screen.getByLabelText(/genre/i));
    await user.click(await screen.findByRole('option', { name: 'Fiction' }));
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /add book/i }));
    
    // Check that the mock function was called correctly
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