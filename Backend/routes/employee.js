
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Employee = require('../models/Employee');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

// Employee Login (no registration)
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const employee = await Employee.findOne({ email: req.body.email });
    if (!employee || !await bcrypt.compare(req.body.password, employee.password)) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = { employee: { id: employee.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get pending transactions
router.get('/transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ status: 'pending' })
      .populate('userId', 'username accountNumber');
    res.json(transactions);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Verify transaction
router.put('/transactions/:id/verify', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction || transaction.status !== 'pending') {
      return res.status(400).json({ msg: 'Invalid transaction' });
    }

    transaction.status = 'verified';
    transaction.verifiedBy = req.employee.id;
    transaction.verifiedAt = new Date();
    await transaction.save();

    res.json({ msg: 'Transaction verified and submitted to SWIFT' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;