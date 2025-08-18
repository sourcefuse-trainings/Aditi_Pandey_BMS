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
  const publication = new Date(pubDate);
  const today = new Date();

  let years = today.getFullYear() - publication.getFullYear();
  let months = today.getMonth() - publication.getMonth();
  let days = today.getDate() - publication.getDate();

  // Adjust if days are negative
  if (days < 0) {
    months--;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }

  // Adjust if months are negative
  if (months < 0) {
    years--;
    months += 12;
  }

  return `${years} years ${months} months ${days} days`;
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

// Render Delete List
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

/* -------------------------------
   NEW ASYNCHRONOUS FETCHING LOGIC
---------------------------------*/

// Fetch data from external API
// JS
const loadingSpinner = document.getElementById("loadingSpinner");
const errorContainer = document.getElementById("errorContainer");
const bookCardsContainer = document.getElementById("bookCardsContainer");
const fetchApiBtn = document.getElementById("fetchApiBtn");

async function fetchExternalBooks() {
  const url = `https://jsonplaceholder.typicode.com/posts?_limit=3&_=${Date.now()}`; // cache-busting param
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

  const data = await response.json();
  return data.map(post => ({
    title: post.title,
    author: `User ${post.userId}`,
    isbn: `123${post.id}`,
    pubDate: "2020-01-01",
    genre: "General",
    age: calculateAge("2020-01-01"),
    category: "General"
  }));
}

async function loadBooksAsync() {
  // UI state: show spinner, hide error
  loadingSpinner.classList.remove("hidden");
  errorContainer.classList.add("hidden");
  bookCardsContainer.innerHTML = "";

  try {
    const externalBooks = await fetchExternalBooks();
    books = [...books, ...externalBooks];
    renderBooks();
  } catch (error) {
    errorContainer.textContent = `Failed to load books: ${error.message}`;
    errorContainer.classList.remove("hidden");
  } finally {
    loadingSpinner.classList.add("hidden");
  }
}

fetchApiBtn.addEventListener("click", loadBooksAsync);


// Search/filter books asynchronously
function attachSearchHandler() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = books.filter(book =>
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query)
    );
    const container = document.getElementById('bookCardsContainer');
    container.innerHTML = '';
    filtered.forEach((book, i) => {
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
  });
}

// Attach search when DOM loads
document.addEventListener("DOMContentLoaded", () => {
  attachSearchHandler();

  // When user clicks Fetch from API
  const fetchBtn = document.getElementById("fetchApiBtn");
  if (fetchBtn) {
    fetchBtn.addEventListener("click", loadBooksAsync);
  }
});

function showError(message) {
  const errorContainer = document.getElementById("errorContainer");
  if (!errorContainer) return;
  errorContainer.textContent = message;
  errorContainer.classList.remove("hidden");

  // Hide after 5 seconds
  setTimeout(() => {
    errorContainer.classList.add("hidden");
  }, 5000);
}
