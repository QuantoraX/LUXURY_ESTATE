const express = require('express');
const { sendMessage, getMessages } = require('../controllers/contactController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', sendMessage);
router.get('/', protect, getMessages);

module.exports = router;
