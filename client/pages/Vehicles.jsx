import { useState, useEffect } from 'react';
import { 
  Car, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  LogOut,
  Clock,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VehicleStatus } from '@shared/parking';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch('/api/parking/vehicles/all');
        const data = await response.json();
        if (data.success) {
          setVehicles(data.data);
          console.log('✅ Vehicles loaded:', data.data.length);
        } else {
          console.error('Failed to fetch vehicles:', data.error);
        }
      } catch (error) {
        console.error('Failed to fetch vehicles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
    const interval = setInterval(fetchVehicles, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.phoneNumber?.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleVehicleExit = async (vehicleId) => {
    // Confirm exit with user
    if (!confirm('Are you sure you want to process the vehicle exit? This will calculate the final amount and free up the parking slot.')) {
      return;
    }

    try {
      const response = await fetch('/api/parking/exit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId, paymentMethod: 'cash' })
      });

      const result = await response.json();
      if (result.success) {
        // Show detailed success message
        alert(`✅ Vehicle Exit Processed Successfully!\n\n${result.message}\n\nReceipts have been sent via email and SMS to the vehicle owner.`);

        // Refresh vehicles list using the new endpoint
        const refreshResponse = await fetch('/api/parking/vehicles/all');
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setVehicles(refreshData.data);
        }
      } else {
        alert(`❌ Failed to process exit: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to process exit:', error);
      alert('❌ Network error. Please check your connection and try again.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case VehicleStatus.PARKED:
        return <Badge variant="destructive">Parked</Badge>;
      case VehicleStatus.EXITED:
        return <Badge variant="secondary">Exited</Badge>;
      case VehicleStatus.RESERVED:
        return <Badge variant="default">Reserved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateDuration = (entryTime, exitTime) => {
    const end = exitTime ? new Date(exitTime) : new Date();
    const start = new Date(entryTime);
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60));
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="h-10 bg-muted rounded"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vehicles</h1>
          <p className="text-muted-foreground">Manage and track all vehicles in the system</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Car className="h-4 w-4" />
            <span>{vehicles.length} total vehicles</span>
          </div>
          <Button
            onClick={() => window.location.href = '/parking'}
            className="gap-2"
          >
            <Car className="h-4 w-4" />
            Register Vehicle
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by registration number, owner name, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vehicles</SelectItem>
                <SelectItem value={VehicleStatus.PARKED}>Currently Parked</SelectItem>
                <SelectItem value={VehicleStatus.EXITED}>Exited</SelectItem>
                <SelectItem value={VehicleStatus.RESERVED}>Reserved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle List</CardTitle>
          <CardDescription>
            Currently showing {filteredVehicles.length} of {vehicles.length} vehicles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Registration</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Entry Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.length > 0 ? (
                  filteredVehicles.map((vehicle, index) => (
                    <TableRow key={vehicle.id || vehicle._id || `vehicle-${index}`}>
                      <TableCell className="font-medium">
                        {vehicle.registrationNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{vehicle.ownerName || 'N/A'}</div>
                          {vehicle.phoneNumber && (
                            <div className="text-sm text-muted-foreground">
                              {vehicle.phoneNumber}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {vehicle.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(vehicle.status)}
                      </TableCell>
                      <TableCell>
                        {vehicle.slotId ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {vehicle.slotId?.number ||
                               (typeof vehicle.slotId === 'string' ? vehicle.slotId.replace('slot-', 'A') : 'N/A')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {calculateDuration(vehicle.entryTime, vehicle.exitTime)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(vehicle.entryTime).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                // Calculate amount based on vehicle status
                                let amountInfo = '';
                                const baseRate = vehicle.type === 'two_wheeler' ? 10 : vehicle.type === 'four_wheeler' ? 20 : vehicle.type === 'truck' ? 50 : 75;

                                if (vehicle.status === 'exited') {
                                  // Show final paid amount for exited vehicles
                                  const duration = Math.ceil((new Date(vehicle.exitTime || vehicle.exitTime) - new Date(vehicle.entryTime)) / (1000 * 60));
                                  const hours = Math.ceil(duration / 60);
                                  const finalAmount = hours * baseRate;
                                  amountInfo = `\n\n💰 Final Amount Paid: ₹${finalAmount}\nDuration: ${Math.floor(duration / 60)}h ${duration % 60}m\nRate: ₹${baseRate}/hour`;
                                } else if (vehicle.status === 'parked') {
                                  // Show current amount for parked vehicles
                                  const duration = Math.ceil((Date.now() - new Date(vehicle.entryTime)) / (1000 * 60));
                                  const hours = Math.ceil(duration / 60);
                                  const currentAmount = hours * baseRate;
                                  amountInfo = `\n\n💰 Current Amount: ₹${currentAmount}\nDuration: ${Math.floor(duration / 60)}h ${duration % 60}m\nRate: ₹${baseRate}/hour\n⏰ Amount will increase every hour`;
                                }

                                alert(`🚗 Vehicle Details\n\nRegistration: ${vehicle.registrationNumber}\nOwner: ${vehicle.ownerName || 'N/A'}\nPhone: ${vehicle.phoneNumber || 'N/A'}\nEmail: ${vehicle.email || 'N/A'}\nType: ${vehicle.type.replace('_', ' ')}\nStatus: ${vehicle.status.toUpperCase()}\nSlot: ${vehicle.slotId?.number || vehicle.slotId || 'N/A'}\nEntry Time: ${new Date(vehicle.entryTime).toLocaleString()}${vehicle.exitTime ? `\nExit Time: ${new Date(vehicle.exitTime).toLocaleString()}` : ''}${amountInfo}`);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {vehicle.status === VehicleStatus.PARKED && (
                              <DropdownMenuItem 
                                onClick={() => handleVehicleExit(vehicle._id || vehicle.id)}
                                className="text-destructive"
                              >
                                <LogOut className="h-4 w-4 mr-2" />
                                Process Exit
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Car className="h-8 w-8 opacity-50" />
                        <p>No vehicles found matching your search</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
