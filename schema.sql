-- FILE: schema.sql (MySQL Corrected Version)
-- Database Schema for Book Management System (BMS) in 3NF

-- 1. Create Authors Table
-- UUID is replaced with CHAR(36)
CREATE TABLE Authors (
    author_id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    -- TIMESTAMP WITH TIME ZONE is replaced with DATETIME
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Categories Table
-- UUID is replaced with CHAR(36)
CREATE TABLE Categories (
    category_id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    -- TIMESTAMP WITH TIME ZONE is replaced with DATETIME
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Books Table
CREATE TABLE Books (
    book_id CHAR(36) PRIMARY KEY,
    
    -- Foreign Keys also use CHAR(36)
    author_id CHAR(36) NOT NULL, 
    category_id CHAR(36) NOT NULL,

    title VARCHAR(500) NOT NULL,
    isbn VARCHAR(20) UNIQUE NOT NULL,
    publication_date DATE NOT NULL,
    genre_keyword VARCHAR(50) NOT NULL, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Define Foreign Key constraints after the column definitions
    FOREIGN KEY (author_id) REFERENCES Authors(author_id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE RESTRICT
);

-- Define Indexes for faster lookups on Foreign Keys
CREATE INDEX idx_book_author ON Books(author_id);
CREATE INDEX idx_book_category ON Books(category_id);
CREATE INDEX idx_book_isbn ON Books(isbn);