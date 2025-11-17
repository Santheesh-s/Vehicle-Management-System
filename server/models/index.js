import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { VehicleType, VehicleStatus, SlotStatus, PaymentStatus, PaymentMethod, UserRole } from '../../shared/parking.js';

// Vehicle Schema
const vehicleSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  type: {
    type: String,
    enum: Object.values(VehicleType),
    required: true
  },
  ownerName: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  entryTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  exitTime: {
    type: Date
  },
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSlot'
  },
  status: {
    type: String,
    enum: Object.values(VehicleStatus),
    default: VehicleStatus.PARKED
  }
}, {
  timestamps: true
});

// ParkingSlot Schema
const parkingSlotSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: Object.values(VehicleType),
    required: true
  },
  status: {
    type: String,
    enum: Object.values(SlotStatus),
    default: SlotStatus.AVAILABLE
  },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  reservedUntil: {
    type: Date
  }
}, {
  timestamps: true
});

// ParkingRecord Schema
const parkingRecordSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSlot',
    required: true
  },
  entryTime: {
    type: Date,
    required: true
  },
  exitTime: {
    type: Date
  },
  duration: {
    type: Number // in minutes
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING
  },
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod)
  },
  receiptId: {
    type: String
  }
}, {
  timestamps: true
});

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.STAFF
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  lastLogin: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// ParkingRate Schema
const parkingRateSchema = new mongoose.Schema({
  vehicleType: {
    type: String,
    enum: Object.values(VehicleType),
    required: true
  },
  baseRate: {
    type: Number,
    required: true,
    min: 0
  },
  additionalRate: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  effectiveFrom: {
    type: Date,
    required: true,
    default: Date.now
  },
  effectiveUntil: {
    type: Date
  }
}, {
  timestamps: true
});

// Create models
export const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export const ParkingSlot = mongoose.model('ParkingSlot', parkingSlotSchema);
export const ParkingRecord = mongoose.model('ParkingRecord', parkingRecordSchema);
export const User = mongoose.model('User', userSchema);
export const ParkingRate = mongoose.model('ParkingRate', parkingRateSchema);

// Hash password helper
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Initialize default data
export const initializeDefaultData = async () => {
  try {
    console.log('🔄 Initializing default data...');

    // Check if admin user exists
    const adminUser = await User.findOne({ role: UserRole.ADMIN });
    if (!adminUser) {
      console.log('👤 Creating default admin user...');
      const hashedPassword = await hashPassword('admin123');
      await User.create({
        username: 'admin',
        email: 'admin@parksys.com',
        role: UserRole.ADMIN,
        name: 'System Administrator',
        password: hashedPassword,
        isActive: true
      });
      console.log('✅ Default admin user created (admin/admin123)');
    }

    // Check if staff user exists
    const staffUser = await User.findOne({ username: 'staff' });
    if (!staffUser) {
      console.log('👤 Creating default staff user...');
      const hashedPassword = await hashPassword('staff123');
      await User.create({
        username: 'staff',
        email: 'staff@parksys.com',
        role: UserRole.STAFF,
        name: 'Staff Member',
        password: hashedPassword,
        isActive: true
      });
      console.log('✅ Default staff user created (staff/staff123)');
    }

    // Check if parking slots exist
    const slotCount = await ParkingSlot.countDocuments();
    if (slotCount === 0) {
      console.log('🅿️ Creating default parking slots...');
      const slots = [];
      
      // Create 50 parking slots
      for (let i = 1; i <= 50; i++) {
        slots.push({
          number: `A${i.toString().padStart(2, '0')}`,
          type: i <= 30 ? VehicleType.TWO_WHEELER : VehicleType.FOUR_WHEELER,
          status: SlotStatus.AVAILABLE,
          position: {
            x: ((i - 1) % 10) * 100,
            y: Math.floor((i - 1) / 10) * 80
          }
        });
      }
      
      await ParkingSlot.insertMany(slots);
      console.log('✅ 50 parking slots created successfully');
    }

    // Check if parking rates exist
    const rateCount = await ParkingRate.countDocuments();
    if (rateCount === 0) {
      console.log('💰 Creating default parking rates...');
      const rates = [
        {
          vehicleType: VehicleType.TWO_WHEELER,
          baseRate: 10,
          additionalRate: 10
        },
        {
          vehicleType: VehicleType.FOUR_WHEELER,
          baseRate: 20,
          additionalRate: 20
        },
        {
          vehicleType: VehicleType.TRUCK,
          baseRate: 50,
          additionalRate: 50
        },
        {
          vehicleType: VehicleType.BUS,
          baseRate: 75,
          additionalRate: 75
        }
      ];
      
      await ParkingRate.insertMany(rates);
      console.log('✅ Default parking rates created successfully');
    }

    console.log('🎉 Default data initialization completed');

  } catch (error) {
    console.error('❌ Error initializing default data:', error);
  }
};
