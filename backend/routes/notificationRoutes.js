const express = require('express');
const { getNotifications, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All notification routes require authentication
router.use(protect);

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/', clearAllNotifications);
router.delete('/:id', deleteNotification);

module.exports = router;
