import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Eye, Send, Settings } from 'lucide-react';

export default function EmailTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState('vehicleEntry');
  
  const mockData = {
    vehicleEntry: {
      registrationNumber: 'KA01AB1234',
      type: 'four_wheeler',
      ownerName: 'John Doe',
      slotNumber: 'A15',
      entryTime: new Date(),
      rate: 20
    },
    vehicleExit: {
      registrationNumber: 'KA01AB1234',
      type: 'four_wheeler',
      ownerName: 'John Doe',
      slotNumber: 'A15',
      entryTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      exitTime: new Date(),
      duration: 120,
      amount: 40,
      paymentMethod: 'card',
      receiptId: 'RCP-1703123456789'
    },
    highOccupancy: {
      occupancyRate: 95,
      occupiedSlots: 47,
      availableSlots: 3,
      totalSlots: 50
    },
    dailyReport: {
      totalVehicles: 45,
      totalRevenue: 1250,
      avgDuration: 125,
      peakOccupancy: 95,
      twoWheelerCount: 20,
      twoWheelerRevenue: 400,
      fourWheelerCount: 22,
      fourWheelerRevenue: 750,
      truckCount: 2,
      truckRevenue: 80,
      busCount: 1,
      busRevenue: 20,
      peakHours: ['09:00-11:00', '14:00-16:00', '18:00-20:00'],
      currentAvailable: 3,
      currentOccupied: 47,
      currentOccupancyRate: 94
    }
  };

  const templates = [
    {
      id: 'vehicleEntry',
      name: 'Vehicle Entry Confirmation',
      description: 'Sent when a vehicle is registered and parked',
      icon: '🚗',
      status: 'active'
    },
    {
      id: 'vehicleExit',
      name: 'Payment Receipt',
      description: 'Sent when a vehicle exits and payment is processed',
      icon: '🧾',
      status: 'active'
    },
    {
      id: 'highOccupancy',
      name: 'High Occupancy Alert',
      description: 'Sent to admins when parking reaches 90% capacity',
      icon: '⚠️',
      status: 'active'
    },
    {
      id: 'dailyReport',
      name: 'Daily Summary Report',
      description: 'Daily performance summary sent to administrators',
      icon: '📊',
      status: 'active'
    }
  ];

  const generateTemplatePreview = async (templateId) => {
    try {
      const response = await fetch('/api/email/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          data: mockData[templateId]
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Open preview in new window
          const previewWindow = window.open('', '_blank', 'width=800,height=600');
          previewWindow.document.write(result.html);
          previewWindow.document.close();
        } else {
          alert('Error: ' + result.error);
        }
      } else {
        alert('Failed to generate preview');
      }
    } catch (error) {
      console.error('Error generating template preview:', error);
      alert('Error generating template preview');
    }
  };

  const testEmailSend = async (templateId) => {
    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          data: mockData[templateId],
          testEmail: 'test@example.com'
        })
      });

      const result = await response.json();
      if (result.success) {
        alert(`✅ Email template processed successfully!\n\nSubject: ${result.template.subject}\nRecipient: ${result.template.recipient}\nStatus: ${result.template.status}\n\nCheck console for more details.`);
        console.log('Email template test result:', result);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      alert('Error sending test email');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Email Templates</h1>
          <p className="text-muted-foreground">Preview and manage email notification templates</p>
        </div>
        <Badge variant="outline" className="gap-2">
          <Mail className="h-4 w-4" />
          Templates Ready
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Template List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Available Templates</CardTitle>
              <CardDescription>
                Click on a template to preview or test
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedTemplate === template.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:bg-accent'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{template.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{template.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {template.description}
                        </div>
                        <Badge 
                          variant={template.status === 'active' ? 'default' : 'secondary'}
                          className="mt-2 text-xs"
                        >
                          {template.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Template Preview and Actions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">
                  {templates.find(t => t.id === selectedTemplate)?.icon}
                </span>
                {templates.find(t => t.id === selectedTemplate)?.name}
              </CardTitle>
              <CardDescription>
                {templates.find(t => t.id === selectedTemplate)?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="data">Sample Data</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="preview" className="space-y-4">
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <h4 className="font-medium mb-2">Template Preview</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Click the buttons below to preview or test the email template
                    </p>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => generateTemplatePreview(selectedTemplate)}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Preview Template
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={() => testEmailSend(selectedTemplate)}
                        className="gap-2"
                      >
                        <Send className="h-4 w-4" />
                        Test Email
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Template Features</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Responsive HTML design</li>
                      <li>• Professional branding with ParkSys theme</li>
                      <li>• Dynamic content based on real data</li>
                      <li>• Mobile-friendly layout</li>
                      <li>• Clear call-to-action sections</li>
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="data" className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Sample Data</h4>
                    <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                      {JSON.stringify(mockData[selectedTemplate], null, 2)}
                    </pre>
                  </div>
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Template Configuration</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Trigger:</span>
                        <span className="text-muted-foreground">Automatic</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recipients:</span>
                        <span className="text-muted-foreground">
                          {selectedTemplate === 'highOccupancy' || selectedTemplate === 'dailyReport' 
                            ? 'Administrators' 
                            : 'Vehicle Owners'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Format:</span>
                        <span className="text-muted-foreground">HTML</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Settings className="h-4 w-4" />
                        Configure Template
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Email Service Status */}
      <Card>
        <CardHeader>
          <CardTitle>Email Service Status</CardTitle>
          <CardDescription>
            Current configuration and service health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-warning">⚠️</div>
              <div className="text-sm font-medium">Service Status</div>
              <div className="text-xs text-muted-foreground">Templates Ready (SMTP Pending)</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-success">4</div>
              <div className="text-sm font-medium">Active Templates</div>
              <div className="text-xs text-muted-foreground">All templates configured</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-muted-foreground">0</div>
              <div className="text-sm font-medium">Emails Sent Today</div>
              <div className="text-xs text-muted-foreground">Waiting for SMTP setup</div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">📧 Setup Instructions</h4>
            <p className="text-sm text-blue-800 mb-2">
              Email templates are ready! To enable sending:
            </p>
            <ol className="text-sm text-blue-800 space-y-1 ml-4">
              <li>1. Configure SMTP credentials in emailService.js</li>
              <li>2. Uncomment the email sending code</li>
              <li>3. Set up environment variables for email auth</li>
              <li>4. Test with your email service provider</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
