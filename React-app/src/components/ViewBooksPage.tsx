import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Book, Genre } from '../types';
import { genres } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { logger } from '../utils/logger';
import { calculateAge } from '../utils/bookUtils';
import { bookService } from '../services/bookService';

const genreColorClasses: Record<Genre, string> = {
  fiction: "bg-gradient-to-r from-red-500 to-red-400",
  science: "bg-gradient-to-r from-blue-500 to-cyan-400",
  history: "bg-gradient-to-r from-yellow-500 to-yellow-400",
  biography: "bg-gradient-to-r from-indigo-500 to-indigo-400",
  technology: "bg-gradient-to-r from-teal-500 to-teal-400",
  romance: "bg-gradient-to-r from-pink-500 to-pink-400",
  general: "bg-gradient-to-r from-gray-500 to-gray-400"
};

const BookCard: React.FC<{ book: Book; onEdit: () => void }> = ({ book, onEdit }) => (
  <div className="p-6 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 shadow-md text-white/90 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 group">
    <div className="space-y-2">
      <h3 className="text-xl font-bold text-white">{book.title}</h3>
      <p><span className="font-semibold text-white/70">Author:</span> {book.author}</p>
      <p><span className="font-semibold text-white/70">ISBN:</span> {book.isbn}</p>
      <p><span className="font-semibold text-white/70">Age:</span> {calculateAge(book.pubDate)}</p>
      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm shadow-md text-white ${genreColorClasses[book.genre as Genre] || genreColorClasses.general}`}>
        {book.genre.charAt(0).toUpperCase() + book.genre.slice(1)}
      </span>
    </div>
    <button onClick={onEdit} className="mt-4 px-4 py-2 w-full rounded-md bg-gradient-primary text-white font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2">
      <FontAwesomeIcon icon={faEdit} /> Edit
    </button>
  </div>
);

const ViewBooksPage: React.FC<{
  books: Book[];
  onBooksFetched: (books: Book[]) => void;
}> = ({ books, onBooksFetched }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredBooks = useMemo(() => {
    return books
      .filter(book => 
        (book.title.toLowerCase().includes(search.toLowerCase()) || 
         book.author.toLowerCase().includes(search.toLowerCase())) &&
        (filter ? book.genre === filter : true)
      )
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [books, search, filter]);

  const handleEdit = (bookId: string) => {
    navigate(`/edit/${bookId}`);
  };

  const fetchFromApi = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedBooks = await bookService.fetchBooksFromApi();
      onBooksFetched(fetchedBooks);
    } catch (err: any) {
      logger.error("Failed to fetch books from API", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container w-[min(1200px,95vw)]">
      <button onClick={() => navigate('/')} className="text-white/90 text-base px-3 py-2 rounded-md mb-6 transition-all hover:bg-white/10 hover:-translate-x-1">
        ⬅ Back
      </button>
      <h2 className="text-white text-3xl font-bold text-center mb-8 relative after:content-['👁️'] after:ml-3">Book List</h2>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input 
          type="text" 
          placeholder="Search by title or author"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 focus:bg-white/20"
        />
        <select 
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white focus:outline-none focus:border-white/40 focus:bg-white/20 appearance-none"
        >
          <option value="" className="bg-[#2a5298]">All Genres</option>
          {genres.map(g => <option key={g} value={g} className="bg-[#2a5298]">{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
        </select>
        <button onClick={fetchFromApi} className="px-6 py-2 bg-gradient-accent text-white font-medium rounded-md shadow-md transition-transform hover:scale-105" disabled={isLoading}>
            {isLoading ? 'Fetching...' : 'Fetch from API'}
        </button>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            <p className="text-white/80">Loading books...</p>
        </div>
      )}

      {error && <div className="bg-red-500/20 text-red-400 p-4 rounded-md border border-red-500/30">Error: {error}</div>}

      {!isLoading && filteredBooks.length > 0 && (
         <div className="grid gap-6 mt-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.map(book => <BookCard key={book.id} book={book} onEdit={() => handleEdit(book.id)} />)}
         </div>
      )}

      {!isLoading && !error && filteredBooks.length === 0 && (
        <p className="text-center text-white/70 mt-8">No books found. Try adding some or fetching from the API!</p>
      )}
    </div>
  );
};

export default ViewBooksPage;