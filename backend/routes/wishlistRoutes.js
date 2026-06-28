const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Get wishlist
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const cleanWishlist = (user.wishlist || []).filter(item => item !== null && item !== undefined);
    res.status(200).json({
      success: true,
      data: cleanWishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Add to wishlist
router.post('/:propertyId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (!user.wishlist) user.wishlist = [];
    
    const propertyIdStr = req.params.propertyId.toString();
    const exists = user.wishlist.some(id => id && id.toString() === propertyIdStr);
    
    if (!exists) {
      user.wishlist.push(req.params.propertyId);
      await user.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Added to wishlist'
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Remove from wishlist
router.delete('/:propertyId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (!user.wishlist) user.wishlist = [];
    
    const propertyIdStr = req.params.propertyId.toString();
    user.wishlist = user.wishlist.filter(id => id && id.toString() !== propertyIdStr);
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Removed from wishlist'
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;