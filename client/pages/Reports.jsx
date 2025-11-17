import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BarChart3, FileText, Download, Calendar, Clock, DollarSign, Car, Users } from 'lucide-react';

export default function Reports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateDailyReport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/parking/reports/daily', { method: 'POST' });
      const result = await response.json();
      
      if (result.success) {
        setReportData(result.data);
        alert('✅ Daily report generated successfully!');
      } else {
        alert('❌ Error generating report: ' + result.error);
      }
    } catch (error) {
      alert('❌ Error generating report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!reportData) return;
    
    const reportText = `PARKING SYSTEM DAILY REPORT
Date: ${reportData.date}

SUMMARY STATISTICS
==================
Total Vehicles: ${reportData.totalVehicles}
Total Revenue: ₹${reportData.totalRevenue}
Current Occupancy: ${reportData.currentOccupancyRate}%

VEHICLE BREAKDOWN
================
Two Wheeler: ${reportData.twoWheelerCount} vehicles (₹${reportData.twoWheelerRevenue})
Four Wheeler: ${reportData.fourWheelerCount} vehicles (₹${reportData.fourWheelerRevenue})
Truck: ${reportData.truckCount} vehicles (₹${reportData.truckRevenue})
Bus: ${reportData.busCount} vehicles (₹${reportData.busRevenue})

CAPACITY STATUS
===============
Available Slots: ${reportData.currentAvailable}
Occupied Slots: ${reportData.currentOccupied}

PEAK HOURS
==========
${reportData.peakHours.join(', ')}

Generated on: ${new Date().toLocaleString()}
    `;
    
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parking-report-${reportData.date.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-muted-foreground">Generate detailed reports and view parking analytics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Daily Report
            </CardTitle>
            <CardDescription>
              Generate comprehensive daily parking report with revenue and usage statistics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full" 
              onClick={generateDailyReport}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Daily Report'}
            </Button>
            
            {reportData && (
              <Button 
                variant="outline" 
                className="w-full gap-2" 
                onClick={downloadReport}
              >
                <Download className="h-4 w-4" />
                Download Report
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Quick Statistics
            </CardTitle>
            <CardDescription>
              Real-time parking metrics and key performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reportData ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Vehicles</span>
                  <Badge variant="outline">{reportData.totalVehicles}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Revenue Today</span>
                  <Badge variant="outline">₹{reportData.totalRevenue}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Current Occupancy</span>
                  <Badge variant="outline">{reportData.currentOccupancyRate}%</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Available Slots</span>
                  <Badge variant="outline">{reportData.currentAvailable}</Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Generate a report to view statistics</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {reportData && (
        <Card>
          <CardHeader>
            <CardTitle>Report Details - {reportData.date}</CardTitle>
            <CardDescription>Comprehensive parking statistics and analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-medium">Revenue</span>
                </div>
                <div className="text-2xl font-bold">₹{reportData.totalRevenue}</div>
                <div className="text-sm text-muted-foreground">Total earnings today</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <Car className="h-4 w-4" />
                  <span className="font-medium">Vehicles</span>
                </div>
                <div className="text-2xl font-bold">{reportData.totalVehicles}</div>
                <div className="text-sm text-muted-foreground">Total served today</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Occupancy</span>
                </div>
                <div className="text-2xl font-bold">{reportData.currentOccupancyRate}%</div>
                <div className="text-sm text-muted-foreground">Current usage rate</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Available</span>
                </div>
                <div className="text-2xl font-bold">{reportData.currentAvailable}</div>
                <div className="text-sm text-muted-foreground">Free slots now</div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div>
              <h4 className="font-medium mb-4">Vehicle Type Breakdown</h4>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Two Wheeler</div>
                  <div className="font-bold text-lg">{reportData.twoWheelerCount}</div>
                  <div className="text-sm">₹{reportData.twoWheelerRevenue} revenue</div>
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Four Wheeler</div>
                  <div className="font-bold text-lg">{reportData.fourWheelerCount}</div>
                  <div className="text-sm">₹{reportData.fourWheelerRevenue} revenue</div>
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Truck</div>
                  <div className="font-bold text-lg">{reportData.truckCount}</div>
                  <div className="text-sm">₹{reportData.truckRevenue} revenue</div>
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Bus</div>
                  <div className="font-bold text-lg">{reportData.busCount}</div>
                  <div className="text-sm">₹{reportData.busRevenue} revenue</div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />
            
            <div>
              <h4 className="font-medium mb-4">Peak Hours Analysis</h4>
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">Busiest Time Periods</div>
                <div className="font-medium">{reportData.peakHours.join(' • ')}</div>
                <div className="text-sm text-muted-foreground mt-2">
                  These hours typically see the highest parking demand
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
