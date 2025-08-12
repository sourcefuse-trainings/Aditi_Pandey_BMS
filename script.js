let books = [];

// Show page function
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
  document.getElementById(pageId).classList.remove('hidden');
  if (pageId === 'viewBooksPage') renderBooks();
  if (pageId === 'deleteBookPage') renderDeleteList();
}

// Calculate book age
const calculateAge = (pubDate) => {
  return Math.max(0, new Date().getFullYear() - new Date(pubDate).getFullYear());
};

// Categorize by genre
const categorizeGenre = (genre) => {
  const categories = {
    fiction: 'Entertainment',
    science: 'Educational',
    history: 'Informational',
    biography: 'Inspirational',
    technology: 'Technical',
    romance: 'Emotional'
  };
  return categories[genre.toLowerCase()] || 'General';
};

// Handle Add Book
document.getElementById('bookForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();
  const isbn = document.getElementById('isbn').value.trim();
  const pubDate = document.getElementById('pubDate').value;
  const genre = document.getElementById('genre').value.trim();

  if (!title || !author || !isbn || !pubDate || !genre) return alert('Fill all fields!');
  if (isNaN(isbn)) return alert('ISBN must be numeric!');

  const book = { title, author, isbn, pubDate, genre, age: calculateAge(pubDate), category: categorizeGenre(genre) };
  books.push(book);
  e.target.reset();
  alert('Book added!');
});

// Render View Books
function renderBooks() {
  const container = document.getElementById('bookCardsContainer');
  container.innerHTML = '';
  
  books.forEach((book, i) => {
    const genreClass = `genre-${book.genre.toLowerCase()}` || 'genre-general';
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
      <div>
        <h3>${book.title}</h3>
        <p><strong>Author:</strong> ${book.author}</p>
        <p><strong>ISBN:</strong> ${book.isbn}</p>
        <p><strong>Age:</strong> ${book.age} yrs</p>
        <span class="genre-tag ${genreClass}">${book.genre}</span>
      </div>
      <button onclick="editBook(${i})">Edit</button>
    `;
    container.appendChild(card);
  });
}

// Render Delete List
function renderDeleteList() {
  const list = document.getElementById('deleteList');
  list.innerHTML = '';
  books.forEach((book, i) => {
    const li = document.createElement('li');
    li.innerHTML = `${book.title} - ${book.author} <button onclick="deleteBook(${i})">Delete</button>`;
    list.appendChild(li);
  });
}

// Delete Book
function deleteBook(index) {
  books.splice(index, 1);
  renderDeleteList();
}

// Edit Book
function editBook(index) {
  const book = books[index];
  showPage('addBookPage');
  document.getElementById('title').value = book.title;
  document.getElementById('author').value = book.author;
  document.getElementById('isbn').value = book.isbn;
  document.getElementById('pubDate').value = book.pubDate;
  document.getElementById('genre').value = book.genre;
  books.splice(index, 1);
}