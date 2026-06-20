const Property = require('../models/Property');
const User = require('../models/User');
const { geocodeAddress } = require('../utils/geocoder');
const jwt = require('jsonwebtoken');

// @desc    Get all properties
// @route   GET /api/properties
exports.getProperties = async (req, res) => {
  try {
    let query = {};
    
    // Approval filter logic:
    // Determine if the caller is an admin optionally by parsing Authorization header
    let isAdmin = false;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user && user.role === 'admin') {
          isAdmin = true;
        }
      } catch (err) {
        // Continue as non-admin
      }
    }

    if (isAdmin && req.query.adminView === 'true') {
      // Admins on the dashboard can view all properties (both approved and pending)
      if (req.query.isApproved !== undefined) {
        query.isApproved = req.query.isApproved === 'true';
      }
    } else if (req.query.agent) {
      // Agents on their dashboard see their own properties (approved & pending)
      query.agent = req.query.agent;
    } else {
      // Guests and normal search results only show approved properties
      query.isApproved = true;
    }

    // Filtering
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }
    
    if (req.query.propertyType) query.propertyType = req.query.propertyType;
    if (req.query.listingType) query.listingType = req.query.listingType;
    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: 'i' };
    }
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { location: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = (page - 1) * limit;
    
    // Sorting
    const sortOrder = req.query.sort === 'price-asc' ? 'price' : 
                      req.query.sort === 'price-desc' ? '-price' : '-createdAt';
    
    const properties = await Property.find(query)
      .populate('agent', 'name email phone')
      .sort(sortOrder)
      .skip(startIndex)
      .limit(limit);
    
    const total = await Property.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      pagination: {
        page,
        totalPages: Math.ceil(total / limit),
        hasNextPage: startIndex + limit < total,
        hasPrevPage: page > 1
      },
      data: properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('agent', 'name email phone avatar');
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if property is approved
    if (!property.isApproved) {
      let hasAccess = false;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
          const token = req.headers.authorization.split(' ')[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          if (decoded.role === 'admin' || decoded.id === property.agent._id.toString()) {
            hasAccess = true;
          } else {
            const user = await User.findById(decoded.id);
            if (user && (user.role === 'admin' || user._id.toString() === property.agent._id.toString())) {
              hasAccess = true;
            }
          }
        } catch (err) {
          // Token error, ignore
        }
      }
      
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'This property listing is pending admin approval'
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create property
// @route   POST /api/properties
exports.createProperty = async (req, res) => {
  try {
    req.body.agent = req.user.id;
    
    // Auto-approve if created by admin, otherwise require approval
    if (req.user.role === 'admin') {
      req.body.isApproved = true;
    } else {
      req.body.isApproved = false;
    }

    // Auto-geocode if coordinates are missing or incomplete
    if (!req.body.coordinates || !req.body.coordinates.lat || !req.body.coordinates.lng) {
      const coords = await geocodeAddress(req.body.location);
      if (coords) {
        req.body.coordinates = coords;
      }
    }

    const property = await Property.create(req.body);
    
    res.status(201).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
exports.updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    // Check ownership or admin
    if (property.agent.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this property'
      });
    }
    
    // Only admin can change or persist approval status
    if (req.user.role !== 'admin') {
      // Force pending approval on edits by non-admins
      req.body.isApproved = false;
    } else {
      // If admin edits, they can explicitly change isApproved or let it keep its current value
      if (req.body.isApproved === undefined) {
        req.body.isApproved = property.isApproved;
      }
    }

    // Auto-geocode if coordinates are missing or incomplete, or if location changed and no coordinates are in req.body
    const locationChanged = req.body.location && req.body.location !== property.location;
    const coordinatesMissing = !req.body.coordinates || !req.body.coordinates.lat || !req.body.coordinates.lng;
    
    if (locationChanged || coordinatesMissing) {
      const hasReqCoords = req.body.coordinates && req.body.coordinates.lat && req.body.coordinates.lng;
      if (!hasReqCoords && req.body.location) {
        const coords = await geocodeAddress(req.body.location);
        if (coords) {
          req.body.coordinates = coords;
        }
      }
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    // Check ownership or admin
    if (property.agent.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this property'
      });
    }
    
    await property.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get featured properties
// @route   GET /api/properties/featured
exports.getFeaturedProperties = async (req, res) => {
  try {
    const properties = await Property.find({ featured: true, isApproved: true })
      .populate('agent', 'name')
      .limit(6);
    
    res.status(200).json({
      success: true,
      data: properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};