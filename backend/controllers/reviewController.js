const AgentReview = require('../models/AgentReview');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Add a review for an agent
// @route   POST /api/users/agents/:id/reviews
// @access  Private
exports.addAgentReview = async (req, res) => {
  try {
    const { rating, text } = req.body;
    const agentId = req.params.id;

    if (!rating || !text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rating and review feedback text are required'
      });
    }

    // Verify rating is an integer between 1 and 5
    const parsedRating = parseInt(rating, 10);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5'
      });
    }

    // 1. Prevent self-review
    if (req.user.id === agentId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot write a review for yourself'
      });
    }

    // 2. Verify agent exists and has the agent role
    const agent = await User.findOne({ _id: agentId, role: 'agent' });
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // 3. Check for existing review
    const existingReview = await AgentReview.findOne({ agent: agentId, reviewer: req.user.id });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this agent'
      });
    }

    // 4. Create review
    const review = await AgentReview.create({
      agent: agentId,
      reviewer: req.user.id,
      rating: parsedRating,
      text: text.trim()
    });

    // 5. Send notification to the agent
    try {
      await Notification.create({
        recipient: agentId,
        sender: req.user.id,
        type: 'general',
        message: `New ${parsedRating}-star review from ${req.user.name}: "${text.trim().length > 30 ? text.trim().substring(0, 30) + '...' : text.trim()}"`,
        link: '/profile'
      });
    } catch (notifErr) {
      console.error('Failed to dispatch review notification:', notifErr.message);
    }

    // Populate reviewer info before returning
    const populatedReview = await AgentReview.findById(review._id)
      .populate('reviewer', 'name avatar role');

    res.status(201).json({
      success: true,
      data: populatedReview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get reviews for a specific agent
// @route   GET /api/users/agents/:id/reviews
// @access  Public
exports.getAgentReviews = async (req, res) => {
  try {
    const agentId = req.params.id;

    // Verify agent exists
    const agent = await User.findOne({ _id: agentId, role: 'agent' });
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    const reviews = await AgentReview.find({ agent: agentId })
      .populate('reviewer', 'name avatar role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
