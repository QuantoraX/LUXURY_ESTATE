const mongoose = require('mongoose');

const agentReviewSchema = new mongoose.Schema({
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Agent reference is required']
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewer reference is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1 star'],
    max: [5, 'Rating cannot exceed 5 stars'],
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be an integer value'
    }
  },
  text: {
    type: String,
    required: [true, 'Review feedback text is required'],
    trim: true,
    maxlength: [1000, 'Review cannot exceed 1000 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent multiple reviews from the same reviewer to the same agent
agentReviewSchema.index({ agent: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('AgentReview', agentReviewSchema);
