import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { UserRole } from '../../shared/parking.js';

// Debug route to check and create users
export const debugUsers = async (req, res) => {
  try {
    // Check all users
    const allUsers = await User.find({}).select('-password');
    
    // Check if admin exists
    let adminUser = await User.findOne({ username: 'admin' });
    if (!adminUser) {
      console.log('Creating admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@parksys.com',
        role: UserRole.ADMIN,
        name: 'System Administrator',
        password: hashedPassword,
        isActive: true
      });
      console.log('Admin user created');
    }

    // Check if staff exists
    let staffUser = await User.findOne({ username: 'staff' });
    if (!staffUser) {
      console.log('Creating staff user...');
      const hashedPassword = await bcrypt.hash('staff123', 10);
      staffUser = await User.create({
        username: 'staff',
        email: 'staff@parksys.com',
        role: UserRole.STAFF,
        name: 'Staff Member',
        password: hashedPassword,
        isActive: true
      });
      console.log('Staff user created');
    }

    // Test password verification
    const adminPasswordTest = await bcrypt.compare('admin123', adminUser.password);
    const staffPasswordTest = await bcrypt.compare('staff123', staffUser.password);

    const updatedUsers = await User.find({}).select('-password');

    res.json({
      success: true,
      data: {
        totalUsers: updatedUsers.length,
        users: updatedUsers,
        passwordTests: {
          admin: adminPasswordTest,
          staff: staffPasswordTest
        },
        credentials: {
          admin: { username: 'admin', password: 'admin123' },
          staff: { username: 'staff', password: 'staff123' }
        }
      }
    });
  } catch (error) {
    console.error('Debug users error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Force create users
export const forceCreateUsers = async (req, res) => {
  try {
    // Delete existing users
    await User.deleteMany({});
    
    // Create admin
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@parksys.com',
      role: UserRole.ADMIN,
      name: 'System Administrator',
      password: hashedAdminPassword,
      isActive: true
    });

    // Create staff
    const hashedStaffPassword = await bcrypt.hash('staff123', 10);
    const staffUser = await User.create({
      username: 'staff',
      email: 'staff@parksys.com',
      role: UserRole.STAFF,
      name: 'Staff Member',
      password: hashedStaffPassword,
      isActive: true
    });

    console.log('✅ Users force created successfully');

    res.json({
      success: true,
      message: 'Users created successfully',
      data: {
        admin: { username: adminUser.username, email: adminUser.email, role: adminUser.role },
        staff: { username: staffUser.username, email: staffUser.email, role: staffUser.role }
      }
    });
  } catch (error) {
    console.error('Force create users error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
