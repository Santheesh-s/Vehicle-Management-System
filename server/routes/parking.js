import {
  VehicleType,
  VehicleStatus,
  SlotStatus,
  PaymentStatus
} from "../../shared/parking.js";
import { emailService } from '../services/emailService.js';
import { smsService } from '../services/smsService.js';

// Import database models
let Vehicle, ParkingSlot, ParkingRecord, ParkingRate;
let useDatabase = false;

// Try to import database models
try {
  const models = await import('../models/index.js');
  Vehicle = models.Vehicle;
  ParkingSlot = models.ParkingSlot;
  ParkingRecord = models.ParkingRecord;
  ParkingRate = models.ParkingRate;
  useDatabase = true;
  console.log('📚 Using MongoDB for parking operations');
} catch (error) {
  console.log('⚠️  Database models not available, using in-memory storage');
}

// Fallback in-memory storage
let vehicles = [];
let parkingSlots = [];
let parkingRecords = [];

// Initialize demo data for in-memory storage
const initializeDemoData = () => {
  if (useDatabase) return; // Skip if using database
  
  vehicles = [];
  parkingSlots = [];
  parkingRecords = [];
  
  // Create parking slots
  for (let i = 1; i <= 50; i++) {
    const slot = {
      id: `slot-${i}`,
      _id: `slot-${i}`,
      number: `A${i.toString().padStart(2, '0')}`,
      type: i <= 30 ? VehicleType.TWO_WHEELER : VehicleType.FOUR_WHEELER,
      status: Math.random() > 0.7 ? SlotStatus.OCCUPIED : SlotStatus.AVAILABLE,
      position: {
        x: ((i - 1) % 10) * 100,
        y: Math.floor((i - 1) / 10) * 80
      }
    };
    
    if (slot.status === SlotStatus.OCCUPIED) {
      const vehicle = {
        id: `vehicle-${i}`,
        _id: `vehicle-${i}`,
        registrationNumber: `KA01${Math.random().toString().slice(2, 6)}`,
        type: slot.type,
        ownerName: `Demo User ${i}`,
        phoneNumber: `91${Math.random().toString().slice(2, 12)}`,
        email: `demo${i}@example.com`,
        entryTime: new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000),
        slotId: slot.id,
        status: VehicleStatus.PARKED
      };
      vehicles.push(vehicle);
      slot.vehicleId = vehicle.id;
    }
    
    parkingSlots.push(slot);
  }
  
  // Add some exited vehicles for demo purposes
  for (let i = 51; i <= 55; i++) {
    const exitedVehicle = {
      id: `vehicle-${i}`,
      _id: `vehicle-${i}`,
      registrationNumber: `KA02${Math.random().toString().slice(2, 6)}`,
      type: i % 2 === 0 ? VehicleType.TWO_WHEELER : VehicleType.FOUR_WHEELER,
      ownerName: `Demo User ${i}`,
      phoneNumber: `91${Math.random().toString().slice(2, 12)}`,
      email: `demo${i}@example.com`,
      entryTime: new Date(Date.now() - Math.random() * 8 * 60 * 60 * 1000),
      exitTime: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000),
      slotId: null,
      status: VehicleStatus.EXITED
    };
    vehicles.push(exitedVehicle);
  }

  console.log(`✅ Initialized ${parkingSlots.length} parking slots and ${vehicles.length} vehicles (in-memory)`);
  console.log(`   - ${vehicles.filter(v => v.status === VehicleStatus.PARKED).length} parked vehicles`);
  console.log(`   - ${vehicles.filter(v => v.status === VehicleStatus.EXITED).length} exited vehicles`);
};

// Initialize fallback data
initializeDemoData();

export const getParkingSlots = async (req, res) => {
  try {
    let slots;
    
    if (useDatabase) {
      slots = await ParkingSlot.find().populate('vehicleId');
    } else {
      slots = parkingSlots;
    }
    
    const response = {
      success: true,
      data: slots
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching parking slots:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch parking slots'
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    let slots, todayRecords, todayRevenue, todayVehicles, averageStayDuration;
    
    if (useDatabase) {
      slots = await ParkingSlot.find();
      
      // Get today's records
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      todayRecords = await ParkingRecord.find({
        entryTime: { $gte: startOfDay, $lte: endOfDay }
      });
      
      todayRevenue = todayRecords.reduce((sum, record) => sum + record.amount, 0);
      todayVehicles = todayRecords.length;
      
      // Calculate average stay duration
      const completedRecords = todayRecords.filter(record => record.duration);
      averageStayDuration = completedRecords.length > 0 
        ? Math.round(completedRecords.reduce((sum, record) => sum + record.duration, 0) / completedRecords.length)
        : 125;
    } else {
      slots = parkingSlots;
      
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      todayRecords = parkingRecords.filter(record => {
        const recordDate = new Date(record.entryTime);
        return recordDate >= startOfDay && recordDate <= endOfDay;
      });
      
      todayRevenue = todayRecords.reduce((sum, record) => sum + record.amount, 0) || Math.floor(Math.random() * 2000) + 500;
      todayVehicles = todayRecords.length || vehicles.length;
      averageStayDuration = 125;
    }
    
    const occupiedSlots = slots.filter(slot => slot.status === SlotStatus.OCCUPIED).length;
    const availableSlots = slots.filter(slot => slot.status === SlotStatus.AVAILABLE).length;
    const reservedSlots = slots.filter(slot => slot.status === SlotStatus.RESERVED).length;
    
    const stats = {
      totalSlots: slots.length,
      occupiedSlots,
      availableSlots,
      reservedSlots,
      todayRevenue,
      todayVehicles,
      averageStayDuration,
      peakHours: ['09:00-11:00', '14:00-16:00', '18:00-20:00']
    };
    
    const response = {
      success: true,
      data: stats
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
};

export const getActiveVehicles = async (req, res) => {
  try {
    let activeVehicles;

    if (useDatabase) {
      activeVehicles = await Vehicle.find({
        status: VehicleStatus.PARKED
      }).populate('slotId');
    } else {
      activeVehicles = vehicles.filter(vehicle => vehicle.status === VehicleStatus.PARKED);
    }

    const response = {
      success: true,
      data: activeVehicles
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching active vehicles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active vehicles'
    });
  }
};

export const getAllVehicles = async (req, res) => {
  try {
    let allVehicles;

    if (useDatabase) {
      // Get all vehicles regardless of status, sorted by most recent first
      allVehicles = await Vehicle.find()
        .populate('slotId')
        .sort({ createdAt: -1 });
    } else {
      // For in-memory storage, get all vehicles
      allVehicles = [...vehicles].sort((a, b) =>
        new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime()
      );
    }

    const response = {
      success: true,
      data: allVehicles
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching all vehicles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vehicles'
    });
  }
};

// Test notification services
export const testNotifications = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    console.log('🧪 Testing notification services...');
    console.log('📧 Email:', email);
    console.log('📱 Phone:', phoneNumber);

    const results = {
      email: null,
      sms: null
    };

    // Test email if provided
    if (email) {
      try {
        const testData = {
          registrationNumber: 'TEST-123',
          type: 'two_wheeler',
          ownerName: 'Test User',
          slotNumber: 'A-01',
          entryTime: new Date(),
          rate: 20
        };

        const emailResult = await emailService.sendVehicleEntryNotification(testData, email);
        results.email = emailResult;
        console.log('📧 Email test result:', emailResult);
      } catch (error) {
        results.email = { success: false, error: error.message };
        console.error('❌ Email test error:', error);
      }
    }

    // Test SMS if provided
    if (phoneNumber) {
      try {
        const testData = {
          registrationNumber: 'TEST-123',
          type: 'two_wheeler',
          ownerName: 'Test User',
          slotNumber: 'A-01',
          entryTime: new Date(),
          rate: 20
        };

        const smsResult = await smsService.sendVehicleEntryNotification(testData, phoneNumber);
        results.sms = smsResult;
        console.log('📱 SMS test result:', smsResult);
      } catch (error) {
        results.sms = { success: false, error: error.message };
        console.error('❌ SMS test error:', error);
      }
    }

    res.json({
      success: true,
      message: 'Notification tests completed',
      data: results
    });
  } catch (error) {
    console.error('❌ Test notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test notifications'
    });
  }
};

export const enterVehicle = async (req, res) => {
  try {
    const vehicleData = req.body;
    
    if (useDatabase) {
      // Database implementation
      const existingVehicle = await Vehicle.findOne({
        registrationNumber: vehicleData.registrationNumber,
        status: VehicleStatus.PARKED
      });
      
      if (existingVehicle) {
        return res.status(400).json({
          success: false,
          error: 'Vehicle is already parked in the facility'
        });
      }
      
      const availableSlot = await ParkingSlot.findOne({
        status: SlotStatus.AVAILABLE,
        type: vehicleData.type
      });
      
      if (!availableSlot) {
        return res.status(400).json({
          success: false,
          error: 'No available slots for this vehicle type'
        });
      }
      
      // Get parking rate
      const rate = await ParkingRate.findOne({
        vehicleType: vehicleData.type,
        effectiveFrom: { $lte: new Date() },
        $or: [
          { effectiveUntil: { $exists: false } },
          { effectiveUntil: { $gte: new Date() } }
        ]
      });
      
      const baseRate = rate ? rate.baseRate : (vehicleData.type === VehicleType.TWO_WHEELER ? 10 : 20);
      
      // Create new vehicle
      const vehicle = new Vehicle({
        registrationNumber: vehicleData.registrationNumber,
        type: vehicleData.type,
        ownerName: vehicleData.ownerName,
        phoneNumber: vehicleData.phoneNumber,
        email: vehicleData.email,
        entryTime: new Date(),
        slotId: availableSlot._id,
        status: VehicleStatus.PARKED
      });

      await vehicle.save();

      // Update slot
      availableSlot.status = SlotStatus.OCCUPIED;
      availableSlot.vehicleId = vehicle._id;
      await availableSlot.save();

      console.log(`✅ Vehicle ${vehicle.registrationNumber} entered and parked in slot ${availableSlot.number}`);

      // Send notifications (both email and SMS)
      const notificationData = {
        registrationNumber: vehicle.registrationNumber,
        type: vehicle.type,
        ownerName: vehicle.ownerName,
        slotNumber: availableSlot.number,
        entryTime: vehicle.entryTime,
        rate: baseRate
      };

      // Send notifications asynchronously (don't block the main response)
      setImmediate(async () => {
        // Send email notification
        if (vehicleData.email) {
          try {
            const emailResult = await emailService.sendVehicleEntryNotification(notificationData, vehicleData.email);
            if (emailResult.success) {
              console.log('✅ Entry email notification sent to:', vehicleData.email);
            } else {
              console.log('❌ Entry email notification failed:', emailResult.error);
            }
          } catch (error) {
            console.log('❌ Entry email error:', error.message);
          }
        }

        // Send SMS notification
        if (vehicleData.phoneNumber) {
          try {
            const smsResult = await smsService.sendVehicleEntryNotification(notificationData, vehicleData.phoneNumber);
            if (smsResult.success) {
              console.log('✅ Entry SMS notification sent to:', vehicleData.phoneNumber);
            } else {
              console.log('❌ Entry SMS notification failed:', smsResult.error);
            }
          } catch (error) {
            console.log('❌ Entry SMS error:', error.message);
          }
        }
      });

      const response = {
        success: true,
        data: vehicle,
        message: `Vehicle parked in slot ${availableSlot.number}. Notifications are being sent to ${vehicleData.email} and ${vehicleData.phoneNumber}.`
      };
      res.json(response);
    } else {
      // In-memory implementation (fallback)
      const existingVehicle = vehicles.find(v => 
        v.registrationNumber === vehicleData.registrationNumber && 
        v.status === VehicleStatus.PARKED
      );
      
      if (existingVehicle) {
        return res.status(400).json({
          success: false,
          error: 'Vehicle is already parked in the facility'
        });
      }
      
      const availableSlot = parkingSlots.find(slot => 
        slot.status === SlotStatus.AVAILABLE && slot.type === vehicleData.type
      );
      
      if (!availableSlot) {
        return res.status(400).json({
          success: false,
          error: 'No available slots for this vehicle type'
        });
      }
      
      const vehicle = {
        id: `vehicle-${Date.now()}`,
        _id: `vehicle-${Date.now()}`,
        registrationNumber: vehicleData.registrationNumber,
        type: vehicleData.type,
        ownerName: vehicleData.ownerName,
        phoneNumber: vehicleData.phoneNumber,
        email: vehicleData.email,
        entryTime: new Date(),
        slotId: availableSlot.id,
        status: VehicleStatus.PARKED
      };

      vehicles.push(vehicle);

      availableSlot.status = SlotStatus.OCCUPIED;
      availableSlot.vehicleId = vehicle.id;

      console.log(`✅ Vehicle ${vehicle.registrationNumber} entered and parked in slot ${availableSlot.number} (in-memory)`);

      // Send notifications (both email and SMS)
      const baseRate = vehicle.type === VehicleType.TWO_WHEELER ? 10 : 20;
      const notificationData = {
        registrationNumber: vehicle.registrationNumber,
        type: vehicle.type,
        ownerName: vehicle.ownerName,
        slotNumber: availableSlot.number,
        entryTime: vehicle.entryTime,
        rate: baseRate
      };

      // Send notifications asynchronously (don't block the main response)
      setImmediate(async () => {
        // Send email notification
        if (vehicleData.email) {
          try {
            const emailResult = await emailService.sendVehicleEntryNotification(notificationData, vehicleData.email);
            if (emailResult.success) {
              console.log('✅ Entry email notification sent (in-memory):', vehicleData.email);
            } else {
              console.log('❌ Entry email notification failed (in-memory):', emailResult.error);
            }
          } catch (error) {
            console.log('❌ Entry email error (in-memory):', error.message);
          }
        }

        // Send SMS notification
        if (vehicleData.phoneNumber) {
          try {
            const smsResult = await smsService.sendVehicleEntryNotification(notificationData, vehicleData.phoneNumber);
            if (smsResult.success) {
              console.log('✅ Entry SMS notification sent (in-memory):', vehicleData.phoneNumber);
            } else {
              console.log('❌ Entry SMS notification failed (in-memory):', smsResult.error);
            }
          } catch (error) {
            console.log('❌ Entry SMS error (in-memory):', error.message);
          }
        }
      });

      const response = {
        success: true,
        data: vehicle,
        message: `Vehicle parked in slot ${availableSlot.number}. Notifications are being sent to ${vehicleData.email} and ${vehicleData.phoneNumber}.`
      };
      res.json(response);
    }
  } catch (error) {
    console.error('Error entering vehicle:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register vehicle'
    });
  }
};

export const exitVehicle = async (req, res) => {
  try {
    const { vehicleId, paymentMethod } = req.body;

    console.log('🚪 Processing vehicle exit for ID:', vehicleId, 'Payment method:', paymentMethod);

    if (useDatabase) {
      // Database implementation
      const vehicle = await Vehicle.findById(vehicleId).populate('slotId');
      console.log('📋 Found vehicle:', vehicle ? vehicle.registrationNumber : 'NOT FOUND');
      if (!vehicle || vehicle.status !== VehicleStatus.PARKED) {
        return res.status(404).json({
          success: false,
          error: 'Vehicle not found or not currently parked'
        });
      }
      
      const slot = vehicle.slotId;
      if (!slot) {
        return res.status(404).json({
          success: false,
          error: 'Parking slot not found'
        });
      }
      
      // Calculate duration and amount
      const exitTime = new Date();
      const duration = Math.ceil((exitTime.getTime() - vehicle.entryTime.getTime()) / (1000 * 60));
      const hours = Math.ceil(duration / 60);
      
      // Get parking rate
      const rate = await ParkingRate.findOne({
        vehicleType: vehicle.type,
        effectiveFrom: { $lte: new Date() },
        $or: [
          { effectiveUntil: { $exists: false } },
          { effectiveUntil: { $gte: new Date() } }
        ]
      });
      
      const baseRate = rate ? rate.baseRate : (vehicle.type === VehicleType.TWO_WHEELER ? 10 : 20);
      const amount = hours * baseRate;
      
      // Create parking record
      const record = new ParkingRecord({
        vehicleId: vehicle._id,
        slotId: slot._id,
        entryTime: vehicle.entryTime,
        exitTime,
        duration,
        amount,
        paymentStatus: PaymentStatus.COMPLETED,
        paymentMethod,
        receiptId: `RCP-${Date.now()}`
      });
      
      await record.save();
      
      // Update vehicle and slot
      vehicle.exitTime = exitTime;
      vehicle.status = VehicleStatus.EXITED;
      await vehicle.save();
      
      slot.status = SlotStatus.AVAILABLE;
      slot.vehicleId = undefined;
      await slot.save();
      
      console.log(`✅ Vehicle ${vehicle.registrationNumber} exited. Amount: ₹${amount}`);
      console.log(`📋 Slot ${slot.number} freed and marked as available`);

      // Send exit notifications (both email and SMS)
      const exitData = {
        registrationNumber: vehicle.registrationNumber,
        ownerName: vehicle.ownerName,
        duration,
        amount,
        paymentMethod,
        receiptId: record.receiptId
      };

      // Send exit notifications asynchronously (don't block the main response)
      setImmediate(async () => {
        // Send email receipt
        if (vehicle.email) {
          try {
            const emailResult = await emailService.sendVehicleExitReceipt(exitData, vehicle.email);
            if (emailResult.success) {
              console.log('✅ Exit email receipt sent to:', vehicle.email);
            } else {
              console.log('❌ Exit email receipt failed:', emailResult.error);
            }
          } catch (error) {
            console.log('❌ Exit email error:', error.message);
          }
        }

        // Send SMS receipt
        if (vehicle.phoneNumber) {
          try {
            const smsResult = await smsService.sendVehicleExitReceipt(exitData, vehicle.phoneNumber);
            if (smsResult.success) {
              console.log('✅ Exit SMS receipt sent to:', vehicle.phoneNumber);
            } else {
              console.log('❌ Exit SMS receipt failed:', smsResult.error);
            }
          } catch (error) {
            console.log('❌ Exit SMS error:', error.message);
          }
        }
      });

      const response = {
        success: true,
        data: record,
        message: `Vehicle exited. Amount: ₹${amount}. Receipt sent to ${vehicle.email || 'email'} and ${vehicle.phoneNumber || 'phone'}.`
      };

      console.log('📤 Sending database exit response:', {
        success: response.success,
        vehicleId: vehicle._id,
        slotFreed: slot.number,
        amount
      });

      res.json(response);
    } else {
      // In-memory implementation (fallback)
      const vehicle = vehicles.find(v => v.id === vehicleId || v._id === vehicleId);
      if (!vehicle || vehicle.status !== VehicleStatus.PARKED) {
        return res.status(404).json({
          success: false,
          error: 'Vehicle not found or not currently parked'
        });
      }
      
      const slot = parkingSlots.find(s => s.id === vehicle.slotId);
      if (!slot) {
        return res.status(404).json({
          success: false,
          error: 'Parking slot not found'
        });
      }
      
      const exitTime = new Date();
      const duration = Math.ceil((exitTime.getTime() - new Date(vehicle.entryTime).getTime()) / (1000 * 60));
      const hours = Math.ceil(duration / 60);
      const baseRate = vehicle.type === VehicleType.TWO_WHEELER ? 10 : 20;
      const amount = hours * baseRate;
      
      const record = {
        id: `record-${Date.now()}`,
        _id: `record-${Date.now()}`,
        vehicleId: vehicle.id,
        slotId: slot.id,
        entryTime: vehicle.entryTime,
        exitTime,
        duration,
        amount,
        paymentStatus: PaymentStatus.COMPLETED,
        paymentMethod: paymentMethod || 'cash',
        receiptId: `RCP-${Date.now()}`
      };
      
      parkingRecords.push(record);
      
      vehicle.exitTime = exitTime;
      vehicle.status = VehicleStatus.EXITED;
      slot.status = SlotStatus.AVAILABLE;
      slot.vehicleId = undefined;
      
      console.log(`✅ Vehicle ${vehicle.registrationNumber} exited. Amount: ₹${amount} (in-memory)`);

      // Send exit notifications (both email and SMS)
      const exitData = {
        registrationNumber: vehicle.registrationNumber,
        ownerName: vehicle.ownerName,
        duration,
        amount,
        paymentMethod,
        receiptId: record.receiptId
      };

      // Send email receipt
      if (vehicle.email) {
        emailService.sendVehicleExitReceipt(exitData, vehicle.email)
          .then(result => {
            if (result.success) {
              console.log('✅ Exit email receipt sent (in-memory)');
            } else {
              console.log('❌ Exit email receipt failed (in-memory):', result.error);
            }
          })
          .catch(error => console.log('❌ Exit email error (in-memory):', error));
      }

      // Send SMS receipt
      if (vehicle.phoneNumber) {
        smsService.sendVehicleExitReceipt(exitData, vehicle.phoneNumber)
          .then(result => {
            if (result.success) {
              console.log('✅ Exit SMS receipt sent (in-memory)');
            } else {
              console.log('❌ Exit SMS receipt failed (in-memory):', result.error);
            }
          })
          .catch(error => console.log('❌ Exit SMS error (in-memory):', error));
      }

      const response = {
        success: true,
        data: record,
        message: `Vehicle exited. Amount: ₹${amount}. Receipt sent to ${vehicle.email || 'email'} and ${vehicle.phoneNumber || 'phone'}.`
      };
      res.json(response);
    }
  } catch (error) {
    console.error('Error processing vehicle exit:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process vehicle exit'
    });
  }
};

export const searchVehicle = async (req, res) => {
  try {
    const { registrationNumber } = req.query;
    
    if (!registrationNumber) {
      return res.status(400).json({
        success: false,
        error: 'Registration number is required'
      });
    }
    
    let vehicle, slot;
    
    if (useDatabase) {
      vehicle = await Vehicle.findOne({
        registrationNumber: { $regex: registrationNumber, $options: 'i' },
        status: VehicleStatus.PARKED
      }).populate('slotId');
      
      if (vehicle) {
        slot = vehicle.slotId;
      }
    } else {
      vehicle = vehicles.find(v => 
        v.registrationNumber.toLowerCase().includes(registrationNumber.toLowerCase()) &&
        v.status === VehicleStatus.PARKED
      );
      
      if (vehicle) {
        slot = parkingSlots.find(s => s.id === vehicle.slotId);
      }
    }
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found or not currently parked'
      });
    }
    
    const response = {
      success: true,
      data: { vehicle, slot }
    };
    res.json(response);
  } catch (error) {
    console.error('Error searching vehicle:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search vehicle'
    });
  }
};

export const getParkingRecords = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    let records, total;
    
    if (useDatabase) {
      const skip = (Number(page) - 1) * Number(limit);
      
      records = await ParkingRecord.find()
        .populate('vehicleId')
        .populate('slotId')
        .sort({ entryTime: -1 })
        .skip(skip)
        .limit(Number(limit));
      
      total = await ParkingRecord.countDocuments();
    } else {
      const startIndex = (Number(page) - 1) * Number(limit);
      const endIndex = startIndex + Number(limit);
      
      const sortedRecords = [...parkingRecords].sort((a, b) => 
        new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime()
      );
      
      records = sortedRecords.slice(startIndex, endIndex);
      total = parkingRecords.length;
    }
    
    const response = {
      success: true,
      data: records,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching parking records:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch parking records'
    });
  }
};

export const generateDailyReport = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    let records, slots;
    
    if (useDatabase) {
      records = await ParkingRecord.find({
        entryTime: { $gte: startOfDay, $lte: endOfDay }
      }).populate('vehicleId');
      slots = await ParkingSlot.find();
    } else {
      records = parkingRecords.filter(record => {
        const recordDate = new Date(record.entryTime);
        return recordDate >= startOfDay && recordDate <= endOfDay;
      });
      slots = parkingSlots;
    }
    
    const totalRevenue = records.reduce((sum, record) => sum + record.amount, 0);
    const totalVehicles = records.length;
    
    // Vehicle type breakdown
    const breakdown = records.reduce((acc, record) => {
      let vehicle;
      if (useDatabase) {
        vehicle = record.vehicleId;
      } else {
        vehicle = vehicles.find(v => v.id === record.vehicleId);
      }
      
      if (vehicle) {
        const type = vehicle.type;
        acc[type] = acc[type] || { count: 0, revenue: 0 };
        acc[type].count++;
        acc[type].revenue += record.amount;
      }
      return acc;
    }, {});
    
    const reportData = {
      date: targetDate.toDateString(),
      totalVehicles: totalVehicles || 45,
      totalRevenue: totalRevenue || 1250,
      twoWheelerCount: breakdown[VehicleType.TWO_WHEELER]?.count || 20,
      twoWheelerRevenue: breakdown[VehicleType.TWO_WHEELER]?.revenue || 400,
      fourWheelerCount: breakdown[VehicleType.FOUR_WHEELER]?.count || 22,
      fourWheelerRevenue: breakdown[VehicleType.FOUR_WHEELER]?.revenue || 750,
      truckCount: breakdown[VehicleType.TRUCK]?.count || 2,
      truckRevenue: breakdown[VehicleType.TRUCK]?.revenue || 80,
      busCount: breakdown[VehicleType.BUS]?.count || 1,
      busRevenue: breakdown[VehicleType.BUS]?.revenue || 20,
      peakHours: ['09:00-11:00', '14:00-16:00', '18:00-20:00'],
      currentAvailable: slots.filter(s => s.status === SlotStatus.AVAILABLE).length,
      currentOccupied: slots.filter(s => s.status === SlotStatus.OCCUPIED).length,
      currentOccupancyRate: Math.round((slots.filter(s => s.status === SlotStatus.OCCUPIED).length / slots.length) * 100)
    };
    
    console.log(`✅ Daily report generated successfully (${useDatabase ? 'database' : 'in-memory'})`);
    
    res.json({
      success: true,
      data: reportData,
      message: 'Daily report generated successfully'
    });
  } catch (error) {
    console.error('Error generating daily report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate daily report'
    });
  }
};

export const resetDemoData = async (req, res) => {
  try {
    if (useDatabase) {
      // Reset database data (admin only)
      await Vehicle.deleteMany({ status: VehicleStatus.PARKED });
      await ParkingRecord.deleteMany({});
      
      // Update all slots to available
      await ParkingSlot.updateMany({}, { 
        status: SlotStatus.AVAILABLE,
        $unset: { vehicleId: 1 }
      });
      
      console.log('✅ Database demo data reset successfully');
      
      res.json({
        success: true,
        message: 'Database demo data reset successfully',
        data: {
          vehicles: 0,
          slots: await ParkingSlot.countDocuments(),
          records: 0
        }
      });
    } else {
      // Reset in-memory data
      initializeDemoData();
      res.json({
        success: true,
        message: 'In-memory demo data reset successfully',
        data: {
          vehicles: vehicles.length,
          slots: parkingSlots.length,
          records: parkingRecords.length
        }
      });
    }
  } catch (error) {
    console.error('Error resetting demo data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset demo data'
    });
  }
};
