import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, FileText, Download, Calendar } from 'lucide-react';

export default function Reports() {
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
              <BarChart3 className="h-5 w-5" />
              Revenue Reports
            </CardTitle>
            <CardDescription>
              Generate daily, weekly, and monthly revenue reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Generate Revenue Report</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Occupancy Analytics
            </CardTitle>
            <CardDescription>
              Analyze parking utilization and peak hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">View Occupancy Analytics</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Vehicle Movement Reports
            </CardTitle>
            <CardDescription>
              Track vehicle entry and exit patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Generate Movement Report</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Data
            </CardTitle>
            <CardDescription>
              Export parking data in various formats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Export Data</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Reports Coming Soon</h3>
            <p>Detailed reporting and analytics features are being developed. Check back soon!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
