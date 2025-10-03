import React from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ViewBooksPage from '../../pages/ViewBooksPage';
import { bookService } from '../../services/bookService';
import type { Book } from '../../types';
import type { Mock } from 'vitest' ; 

vi.mock('../../services/bookService', () => ({
  bookService: {
    fetchBooksFromApi: vi.fn(),
  },
}));

vi.mock('../../utils/logger');

vi.mock('../../components/ChromaGridBookList', () => ({
  default: ({ books, renderActions }: { books: Book[], renderActions: (book: Book) => React.ReactNode }) => (
    <div data-testid="book-list">
      {books.map((book) => (
        <div key={book.id}>
          <span>{book.title}</span>
          <span>{book.author}</span>
          {renderActions(book)}
        </div>
      ))}
    </div>
  ),
}));

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('ViewBooksPage', () => {
  const mockBooks: Book[] = [
    { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '111', pubDate: '1925-04-10', genre: 'fiction' },
    { id: '2', title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '222', pubDate: '1988-03-01', genre: 'science' }
  ];
  const mockOnBooksFetched = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the initial list of books', () => {
    render(<ViewBooksPage books={mockBooks} onBooksFetched={mockOnBooksFetched} />);
    expect(screen.getByRole('heading', { name: /book list/i })).toBeInTheDocument();
    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    expect(screen.getByText('A Brief History of Time')).toBeInTheDocument();
  });

  it('should filter books based on search input', async () => {
    const user = userEvent.setup();
    render(<ViewBooksPage books={mockBooks} onBooksFetched={mockOnBooksFetched} />);
    const searchInput = screen.getByLabelText(/search by title or author/i);
    await user.type(searchInput, 'Gatsby');
    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    expect(screen.queryByText('A Brief History of Time')).not.toBeInTheDocument();
  });

  it('should filter books based on genre selection', async () => {
    const user = userEvent.setup();
    render(<ViewBooksPage books={mockBooks} onBooksFetched={mockOnBooksFetched} />);
    await user.click(screen.getByRole('combobox', { name: /genre/i }));
    await user.click(await screen.findByRole('option', { name: /science/i }));
    expect(screen.getByText('A Brief History of Time')).toBeInTheDocument();
    expect(screen.queryByText('The Great Gatsby')).not.toBeInTheDocument();
  });

  it('should fetch new books and show a loading state', async () => {
    const user = userEvent.setup();
    const newApiBooks: Book[] = [{ id: '3', title: 'New API Book', author: 'API Author', isbn: '333', pubDate: '2025-01-01', genre: 'general' }];
    (bookService.fetchBooksFromApi as Mock).mockResolvedValue(newApiBooks);
    render(<ViewBooksPage books={mockBooks} onBooksFetched={mockOnBooksFetched} />);
    const fetchButton = screen.getByRole('button', { name: /fetch from api/i });
    await user.click(fetchButton);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    await waitFor(() => {
      expect(mockOnBooksFetched).toHaveBeenCalledWith(newApiBooks);
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('should display an error message if the API fetch fails', async () => {
    const user = userEvent.setup();
    (bookService.fetchBooksFromApi as Mock).mockRejectedValue(new Error('API Error'));
    render(<ViewBooksPage books={mockBooks} onBooksFetched={mockOnBooksFetched} />);
    await user.click(screen.getByRole('button', { name: /fetch from api/i }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('API Error');
    expect(mockOnBooksFetched).not.toHaveBeenCalled();
  });

  it('should navigate to the edit page when an edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<ViewBooksPage books={mockBooks} onBooksFetched={mockOnBooksFetched} />);
    const secondBookContainer = screen.getByText('A Brief History of Time').parentElement!;
    const editButton = within(secondBookContainer).getByRole('button', { name: /edit/i });
    await user.click(editButton);
    expect(mockedNavigate).toHaveBeenCalledWith('/edit/2');
  });
});