import { RequestHandler } from "express";
import { 
  Vehicle, 
  ParkingSlot, 
  ParkingRecord, 
  VehicleType, 
  VehicleStatus, 
  SlotStatus, 
  PaymentStatus,
  ApiResponse,
  VehicleEntryRequest,
  VehicleExitRequest,
  DashboardStats
} from "@shared/parking";

// Mock data for demo purposes - in production this would connect to MongoDB
let vehicles: Vehicle[] = [];
let parkingSlots: ParkingSlot[] = [];
let parkingRecords: ParkingRecord[] = [];

// Initialize demo data
const initializeDemoData = () => {
  // Create parking slots
  for (let i = 1; i <= 50; i++) {
    const slot: ParkingSlot = {
      id: `slot-${i}`,
      number: `A${i.toString().padStart(2, '0')}`,
      type: i <= 30 ? VehicleType.TWO_WHEELER : VehicleType.FOUR_WHEELER,
      status: Math.random() > 0.7 ? SlotStatus.OCCUPIED : SlotStatus.AVAILABLE,
      position: {
        x: ((i - 1) % 10) * 100,
        y: Math.floor((i - 1) / 10) * 80
      }
    };
    
    if (slot.status === SlotStatus.OCCUPIED) {
      const vehicle: Vehicle = {
        id: `vehicle-${i}`,
        registrationNumber: `KA01${Math.random().toString().slice(2, 6)}`,
        type: slot.type,
        ownerName: `Owner ${i}`,
        phoneNumber: `9${Math.random().toString().slice(2, 11)}`,
        entryTime: new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000),
        slotId: slot.id,
        status: VehicleStatus.PARKED
      };
      vehicles.push(vehicle);
      slot.vehicleId = vehicle.id;
    }
    
    parkingSlots.push(slot);
  }
};

// Initialize demo data on module load
initializeDemoData();

export const getParkingSlots: RequestHandler = (req, res) => {
  const response: ApiResponse<ParkingSlot[]> = {
    success: true,
    data: parkingSlots
  };
  res.json(response);
};

export const getDashboardStats: RequestHandler = (req, res) => {
  const occupiedSlots = parkingSlots.filter(slot => slot.status === SlotStatus.OCCUPIED).length;
  const availableSlots = parkingSlots.filter(slot => slot.status === SlotStatus.AVAILABLE).length;
  const reservedSlots = parkingSlots.filter(slot => slot.status === SlotStatus.RESERVED).length;
  
  const todayRecords = parkingRecords.filter(record => 
    new Date(record.entryTime).toDateString() === new Date().toDateString()
  );
  
  const stats: DashboardStats = {
    totalSlots: parkingSlots.length,
    occupiedSlots,
    availableSlots,
    reservedSlots,
    todayRevenue: todayRecords.reduce((sum, record) => sum + record.amount, 0),
    todayVehicles: todayRecords.length,
    averageStayDuration: 125, // minutes
    peakHours: ['09:00-11:00', '14:00-16:00', '18:00-20:00']
  };
  
  const response: ApiResponse<DashboardStats> = {
    success: true,
    data: stats
  };
  res.json(response);
};

export const getActiveVehicles: RequestHandler = (req, res) => {
  const activeVehicles = vehicles.filter(vehicle => vehicle.status === VehicleStatus.PARKED);
  const response: ApiResponse<Vehicle[]> = {
    success: true,
    data: activeVehicles
  };
  res.json(response);
};

export const enterVehicle: RequestHandler = (req, res) => {
  const vehicleData: VehicleEntryRequest = req.body;
  
  // Find available slot
  const availableSlot = parkingSlots.find(slot => 
    slot.status === SlotStatus.AVAILABLE && slot.type === vehicleData.type
  );
  
  if (!availableSlot) {
    const response: ApiResponse = {
      success: false,
      error: 'No available slots for this vehicle type'
    };
    return res.status(400).json(response);
  }
  
  // Create new vehicle
  const vehicle: Vehicle = {
    id: `vehicle-${Date.now()}`,
    registrationNumber: vehicleData.registrationNumber,
    type: vehicleData.type,
    ownerName: vehicleData.ownerName,
    phoneNumber: vehicleData.phoneNumber,
    entryTime: new Date(),
    slotId: availableSlot.id,
    status: VehicleStatus.PARKED
  };
  
  // Update slot
  availableSlot.status = SlotStatus.OCCUPIED;
  availableSlot.vehicleId = vehicle.id;
  
  // Add to arrays
  vehicles.push(vehicle);
  
  const response: ApiResponse<Vehicle> = {
    success: true,
    data: vehicle,
    message: `Vehicle parked in slot ${availableSlot.number}`
  };
  res.json(response);
};

export const exitVehicle: RequestHandler = (req, res) => {
  const { vehicleId, paymentMethod }: VehicleExitRequest = req.body;
  
  const vehicle = vehicles.find(v => v.id === vehicleId);
  if (!vehicle || vehicle.status !== VehicleStatus.PARKED) {
    const response: ApiResponse = {
      success: false,
      error: 'Vehicle not found or not currently parked'
    };
    return res.status(404).json(response);
  }
  
  const slot = parkingSlots.find(s => s.id === vehicle.slotId);
  if (!slot) {
    const response: ApiResponse = {
      success: false,
      error: 'Parking slot not found'
    };
    return res.status(404).json(response);
  }
  
  // Calculate duration and amount
  const exitTime = new Date();
  const duration = Math.ceil((exitTime.getTime() - vehicle.entryTime.getTime()) / (1000 * 60)); // minutes
  const hours = Math.ceil(duration / 60);
  const baseRate = vehicle.type === VehicleType.TWO_WHEELER ? 10 : 20;
  const amount = hours * baseRate;
  
  // Create parking record
  const record: ParkingRecord = {
    id: `record-${Date.now()}`,
    vehicleId: vehicle.id,
    slotId: slot.id,
    entryTime: vehicle.entryTime,
    exitTime,
    duration,
    amount,
    paymentStatus: PaymentStatus.COMPLETED,
    paymentMethod
  };
  
  // Update vehicle and slot
  vehicle.exitTime = exitTime;
  vehicle.status = VehicleStatus.EXITED;
  slot.status = SlotStatus.AVAILABLE;
  slot.vehicleId = undefined;
  
  parkingRecords.push(record);
  
  const response: ApiResponse<ParkingRecord> = {
    success: true,
    data: record,
    message: `Vehicle exited. Amount: ₹${amount}`
  };
  res.json(response);
};

export const searchVehicle: RequestHandler = (req, res) => {
  const { registrationNumber } = req.query;
  
  if (!registrationNumber) {
    const response: ApiResponse = {
      success: false,
      error: 'Registration number is required'
    };
    return res.status(400).json(response);
  }
  
  const vehicle = vehicles.find(v => 
    v.registrationNumber.toLowerCase().includes((registrationNumber as string).toLowerCase()) &&
    v.status === VehicleStatus.PARKED
  );
  
  if (!vehicle) {
    const response: ApiResponse = {
      success: false,
      error: 'Vehicle not found or not currently parked'
    };
    return res.status(404).json(response);
  }
  
  const slot = parkingSlots.find(s => s.id === vehicle.slotId);
  
  const response: ApiResponse<{ vehicle: Vehicle; slot?: ParkingSlot }> = {
    success: true,
    data: { vehicle, slot }
  };
  res.json(response);
};

export const getParkingRecords: RequestHandler = (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const startIndex = (Number(page) - 1) * Number(limit);
  const endIndex = startIndex + Number(limit);
  
  const sortedRecords = parkingRecords.sort((a, b) => 
    new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime()
  );
  
  const paginatedRecords = sortedRecords.slice(startIndex, endIndex);
  
  const response = {
    success: true,
    data: paginatedRecords,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: parkingRecords.length,
      totalPages: Math.ceil(parkingRecords.length / Number(limit))
    }
  };
  
  res.json(response);
};
