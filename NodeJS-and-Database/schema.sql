
CREATE TABLE Authors (
   id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE Categories (
 id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE Books (
    book_id CHAR(36) PRIMARY KEY,
    author_id CHAR(36) NOT NULL, 
    category_id CHAR(36) NOT NULL,

    title VARCHAR(500) NOT NULL,
    isbn VARCHAR(20) UNIQUE NOT NULL,
    publication_date DATE NOT NULL,
    genre_keyword VARCHAR(50) NOT NULL, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (author_id) REFERENCES Authors(author_id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE RESTRICT
);

CREATE INDEX idx_book_author ON Books(author_id);
CREATE INDEX idx_book_category ON Books(category_id);
CREATE INDEX idx_book_isbn ON Books(isbn);
