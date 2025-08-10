import { ParkingSlot, ParkingRate } from '../models/index.js';
import { VehicleType, SlotStatus } from '../../shared/parking.js';

// Get system configuration
export const getSystemConfig = async (req, res) => {
  try {
    const totalSlots = await ParkingSlot.countDocuments();
    const slotsByType = await ParkingSlot.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const rates = await ParkingRate.find({
      $or: [
        { effectiveUntil: { $exists: false } },
        { effectiveUntil: { $gte: new Date() } }
      ]
    }).sort({ effectiveFrom: -1 });
    
    const config = {
      totalSlots,
      slotsByType: slotsByType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      rates
    };
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error getting system config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get system configuration'
    });
  }
};

// Update slot configuration (ADD slots without removing existing data)
export const updateSlotConfiguration = async (req, res) => {
  try {
    const { twoWheelerSlots, fourWheelerSlots, truckSlots, busSlots } = req.body;
    
    if (!twoWheelerSlots || !fourWheelerSlots) {
      return res.status(400).json({
        success: false,
        error: 'Two wheeler and four wheeler slots are required'
      });
    }
    
    // Get current slot counts by type
    const currentSlots = await ParkingSlot.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const currentCounts = currentSlots.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
    
    // Calculate how many slots to add for each type
    const slotsToAdd = {
      [VehicleType.TWO_WHEELER]: Math.max(0, twoWheelerSlots - (currentCounts[VehicleType.TWO_WHEELER] || 0)),
      [VehicleType.FOUR_WHEELER]: Math.max(0, fourWheelerSlots - (currentCounts[VehicleType.FOUR_WHEELER] || 0)),
      [VehicleType.TRUCK]: Math.max(0, (truckSlots || 0) - (currentCounts[VehicleType.TRUCK] || 0)),
      [VehicleType.BUS]: Math.max(0, (busSlots || 0) - (currentCounts[VehicleType.BUS] || 0))
    };
    
    // Get the highest slot number to continue from
    const lastSlot = await ParkingSlot.findOne().sort({ number: -1 });
    let nextSlotNumber = 1;
    
    if (lastSlot) {
      // Extract number from slot (e.g., "A50" -> 50, "B25" -> 25)
      const match = lastSlot.number.match(/\d+$/);
      if (match) {
        nextSlotNumber = parseInt(match[0]) + 1;
      }
    }
    
    const newSlots = [];
    
    // Add Two Wheeler slots
    for (let i = 0; i < slotsToAdd[VehicleType.TWO_WHEELER]; i++) {
      newSlots.push({
        number: `A${nextSlotNumber.toString().padStart(2, '0')}`,
        type: VehicleType.TWO_WHEELER,
        status: SlotStatus.AVAILABLE,
        position: {
          x: ((nextSlotNumber - 1) % 10) * 100,
          y: Math.floor((nextSlotNumber - 1) / 10) * 80
        }
      });
      nextSlotNumber++;
    }
    
    // Add Four Wheeler slots
    for (let i = 0; i < slotsToAdd[VehicleType.FOUR_WHEELER]; i++) {
      newSlots.push({
        number: `B${nextSlotNumber.toString().padStart(2, '0')}`,
        type: VehicleType.FOUR_WHEELER,
        status: SlotStatus.AVAILABLE,
        position: {
          x: ((nextSlotNumber - 1) % 10) * 100,
          y: Math.floor((nextSlotNumber - 1) / 10) * 80
        }
      });
      nextSlotNumber++;
    }
    
    // Add Truck slots
    for (let i = 0; i < slotsToAdd[VehicleType.TRUCK]; i++) {
      newSlots.push({
        number: `C${nextSlotNumber.toString().padStart(2, '0')}`,
        type: VehicleType.TRUCK,
        status: SlotStatus.AVAILABLE,
        position: {
          x: ((nextSlotNumber - 1) % 10) * 100,
          y: Math.floor((nextSlotNumber - 1) / 10) * 80
        }
      });
      nextSlotNumber++;
    }
    
    // Add Bus slots
    for (let i = 0; i < slotsToAdd[VehicleType.BUS]; i++) {
      newSlots.push({
        number: `D${nextSlotNumber.toString().padStart(2, '0')}`,
        type: VehicleType.BUS,
        status: SlotStatus.AVAILABLE,
        position: {
          x: ((nextSlotNumber - 1) % 10) * 100,
          y: Math.floor((nextSlotNumber - 1) / 10) * 80
        }
      });
      nextSlotNumber++;
    }
    
    // Insert new slots only if there are any to add
    if (newSlots.length > 0) {
      await ParkingSlot.insertMany(newSlots);
      console.log(`✅ Added ${newSlots.length} new parking slots`);
    }
    
    // Get updated counts
    const updatedTotalSlots = await ParkingSlot.countDocuments();
    const updatedSlotsByType = await ParkingSlot.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const updatedCounts = updatedSlotsByType.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: {
        totalSlots: updatedTotalSlots,
        twoWheelerSlots: updatedCounts[VehicleType.TWO_WHEELER] || 0,
        fourWheelerSlots: updatedCounts[VehicleType.FOUR_WHEELER] || 0,
        truckSlots: updatedCounts[VehicleType.TRUCK] || 0,
        busSlots: updatedCounts[VehicleType.BUS] || 0,
        slotsAdded: newSlots.length,
        addedByType: {
          twoWheeler: slotsToAdd[VehicleType.TWO_WHEELER],
          fourWheeler: slotsToAdd[VehicleType.FOUR_WHEELER],
          truck: slotsToAdd[VehicleType.TRUCK],
          bus: slotsToAdd[VehicleType.BUS]
        }
      },
      message: newSlots.length > 0 
        ? `Successfully added ${newSlots.length} new parking slots. All existing data preserved.`
        : 'No new slots needed. Current configuration already meets or exceeds requirements.'
    });
  } catch (error) {
    console.error('Error updating slot configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update slot configuration'
    });
  }
};

// Remove excess slots (admin only, when reducing slot count)
export const removeExcessSlots = async (req, res) => {
  try {
    const { twoWheelerSlots, fourWheelerSlots, truckSlots, busSlots } = req.body;
    
    // Get current slot counts by type
    const currentSlots = await ParkingSlot.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const currentCounts = currentSlots.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
    
    const targetCounts = {
      [VehicleType.TWO_WHEELER]: twoWheelerSlots || 0,
      [VehicleType.FOUR_WHEELER]: fourWheelerSlots || 0,
      [VehicleType.TRUCK]: truckSlots || 0,
      [VehicleType.BUS]: busSlots || 0
    };
    
    let removedSlots = 0;
    const removalSummary = {};
    
    // Remove excess slots for each type (only available slots)
    for (const [vehicleType, targetCount] of Object.entries(targetCounts)) {
      const currentCount = currentCounts[vehicleType] || 0;
      
      if (currentCount > targetCount) {
        const toRemove = currentCount - targetCount;
        
        // Only remove available slots (not occupied)
        const removedFromType = await ParkingSlot.deleteMany({
          type: vehicleType,
          status: SlotStatus.AVAILABLE,
          $expr: { $lte: [{ $indexOfArray: [await ParkingSlot.find({ type: vehicleType, status: SlotStatus.AVAILABLE }).select('_id'), '$_id'] }, toRemove - 1] }
        });
        
        removedSlots += removedFromType.deletedCount;
        removalSummary[vehicleType] = removedFromType.deletedCount;
      }
    }
    
    res.json({
      success: true,
      data: {
        removedSlots,
        removalSummary
      },
      message: `Removed ${removedSlots} available slots. Occupied slots were preserved.`
    });
  } catch (error) {
    console.error('Error removing excess slots:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove excess slots'
    });
  }
};

// Update parking rates
export const updateParkingRates = async (req, res) => {
  try {
    const { rates } = req.body;
    
    if (!rates || !Array.isArray(rates)) {
      return res.status(400).json({
        success: false,
        error: 'Rates array is required'
      });
    }
    
    // Expire old rates
    await ParkingRate.updateMany(
      { effectiveUntil: { $exists: false } },
      { effectiveUntil: new Date() }
    );
    
    // Create new rates
    const newRates = rates.map(rate => ({
      vehicleType: rate.vehicleType,
      baseRate: rate.baseRate,
      additionalRate: rate.additionalRate || rate.baseRate,
      currency: 'INR',
      effectiveFrom: new Date()
    }));
    
    await ParkingRate.insertMany(newRates);
    
    console.log('✅ Parking rates updated successfully');
    
    res.json({
      success: true,
      data: newRates,
      message: 'Parking rates updated successfully'
    });
  } catch (error) {
    console.error('Error updating parking rates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update parking rates'
    });
  }
};

// Get current parking rates
export const getParkingRates = async (req, res) => {
  try {
    const rates = await ParkingRate.find({
      effectiveFrom: { $lte: new Date() },
      $or: [
        { effectiveUntil: { $exists: false } },
        { effectiveUntil: { $gte: new Date() } }
      ]
    }).sort({ vehicleType: 1 });
    
    res.json({
      success: true,
      data: rates
    });
  } catch (error) {
    console.error('Error getting parking rates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get parking rates'
    });
  }
};
