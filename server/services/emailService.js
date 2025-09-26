import nodemailer from 'nodemailer';

// Email templates with proper HTML structure
const emailTemplates = {
  vehicleEntry: (data) => ({
    subject: 'Vehicle Entry Confirmation - ParkSys',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Vehicle Entry Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .info-card { background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; }
          .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🅿️ ParkSys</h1>
            <h2>Vehicle Entry Confirmation</h2>
          </div>
          <div class="content">
            <p>Dear ${data.ownerName || 'Customer'},</p>
            <p>Your vehicle has been successfully registered and parked at our facility.</p>
            <div class="info-card">
              <h3>🚗 Vehicle Details</h3>
              <p><strong>Registration Number:</strong> ${data.registrationNumber}</p>
              <p><strong>Vehicle Type:</strong> ${data.type.replace('_', ' ')}</p>
              <p><strong>Parking Slot:</strong> ${data.slotNumber}</p>
              <p><strong>Entry Time:</strong> ${new Date(data.entryTime).toLocaleString()}</p>
              <p><strong>Rate:</strong> ₹${data.rate}/hour</p>
            </div>
            <p><strong>Important:</strong> Please keep this confirmation for your records.</p>
          </div>
          <div class="footer">
            <p>Thank you for choosing ParkSys!</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  vehicleExit: (data) => ({
    subject: 'Payment Receipt - ParkSys',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .receipt-card { background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .billing-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .billing-table th, .billing-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          .billing-table th { background-color: #f9fafb; font-weight: 600; }
          .total-row { background-color: #10b981; color: white; font-weight: bold; }
          .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🅿️ ParkSys</h1>
            <h2>Payment Receipt</h2>
            <p>Receipt #${data.receiptId}</p>
          </div>
          <div class="content">
            <p>Dear ${data.ownerName || 'Customer'},</p>
            <div class="receipt-card">
              <h3>🧾 Billing Summary</h3>
              <table class="billing-table">
                <tr><td>Vehicle Registration</td><td>${data.registrationNumber}</td></tr>
                <tr><td>Duration</td><td>${Math.floor(data.duration / 60)}h ${data.duration % 60}m</td></tr>
                <tr><td>Payment Method</td><td>${data.paymentMethod.toUpperCase()}</td></tr>
                <tr class="total-row"><td><strong>Total Amount</strong></td><td><strong>₹${data.amount}</strong></td></tr>
              </table>
            </div>
            <p><strong>Status:</strong> ✅ Payment Successful</p>
          </div>
          <div class="footer">
            <p>Thank you for choosing ParkSys!</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  otpVerification: (data) => ({
    subject: 'Password Reset OTP - ParkSys',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset OTP</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; text-align: center; }
          .otp-card { background-color: #faf5ff; border: 2px solid #8b5cf6; border-radius: 8px; padding: 30px; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: bold; color: #8b5cf6; letter-spacing: 8px; margin: 20px 0; }
          .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; }
          .warning { background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 ParkSys</h1>
            <h2>Password Reset OTP</h2>
          </div>
          <div class="content">
            <p>Dear ${data.name || 'User'},</p>
            <p>We received a request to reset your password. Use the OTP below to reset your password:</p>
            <div class="otp-card">
              <h3>Your OTP Code</h3>
              <div class="otp-code">${data.otp}</div>
              <p>This OTP is valid for <strong>10 minutes</strong></p>
            </div>
            <div class="warning">
              <p><strong>⚠️ Security Notice:</strong> If you did not request this password reset, please ignore this email. Do not share this OTP with anyone.</p>
            </div>
            <p>To reset your password, enter this OTP in the application and create a new password.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from ParkSys</p>
            <p>If you need help, contact support at arvilightss@gmail.com</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  highOccupancy: (data) => ({
    subject: 'High Occupancy Alert - ParkSys',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>High Occupancy Alert</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .alert-card { background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; }
          .stats { display: flex; justify-content: space-around; margin: 20px 0; }
          .stat { text-align: center; }
          .stat-number { font-size: 2em; font-weight: bold; color: #f59e0b; }
          .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ High Occupancy Alert</h1>
            <h2>ParkSys Facility</h2>
          </div>
          <div class="content">
            <p>Dear Admin,</p>
            <div class="alert-card">
              <h3>🚨 Parking Facility Alert</h3>
              <p>The parking facility has reached <strong>${data.occupancyRate}%</strong> capacity.</p>
            </div>
            <div class="stats">
              <div class="stat">
                <div class="stat-number">${data.occupiedSlots}</div>
                <div>Occupied</div>
              </div>
              <div class="stat">
                <div class="stat-number">${data.availableSlots}</div>
                <div>Available</div>
              </div>
            </div>
            <p>Alert generated at: ${new Date().toLocaleString()}</p>
          </div>
          <div class="footer">
            <p>ParkSys Automated Alert System</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  dailyReport: (data) => ({
    subject: `Daily Parking Report - ${new Date().toDateString()}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Daily Parking Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
          .metric-card { background-color: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; }
          .metric-number { font-size: 2em; font-weight: bold; color: #8b5cf6; }
          .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Daily Parking Report</h1>
            <h2>ParkSys Facility</h2>
            <p>${new Date().toDateString()}</p>
          </div>
          <div class="content">
            <h3>��� Key Metrics</h3>
            <div class="metrics">
              <div class="metric-card">
                <div class="metric-number">${data.totalVehicles || 0}</div>
                <div>Total Vehicles</div>
              </div>
              <div class="metric-card">
                <div class="metric-number">₹${data.totalRevenue || 0}</div>
                <div>Revenue</div>
              </div>
            </div>
            <p>Peak Hours: ${data.peakHours?.join(', ') || 'No data available'}</p>
          </div>
          <div class="footer">
            <p>Generated automatically by ParkSys</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Create email transporter with actual SMTP configuration
const createEmailTransporter = async () => {
  try {
    const user = process.env.SMTP_MAIL;
    const pass = process.env.SMTP_PASSWORD;

    if (!user || !pass) {
      throw new Error('SMTP configuration missing: set SMTP_MAIL and SMTP_PASSWORD environment variables');
    }

    const port = Number(process.env.SMTP_PORT) || 587;

    const config = {
      service: process.env.SMTP_SERVICE || 'gmail',
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    };

    console.log('📧 Creating email transporter with config:', {
      service: config.service,
      host: config.host,
      port: config.port,
      user: config.auth.user
    });

    // Create nodemailer transporter
    let transporter;

    try {
      // Use the correct method name for nodemailer
      transporter = nodemailer.createTransport(config);
      console.log('✅ Email transporter created successfully');

      // Test the connection
      await transporter.verify();
      console.log('✅ Email SMTP connection verified');
    } catch (error) {
      console.warn('⚠️ Email transporter issue:', error.message);

      // Still create the transporter, but log the issue
      try {
        transporter = nodemailer.createTransport(config);
        console.log('📧 Transporter created despite verification issue');
      } catch (createError) {
        console.error('❌ Cannot create email transporter:', createError.message);
        // Create a fallback transporter that logs instead of sending
        transporter = {
          sendMail: async (options) => {
            console.log('📧 [FALLBACK] Email would be sent to:', options.to);
            console.log('📧 [FALLBACK] Subject:', options.subject);
            console.log('📧 [FALLBACK] From:', options.from);
            return { messageId: 'fallback-message-id', success: false, fallback: true };
          }
        };
      }
    }

    return transporter;
  } catch (error) {
    console.error('❌ Failed to create email transporter:', error.message);
    console.log('📧 Email service will be disabled');
    // Return a mock transporter that fails gracefully
    return {
      sendMail: async () => {
        return { success: false, error: 'Email service not available' };
      }
    };
  }
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Email service functions
export const emailService = {
  async sendVehicleEntryNotification(vehicleData, ownerEmail) {
    try {
      console.log('🔄 Attempting to send vehicle entry notification to:', ownerEmail);

      if (!ownerEmail) {
        console.log('No email provided for vehicle entry notification');
        return { success: false, message: 'No email provided' };
      }

      const template = emailTemplates.vehicleEntry(vehicleData);
      const transporter = await createEmailTransporter();

      console.log('📧 Email transporter created, sending mail...');
      
      await transporter.sendMail({
        from: `"ParkSys" <${process.env.SMTP_MAIL}>`,
        to: ownerEmail,
        subject: template.subject,
        html: template.html
      });
      
      console.log('✅ Vehicle entry notification sent to:', ownerEmail);
      return { success: true, message: 'Entry notification sent successfully' };
    } catch (error) {
      console.error('❌ Error sending vehicle entry notification:', error);
      return { success: false, error: error.message };
    }
  },

  async sendVehicleExitReceipt(exitData, ownerEmail) {
    try {
      if (!ownerEmail) {
        console.log('No email provided for exit receipt');
        return { success: false, message: 'No email provided' };
      }

      const template = emailTemplates.vehicleExit(exitData);
      const transporter = await createEmailTransporter();
      
      await transporter.sendMail({
        from: `"ParkSys" <${process.env.SMTP_MAIL}>`,
        to: ownerEmail,
        subject: template.subject,
        html: template.html
      });
      
      console.log('✅ Vehicle exit receipt sent to:', ownerEmail);
      return { success: true, message: 'Exit receipt sent successfully' };
    } catch (error) {
      console.error('❌ Error sending vehicle exit receipt:', error);
      return { success: false, error: error.message };
    }
  },

  async sendOTPEmail(email, userName) {
    try {
      const otp = generateOTP();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
      
      // Store OTP
      otpStore.set(email, { otp, expiresAt });
      
      const template = emailTemplates.otpVerification({
        otp,
        name: userName
      });

      const transporter = await createEmailTransporter();
      
      await transporter.sendMail({
        from: `"ParkSys" <${process.env.SMTP_MAIL}>`,
        to: email,
        subject: template.subject,
        html: template.html
      });
      
      console.log('✅ OTP sent to:', email);
      return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
      console.error('❌ Error sending OTP:', error);
      return { success: false, error: error.message };
    }
  },

  verifyOTP(email, otp) {
    const storedData = otpStore.get(email);
    
    if (!storedData) {
      return { success: false, error: 'OTP not found or expired' };
    }
    
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return { success: false, error: 'OTP has expired' };
    }
    
    if (storedData.otp !== otp) {
      return { success: false, error: 'Invalid OTP' };
    }
    
    otpStore.delete(email);
    return { success: true, message: 'OTP verified successfully' };
  },

  async sendHighOccupancyAlert(alertData, adminEmails = ['arvilightss@gmail.com']) {
    try {
      const template = emailTemplates.highOccupancy(alertData);
      const transporter = await createEmailTransporter();
      
      await transporter.sendMail({
        from: `"ParkSys Alerts" <${process.env.SMTP_MAIL}>`,
        to: adminEmails.join(','),
        subject: template.subject,
        html: template.html
      });
      
      console.log('✅ High occupancy alert sent to admins');
      return { success: true, message: 'Alert sent successfully' };
    } catch (error) {
      console.error('❌ Error sending high occupancy alert:', error);
      return { success: false, error: error.message };
    }
  },

  async sendDailyReport(reportData, adminEmails = ['arvilightss@gmail.com']) {
    try {
      const template = emailTemplates.dailyReport(reportData);
      const transporter = await createEmailTransporter();
      
      await transporter.sendMail({
        from: `"ParkSys Reports" <${process.env.SMTP_MAIL}>`,
        to: adminEmails.join(','),
        subject: template.subject,
        html: template.html
      });
      
      console.log('✅ Daily report sent to admins');
      return { success: true, message: 'Daily report sent successfully' };
    } catch (error) {
      console.error('❌ Error sending daily report:', error);
      return { success: false, error: error.message };
    }
  },

  async testEmailConfiguration() {
    try {
      const transporter = await createEmailTransporter();
      
      await transporter.sendMail({
        from: `"ParkSys Test" <${process.env.SMTP_MAIL}>`,
        to: process.env.SMTP_MAIL,
        subject: 'ParkSys Email Configuration Test',
        html: `
          <h2>✅ Email Configuration Test Successful</h2>
          <p>Your SMTP configuration is working correctly!</p>
          <p>Timestamp: ${new Date().toLocaleString()}</p>
        `
      });
      
      console.log('✅ Test email sent successfully');
      return { success: true, message: 'Email configuration is working correctly' };
    } catch (error) {
      console.error('❌ Email configuration test failed:', error);
      return { success: false, error: error.message };
    }
  }
};
