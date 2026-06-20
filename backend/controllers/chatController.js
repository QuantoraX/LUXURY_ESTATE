const Chat = require('../models/Chat');
const ChatMessage = require('../models/ChatMessage');
const Notification = require('../models/Notification');

// @desc    Get user conversations
// @route   GET /api/chats
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id
    })
      .populate('participants', 'name avatar role email phone')
      .populate('property', 'title price location images image listingType')
      .sort({ lastMessageAt: -1 });

    const chatsWithUnread = await Promise.all(chats.map(async (chat) => {
      const unreadCount = await ChatMessage.countDocuments({
        chat: chat._id,
        sender: { $ne: req.user.id },
        isRead: false
      });
      return {
        ...chat.toObject(),
        unreadCount
      };
    }));

    res.status(200).json({
      success: true,
      data: chatsWithUnread
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Start or retrieve a conversation thread
// @route   POST /api/chats
// @access  Private
exports.startConversation = async (req, res) => {
  try {
    const { recipientId, propertyId } = req.body;

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID is required'
      });
    }

    if (recipientId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot start a conversation with yourself'
      });
    }

    // Check if chat thread already exists between these participants
    let chat = await Chat.findOne({
      participants: { $all: [req.user.id, recipientId] }
    });

    if (!chat) {
      chat = await Chat.create({
        participants: [req.user.id, recipientId],
        property: propertyId || undefined,
        lastMessage: 'Conversation started',
        lastMessageAt: Date.now()
      });
    } else if (propertyId) {
      // Update property context if a new one is selected
      chat.property = propertyId;
      await chat.save();
    }

    // Populate thread details before returning
    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', 'name avatar role email phone')
      .populate('property', 'title price location images image listingType');

    res.status(200).json({
      success: true,
      data: populatedChat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/chats/:chatId/messages
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Conversation thread not found'
      });
    }

    // Verify requesting user is a participant
    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this conversation'
      });
    }

    const messages = await ChatMessage.find({ chat: chatId }).sort({ createdAt: 1 });

    // Mark messages sent by the other participant as read
    await ChatMessage.updateMany(
      { chat: chatId, sender: { $ne: req.user.id }, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Send a message in a conversation thread
// @route   POST /api/chats/:chatId/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message text cannot be empty'
      });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Conversation thread not found'
      });
    }

    // Verify user is a participant
    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this conversation'
      });
    }

    // Create the message
    const message = await ChatMessage.create({
      chat: chatId,
      sender: req.user.id,
      text: text.trim()
    });

    // Update conversation last message pointer
    chat.lastMessage = text.trim();
    chat.lastMessageAt = Date.now();
    await chat.save();

    // Find the other participant to trigger notifications
    const recipientId = chat.participants.find(p => p.toString() !== req.user.id);

    try {
      await Notification.create({
        recipient: recipientId,
        sender: req.user.id,
        type: 'general',
        message: `New message from ${req.user.name}: "${text.trim().length > 35 ? text.trim().substring(0, 35) + '...' : text.trim()}"`,
        link: '/dashboard?tab=inbox'
      });
    } catch (notifErr) {
      console.error('Failed to create chat notification:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a conversation thread
// @route   DELETE /api/chats/:chatId
// @access  Private
exports.deleteConversation = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Conversation thread not found'
      });
    }

    // Verify requesting user is a participant
    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this conversation'
      });
    }

    // Delete all messages associated with the chat
    await ChatMessage.deleteMany({ chat: chatId });

    // Delete the chat itself
    await Chat.findByIdAndDelete(chatId);

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

