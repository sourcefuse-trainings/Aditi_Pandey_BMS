/**
 * @file Test suite for the ChromaGridBookList component.
 * Verifies that it renders a list of books, handles an empty state correctly,
 * and manages card expansion on user click.
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChromaGridBookList from '../ChromaGridBookList';
import type { Book } from '../../types';

// Mock the ChromaGrid child component to isolate ChromaGridBookList.
// This makes the test simpler, faster, and more focused on the list's logic,
// rather than the complex animations of the grid itself.
// The mock correctly handles `forwardRef` to match the real component's signature.
vi.mock('../ChromaGrid', () => ({
  __esModule: true,
  default: React.forwardRef(({ items, renderItem }: any, ref: any) => (
    <div ref={ref}>{items.map((item: any, i: number) => renderItem(item, i))}</div>
  )),
}));

describe('ChromaGridBookList', () => {
  // Arrange: Set up mock data for the tests.
  const mockBooks: Book[] = [
    { id: '1', title: 'Book One', author: 'Author A', isbn: '111', pubDate: '2020-01-01', genre: 'fiction' },
    { id: '2', title: 'Book Two', author: 'Author B', isbn: '222', pubDate: '2021-01-01', genre: 'science' },
  ];

  const mockRenderActions = (book: Book) => <button>Action for {book.title}</button>;

  it('should render a list of books', () => {
    // Act: Render the component with mock books.
    render(<ChromaGridBookList books={mockBooks} renderActions={mockRenderActions} />);
    
    // Assert: Verify that book titles and authors are in the document.
    expect(screen.getByText('Book One')).toBeInTheDocument();
    expect(screen.getByText('by Author B')).toBeInTheDocument();
  });

  it('should display a message when there are no books', () => {
    // Act: Render the component with an empty array of books.
    render(<ChromaGridBookList books={[]} renderActions={mockRenderActions} />);
    
    // Assert: Verify that the "no books" message is displayed.
    expect(screen.getByText('No books to display.')).toBeInTheDocument();
  });

  it('should expand a card to show more details on click', async () => {
    const user = userEvent.setup();
    render(<ChromaGridBookList books={mockBooks} renderActions={mockRenderActions} />);
    
    // Arrange: Find the first book card.
    const firstBookCard = screen.getByText('Book One').closest('article');
    expect(firstBookCard).not.toBeNull();
    
    // Assert: Initially, the detailed information (ISBN) should not be visible.
    // We use `queryByText` because it returns null if not found, instead of throwing an error.
    expect(within(firstBookCard!).queryByText(/isbn:/i)).not.toBeVisible();
    
    // Act: Simulate a user clicking on the card.
    await user.click(firstBookCard!);

    // Assert: After the click, wait for the ISBN label to appear and be visible.
    // We use `findByText` as it waits for the element to appear asynchronously.
    const isbnLabel = await within(firstBookCard!).findByText(/isbn:/i);
    expect(isbnLabel.parentElement).toHaveTextContent('ISBN: 111');
  });
});