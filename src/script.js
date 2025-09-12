// src/script.ts
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// ===================================
// 2. SIMPLIFIED LOGGER CLASS
// ===================================
var Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.prototype.getTimestamp = function () {
        return new Date().toISOString();
    };
    Logger.prototype.colorize = function (message, color) {
        var css = "color: ".concat(color, "; font-weight: bold;");
        var plainText = "[".concat(this.getTimestamp(), "] ").concat(message);
        return [plainText, css];
    };
    Logger.prototype.info = function (message) {
        var _a = this.colorize("INFO: ".concat(message), 'deepskyblue'), plainText = _a[0], css = _a[1];
        console.log("%c".concat(plainText), css);
    };
    Logger.prototype.success = function (message) {
        var _a = this.colorize("SUCCESS: ".concat(message), 'mediumseagreen'), plainText = _a[0], css = _a[1];
        console.log("%c".concat(plainText), css);
    };
    Logger.prototype.error = function (message, errorObj) {
        var errorMessage = errorObj ? "".concat(message, " - ").concat(errorObj.message) : message;
        var _a = this.colorize("ERROR: ".concat(errorMessage), 'crimson'), plainText = _a[0], css = _a[1];
        console.error("%c".concat(plainText), css);
    };
    return Logger;
}());
// ===================================
// 3. DECORATOR
// ===================================
function LogMethodActivity(logger) {
    return function (target, propertyKey, descriptor) {
        var originalMethod = descriptor.value;
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            logger.info("Calling method: ".concat(propertyKey));
            var result = originalMethod.apply(this, args);
            logger.info("Method ".concat(propertyKey, " finished execution."));
            return result;
        };
        return descriptor;
    };
}
// ===================================
// 4. BOOK MANAGER CLASS
// ===================================
var BookManager = function () {
    var _a;
    var _instanceExtraInitializers = [];
    var _applyFiltersAndSort_decorators;
    var _loadBooksAsync_decorators;
    return _a = /** @class */ (function () {
            function BookManager() {
                this.books = (__runInitializers(this, _instanceExtraInitializers), []);
                this.editingIndex = null;
                this.logger = new Logger();
                this.initEventListeners();
                this.attachMethodsToWindow();
                this.logger.info("BookManager initialized.");
            }
            // ... (All other methods remain the same, but the download-related code is removed) ...
            BookManager.prototype.getElement = function (selector) {
                var element = document.querySelector(selector);
                if (!element) {
                    throw new Error("Element with selector \"".concat(selector, "\" not found."));
                }
                return element;
            };
            BookManager.prototype.attachMethodsToWindow = function () {
                var customWindow = window;
                customWindow.editBook = this.editBook.bind(this);
                customWindow.deleteBook = this.deleteBook.bind(this);
                customWindow.showPage = this.showPage.bind(this);
            };
            BookManager.prototype.showPage = function (pageId) {
                document.querySelectorAll('.page').forEach(function (page) { return page.classList.add('hidden'); });
                this.getElement("#".concat(pageId)).classList.remove('hidden');
                if (pageId === 'viewBooksPage')
                    this.applyFiltersAndSort();
                if (pageId === 'deleteBookPage')
                    this.renderDeleteList();
            };
            BookManager.prototype.calculateAge = function (pubDate) {
                var publication = new Date(pubDate);
                var today = new Date();
                var years = today.getFullYear() - publication.getFullYear();
                var months = today.getMonth() - publication.getMonth();
                var days = today.getDate() - publication.getDate();
                if (days < 0) {
                    months--;
                    var prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                    days += prevMonth.getDate();
                }
                if (months < 0) {
                    years--;
                    months += 12;
                }
                return "".concat(years, " years ").concat(months, " months ").concat(days, " days");
            };
            BookManager.prototype.categorizeGenre = function (genre) {
                var categories = {
                    fiction: 'Entertainment',
                    science: 'Educational',
                    history: 'Informational',
                    biography: 'Inspirational',
                    technology: 'Technical',
                    romance: 'Emotional'
                };
                return categories[genre.toLowerCase()] || 'General';
            };
            BookManager.prototype.renderFilteredBooks = function (filteredBooks) {
                var bookCardsContainer = this.getElement("#bookCardsContainer");
                bookCardsContainer.innerHTML = '';
                filteredBooks.forEach(function (book, i) {
                    var card = document.createElement('div');
                    card.className = "p-6 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 shadow-md text-white flex flex-col justify-between hover:scale-[1.02] transition-transform";
                    card.innerHTML = "\n        <div class=\"space-y-2\">\n          <h3 class=\"text-xl font-bold\">".concat(book.title, "</h3>\n          <p><span class=\"font-semibold\">Author:</span> ").concat(book.author, "</p>\n          <p><span class=\"font-semibold\">ISBN:</span> ").concat(book.isbn, "</p>\n          <p><span class=\"font-semibold\">Age:</span> ").concat(book.age, "</p>\n          <span class=\"inline-block mt-2 px-3 py-1 rounded-full text-sm bg-gradient-accent text-white shadow\">").concat(book.genre, "</span>\n        </div>\n        <button onclick=\"editBook(").concat(i, ")\" class=\"mt-4 px-4 py-2 rounded-md bg-gradient-primary text-white font-medium shadow hover:shadow-lg hover:scale-105 transition-all\">\n          \u270F Edit\n        </button>\n      ");
                    bookCardsContainer.appendChild(card);
                });
            };
            BookManager.prototype.applyFiltersAndSort = function () {
                var _b, _c;
                var searchQuery = ((_b = this.getElement("#searchInput")) === null || _b === void 0 ? void 0 : _b.value.toLowerCase()) || "";
                var genreQuery = ((_c = this.getElement("#filterGenre")) === null || _c === void 0 ? void 0 : _c.value.toLowerCase()) || "";
                var filteredBooks = this.books.filter(function (book) {
                    var matchesSearch = book.title.toLowerCase().includes(searchQuery) || book.author.toLowerCase().includes(searchQuery);
                    var matchesGenre = genreQuery ? book.genre.toLowerCase() === genreQuery : true;
                    return matchesSearch && matchesGenre;
                });
                filteredBooks.sort(function (a, b) { return a.title.localeCompare(b.title); });
                this.renderFilteredBooks(filteredBooks);
            };
            BookManager.prototype.renderDeleteList = function () {
                var list = this.getElement('#deleteList');
                list.innerHTML = '';
                this.books.forEach(function (book, i) {
                    var li = document.createElement('li');
                    li.className = "flex justify-between items-center p-4 rounded-md bg-white/10 border border-white/20 text-white";
                    li.innerHTML = "\n        <span>".concat(book.title, " - ").concat(book.author, "</span>\n        <button onclick=\"deleteBook(").concat(i, ")\" class=\"px-3 py-1 rounded bg-gradient-danger text-white shadow hover:scale-105 transition-all\">\n          \uD83D\uDDD1 Delete\n        </button>\n      ");
                    list.appendChild(li);
                });
            };
            BookManager.prototype.deleteBook = function (index) {
                var deletedBook = this.books[index];
                this.books.splice(index, 1);
                this.logger.info("Deleted book: \"".concat(deletedBook.title, "\""));
                this.renderDeleteList();
                this.applyFiltersAndSort();
            };
            BookManager.prototype.editBook = function (index) {
                var book = this.books[index];
                this.editingIndex = index;
                this.getElement('#title').value = book.title;
                this.getElement('#author').value = book.author;
                this.getElement('#isbn').value = book.isbn;
                this.getElement('#pubDate').value = book.pubDate;
                this.getElement('#genre').value = book.genre;
                this.getElement('#formTitle').textContent = "Edit Book";
                this.getElement('#submitBtn').textContent = "Save Changes";
                this.showPage('addBookPage');
            };
            BookManager.prototype.fetchExternalBooks = function () {
                return __awaiter(this, void 0, void 0, function () {
                    var url, response, data;
                    var _this = this;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                url = "https://jsonplaceholder.typicode.com/posts?_limit=3&_=".concat(Date.now());
                                return [4 /*yield*/, fetch(url, { cache: "no-store" })];
                            case 1:
                                response = _b.sent();
                                if (!response.ok)
                                    throw new Error("HTTP error! Status: ".concat(response.status));
                                return [4 /*yield*/, response.json()];
                            case 2:
                                data = _b.sent();
                                return [2 /*return*/, data.map(function (post) { return ({
                                        title: post.title,
                                        author: "User ".concat(post.userId),
                                        isbn: "123".concat(post.id),
                                        pubDate: "2020-01-01",
                                        genre: "general",
                                        age: _this.calculateAge("2020-01-01"),
                                        category: "general"
                                    }); })];
                        }
                    });
                });
            };
            BookManager.prototype.loadBooksAsync = function () {
                return __awaiter(this, void 0, void 0, function () {
                    var loadingSpinner, errorContainer, externalBooks, error_1;
                    var _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                loadingSpinner = this.getElement("#loadingSpinner");
                                errorContainer = this.getElement("#errorContainer");
                                loadingSpinner.classList.remove("hidden");
                                errorContainer.classList.add("hidden");
                                _c.label = 1;
                            case 1:
                                _c.trys.push([1, 3, 4, 5]);
                                return [4 /*yield*/, this.fetchExternalBooks()];
                            case 2:
                                externalBooks = _c.sent();
                                (_b = this.books).push.apply(_b, externalBooks);
                                this.logger.success("Successfully fetched ".concat(externalBooks.length, " books from API."));
                                this.applyFiltersAndSort();
                                return [3 /*break*/, 5];
                            case 3:
                                error_1 = _c.sent();
                                this.logger.error("Failed to load books from API", error_1);
                                errorContainer.textContent = "Failed to load books: ".concat(error_1.message);
                                errorContainer.classList.remove("hidden");
                                return [3 /*break*/, 5];
                            case 4:
                                loadingSpinner.classList.add("hidden");
                                return [7 /*endfinally*/];
                            case 5: return [2 /*return*/];
                        }
                    });
                });
            };
            BookManager.prototype.initEventListeners = function () {
                var _this = this;
                this.getElement('#bookForm').addEventListener('submit', function (e) {
                    e.preventDefault();
                    var title = _this.getElement('#title').value.trim();
                    var author = _this.getElement('#author').value.trim();
                    var isbn = _this.getElement('#isbn').value.trim();
                    var pubDate = _this.getElement('#pubDate').value;
                    var genre = _this.getElement('#genre').value.trim();
                    if (!title || !author || !isbn || !pubDate || !genre) {
                        _this.logger.error("All fields must be filled out.");
                        return alert('Fill all fields!');
                    }
                    if (isNaN(Number(isbn))) {
                        _this.logger.error("ISBN must be a numeric value.");
                        return alert('ISBN must be numeric!');
                    }
                    var book = { title: title, author: author, isbn: isbn, pubDate: pubDate, genre: genre, age: _this.calculateAge(pubDate), category: _this.categorizeGenre(genre) };
                    if (_this.editingIndex !== null) {
                        _this.books[_this.editingIndex] = book;
                        _this.logger.success("Book updated: \"".concat(book.title, "\""));
                        _this.editingIndex = null;
                        _this.getElement('#formTitle').textContent = "Add a New Book";
                        _this.getElement('#submitBtn').textContent = "Add Book";
                    }
                    else {
                        _this.books.push(book);
                        _this.logger.success("New book added: \"".concat(book.title, "\""));
                    }
                    e.target.reset();
                    _this.applyFiltersAndSort();
                    _this.showPage('viewBooksPage');
                });
                this.getElement("#fetchApiBtn").addEventListener("click", function () { return _this.loadBooksAsync(); });
                document.addEventListener("DOMContentLoaded", function () {
                    var _b, _c;
                    (_b = _this.getElement("#filterGenre")) === null || _b === void 0 ? void 0 : _b.addEventListener("change", function () { return _this.applyFiltersAndSort(); });
                    (_c = _this.getElement("#searchInput")) === null || _c === void 0 ? void 0 : _c.addEventListener("input", function () { return _this.applyFiltersAndSort(); });
                });
            };
            return BookManager;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _applyFiltersAndSort_decorators = [LogMethodActivity(new Logger())];
            _loadBooksAsync_decorators = [LogMethodActivity(new Logger())];
            __esDecorate(_a, null, _applyFiltersAndSort_decorators, { kind: "method", name: "applyFiltersAndSort", static: false, private: false, access: { has: function (obj) { return "applyFiltersAndSort" in obj; }, get: function (obj) { return obj.applyFiltersAndSort; } }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(_a, null, _loadBooksAsync_decorators, { kind: "method", name: "loadBooksAsync", static: false, private: false, access: { has: function (obj) { return "loadBooksAsync" in obj; }, get: function (obj) { return obj.loadBooksAsync; } }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
// ===================================
// 5. APP INITIALIZATION
// ===================================
new BookManager();
