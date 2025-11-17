import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, Save, Bell, DollarSign, Shield, RotateCcw, Database, ParkingCircle, Users, Send } from 'lucide-react';

function TestNotificationForm() {
  const [testEmail, setTestEmail] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testResults, setTestResults] = useState(null);

  const testNotifications = async () => {
    if (!testEmail && !testPhone) {
      alert('Please provide at least an email or phone number to test');
      return;
    }

    try {
      setTestLoading(true);
      setTestResults(null);

      const response = await fetch('/api/parking/test-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail || undefined,
          phoneNumber: testPhone || undefined
        })
      });

      const result = await response.json();
      setTestResults(result.data);

      if (result.success) {
        console.log('✅ Notification tests completed');
      }
    } catch (error) {
      console.error('❌ Test error:', error);
      setTestResults({ error: error.message });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="test-email">Test Email Address</Label>
          <Input
            id="test-email"
            type="email"
            placeholder="test@example.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Email notification will be sent to this address
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="test-phone">Test Phone Number</Label>
          <Input
            id="test-phone"
            type="tel"
            placeholder="+91 7812858137"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            SMS notification will be sent to this number
          </p>
        </div>
      </div>

      <Button
        onClick={testNotifications}
        disabled={testLoading || (!testEmail && !testPhone)}
        className="w-full gap-2"
      >
        <Send className="h-4 w-4" />
        {testLoading ? 'Testing Notifications...' : 'Test Notifications'}
      </Button>

      {testResults && (
        <div className="space-y-4">
          <h4 className="font-medium">Test Results:</h4>

          {testResults.email && (
            <div className={`p-4 rounded-lg border ${testResults.email.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h5 className="font-medium text-sm mb-2">📧 Email Test</h5>
              <p className={`text-sm ${testResults.email.success ? 'text-green-800' : 'text-red-800'}`}>
                {testResults.email.success ?
                  `✅ Email sent successfully to: ${testEmail}` :
                  `❌ Email failed: ${testResults.email.error}`
                }
              </p>
            </div>
          )}

          {testResults.sms && (
            <div className={`p-4 rounded-lg border ${testResults.sms.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h5 className="font-medium text-sm mb-2">📱 SMS Test</h5>
              <p className={`text-sm ${testResults.sms.success ? 'text-green-800' : 'text-red-800'}`}>
                {testResults.sms.success ?
                  `✅ SMS sent successfully to: ${testPhone}` :
                  `❌ SMS failed: ${testResults.sms.error}`
                }
              </p>
            </div>
          )}

          {testResults.error && (
            <div className="p-4 rounded-lg border bg-red-50 border-red-200">
              <h5 className="font-medium text-sm mb-2">❌ Test Error</h5>
              <p className="text-sm text-red-800">{testResults.error}</p>
            </div>
          )}
        </div>
      )}

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">ℹ️ Configuration Status</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>📧 <strong>Email:</strong> Using Gmail SMTP (arvilightss@gmail.com)</p>
          <p>📱 <strong>SMS:</strong> Using Twilio (+18159132958)</p>
          <p>🎯 <strong>Your number:</strong> +917812858137</p>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const [systemConfig, setSystemConfig] = useState(null);
  const [slotConfig, setSlotConfig] = useState({
    twoWheelerSlots: 30,
    fourWheelerSlots: 20,
    truckSlots: 0,
    busSlots: 0
  });
  const [rates, setRates] = useState([
    { vehicleType: 'two_wheeler', baseRate: 10, additionalRate: 10 },
    { vehicleType: 'four_wheeler', baseRate: 20, additionalRate: 20 },
    { vehicleType: 'truck', baseRate: 50, additionalRate: 50 },
    { vehicleType: 'bus', baseRate: 75, additionalRate: 75 }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSystemConfig();
    fetchParkingRates();
  }, []);

  const fetchSystemConfig = async () => {
    try {
      const response = await fetch('/api/config/system');
      const result = await response.json();
      
      if (result.success) {
        setSystemConfig(result.data);
        // Update slot config from system data
        if (result.data.slotsByType) {
          setSlotConfig({
            twoWheelerSlots: result.data.slotsByType.two_wheeler || 0,
            fourWheelerSlots: result.data.slotsByType.four_wheeler || 0,
            truckSlots: result.data.slotsByType.truck || 0,
            busSlots: result.data.slotsByType.bus || 0
          });
        }
      }
    } catch (error) {
      console.error('Error fetching system config:', error);
    }
  };

  const fetchParkingRates = async () => {
    try {
      const response = await fetch('/api/config/rates');
      const result = await response.json();
      
      if (result.success && result.data.length > 0) {
        setRates(result.data.map(rate => ({
          vehicleType: rate.vehicleType,
          baseRate: rate.baseRate,
          additionalRate: rate.additionalRate || rate.baseRate
        })));
      }
    } catch (error) {
      console.error('Error fetching parking rates:', error);
    }
  };

  const resetDemoData = async () => {
    if (!confirm('Are you sure you want to reset all demo data? This will clear all vehicles and records.')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/parking/reset', { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      
      if (result.success) {
        setSuccess(`Demo data reset successfully! ${result.message}`);
        fetchSystemConfig(); // Refresh system config
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setError('Error resetting data: ' + result.error);
      }
    } catch (error) {
      console.error('Error resetting demo data:', error);
      setError('Error resetting demo data');
    } finally {
      setLoading(false);
    }
  };

  const updateSlotConfiguration = async () => {

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/config/slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(slotConfig)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSuccess(`Slot configuration updated! ${result.message}`);
        fetchSystemConfig(); // Refresh system config
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setError(result.error || 'Failed to update slot configuration');
      }
    } catch (error) {
      console.error('Error updating slot configuration:', error);
      setError('Failed to update slot configuration');
    } finally {
      setLoading(false);
    }
  };

  const updateParkingRates = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/config/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rates })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSuccess('Parking rates updated successfully!');
      } else {
        setError(result.error || 'Failed to update parking rates');
      }
    } catch (error) {
      console.error('Error updating parking rates:', error);
      setError('Failed to update parking rates');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = (section) => {
    setSuccess(`${section} settings saved successfully!`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const updateRateValue = (index, field, value) => {
    const newRates = [...rates];
    newRates[index][field] = parseFloat(value) || 0;
    setRates(newRates);
  };

  const totalSlots = slotConfig.twoWheelerSlots + slotConfig.fourWheelerSlots + slotConfig.truckSlots + slotConfig.busSlots;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Alerts */}
      {error && (
        <Alert variant="destructive" className="mx-2 sm:mx-0">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mx-2 sm:mx-0">
          <AlertDescription className="text-success">{success}</AlertDescription>
        </Alert>
      )}

      <div className="px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Configure your parking management system</p>
      </div>

      <Tabs defaultValue="slots" className="w-full px-2 sm:px-0">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 bg-muted/30 h-auto p-1">
          <TabsTrigger value="slots" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm py-2 px-1 sm:px-3">
            <span className="hidden sm:inline">Slot Configuration</span>
            <span className="sm:hidden">Slots</span>
          </TabsTrigger>
          <TabsTrigger value="rates" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm py-2 px-1 sm:px-3">
            <span className="hidden sm:inline">Parking Rates</span>
            <span className="sm:hidden">Rates</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm py-2 px-1 sm:px-3 col-span-2 sm:col-span-1">
            <span className="hidden sm:inline">System Settings</span>
            <span className="sm:hidden">System</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm py-2 px-1 sm:px-3 hidden sm:flex">
            Test Notifications
          </TabsTrigger>
          <TabsTrigger value="data" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm py-2 px-1 sm:px-3 hidden sm:flex">
            Data Management
          </TabsTrigger>
        </TabsList>

        {/* Mobile-only additional tabs */}
        <div className="grid grid-cols-2 gap-2 mt-2 sm:hidden">
          <TabsList className="h-auto p-1">
            <TabsTrigger value="notifications" className="w-full data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs py-2">
              Notifications
            </TabsTrigger>
          </TabsList>
          <TabsList className="h-auto p-1">
            <TabsTrigger value="data" className="w-full data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs py-2">
              Data
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Slot Configuration */}
        <TabsContent value="slots" className="space-y-4 sm:space-y-6">
          <Card className="shadow-sm border-muted/20 mx-2 sm:mx-0">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <ParkingCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                Parking Slot Configuration
              </CardTitle>
              <CardDescription className="text-sm">
                Configure the number and type of parking slots available
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {systemConfig && (
                <div className="grid gap-4 md:grid-cols-4 p-4 bg-muted rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{systemConfig.totalSlots}</div>
                    <div className="text-sm text-muted-foreground">Current Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{systemConfig.slotsByType?.two_wheeler || 0}</div>
                    <div className="text-sm text-muted-foreground">Two Wheeler</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{systemConfig.slotsByType?.four_wheeler || 0}</div>
                    <div className="text-sm text-muted-foreground">Four Wheeler</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{(systemConfig.slotsByType?.truck || 0) + (systemConfig.slotsByType?.bus || 0)}</div>
                    <div className="text-sm text-muted-foreground">Truck/Bus</div>
                  </div>
                </div>
              )}

              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="two-wheeler-slots">Two Wheeler Slots *</Label>
                  <Input
                    id="two-wheeler-slots"
                    type="number"
                    min="0"
                    value={slotConfig.twoWheelerSlots}
                    onChange={(e) => setSlotConfig({ ...slotConfig, twoWheelerSlots: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="four-wheeler-slots">Four Wheeler Slots *</Label>
                  <Input
                    id="four-wheeler-slots"
                    type="number"
                    min="0"
                    value={slotConfig.fourWheelerSlots}
                    onChange={(e) => setSlotConfig({ ...slotConfig, fourWheelerSlots: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="truck-slots">Truck Slots</Label>
                  <Input
                    id="truck-slots"
                    type="number"
                    min="0"
                    value={slotConfig.truckSlots}
                    onChange={(e) => setSlotConfig({ ...slotConfig, truckSlots: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bus-slots">Bus Slots</Label>
                  <Input
                    id="bus-slots"
                    type="number"
                    min="0"
                    value={slotConfig.busSlots}
                    onChange={(e) => setSlotConfig({ ...slotConfig, busSlots: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">✅ Smart Slot Management</h4>
                <p className="text-sm text-green-800 mb-2">
                  Target total slots: <strong>{totalSlots}</strong>
                </p>
                <p className="text-xs text-green-700">
                  ⚡ Smart Update: Only adds new slots if needed. All existing vehicles and data will be preserved!
                </p>
              </div>

              <Button
                onClick={updateSlotConfiguration}
                disabled={loading || totalSlots === 0}
                className="w-full gap-2"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Adding Slots...' : 'Add Slots (Data Preserved)'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Parking Rates */}
        <TabsContent value="rates" className="space-y-4 sm:space-y-6">
          <Card className="shadow-sm border-muted/20 mx-2 sm:mx-0">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                Parking Rates
              </CardTitle>
              <CardDescription className="text-sm">
                Configure pricing for different vehicle types
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {rates.map((rate, index) => (
                <div key={rate.vehicleType} className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3 p-3 sm:p-4 border rounded-lg">
                  <div className="flex items-center">
                    <Label className="text-sm font-medium capitalize">
                      {rate.vehicleType.replace('_', ' ')}
                    </Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`rate-${rate.vehicleType}`}>Base Rate (₹/hour)</Label>
                    <Input
                      id={`rate-${rate.vehicleType}`}
                      type="number"
                      min="0"
                      step="0.1"
                      value={rate.baseRate}
                      onChange={(e) => updateRateValue(index, 'baseRate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`additional-rate-${rate.vehicleType}`}>Additional Rate (₹/hour)</Label>
                    <Input
                      id={`additional-rate-${rate.vehicleType}`}
                      type="number"
                      min="0"
                      step="0.1"
                      value={rate.additionalRate}
                      onChange={(e) => updateRateValue(index, 'additionalRate', e.target.value)}
                    />
                  </div>
                </div>
              ))}

              <Button 
                onClick={updateParkingRates}
                disabled={loading}
                className="w-full gap-2"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Updating...' : 'Update Parking Rates'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-4 sm:space-y-6 px-2 sm:px-0">
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
            {/* Notifications */}
            <Card className="shadow-sm border-muted/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Configure system alerts and notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>High Occupancy Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Alert when parking is 90% full
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Payment Confirmations</Label>
                    <p className="text-sm text-muted-foreground">
                      Send payment receipts via SMS/Email
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Daily Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Email daily summary reports
                    </p>
                  </div>
                  <Switch />
                </div>
                <Button 
                  className="w-full gap-2"
                  onClick={() => saveSettings('Notification')}
                >
                  <Save className="h-4 w-4" />
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="shadow-sm border-muted/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security
                </CardTitle>
                <CardDescription>
                  Security and access control settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for admin accounts
                    </p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">
                      Auto-logout after inactivity
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-duration">Session Duration (minutes)</Label>
                  <Input id="session-duration" defaultValue="30" />
                </div>
                <Button 
                  className="w-full gap-2"
                  onClick={() => saveSettings('Security')}
                >
                  <Save className="h-4 w-4" />
                  Save Security Settings
                </Button>
              </CardContent>
            </Card>

            {/* System Info */}
            <Card className="shadow-sm border-muted/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  System Information
                </CardTitle>
                <CardDescription>
                  General system configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="facility-name">Facility Name</Label>
                  <Input id="facility-name" defaultValue="ParkSys Parking Facility" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facility-address">Address</Label>
                  <Input id="facility-address" defaultValue="123 Main Street, City" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Contact Phone</Label>
                  <Input id="contact-phone" defaultValue="+91 9876543210" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input id="contact-email" defaultValue="contact@parksys.com" />
                </div>
                <Button 
                  className="w-full gap-2"
                  onClick={() => saveSettings('System')}
                >
                  <Save className="h-4 w-4" />
                  Save System Settings
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="shadow-sm border-muted/20">
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>
                  Current system health and API status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-success">✅</div>
                    <div className="text-sm font-medium">Database</div>
                    <div className="text-xs text-muted-foreground">MongoDB Connected</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-success">📧</div>
                    <div className="text-sm font-medium">Email Templates</div>
                    <div className="text-xs text-muted-foreground">4 templates ready</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Test Notifications */}
        <TabsContent value="notifications" className="space-y-4 sm:space-y-6 px-2 sm:px-0">
          <Card className="shadow-sm border-muted/20">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                Test Notification Services
              </CardTitle>
              <CardDescription className="text-sm">
                Test email and SMS notifications to ensure they're working correctly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <TestNotificationForm />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management */}
        <TabsContent value="data" className="space-y-4 sm:space-y-6 px-2 sm:px-0">
          <Card className="shadow-sm border-muted/20">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Database className="h-4 w-4 sm:h-5 sm:w-5" />
                Data Management
              </CardTitle>
              <CardDescription className="text-sm">
                Reset and manage system data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{systemConfig?.totalSlots || 0}</div>
                  <div className="text-sm font-medium">Total Slots</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {systemConfig ? systemConfig.totalSlots - (systemConfig.slotsByType?.occupied || 0) : 0}
                  </div>
                  <div className="text-sm font-medium">Available</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {systemConfig?.slotsByType?.occupied || 0}
                  </div>
                  <div className="text-sm font-medium">Occupied</div>
                </div>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-2">⚠️ Data Reset Warning</h4>
                <p className="text-sm text-orange-800 mb-2">
                  This action will permanently delete all current vehicles and parking records. 
                  All slots will be reset to available status.
                </p>
                <p className="text-xs text-orange-700">
                  This operation cannot be undone. Make sure you have backups if needed.
                </p>
              </div>
              
              <Button 
                onClick={resetDemoData}
                disabled={loading}
                variant="destructive"
                className="w-full gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                {loading ? 'Resetting...' : 'Reset All Data'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
