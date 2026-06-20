const express = require('express');
const { getConversations, startConversation, getMessages, sendMessage, deleteConversation } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All chat routes require authentication
router.use(protect);

router.get('/', getConversations);
router.post('/', startConversation);
router.get('/:chatId/messages', getMessages);
router.post('/:chatId/messages', sendMessage);
router.delete('/:chatId', deleteConversation);

module.exports = router;
