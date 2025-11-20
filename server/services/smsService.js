import twilio from 'twilio';

// SMS templates
const smsTemplates = {
  vehicleEntry: (data) => {
    return `🅿️ ParkSys: Vehicle ${data.registrationNumber} parked at slot ${data.slotNumber}. Entry: ${new Date(data.entryTime).toLocaleString()}. Rate: ₹${data.rate}/hr. Welcome!`;
  },

  vehicleExit: (data) => {
    const duration = `${Math.floor(data.duration / 60)}h ${data.duration % 60}m`;
    return `🧾 ParkSys: Vehicle ${data.registrationNumber} exited. Duration: ${duration}. Amount: ₹${data.amount}. Payment: ${data.paymentMethod.toUpperCase()}. Receipt: ${data.receiptId}. Thank you!`;
  },

  otpVerification: (data) => {
    return `🔐 ParkSys: Your password reset OTP is ${data.otp}. Valid for 10 minutes. Do not share this OTP with anyone.`;
  },

  highOccupancy: (data) => {
    return `⚠️ ParkSys Alert: Parking facility reached ${data.occupancyRate}% capacity. ${data.occupiedSlots} occupied, ${data.availableSlots} available.`;
  }
};
const createTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  // FULL VALUES - check these exactly
  console.log('🔐 FULL CREDENTIALS:', {
    accountSid: accountSid,
    authToken: authToken,
    fromNumber: fromNumber,
    accountSidLength: accountSid?.length || 0,
    authTokenLength: authToken?.length || 0
  });

  if (!accountSid || !authToken || !fromNumber) {
    console.warn('⚠️ Missing Twilio configuration');
    return null;
  }

  const client = twilio(accountSid, authToken);
  return { client, fromNumber };
};

// Generate OTP for SMS
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTPs temporarily (in production, use Redis or database)
const smsOtpStore = new Map();

// SMS service functions
export const smsService = {
  async sendVehicleEntryNotification(vehicleData, phoneNumber) {
    try {
      if (!phoneNumber) {
        console.log('No phone number provided for vehicle entry SMS');
        return { success: false, message: 'No phone number provided' };
      }

      // Format phone number (ensure it includes country code)
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      if (!formattedPhone) {
        return { success: false, message: 'Invalid phone number format' };
      }

      const message = smsTemplates.vehicleEntry(vehicleData);
      const twilioConfig = createTwilioClient();

      if (!twilioConfig) {
        console.log('📱 SMS service disabled - no valid Twilio phone number');
        return { success: false, message: 'SMS service not configured' };
      }

      const { client, fromNumber } = twilioConfig;

      const result = await client.messages.create({
        body: message,
        from: fromNumber,
        to: formattedPhone
      });
      
      console.log('✅ Vehicle entry SMS sent to:', phoneNumber, 'SID:', result.sid);
      return { success: true, message: 'Entry SMS sent successfully', sid: result.sid };
    } catch (error) {
      console.error('❌ Error sending vehicle entry SMS:', error);
      return { success: false, error: error.message };
    }
  },

  async sendVehicleExitReceipt(exitData, phoneNumber) {
    try {
      if (!phoneNumber) {
        console.log('No phone number provided for exit receipt SMS');
        return { success: false, message: 'No phone number provided' };
      }

      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      if (!formattedPhone) {
        return { success: false, message: 'Invalid phone number format' };
      }

      const message = smsTemplates.vehicleExit(exitData);
      const twilioConfig = createTwilioClient();

      if (!twilioConfig) {
        console.log('📱 SMS service disabled - no valid Twilio phone number');
        return { success: false, message: 'SMS service not configured' };
      }

      const { client, fromNumber } = twilioConfig;

      const result = await client.messages.create({
        body: message,
        from: fromNumber,
        to: formattedPhone
      });
      
      console.log('✅ Vehicle exit SMS sent to:', phoneNumber, 'SID:', result.sid);
      return { success: true, message: 'Exit SMS sent successfully', sid: result.sid };
    } catch (error) {
      console.error('❌ Error sending vehicle exit SMS:', error);
      return { success: false, error: error.message };
    }
  },

  async sendOTPSMS(phoneNumber, userName) {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      if (!formattedPhone) {
        return { success: false, message: 'Invalid phone number format' };
      }

      const otp = generateOTP();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
      
      // Store OTP
      smsOtpStore.set(phoneNumber, { otp, expiresAt });
      
      const message = smsTemplates.otpVerification({ otp, name: userName });
      const twilioConfig = createTwilioClient();
      if (!twilioConfig) {
        return { success: false, message: 'SMS service not configured' };
      }
      const { client, fromNumber } = twilioConfig;
      
      const result = await client.messages.create({
        body: message,
        from: fromNumber,
        to: formattedPhone
      });
      
      console.log('✅ OTP SMS sent to:', phoneNumber, 'SID:', result.sid);
      return { success: true, message: 'OTP SMS sent successfully', sid: result.sid };
    } catch (error) {
      console.error('❌ Error sending OTP SMS:', error);
      return { success: false, error: error.message };
    }
  },

  verifySMSOTP(phoneNumber, otp) {
    const storedData = smsOtpStore.get(phoneNumber);
    
    if (!storedData) {
      return { success: false, error: 'OTP not found or expired' };
    }
    
    if (Date.now() > storedData.expiresAt) {
      smsOtpStore.delete(phoneNumber);
      return { success: false, error: 'OTP has expired' };
    }
    
    if (storedData.otp !== otp) {
      return { success: false, error: 'Invalid OTP' };
    }
    
    smsOtpStore.delete(phoneNumber);
    return { success: true, message: 'OTP verified successfully' };
  },

  async sendHighOccupancyAlert(alertData, adminPhones = []) {
    try {
      if (adminPhones.length === 0) {
        console.log('No admin phone numbers provided for high occupancy alert');
        return { success: false, message: 'No admin phone numbers provided' };
      }

      const message = smsTemplates.highOccupancy(alertData);
      const twilioConfig = createTwilioClient();
      if (!twilioConfig) {
        return { success: false, message: 'SMS service not configured' };
      }
      const { client, fromNumber } = twilioConfig;
      
      const results = [];
      for (const phone of adminPhones) {
        try {
          const formattedPhone = this.formatPhoneNumber(phone);
          if (formattedPhone) {
            const result = await client.messages.create({
              body: message,
              from: fromNumber,
              to: formattedPhone
            });
            results.push({ phone, success: true, sid: result.sid });
          } else {
            results.push({ phone, success: false, error: 'Invalid phone number format' });
          }
        } catch (error) {
          results.push({ phone, success: false, error: error.message });
        }
      }
      
      console.log('✅ High occupancy alert SMS sent to admins:', results);
      return { success: true, message: 'Alert SMS sent to admins', results };
    } catch (error) {
      console.error('❌ Error sending high occupancy alert SMS:', error);
      return { success: false, error: error.message };
    }
  },

  formatPhoneNumber(phone) {
    if (!phone) return null;
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // If it's an Indian number (10 digits), add +91
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }
    
    // If it already has country code (starts with +)
    if (phone.startsWith('+')) {
      return phone;
    }
    
    // If it has 12 digits (91 prefix), add +
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+${cleaned}`;
    }
    
    // For international numbers, assume they're already formatted
    if (cleaned.length > 10) {
      return `+${cleaned}`;
    }
    
    console.warn('Unable to format phone number:', phone);
    return null;
  },

  async testSMSConfiguration(testPhone = '+917812858137') {
    try {
      const formattedPhone = this.formatPhoneNumber(testPhone);
      if (!formattedPhone) {
        return { success: false, message: 'Invalid phone number format' };
      }

      const twilioConfig = createTwilioClient();

      if (!twilioConfig) {
        return {
          success: false,
          message: 'SMS service not configured - set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER'
        };
      }

      const { client, fromNumber } = twilioConfig;

      const result = await client.messages.create({
        body: '🧪 ParkSys: SMS configuration test successful! Your Twilio integration is working correctly.',
        from: fromNumber,
        to: formattedPhone
      });

      console.log('✅ Test SMS sent successfully to:', formattedPhone, 'SID:', result.sid);
      return { success: true, message: 'SMS configuration is working correctly', sid: result.sid };
    } catch (error) {
      console.error('❌ SMS configuration test failed:', error);
      return { success: false, error: error.message };
    }
  }
};
