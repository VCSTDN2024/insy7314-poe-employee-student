const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require ('../models/User');

 

//('../models/User');

const router = express.Router();

// RegEx whitelisting patterns
const usernamePattern = /^[a-zA-Z0-9_]{5,20}$/; // Defining username pattern: 5-20 characters, letters, numbers, and underscores
const accountNumberPattern = /^[0-9]{10,12}$/; // Defining account number pattern: 10-12 digits only

// Defining password pattern: 12+ characters, must include lowercase, uppercase, digit, and special character
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;

// Registration
router.post('/register', [
  body('username').matches(usernamePattern).withMessage('Invalid username format'),
  body('accountNumber').matches(accountNumberPattern).withMessage('Invalid account number'),
  body('password').matches(passwordPattern).withMessage('Password must be strong'),
], async (req, res) => {  // ... registration logic with bcrypt hashing and MongoDB
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    let user = await User.findOne({ accountNumber: req.body.accountNumber });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User(req.body);
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    await user.save();

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Login
router.post('/login', [
  body('accountNumber').matches(accountNumberPattern).withMessage('Invalid account number'),
  body('password').notEmpty().withMessage('Password required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const user = await User.findOne({ accountNumber: req.body.accountNumber });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;