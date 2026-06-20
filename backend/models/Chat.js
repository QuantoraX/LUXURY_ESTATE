const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: false
  },
  lastMessage: {
    type: String,
    trim: true,
    default: ''
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Chat', chatSchema);
