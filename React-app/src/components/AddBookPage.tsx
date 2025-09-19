import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { type Book, genres } from '../types';
import { logger } from '../utils/logger';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/dark.css';

interface AddBookPageProps {
  books: Book[];
  addBook: (book: Omit<Book, 'id'>) => void;
  updateBook: (book: Book) => void;
}

const initialFormData = {
  title: '', author: '', isbn: '', pubDate: '', genre: ''
};

const AddBookPage: React.FC<AddBookPageProps> = ({ books, addBook, updateBook }) => {
  const navigate = useNavigate();
  const { bookId } = useParams<{ bookId: string }>();

  const [formData, setFormData] = useState(initialFormData);
  
  const bookToEdit = useMemo(() => 
    bookId ? books.find(b => b.id === bookId) : null, 
    [bookId, books]
  );
  
  const isEditing = !!bookToEdit;

  useEffect(() => {
    if (isEditing && bookToEdit) {
      setFormData({
        title: bookToEdit.title,
        author: bookToEdit.author,
        isbn: bookToEdit.isbn,
        pubDate: bookToEdit.pubDate,
        genre: bookToEdit.genre,
      });
      logger.info(`Editing book: ${bookToEdit.title}`);
    } else {
      setFormData(initialFormData);
    }
  }, [bookToEdit, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleDateChange = (date: Date[]) => {
    if (date[0]) {
      setFormData(prev => ({ ...prev, pubDate: date[0].toISOString().split('T')[0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && bookToEdit) {
      updateBook({ ...bookToEdit, ...formData });
    } else {
      addBook(formData);
    }
  };

  return (
    <div className="page-container w-[min(600px,95vw)]">
      <button onClick={() => navigate(-1)} className="text-white/90 text-base px-3 py-2 rounded-md mb-6 transition-all hover:bg-white/10 hover:-translate-x-1">
        ⬅ Back
      </button>
      <h2 className="text-white text-3xl font-bold text-center mb-8 relative after:content-['✍️'] after:ml-3">
        {isEditing ? 'Edit Book' : 'Add a New Book'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {(Object.keys(initialFormData) as Array<keyof typeof initialFormData>)
          .filter(key => !['pubDate', 'genre'].includes(key))
          .map(key => (
          <div key={key}>
            <label htmlFor={key} className="text-white/90 font-medium block mb-2">
              {key.charAt(0).toUpperCase() + key.slice(1)}:
            </label>
            <input
              type="text"
              id={key}
              value={formData[key]}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all"
            />
          </div>
        ))}
        <div>
           <label className="text-white/90 font-medium block mb-2">Publication Date:</label>
           <Flatpickr
              value={formData.pubDate}
              onChange={handleDateChange}
              options={{ dateFormat: 'Y-m-d' }}
              className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all"
              placeholder="Select Date"
           />
        </div>
        <div>
          <label className="text-white/90 font-medium block mb-2">Genre:</label>
          <select id="genre" value={formData.genre} onChange={handleChange} required className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all appearance-none">
            <option value="">Select Genre</option>
            {genres.map(g => <option key={g} value={g} className="bg-[#2a5298]">{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
          </select>
        </div>
        <button type="submit" className="relative mt-4 px-6 py-3 w-full rounded-md bg-gradient-primary text-white font-semibold shadow-md transition-all hover:scale-[1.02] hover:shadow-lg">
          {isEditing ? 'Save Changes' : 'Add Book'}
        </button>
      </form>
    </div>
  );
};

export default AddBookPage;