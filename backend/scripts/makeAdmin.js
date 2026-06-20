const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const email = process.argv[2];

if (!email) {
  console.log('❌ Error: Please provide an email address.');
  console.log('Usage: node scripts/makeAdmin.js <email>');
  process.exit(1);
}

// Database connection
let dbUri = process.env.MONGODB_URI;
if (!dbUri || dbUri.includes('your_username') || dbUri.includes('your_password')) {
  dbUri = 'mongodb://127.0.0.1:27017/luxestate';
}

console.log('Connecting to database...');
mongoose.connect(dbUri)
  .then(async () => {
    console.log('Connected! Searching for user with email:', email);
    const user = await User.findOneAndUpdate(
      { email: { $regex: new RegExp('^' + email.trim() + '$', 'i') } },
      { role: 'admin' },
      { new: true }
    );

    if (!user) {
      console.log('❌ Error: User not found with email:', email);
    } else {
      console.log(`✅ Success: User "${user.name}" (${user.email}) has been promoted to "admin"!`);
    }
    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Database error:', err.message);
    process.exit(1);
  });
