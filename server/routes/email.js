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
            <h3>📈 Key Metrics</h3>
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

export const previewEmailTemplate = async (req, res) => {
  try {
    const { templateId, data } = req.body;
    
    if (!templateId || !emailTemplates[templateId]) {
      return res.status(400).json({
        success: false,
        error: 'Invalid template ID'
      });
    }
    
    const template = emailTemplates[templateId](data);
    
    res.json({
      success: true,
      subject: template.subject,
      html: template.html
    });
  } catch (error) {
    console.error('Error generating email preview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate email preview'
    });
  }
};

export const testEmailTemplate = async (req, res) => {
  try {
    const { templateId, data, testEmail } = req.body;
    
    if (!templateId || !data) {
      return res.status(400).json({
        success: false,
        error: 'Template ID and data are required'
      });
    }
    
    if (!emailTemplates[templateId]) {
      return res.status(400).json({
        success: false,
        error: 'Unknown template ID'
      });
    }
    
    const template = emailTemplates[templateId](data);
    
    console.log(`✅ Email template "${templateId}" processed successfully`);
    console.log(`Subject: ${template.subject}`);
    console.log(`Template ready for: ${testEmail || 'test@example.com'}`);
    
    res.json({
      success: true,
      message: 'Email template processed successfully',
      template: {
        subject: template.subject,
        recipient: testEmail || 'test@example.com',
        status: 'Template Ready (SMTP not configured)'
      }
    });
  } catch (error) {
    console.error('Error testing email template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test email template'
    });
  }
};

export const getEmailStats = async (req, res) => {
  try {
    const stats = {
      totalSent: 0,
      templatesActive: 4,
      deliveryRate: 100,
      lastSent: null,
      serviceStatus: 'templates_ready'
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching email stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch email statistics'
    });
  }
};
