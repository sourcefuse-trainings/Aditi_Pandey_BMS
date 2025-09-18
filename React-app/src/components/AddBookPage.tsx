import React, { useState, useEffect } from 'react';
import { type Book, genres } from '../types';
import type { Page } from '../types';
import { v4 as uuidv4 } from 'uuid'; // Use npm install uuid @types/uuid
import { logger } from '../utils/logger';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/dark.css';

interface AddBookPageProps {
  setPage: (page: Page) => void;
  addBook: (book: Book) => void;
  updateBook: (book: Book) => void;
  bookToEdit: Book | null;
}

const AddBookPage: React.FC<AddBookPageProps> = ({ setPage, addBook, updateBook, bookToEdit }) => {
  const [formData, setFormData] = useState({
    title: '', author: '', isbn: '', pubDate: '', genre: ''
  });
  const isEditing = !!bookToEdit;

  useEffect(() => {
    if (isEditing) {
      setFormData({
        title: bookToEdit.title,
        author: bookToEdit.author,
        isbn: bookToEdit.isbn,
        pubDate: bookToEdit.pubDate,
        genre: bookToEdit.genre,
      });
      logger.info(`Editing book: ${bookToEdit.title}`);
    }
  }, [bookToEdit, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleDateChange = (date: Date[]) => {
      if (date[0]) {
        const formattedDate = date[0].toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, pubDate: formattedDate }));
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(formData).some(val => !val)) {
        logger.error("All fields must be filled out.");
        alert("Please fill out all fields.");
        return;
    }

    const bookData = {
      id: isEditing ? bookToEdit.id : uuidv4(),
      ...formData
    };

    if (isEditing) {
      updateBook(bookData);
    } else {
      addBook(bookData);
    }
    
    setPage('viewBooks');
  };

  return (
    <div className="page-container">
      <button onClick={() => setPage('home')} className="text-white/90 text-base px-3 py-2 rounded-md mb-6 transition-all hover:bg-white/10 hover:-translate-x-1">
        ⬅ Back
      </button>
      <h2 className="text-white text-3xl font-bold text-center mb-8 relative after:content-['📚'] after:ml-3">
        {isEditing ? 'Edit Book' : 'Add a New Book'}
      </h2>
      <form onSubmit={handleSubmit} className="grid gap-6">
        {Object.keys(formData).map(key => (
          key !== 'genre' && key !== 'pubDate' && (
            <div key={key}>
              <label className="text-white/90 font-medium capitalize block mb-2">{key}:</label>
              <input
                type={key === 'isbn' ? 'number' : 'text'}
                id={key}
                value={(formData as any)[key]}
                onChange={handleChange}
                placeholder={`Enter ${key}`}
                required
                className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all"
              />
            </div>
          )
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
        <button type="submit" className="relative mt-4 px-6 py-3 rounded-md bg-gradient-primary text-white font-semibold shadow-md transition-all hover:scale-105 hover:shadow-xl">
          {isEditing ? 'Save Changes' : 'Add Book'}
        </button>
      </form>
    </div>
  );
};

export default AddBookPage;