const Message = require('../models/Message');
const Property = require('../models/Property');
const Notification = require('../models/Notification');

// @desc    Create contact message / inquiry
// @route   POST /api/contact
// @access  Public
exports.sendMessage = async (req, res) => {
  try {
    const { name, email, subject, message, propertyId, agentId } = req.body;

    const newMessage = await Message.create({
      name,
      email,
      subject: subject || 'general',
      message,
      property: propertyId || undefined,
      agent: agentId || undefined
    });

    // Dispatch notification to agent
    let targetAgentId = agentId;
    if (!targetAgentId && propertyId) {
      try {
        const propertyObj = await Property.findById(propertyId);
        if (propertyObj) {
          targetAgentId = propertyObj.agent;
        }
      } catch (err) {
        console.error('Failed to lookup property for message notification:', err.message);
      }
    }

    if (targetAgentId) {
      try {
        await Notification.create({
          recipient: targetAgentId,
          sender: req.user ? req.user.id : undefined,
          type: 'inquiry',
          message: `New inquiry from ${name} regarding "${subject || 'General'}"`,
          link: '/dashboard'
        });
      } catch (notifError) {
        console.error('Failed to create message notification:', notifError.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Inquiry sent successfully',
      data: newMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get contact messages / inquiries
// @route   GET /api/contact
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    let query = {};

    // Role-based filtering
    if (req.user.role === 'agent') {
      query.agent = req.user.id;
    } else if (req.user.role === 'user') {
      query.email = req.user.email;
    }

    const messages = await Message.find(query)
      .populate('property', 'title price location')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
