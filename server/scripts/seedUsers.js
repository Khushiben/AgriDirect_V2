const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas');

    // Clear all existing users
    await User.deleteMany({});
    console.log('✅ Cleared all existing users');

    // Create new users with @agri.com extension
    const users = [
      // Admin users
      {
        role: 'admin',
        name: 'Admin One',
        email: 'admin1@agri.com',
        phone: '9876543210',
        password: 'agri123',
        isVerified: true,
        profilePicture: 'default-profile.png'
      },
      {
        role: 'admin',
        name: 'Admin Two',
        email: 'admin2@agri.com',
        phone: '9876543211',
        password: 'agri123',
        isVerified: true,
        profilePicture: 'default-profile.png'
      },
      {
        role: 'admin',
        name: 'Admin Three',
        email: 'admin3@agri.com',
        phone: '9876543212',
        password: 'agri123',
        isVerified: true,
        profilePicture: 'default-profile.png'
      },
      
      // Farmer
      {
        role: 'farmer',
        name: 'John Farmer',
        email: 'farmer@agri.com',
        phone: '9876543213',
        password: 'agri123',
        state: 'Gujarat',
        district: 'Anand',
        address: '123 Farm Road, Anand',
        licenseId: 'FARM001',
        isVerified: true,
        profilePicture: 'default-profile.png'
      },
      
      // Distributor
      {
        role: 'distributor',
        name: 'Mike Distributor',
        email: 'distributor@agri.com',
        phone: '9876543214',
        password: 'agri123',
        state: 'Gujarat',
        district: 'Vadodara',
        address: '456 Market Street, Vadodara',
        licenseId: 'DIST001',
        isVerified: true,
        profilePicture: 'default-profile.png'
      },
      
      // Retailer
      {
        role: 'retailer',
        name: 'Sarah Retailer',
        email: 'retailer@agri.com',
        phone: '9876543215',
        password: 'agri123',
        state: 'Gujarat',
        district: 'Ahmedabad',
        address: '789 Shop Lane, Ahmedabad',
        licenseId: 'RET001',
        isVerified: true,
        profilePicture: 'default-profile.png'
      },
      
      // Consumer
      {
        role: 'consumer',
        name: 'Tom Consumer',
        email: 'consumer@agri.com',
        phone: '9876543216',
        password: 'agri123',
        state: 'Gujarat',
        district: 'Gandhinagar',
        address: '321 Home Avenue, Gandhinagar',
        isVerified: true,
        profilePicture: 'default-profile.png'
      }
    ];

    // Hash passwords and create users
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      await user.save();
      console.log(`✅ Created ${userData.role}: ${userData.email}`);
    }

    console.log('\n🎉 All users created successfully!');
    console.log('\nLogin credentials:');
    console.log('Admins: admin1@agri.com, admin2@agri.com, admin3@agri.com (password: agri123)');
    console.log('Farmer: farmer@agri.com (password: agri123)');
    console.log('Distributor: distributor@agri.com (password: agri123)');
    console.log('Retailer: retailer@agri.com (password: agri123)');
    console.log('Consumer: consumer@agri.com (password: agri123)');

  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await mongoose.disconnect();
  }
};

seedUsers();
