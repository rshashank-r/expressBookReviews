const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Helper function to check if a user exists
const doesExist = (username)=>{
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

// ----------------------------------------------------------------------
// TASKS 1-6 (SYNCHRONOUS IMPLEMENTATIONS)
// ----------------------------------------------------------------------

// Task 6: Register a new user
public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) {
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});
    }
  }
  return res.status(404).json({message: "Unable to register user. Username and password are required."});
});

// Task 1: Get the book list available in the shop
public_users.get('/',function (req, res) {
  // Use JSON.stringify method for displaying the output neatly.
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn]; 

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({message: `Book with ISBN ${isbn} not found.`});
  }
});
  
// Task 3: Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const matchingBooks = [];

  for (const isbn in books) {
    if (books[isbn].author === author) {
      // Add the book to the list
      matchingBooks.push(books[isbn]);
    }
  }

  if (matchingBooks.length > 0) {
    return res.status(200).json({booksbyauthor: matchingBooks});
  } else {
    return res.status(404).json({message: `No books found by author: ${author}`});
  }
});

// Task 4: Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const matchingBooks = [];

  for (const isbn in books) {
    if (books[isbn].title === title) {
      matchingBooks.push(books[isbn]);
    }
  }

  if (matchingBooks.length > 0) {
    return res.status(200).json({booksbytitle: matchingBooks});
  } else {
    return res.status(404).json({message: `No books found with title: ${title}`});
  }
});

// Task 5: Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    if (Object.keys(book.reviews).length > 0) {
      return res.status(200).json(book.reviews);
    } else {
      return res.status(200).json({message: `Book with ISBN ${isbn} has no reviews yet.`});
    }
  } else {
    return res.status(404).json({message: `Book with ISBN ${isbn} not found.`});
  }
});

// ----------------------------------------------------------------------
// CUSTOM PROMISE FUNCTIONS (Simulating Async Fetch - Tasks 10-13)
// ----------------------------------------------------------------------

// Simulates fetching all books
function getBooks() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(books);
        }, 500);
    });
}

// Simulates fetching book details by ISBN
function getBookByISBN(isbn) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const book = books[isbn];
            if (book) {
                resolve(book);
            } else {
                reject(new Error(`Book with ISBN ${isbn} not found.`));
            }
        }, 500);
    });
}

// Simulates fetching books by Author
function getBooksByAuthor(author) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const matchingBooks = [];
            for (const isbn in books) {
                if (books[isbn].author === author) {
                    matchingBooks.push(books[isbn]);
                }
            }

            if (matchingBooks.length > 0) {
                resolve({ booksbyauthor: matchingBooks });
            } else {
                reject(new Error(`No books found by author: ${author}`));
            }
        }, 500);
    });
}

// Simulates fetching books by Title
function getBooksByTitle(title) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const matchingBooks = [];
            for (const isbn in books) {
                if (books[isbn].title === title) {
                    matchingBooks.push(books[isbn]);
                }
            }

            if (matchingBooks.length > 0) {
                resolve({ booksbytitle: matchingBooks });
            } else {
                reject(new Error(`No books found with title: ${title}`));
            }
        }, 500);
    });
}

// ----------------------------------------------------------------------
// TASKS 10-13 (ASYNC/AWAIT IMPLEMENTATIONS)
// ----------------------------------------------------------------------

// Task 10: Get the book list available in the shop (Async/Await)
public_users.get('/books/async', async function (req, res) {
    try {
        const bookList = await getBooks();
        return res.status(200).send(JSON.stringify(bookList, null, 4));
    } catch (error) {
        return res.status(500).json({ message: "Failed to retrieve book list." });
    }
});


// Task 11: Get book details based on ISBN (Async/Await)
public_users.get('/isbn/async/:isbn', async function (req, res) {
    try {
        const isbn = req.params.isbn;
        const book = await getBookByISBN(isbn);
        return res.status(200).json(book);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});

// Task 12: Get book details based on author (Async/Await)
public_users.get('/author/async/:author', async function (req, res) {
    try {
        const author = req.params.author;
        const matchingBooks = await getBooksByAuthor(author);
        return res.status(200).json(matchingBooks);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});


// Task 13: Get all books based on title (Async/Await)
public_users.get('/title/async/:title', async function (req, res) {
    try {
        const title = req.params.title;
        const matchingBooks = await getBooksByTitle(title);
        return res.status(200).json(matchingBooks);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});

module.exports.general = public_users;