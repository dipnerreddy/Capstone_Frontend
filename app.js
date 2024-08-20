const express = require('express');
const axios = require('axios');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;
require('dotenv').config();
const session = require('express-session');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Base URL for your Spring Boot APIs
const BASE_URL = 'https://capstone-axf8cfanaxafaygy.southindia-01.azurewebsites.net';

app.use(session({
    secret: process.env.SESSION_SECRET, // Access secret key from environment variables
    resave: false,
    saveUninitialized: true
}));

app.get('/', (req, res) => {
    res.redirect('/login');
});

// Display Login Form
app.get('/login', (req, res) => {
    const error = req.query.error || null;
    const updated = req.query.updated || null;
    res.render('login', { error, updated });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Check credentials logic here
    // If credentials are valid:
    req.session.email = email; // Store the email in the session
    res.redirect('/dashboard'); // Redirect to the dashboard or another page
});

app.get('/dashboard', (req, res) => {
    const error = req.query.error || null;
    const updated = req.query.updated || null; // Handle the updated query parameter
    res.render('dashboard', { error, updated });
});

// Display Update Form
app.get('/update-blood-bank', (req, res) => {
    const email = req.session.email;
    if (!email) {
        return res.redirect('/login?error=Please login first');
    }
    res.render('update-blood-bank', { email });
});

// Handle Update Form Submission
app.post('/update-blood-bank', async (req, res) => {
    const email = req.session.email;
    const { oPositive, oNegative, aPositive, aNegative, bPositive, bNegative } = req.body;

    try {
        // Make a POST request to your Spring Boot API to update the blood bank
        const response = await axios.post(`${BASE_URL}/bloodBank/update`, {
            email, oPositive, oNegative, aPositive, aNegative, bPositive, bNegative
        });

        // Redirect to the dashboard with a success message
        res.redirect('/dashboard?updated=true');
    } catch (error) {
        console.error('Error updating blood bank:', error);
        res.redirect('/dashboard?error=Update failed');
    }
});

// Route for handling the "See Database" button click
app.get('/see-database', (req, res) => {
    res.render('under-development'); // Render a page saying "Under Development"
});

// Route for handling the "Logout" button click
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.redirect('/dashboard?error=Logout failed');
        }
        res.redirect('/login');
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
