import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, Save, Bell, DollarSign, Shield } from 'lucide-react';

export default function Settings() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Configure your parking management system</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Parking Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Parking Rates
            </CardTitle>
            <CardDescription>
              Configure pricing for different vehicle types
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="two-wheeler-rate">Two Wheeler (₹/hour)</Label>
              <Input id="two-wheeler-rate" defaultValue="10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="four-wheeler-rate">Four Wheeler (₹/hour)</Label>
              <Input id="four-wheeler-rate" defaultValue="20" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="truck-rate">Truck (₹/hour)</Label>
              <Input id="truck-rate" defaultValue="50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bus-rate">Bus (₹/hour)</Label>
              <Input id="bus-rate" defaultValue="75" />
            </div>
            <Button className="w-full gap-2">
              <Save className="h-4 w-4" />
              Save Rates
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
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
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              System Settings
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
            <Button className="w-full gap-2">
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
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
            <Button className="w-full gap-2">
              <Save className="h-4 w-4" />
              Save Security Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-muted-foreground">
            <SettingsIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Advanced Settings Coming Soon</h3>
            <p>Additional configuration options are being developed. Check back soon!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
