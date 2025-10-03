import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChromaGridBookList from '../ChromaGridBookList';
import type { Book } from '../../types';

// Corrected mock to properly handle forwardRef
vi.mock('../ChromaGrid', () => ({
  __esModule: true,
  default: React.forwardRef(({ items, renderItem }: any, ref: any) => (
    <div ref={ref}>{items.map((item: any, i: number) => renderItem(item, i))}</div>
  )),
}));

describe('ChromaGridBookList', () => {
  const mockBooks: Book[] = [
    { id: '1', title: 'Book One', author: 'Author A', isbn: '111', pubDate: '2020-01-01', genre: 'fiction' },
    { id: '2', title: 'Book Two', author: 'Author B', isbn: '222', pubDate: '2021-01-01', genre: 'science' },
  ];

  const mockRenderActions = (book: Book) => <button>Action for {book.title}</button>;

  it('should render a list of books', () => {
    render(<ChromaGridBookList books={mockBooks} renderActions={mockRenderActions} />);
    
    expect(screen.getByText('Book One')).toBeInTheDocument();
    expect(screen.getByText('by Author B')).toBeInTheDocument();
  });

  it('should display a message when there are no books', () => {
    render(<ChromaGridBookList books={[]} renderActions={mockRenderActions} />);
    
    expect(screen.getByText('No books to display.')).toBeInTheDocument();
  });

  it('should expand a card to show more details on click', async () => {
    const user = userEvent.setup();
    render(<ChromaGridBookList books={mockBooks} renderActions={mockRenderActions} />);
    
    const firstBookCard = screen.getByText('Book One').closest('article');
    expect(firstBookCard).not.toBeNull();
    
    expect(within(firstBookCard!).queryByText(/isbn:/i)).not.toBeVisible();
    
    await user.click(firstBookCard!);

    const isbnLabel = await within(firstBookCard!).findByText(/isbn:/i);
    expect(isbnLabel.parentElement).toHaveTextContent('ISBN: 111');
  });
});