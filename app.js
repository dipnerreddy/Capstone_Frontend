const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Base URL for your Spring Boot APIs
const BASE_URL = 'https://capstone-axf8cfanaxafaygy.southindia-01.azurewebsites.net';
// https://capstone-axf8cfanaxafaygy.southindia-01.azurewebsites.net/
// const BASE_URL = 'http://localhost:8080';

// Display Login Form
app.get('/login', (req, res) => {
    const error = req.query.error || null;
    res.render('login', { error });
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

// Display Dashboard
app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});


const bodyParser = require('body-parser');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Route for updating blood bank info
app.post('/update-blood-bank', async (req, res) => {
  const email = req.body.email;
  const oPositive = req.body.oPositive;
  const oNegative = req.body.oNegative;
  const aPositive = req.body.aPositive;
  const aNegative = req.body.aNegative;
  const bPositive = req.body.bPositive;
  const bNegative = req.body.bNegative;

  // Debugging: Log the values received
  console.log('Email:', email);
  console.log('O Positive:', oPositive);
  console.log('O Negative:', oNegative);
  console.log('A Positive:', aPositive);
  console.log('A Negative:', aNegative);
  console.log('B Positive:', bPositive);
  console.log('B Negative:', bNegative);

  try {
      // Make a POST request to your Spring Boot API
      const response = await axios.post(`${BASE_URL}/bloodBank/update`, {
          email: email,
          oPositive: oPositive,
          oNegative: oNegative,
          aPositive: aPositive,
          aNegative: aNegative,
          bPositive: bPositive,
          bNegative: bNegative
      });

      // Log the response from the API
      console.log('API response:', response.data);

      // Redirect to the dashboard or send a success message
      res.redirect('/login?updated=true'); // Or send a JSON response if you prefer: res.json({ message: 'Blood bank info updated successfully.' });
  } catch (error) {
      // Log the error
      console.error('Error updating blood bank:', error);

      // Send an error message or redirect to the dashboard with an error
      res.redirect('/dashboard?error=Update failed');
  }
});


// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
