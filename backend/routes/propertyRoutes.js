const express = require('express');
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getFeaturedProperties
} = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getProperties);
router.get('/featured', getFeaturedProperties);
router.get('/:id', getProperty);
router.post('/', protect, authorize('agent', 'admin'), createProperty);
router.put('/:id', protect, updateProperty);
router.delete('/:id', protect, deleteProperty);

module.exports = router;