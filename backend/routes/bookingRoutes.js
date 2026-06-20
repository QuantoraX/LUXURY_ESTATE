const express = require('express');
const { createBooking, getBookings, updateBookingStatus } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Middleware to optionally verify user if logged in, but not block if not
const optionalProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwtsecretkey');
      req.user = await User.findById(decoded.id);
    } catch (err) {
      // Continue without user object if token is invalid
    }
  }
  next();
};

router.post('/', optionalProtect, createBooking);
router.get('/', protect, getBookings);
router.put('/:id', protect, updateBookingStatus);

module.exports = router;
