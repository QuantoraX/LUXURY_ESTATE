const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  coordinates: {
    lat: {
      type: Number,
      min: [5.5, 'Latitude must be within Sri Lanka (5.5 to 10.0)'],
      max: [10.0, 'Latitude must be within Sri Lanka (5.5 to 10.0)']
    },
    lng: {
      type: Number,
      min: [79.0, 'Longitude must be within Sri Lanka (79.0 to 82.5)'],
      max: [82.5, 'Longitude must be within Sri Lanka (79.0 to 82.5)']
    }
  },
  propertyType: {
    type: String,
    enum: ['house', 'apartment', 'villa', 'land', 'commercial'],
    required: true
  },
  listingType: {
    type: String,
    enum: ['rent', 'sell'],
    required: true
  },
  bedrooms: {
    type: Number,
    default: 0
  },
  bathrooms: {
    type: Number,
    default: 0
  },
  area: {
    type: Number,
    required: true
  },
  images: [{
    type: String,
    required: true
  }],
  features: [{
    type: String
  }],
  featured: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  virtualTourUrl: {
    type: String,
    trim: true
  },
  videoUrl: {
    type: String,
    trim: true
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Property', propertySchema);