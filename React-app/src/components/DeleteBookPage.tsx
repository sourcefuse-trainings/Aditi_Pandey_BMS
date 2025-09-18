import React from 'react';
import type { Book, Page } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';

interface DeleteBookPageProps {
  books: Book[];
  setPage: (page: Page) => void;
  deleteBook: (id: string) => void;
}

const DeleteBookPage: React.FC<DeleteBookPageProps> = ({ books, setPage, deleteBook }) => {
  return (
    <div className="page-container">
      <button onClick={() => setPage('home')} className="text-white/90 text-base px-3 py-2 rounded-md mb-6 transition-all hover:bg-white/10 hover:-translate-x-1">
        ⬅ Back
      </button>
      <h2 className="text-white text-3xl font-bold text-center mb-8 relative after:content-['🗑️'] after:ml-3">Delete Books</h2>
      
      {books.length > 0 ? (
        <ul className="grid gap-3">
          {books.map(book => (
            <li key={book.id} className="flex justify-between items-center p-4 rounded-md bg-white/10 border border-white/20 text-white/90 transition-all hover:bg-white/20 hover:scale-[1.01]">
              <span>{book.title} - <span className="text-white/60">{book.author}</span></span>
              <button 
                onClick={() => deleteBook(book.id)} 
                className="px-3 py-1.5 rounded-md bg-gradient-danger text-white shadow-md hover:scale-105 transition-transform flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faTrashAlt} /> Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-white/70 mt-8">No books to delete.</p>
      )}
    </div>
  );
};

export default DeleteBookPage;