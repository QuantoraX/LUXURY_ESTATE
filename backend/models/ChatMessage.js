const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: [true, 'Chat thread reference is required']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender reference is required']
  },
  text: {
    type: String,
    required: [true, 'Message content text is required'],
    trim: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
