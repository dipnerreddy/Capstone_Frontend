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
const BASE_URL = 'https://capstone-axf8cfanaxafaygy.southindia-01.azurewebsites.net/bloodBank';

app.use(session({
    // secret: process.env.SESSION_SECRET, 
    // Access secret key from environment variables

    secret: "eba2004484d914deb29ef8fd54eab10b3adf6588739fa203b97d679d3010359f7b395c79e36a319fee4490a11f7b106477eb3cd4c745c6f808b437f96c3918de",
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

// Handle Login Form Submission
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Make a POST request to your Spring Boot API to check credentials
        const response = await axios.post(`${BASE_URL}/login`, { email, password });

        if (response.data.success) {
            req.session.email = email; // Store the email in the session
            res.redirect('/dashboard'); // Redirect to the dashboard or another page
        } else {
            res.redirect('/login?error=Invalid credentials'); // Redirect back to login with error
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.redirect('/login?error=Login failed');
    }
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
        const response = await axios.post(`${BASE_URL}/update`, {
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
app.get('/see-database', async (req, res) => {
    const email = req.session.email;
    if (!email) {
        return res.redirect('/login?error=Please login first');
    }
    try {
        const response = await axios.get(`${BASE_URL}/search`, {
            params: { email: email },
            headers: {
                'Content-Type': 'application/json'
            }
        });
        // Ensure the response data structure matches what the EJS template expects
        const bloodBankData = response.data;
        res.render('see-database', { bloodBankData });

    } catch (error) {
        console.error('Error retrieving blood bank data:', error);
        res.redirect('/dashboard?error=Failed to retrieve data');
    }
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
