const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');

// Initializing Express router for payment routes
const router = express.Router();

// Defining middleware to authenticate requests using JWT
const auth = (req, res, next) => {

  // Extracting token from request header
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  // Verifying JWT token with secret
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
// Defining RegEx patterns for input validation
const amountPattern = /^\d+(\.\d{1,2})?$/; // Matches positive numbers with up to 2 decimal places
const currencyPattern = /^[A-Z]{3}$/; // Matches 3-letter currency codes (e.g., USD)
const providerPattern = /^[a-zA-Z0-9\s-]{3,20}$/; // Matches provider names (3-20 chars)
const payeeAccountPattern = /^[0-9]{10,20}$/; // Matches 10-20 digit account numbers
const swiftCodePattern = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/; // Matches SWIFT codes (8 or 11 chars)

// Handling POST request to create a payment transaction
router.post('/', auth, [
  body('amount').matches(amountPattern).withMessage('Invalid amount'),
  body('currency').matches(currencyPattern).withMessage('Invalid currency (e.g., USD)'),
  body('provider').matches(providerPattern).withMessage('Invalid provider'),
  body('payeeAccount').matches(payeeAccountPattern).withMessage('Invalid payee account'),
  body('swiftCode').matches(swiftCodePattern).withMessage('Invalid SWIFT code'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
     // Creating a new transaction with user ID and request data
    const transaction = new Transaction({
      userId: req.user.id,
      ...req.body,
    });
    await transaction.save();
    res.json({ msg: 'Payment initiated successfully', transaction });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;