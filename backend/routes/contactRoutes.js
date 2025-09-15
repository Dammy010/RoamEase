const express = require('express');
const router = express.Router();
const { submitContactForm } = require('../controllers/contactController');

// Test route to verify contact endpoint is working
router.get('/test', (req, res) => {
  res.status(200).json({ message: 'Contact endpoint is working!' });
});

// Public route for contact form submission
router.post('/', submitContactForm);

module.exports = router;
