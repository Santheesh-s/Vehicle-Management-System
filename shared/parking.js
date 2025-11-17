/**
 * @typedef {Object} Vehicle
 * @property {string} id
 * @property {string} registrationNumber
 * @property {string} type
 * @property {string} [ownerName]
 * @property {string} [phoneNumber]
 * @property {Date} entryTime
 * @property {Date} [exitTime]
 * @property {string} [slotId]
 * @property {string} status
 */

/**
 * @typedef {Object} ParkingSlot
 * @property {string} id
 * @property {string} number
 * @property {string} type
 * @property {string} status
 * @property {Object} position
 * @property {number} position.x
 * @property {number} position.y
 * @property {string} [vehicleId]
 * @property {Date} [reservedUntil]
 */

/**
 * @typedef {Object} ParkingRecord
 * @property {string} id
 * @property {string} vehicleId
 * @property {string} slotId
 * @property {Date} entryTime
 * @property {Date} [exitTime]
 * @property {number} [duration]
 * @property {number} amount
 * @property {string} paymentStatus
 * @property {string} [paymentMethod]
 * @property {string} [receiptId]
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} username
 * @property {string} email
 * @property {string} role
 * @property {string} name
 * @property {Date} createdAt
 * @property {Date} [lastLogin]
 * @property {boolean} isActive
 */

/**
 * @typedef {Object} DashboardStats
 * @property {number} totalSlots
 * @property {number} occupiedSlots
 * @property {number} availableSlots
 * @property {number} reservedSlots
 * @property {number} todayRevenue
 * @property {number} todayVehicles
 * @property {number} averageStayDuration
 * @property {string[]} peakHours
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {*} [data]
 * @property {string} [message]
 * @property {string} [error]
 */

// Constants for vehicle types
export const VehicleType = {
  TWO_WHEELER: 'two_wheeler',
  FOUR_WHEELER: 'four_wheeler',
  TRUCK: 'truck',
  BUS: 'bus'
};

export const VehicleStatus = {
  PARKED: 'parked',
  EXITED: 'exited',
  RESERVED: 'reserved'
};

export const SlotStatus = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
  MAINTENANCE: 'maintenance'
};

export const UserRole = {
  ADMIN: 'admin',
  STAFF: 'staff',
  CUSTOMER: 'customer'
};

export const PaymentStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

export const PaymentMethod = {
  CASH: 'cash',
  CARD: 'card',
  UPI: 'upi',
  WALLET: 'wallet'
};
