import { smsService } from '../services/smsService.js';

export const testSMSConfiguration = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required for testing'
      });
    }
    
    const result = await smsService.testSMSConfiguration(phoneNumber);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: { sid: result.sid }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('SMS test error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test SMS configuration'
    });
  }
};

export const sendSMSOTP = async (req, res) => {
  try {
    const { phoneNumber, userName } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }
    
    const result = await smsService.sendOTPSMS(phoneNumber, userName);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: { sid: result.sid }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('SMS OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send SMS OTP'
    });
  }
};

export const verifySMSOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    
    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and OTP are required'
      });
    }
    
    const result = smsService.verifySMSOTP(phoneNumber, otp);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('SMS OTP verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify SMS OTP'
    });
  }
};

export const sendHighOccupancyAlert = async (req, res) => {
  try {
    const { alertData, adminPhones } = req.body;
    
    if (!alertData) {
      return res.status(400).json({
        success: false,
        error: 'Alert data is required'
      });
    }
    
    const result = await smsService.sendHighOccupancyAlert(alertData, adminPhones);
    
    res.json({
      success: result.success,
      message: result.message,
      data: result.results
    });
  } catch (error) {
    console.error('High occupancy alert SMS error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send high occupancy alert SMS'
    });
  }
};
