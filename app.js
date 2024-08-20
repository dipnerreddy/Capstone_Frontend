const express = require('express');
const axios = require('axios');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Base URL for your Spring Boot APIs
const BASE_URL = 'https://capstone-axf8cfanaxafaygy.southindia-01.azurewebsites.net';

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
    const response = await axios.post(`${BASE_URL}/bloodBank/login`, { email, password });
    // Handle successful login
    res.redirect('/dashboard');
  } catch (error) {
    // Handle login failure
    res.redirect('/login?error=Invalid credentials');
  }
});

app.get('/dashboard', (req, res) => {
  const error = req.query.error || null;
  const updated = req.query.updated || null;  // Add this line to handle the updated query parameter
  res.render('dashboard', { error, updated });
});

// Handle Update Form Submission (This part is already in your code)
app.post('/update-blood-bank', async (req, res) => {
  const { email, oPositive, oNegative, aPositive, aNegative, bPositive, bNegative } = req.body;

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

// Display Update Form
app.get('/update-blood-bank', (req, res) => {
  res.render('update-blood-bank');
});

// Route for handling the "See Database" button click
app.get('/see-database', (req, res) => {
  res.render('under-development'); // Render a page saying "Under Development"
});

// Route for handling the "Logout" button click
app.get('/logout', (req, res) => {
  res.redirect('/login');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
