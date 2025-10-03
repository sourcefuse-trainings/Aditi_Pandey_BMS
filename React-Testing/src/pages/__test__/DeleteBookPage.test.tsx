import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteBookPage from '../../pages/DeleteBookPage';
import type { Book } from '../../types';

vi.mock('../../components/ChromaGridBookList', () => ({
  default: React.forwardRef(({ books, renderActions }: { books: Book[], renderActions: (book: Book) => React.ReactNode }, ref: any) => (
    <div data-testid="book-list" ref={ref}>
      {books.map((book) => (
        <div key={book.id}>
          <span>{book.title}</span>
          {renderActions(book)}
        </div>
      ))}
    </div>
  )),
}));

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('DeleteBookPage', () => {
  const mockBooks: Book[] = [
    { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', pubDate: '1925-04-10', genre: 'fiction' },
    { id: '2', title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '9780553380163', pubDate: '1988-03-01', genre: 'science' }
  ];
  const mockDeleteBook = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the page title and the list of books', () => {
    render(<DeleteBookPage books={mockBooks} deleteBook={mockDeleteBook} />);
    expect(screen.getByRole('heading', { name: /delete books/i })).toBeInTheDocument();
    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    expect(screen.getByText('A Brief History of Time')).toBeInTheDocument();
  });

  it('should open a confirmation dialog when a delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<DeleteBookPage books={mockBooks} deleteBook={mockDeleteBook} />);
    const firstBookContainer = screen.getByText('The Great Gatsby').parentElement!;
    const deleteButton = within(firstBookContainer).getByRole('button', { name: /delete/i });
    await user.click(deleteButton);
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/are you sure you want to permanently delete "The Great Gatsby"/i)).toBeInTheDocument();
  });

  it('should call the deleteBook prop and close the dialog when confirmation is clicked', async () => {
    const user = userEvent.setup();
    render(<DeleteBookPage books={mockBooks} deleteBook={mockDeleteBook} />);
    const firstBookContainer = screen.getByText('The Great Gatsby').parentElement!;
    await user.click(within(firstBookContainer).getByRole('button', { name: /delete/i }));
    const dialog = await screen.findByRole('dialog');
    const confirmDeleteButton = within(dialog).getByRole('button', { name: /delete/i });
    await user.click(confirmDeleteButton);
    expect(mockDeleteBook).toHaveBeenCalledWith('1');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should close the dialog without calling deleteBook when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<DeleteBookPage books={mockBooks} deleteBook={mockDeleteBook} />);
    const firstBookContainer = screen.getByText('The Great Gatsby').parentElement!;
    await user.click(within(firstBookContainer).getByRole('button', { name: /delete/i }));
    const dialog = await screen.findByRole('dialog');
    const cancelButton = within(dialog).getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    expect(mockDeleteBook).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});