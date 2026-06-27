const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const cloudinary = require('./config/cloudinary');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware
app.use((req, res, next) => {
  console.log(`[API Request] ${req.method} ${req.url}`);
  next();
});
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174'
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, postman or server-to-server)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.endsWith('.vercel.app') || 
                      origin.startsWith('https://luxestate-'); // Support any custom frontend name
                      
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
let dbUri = process.env.MONGODB_URI;
if (!dbUri || dbUri.includes('your_username') || dbUri.includes('your_password')) {
  dbUri = 'mongodb://127.0.0.1:27017/luxestate';
  console.log('ℹ️ MONGODB_URI is empty or placeholder. Falling back to local MongoDB: mongodb://127.0.0.1:27017/luxestate');
}

mongoose.connect(dbUri)
.then(() => {
  console.log('✅ MongoDB Connected');
  // Trigger property coordinates migration
  const { migratePropertyCoordinates } = require('./utils/migration');
  migratePropertyCoordinates();
})
.catch(err => console.error('❌ MongoDB Error:', err));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// File upload endpoint
const upload = require('./middleware/uploadMiddleware');
const { protect } = require('./middleware/auth');

app.post('/api/upload', protect, (req, res, next) => {
  // Use upload middleware to parse multiple files
  upload.array('images', 5)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    try {
      const files = req.files || [];
      
      // Upload each file to Cloudinary and clean up the local copy
      const uploadPromises = files.map(async (file) => {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'luxestate'
          });
          
          // Delete local file after successful upload
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          
          return result.secure_url;
        } catch (uploadError) {
          // Clean up the local file even if upload fails
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          throw uploadError;
        }
      });

      const urls = await Promise.all(uploadPromises);

      res.status(200).json({
        success: true,
        urls
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
// Nodemon watch trigger