import { useState, useEffect } from 'react';
import { 
  Car, 
  ParkingCircle, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Activity,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { DashboardStats, Vehicle, ParkingSlot } from '@shared/parking';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: number;
  color?: 'default' | 'success' | 'warning' | 'danger';
}

function StatCard({ title, value, description, icon: Icon, trend, color = 'default' }: StatCardProps) {
  const colorStyles = {
    default: 'text-foreground',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-destructive'
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", colorStyles[color])} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend !== undefined && (
          <div className={cn("text-xs mt-1", trend >= 0 ? "text-success" : "text-destructive")}>
            {trend >= 0 ? '+' : ''}{trend}% from yesterday
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentVehicles, setRecentVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, vehiclesResponse] = await Promise.all([
          fetch('/api/parking/stats'),
          fetch('/api/parking/vehicles')
        ]);

        const statsData = await statsResponse.json();
        const vehiclesData = await vehiclesResponse.json();

        if (statsData.success) setStats(statsData.data);
        if (vehiclesData.success) setRecentVehicles(vehiclesData.data.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-6"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const occupancyRate = stats ? Math.round((stats.occupiedSlots / stats.totalSlots) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening at your parking facility today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4" />
          <span>Live Updates</span>
          <div className="h-2 w-2 bg-success rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Parking Slots"
          value={stats?.totalSlots ?? 0}
          description="Available parking spaces"
          icon={ParkingCircle}
        />
        <StatCard
          title="Currently Occupied"
          value={stats?.occupiedSlots ?? 0}
          description={`${occupancyRate}% occupancy rate`}
          icon={Car}
          color={occupancyRate > 80 ? 'warning' : 'success'}
        />
        <StatCard
          title="Today's Revenue"
          value={`₹${stats?.todayRevenue ?? 0}`}
          description="Total earnings today"
          icon={DollarSign}
          trend={12}
          color="success"
        />
        <StatCard
          title="Vehicles Today"
          value={stats?.todayVehicles ?? 0}
          description="Vehicles served today"
          icon={Users}
          trend={8}
        />
      </div>

      {/* Occupancy Overview & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Occupancy Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Parking Occupancy</CardTitle>
            <CardDescription>Real-time parking space availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Occupancy Rate</span>
                <span className="font-medium">{occupancyRate}%</span>
              </div>
              <Progress value={occupancyRate} className="h-2" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-success">{stats?.availableSlots ?? 0}</div>
                <div className="text-xs text-muted-foreground">Available</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-destructive">{stats?.occupiedSlots ?? 0}</div>
                <div className="text-xs text-muted-foreground">Occupied</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-warning">{stats?.reservedSlots ?? 0}</div>
                <div className="text-xs text-muted-foreground">Reserved</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common parking management tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start gap-2" size="lg">
              <Car className="h-4 w-4" />
              Register New Vehicle
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" size="lg">
              <ParkingCircle className="h-4 w-4" />
              View Parking Grid
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" size="lg">
              <TrendingUp className="h-4 w-4" />
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Vehicles */}
        <Card>
          <CardHeader>
            <CardTitle>Recently Parked Vehicles</CardTitle>
            <CardDescription>Latest vehicle entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentVehicles.length > 0 ? (
                recentVehicles.map((vehicle) => (
                  <div key={vehicle.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Car className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{vehicle.registrationNumber}</div>
                        <div className="text-xs text-muted-foreground">
                          {vehicle.type.replace('_', ' ')} • Slot {vehicle.slotId?.replace('slot-', 'A')}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {new Date(vehicle.entryTime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Car className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No vehicles currently parked</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Important notifications and warnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {occupancyRate > 90 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-destructive">High Occupancy Alert</div>
                    <div className="text-xs text-muted-foreground">
                      Parking facility is {occupancyRate}% full. Consider alternative arrangements.
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-sm text-success">System Status</div>
                  <div className="text-xs text-muted-foreground">
                    All parking systems are operational and functioning normally.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Info className="h-4 w-4 text-primary mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-sm text-primary">Peak Hours</div>
                  <div className="text-xs text-muted-foreground">
                    Expected busy periods: {stats?.peakHours?.join(', ') ?? 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Performance Summary</CardTitle>
          <CardDescription>Key metrics and insights for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold">{stats?.averageStayDuration ?? 0} min</div>
              <div className="text-sm text-muted-foreground">Average Stay Duration</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold">₹{Math.round((stats?.todayRevenue ?? 0) / (stats?.todayVehicles ?? 1))}</div>
              <div className="text-sm text-muted-foreground">Average Revenue per Vehicle</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold">{Math.round(((stats?.todayVehicles ?? 0) / (stats?.totalSlots ?? 1)) * 100)}%</div>
              <div className="text-sm text-muted-foreground">Utilization Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
