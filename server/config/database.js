import mongoose from 'mongoose';
import { initializeDefaultData } from '../models/index.js';

const MONGODB_URI = 'mongodb+srv://vehicle:Santheesh2006@vehicle.tcoxeer.mongodb.net/parkingsystem?retryWrites=true&w=majority&appName=vehicle';

export const connectDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Set mongoose options for better connection handling
    mongoose.set('strictQuery', false);
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000, // Increase timeout
      socketTimeoutMS: 45000,
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 5,
    });
    
    console.log('✅ MongoDB connected successfully');
    
    // Initialize default data
    await initializeDefaultData();
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️  Falling back to in-memory storage for demo');
    return false;
  }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('🚨 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('📴 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
});
