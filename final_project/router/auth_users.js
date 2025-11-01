const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// NOTE: This 'users' array is shared with general.js
let users = []; 

// Helper function to check if username is valid (optional, minimal check)
const isValid = (username)=>{
    // Simple check: username must be non-null and non-empty
    return (username && username.trim().length > 0);
}

// Helper function to check if username and password match records
const authenticatedUser = (username, password)=>{
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
    });
    if(validusers.length > 0){
        return true;
    } else {
        return false;
    }
}

// Task 7: Login as a registered user
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({message: "Error logging in: Username and password are required"});
    }

    if (authenticatedUser(username,password)) {
        let accessToken = jwt.sign({
            data: password // We use username as the identifier in the payload
        }, 'access', { expiresIn: 60 * 60 });

        // Save the token in the session for the authentication middleware in index.js
        req.session.authorization = {
            accessToken,
            username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Task 8: Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    
    // The username is stored in the session by the /login route (Task 7)
    // and verified by the auth middleware in index.js
    const username = req.session.authorization.username; 

    if (!books[isbn]) {
        return res.status(404).json({message: `Book with ISBN ${isbn} not found.`});
    }
    
    // Check if the review query parameter is present
    if (!review) {
        return res.status(400).json({message: "Review content is missing in the query parameters."});
    }

    // Check if the user already reviewed this book
    if (books[isbn].reviews[username]) {
        // User has already reviewed -> Modify existing review
        books[isbn].reviews[username] = review;
        return res.status(200).json({message: `Review for ISBN ${isbn} by user ${username} successfully MODIFIED.`});
    } else {
        // First review by this user -> Add new review
        books[isbn].reviews[username] = review;
        return res.status(200).json({message: `Review for ISBN ${isbn} by user ${username} successfully ADDED.`});
    }
});

// Task 9: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username; // Get username from session

    if (!books[isbn]) {
        return res.status(404).json({message: `Book with ISBN ${isbn} not found.`});
    }
    
    // Check if the user has a review to delete
    if (books[isbn].reviews[username]) {
        // Delete the review using the username as the key
        delete books[isbn].reviews[username];
        return res.status(200).json({message: `Review for ISBN ${isbn} by user ${username} successfully DELETED.`});
    } else {
        return res.status(404).json({message: `No review found for ISBN ${isbn} by user ${username}.`});
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;