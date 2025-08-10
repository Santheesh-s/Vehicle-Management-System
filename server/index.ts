import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDatabase } from "./config/database.js";
import { handleDemo } from "./routes/demo";
import {
  getParkingSlots,
  getDashboardStats,
  getActiveVehicles,
  getAllVehicles,
  enterVehicle,
  exitVehicle,
  searchVehicle,
  getParkingRecords,
  generateDailyReport,
  resetDemoData,
  testNotifications
} from "./routes/parking.js";
import {
  previewEmailTemplate,
  testEmailTemplate,
  getEmailStats
} from "./routes/email.js";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  getAllUsers,
  updateUser,
  changePassword,
  requestPasswordResetOTP,
  verifyOTPAndResetPassword,
  requestPasswordResetSMSOTP,
  verifySMSOTPAndResetPassword,
  deleteUser,
  authenticateToken,
  requireAdmin,
  testEmailConfig,
  testSMSConfig
} from "./routes/auth.js";
import {
  getSystemConfig,
  updateSlotConfiguration,
  removeExcessSlots,
  updateParkingRates,
  getParkingRates
} from "./routes/config.js";
import {
  debugUsers,
  forceCreateUsers
} from "./routes/debug.js";

export function createServer() {
  const app = express();

  // Connect to MongoDB (with fallback)
  connectDatabase();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Debug routes (temporary)
  app.get("/api/debug/users", debugUsers);
  app.post("/api/debug/create-users", forceCreateUsers);

  // Authentication routes (public)
  app.post("/api/auth/login", loginUser);
  app.post("/api/auth/request-otp", requestPasswordResetOTP);
  app.post("/api/auth/verify-otp", verifyOTPAndResetPassword);
  app.post("/api/auth/request-sms-otp", requestPasswordResetSMSOTP);
  app.post("/api/auth/verify-sms-otp", verifySMSOTPAndResetPassword);
  app.post("/api/auth/test-email", testEmailConfig);
  app.post("/api/auth/test-sms", testSMSConfig);

  // Protected routes (require authentication)
  app.get("/api/auth/me", authenticateToken, getCurrentUser);
  app.post("/api/auth/change-password", authenticateToken, changePassword);

  // Admin only routes
  app.post("/api/auth/register", authenticateToken, requireAdmin, registerUser);
  app.get("/api/auth/users", authenticateToken, requireAdmin, getAllUsers);
  app.put("/api/auth/users/:userId", authenticateToken, requireAdmin, updateUser);
  app.delete("/api/auth/users/:userId", authenticateToken, requireAdmin, deleteUser);

  // Parking API routes (some require authentication)
  app.get("/api/parking/slots", getParkingSlots);
  app.get("/api/parking/stats", getDashboardStats);
  app.get("/api/parking/vehicles", getActiveVehicles);
  app.get("/api/parking/vehicles/all", getAllVehicles);
  app.get("/api/parking/records", getParkingRecords);
  app.get("/api/parking/search", searchVehicle);
  app.post("/api/parking/enter", enterVehicle);
  app.post("/api/parking/exit", exitVehicle);
  app.post("/api/parking/test-notifications", testNotifications);
  app.post("/api/parking/reset", authenticateToken, requireAdmin, resetDemoData);

  // Configuration routes (admin only)
  app.get("/api/config/system", getSystemConfig);
  app.get("/api/config/rates", getParkingRates);
  app.post("/api/config/slots", authenticateToken, requireAdmin, updateSlotConfiguration);
  app.delete("/api/config/slots", authenticateToken, requireAdmin, removeExcessSlots);
  app.post("/api/config/rates", authenticateToken, requireAdmin, updateParkingRates);

  // Reports and admin routes
  app.post("/api/parking/reports/daily", generateDailyReport);

  // Email API routes
  app.post("/api/email/preview", previewEmailTemplate);
  app.post("/api/email/test", testEmailTemplate);
  app.get("/api/email/stats", getEmailStats);

  return app;
}
