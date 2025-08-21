let books = [];
let editingIndex = null; // Track which book is being edited

// Show page
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
  document.getElementById(pageId).classList.remove('hidden');
  if (pageId === 'viewBooksPage') applyFiltersAndSort();
  if (pageId === 'deleteBookPage') renderDeleteList();
}

// Calculate age
const calculateAge = (pubDate) => {
  const publication = new Date(pubDate);
  const today = new Date();

  let years = today.getFullYear() - publication.getFullYear();
  let months = today.getMonth() - publication.getMonth();
  let days = today.getDate() - publication.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  return `${years} years ${months} months ${days} days`;
};

// Genre mapping
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

// Add/Edit Book handler
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

  if (editingIndex !== null) {
    books[editingIndex] = book;
    editingIndex = null;
    document.getElementById('formTitle').textContent = "Add a New Book";
    document.getElementById('submitBtn').textContent = "Add Book";
  } else {
    books.push(book);
  }

  e.target.reset();
  alert('Book saved!');
  applyFiltersAndSort();
  showPage('viewBooksPage');
});

// Render Books
function renderFilteredBooks(filteredBooks) {
  const container = document.getElementById('bookCardsContainer');
  container.innerHTML = '';

  filteredBooks.forEach((book, i) => {
    const card = document.createElement('div');
    card.className =
      "p-6 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 shadow-md text-white flex flex-col justify-between hover:scale-[1.02] transition-transform";

    card.innerHTML = `
      <div class="space-y-2">
        <h3 class="text-xl font-bold">${book.title}</h3>
        <p><span class="font-semibold">Author:</span> ${book.author}</p>
        <p><span class="font-semibold">ISBN:</span> ${book.isbn}</p>
        <p><span class="font-semibold">Age:</span> ${book.age}</p>
        <span class="inline-block mt-2 px-3 py-1 rounded-full text-sm bg-gradient-accent text-white shadow">${book.genre}</span>
      </div>
      <button onclick="editBook(${i})"
        class="mt-4 px-4 py-2 rounded-md bg-gradient-primary text-white font-medium shadow hover:shadow-lg hover:scale-105 transition-all">
        ✏ Edit
      </button>
    `;
    container.appendChild(card);
  });
}

// Apply filters
function applyFiltersAndSort() {
  const searchQuery = document.getElementById("searchInput")?.value.toLowerCase() || "";
  const genreQuery = document.getElementById("filterGenre")?.value.toLowerCase() || "";

  let filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery) || book.author.toLowerCase().includes(searchQuery);
    const matchesGenre = genreQuery ? book.genre.toLowerCase() === genreQuery : true;
    return matchesSearch && matchesGenre;
  });

  filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
  renderFilteredBooks(filteredBooks);
}

// Delete List
function renderDeleteList() {
  const list = document.getElementById('deleteList');
  list.innerHTML = '';
  books.forEach((book, i) => {
    const li = document.createElement('li');
    li.className =
      "flex justify-between items-center p-4 rounded-md bg-white/10 border border-white/20 text-white";
    li.innerHTML = `
      <span>${book.title} - ${book.author}</span>
      <button onclick="deleteBook(${i})"
        class="px-3 py-1 rounded bg-gradient-danger text-white shadow hover:scale-105 transition-all">
        🗑 Delete
      </button>
    `;
    list.appendChild(li);
  });
}

// Delete book
function deleteBook(index) {
  books.splice(index, 1);
  renderDeleteList();
  applyFiltersAndSort();
}

// Edit Book
function editBook(index) {
  const book = books[index];
  editingIndex = index;

  document.getElementById('title').value = book.title;
  document.getElementById('author').value = book.author;
  document.getElementById('isbn').value = book.isbn;
  document.getElementById('pubDate').value = book.pubDate;
  document.getElementById('genre').value = book.genre;

  document.getElementById('formTitle').textContent = "Edit Book";
  document.getElementById('submitBtn').textContent = "Save Changes";

  showPage('addBookPage');
}

/* -------------------------------
   Fetch Books from API
---------------------------------*/

const loadingSpinner = document.getElementById("loadingSpinner");
const errorContainer = document.getElementById("errorContainer");
const bookCardsContainer = document.getElementById("bookCardsContainer");
const fetchApiBtn = document.getElementById("fetchApiBtn");

async function fetchExternalBooks() {
  const url = `https://jsonplaceholder.typicode.com/posts?_limit=3&_=${Date.now()}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

  const data = await response.json();
  return data.map(post => ({
    title: post.title,
    author: `User ${post.userId}`,
    isbn: `123${post.id}`,
    pubDate: "2020-01-01",
    genre: "general",
    age: calculateAge("2020-01-01"),
    category: "general"
  }));
}

async function loadBooksAsync() {
  loadingSpinner.classList.remove("hidden");
  errorContainer.classList.add("hidden");
  bookCardsContainer.innerHTML = "";

  try {
    const externalBooks = await fetchExternalBooks();
    books = [...books, ...externalBooks];
    applyFiltersAndSort();
  } catch (error) {
    errorContainer.textContent = `Failed to load books: ${error.message}`;
    errorContainer.classList.remove("hidden");
  } finally {
    loadingSpinner.classList.add("hidden");
  }
}

fetchApiBtn.addEventListener("click", loadBooksAsync);

// Filters
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("filterGenre")?.addEventListener("change", applyFiltersAndSort);
  document.getElementById("searchInput")?.addEventListener("input", applyFiltersAndSort);
});