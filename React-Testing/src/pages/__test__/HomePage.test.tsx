import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../../pages/HomePage';

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
    vi.clearAllMocks();
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

  it.each([
    { cardName: 'Add New Book', path: '/add' },
    { cardName: 'View All Books', path: '/view' },
    { cardName: 'Delete a Book', path: '/delete' },
  ])('should navigate to $path when the "$cardName" card is clicked', async ({ cardName, path }) => {
    const user = userEvent.setup();
    renderHomePage();
    const card = screen.getByText(cardName).closest('button');
    expect(card).toBeInTheDocument();
    await user.click(card!);
    expect(mockedNavigate).toHaveBeenCalledWith(path);
  });
});