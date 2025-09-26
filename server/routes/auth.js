import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { UserRole } from '../../shared/parking.js';
import { emailService } from '../services/emailService.js';
import { smsService } from '../services/smsService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'parksys-secret-key-2024';
const JWT_EXPIRES_IN = '24h';

// Helper function to generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Helper function to hash password
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Register new user (admin only)
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, role, name } = req.body;
    
    // Validate required fields
    if (!username || !email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Username, email, password, and name are required'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email or username already exists'
      });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: role || UserRole.STAFF,
      name,
      isActive: true
    });
    
    await user.save();
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      success: true,
      data: userResponse,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register user'
    });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }
    
    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
      isActive: true
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate token
    const token = generateToken(user._id, user.role);
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({
      success: true,
      data: {
        user: userResponse,
        token
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to login'
    });
  }
};

// Request OTP for password reset
export const requestPasswordResetOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found with this email'
      });
    }
    
    // Send OTP
    const result = await emailService.sendOTPEmail(email, user.name);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'OTP sent to your email address'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to send OTP'
      });
    }
  } catch (error) {
    console.error('Error requesting password reset OTP:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send OTP'
    });
  }
};

// Verify OTP and reset password
export const verifyOTPAndResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email, OTP, and new password are required'
      });
    }
    
    // Verify OTP
    const otpVerification = emailService.verifyOTP(email, otp);
    if (!otpVerification.success) {
      return res.status(400).json({
        success: false,
        error: otpVerification.error
      });
    }
    
    // Find user
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Hash new password and update
    const hashedNewPassword = await hashPassword(newPassword);
    user.password = hashedNewPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password'
    });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user data'
    });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get users'
    });
  }
};

// Update user (admin only or own profile)
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, role, isActive } = req.body;
    
    // Check if user can update this profile
    if (req.user.role !== UserRole.ADMIN && req.user.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied'
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Update allowed fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (req.user.role === UserRole.ADMIN && role) user.role = role;
    if (req.user.role === UserRole.ADMIN && typeof isActive === 'boolean') user.isActive = isActive;
    
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({
      success: true,
      data: userResponse,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Check current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);
    user.password = hashedNewPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user.userId === userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    await User.findByIdAndDelete(userId);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
};

// Test email configuration
export const testEmailConfig = async (req, res) => {
  try {
    const result = await emailService.testEmailConfiguration();

    res.json(result);
  } catch (error) {
    console.error('Error testing email config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test email configuration'
    });
  }
};

// Request SMS OTP for password reset
export const requestPasswordResetSMSOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    // For this demo, we'll send OTP without checking if phone number exists
    // In production, you'd want to verify the phone number belongs to a user
    const result = await smsService.sendOTPSMS(phoneNumber, 'User');

    if (result.success) {
      console.log(`📱 Password reset SMS OTP sent to: ${phoneNumber}`);
      res.json({
        success: true,
        message: 'Password reset OTP sent to your phone number'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Failed to send OTP'
      });
    }
  } catch (error) {
    console.error('Error sending SMS OTP:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send SMS OTP'
    });
  }
};

// Verify SMS OTP and reset password
export const verifySMSOTPAndResetPassword = async (req, res) => {
  try {
    const { phoneNumber, otp, newPassword } = req.body;

    if (!phoneNumber || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Phone number, OTP, and new password are required'
      });
    }

    // Verify SMS OTP
    const verificationResult = smsService.verifySMSOTP(phoneNumber, otp);
    if (!verificationResult.success) {
      return res.status(400).json(verificationResult);
    }

    // For this demo, we'll assume the phone number belongs to the admin user
    // In production, you'd have a proper phone-to-user mapping
    const user = await User.findOne({ role: 'ADMIN', isActive: true });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update password
    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    console.log(`✅ Password reset via SMS completed for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Password reset successful via SMS. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Error verifying SMS OTP and resetting password:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password via SMS'
    });
  }
};

// Test SMS configuration
export const testSMSConfig = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required for testing'
      });
    }

    const result = await smsService.testSMSConfiguration(phoneNumber);

    res.json(result);
  } catch (error) {
    console.error('Error testing SMS config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test SMS configuration'
    });
  }
};

// Middleware to verify JWT token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

// Middleware to check admin role
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
};
