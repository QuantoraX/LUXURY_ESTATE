const Booking = require('../models/Booking');
const Property = require('../models/Property');
const Notification = require('../models/Notification');

// @desc    Create new viewing booking
// @route   POST /api/bookings
// @access  Public
exports.createBooking = async (req, res) => {
  try {
    const { name, email, phone, date, time, tourType, propertyId, agentId } = req.body;

    if (!propertyId || !agentId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Please provide propertyId, agentId, date, and time slot.'
      });
    }

    const bookingData = {
      property: propertyId,
      agent: agentId,
      name,
      email,
      phone,
      date,
      time,
      tourType: tourType || 'in-person'
    };

    // If user is logged in, attach their user ID
    if (req.user) {
      bookingData.user = req.user.id;
    }

    const newBooking = await Booking.create(bookingData);

    // Dispatch notification to the agent
    try {
      const propertyObj = await Property.findById(propertyId);
      const propertyTitle = propertyObj ? propertyObj.title : 'Property';
      await Notification.create({
        recipient: agentId,
        sender: req.user ? req.user.id : undefined,
        type: 'booking',
        message: `New viewing scheduled for "${propertyTitle}" by ${name} (${time} on ${new Date(date).toLocaleDateString()}).`,
        link: '/dashboard'
      });
    } catch (notifError) {
      console.error('Failed to create booking notification:', notifError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Viewing request scheduled successfully',
      data: newBooking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get viewing bookings
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
  try {
    let query = {};

    // Role-based filtering
    if (req.user.role === 'agent') {
      query.agent = req.user.id;
    } else if (req.user.role === 'user') {
      // Find bookings either matching user ID or their registered email
      query.$or = [{ user: req.user.id }, { email: req.user.email }];
    } // Admin gets all bookings

    const bookings = await Booking.find(query)
      .populate('property', 'title price location listingType')
      .populate('agent', 'name email phone')
      .populate('user', 'name email role avatar')
      .sort('-date');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update booking status (confirm / cancel)
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking status.'
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    // Access control: only the assigned agent or an admin can update
    if (req.user.role !== 'admin' && booking.agent.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this booking.'
      });
    }

    booking.status = status;
    await booking.save();

    // Dispatch notification to the user if applicable
    if (booking.user) {
      try {
        const propertyObj = await Property.findById(booking.property);
        const propertyTitle = propertyObj ? propertyObj.title : 'Property';
        await Notification.create({
          recipient: booking.user,
          sender: req.user.id,
          type: 'booking',
          message: `Your viewing request for "${propertyTitle}" has been ${status} by the agent.`,
          link: '/dashboard'
        });
      } catch (notifError) {
        console.error('Failed to create status update notification:', notifError.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
