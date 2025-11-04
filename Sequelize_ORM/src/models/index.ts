
import Author from './Author';
import Genre from './Genre'; 
import Book from './Book';

Author.hasMany(Book, {
  foreignKey: 'author_id',
  as: 'books',
});
Book.belongsTo(Author, {
  foreignKey: 'author_id',
  as: 'author',
});
Genre.hasMany(Book, {
  foreignKey: 'genre_id', 
  as: 'books',
});
Book.belongsTo(Genre, {
  foreignKey: 'genre_id', 
  as: 'genre', 
});
export { Author, Genre, Book }; 