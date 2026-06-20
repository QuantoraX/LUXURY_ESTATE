const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Property = require('../models/Property');

const router = express.Router();

// Get all agents (public)
router.get('/agents', async (req, res) => {
  try {
    const agents = await User.find({ role: 'agent' }).select('-password').lean();
    const AgentReview = require('../models/AgentReview');
    
    // For each agent, count their listed properties, average rating, and review counts
    const agentsWithCount = await Promise.all(agents.map(async (agent) => {
      const propertyCount = await Property.countDocuments({ agent: agent._id });
      
      const reviews = await AgentReview.find({ agent: agent._id });
      const reviewCount = reviews.length;
      const averageRating = reviewCount > 0 
        ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1)) 
        : 0;

      return {
        ...agent,
        propertyCount,
        averageRating,
        reviewCount
      };
    }));

    res.status(200).json({
      success: true,
      data: agentsWithCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all users (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get admin user (protected)
router.get('/admin', protect, async (req, res) => {
  try {
    const admin = await User.findOne({ role: 'admin' }).select('name email avatar role phone');
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'No admin support accounts found'
      });
    }
    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update current user profile details
router.put('/me', protect, async (req, res) => {
  try {
    const { name, email, phone, password, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify if email is already taken
    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email address is already in use by another account.'
        });
      }
      user.email = email.toLowerCase();
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (password) user.password = password;

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update user role (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (role && !['user', 'agent', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete user (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user._id.toString() === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account'
      });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Review routes
const { addAgentReview, getAgentReviews } = require('../controllers/reviewController');
router.post('/agents/:id/reviews', protect, addAgentReview);
router.get('/agents/:id/reviews', getAgentReviews);

module.exports = router;