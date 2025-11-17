import { useState, useEffect } from 'react';
import {
  Car,
  Plus,
  Search,
  Filter,
  RotateCcw,
  MapPin,
  Clock,
  User,
  Phone,
  CreditCard,
  Bike,
  Truck,
  Bus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { VehicleType, SlotStatus, VehicleStatus } from '@shared/parking';

function ParkingSlotComponent({ slot, vehicle, onSlotClick }) {
  const getSlotColor = () => {
    switch (slot.status) {
      case SlotStatus.AVAILABLE:
        return 'bg-available hover:bg-available/80 border-available/30';
      case SlotStatus.OCCUPIED:
        return 'bg-occupied hover:bg-occupied/80 border-occupied/30';
      case SlotStatus.RESERVED:
        return 'bg-reserved hover:bg-reserved/80 border-reserved/30';
      case SlotStatus.MAINTENANCE:
        return 'bg-muted hover:bg-muted/80 border-muted-foreground/30';
      default:
        return 'bg-muted';
    }
  };

  const getTextColor = () => {
    return slot.status === SlotStatus.AVAILABLE ? 'text-available-foreground' : 'text-white';
  };

  return (
    <div
      className={cn(
        "relative h-16 w-24 rounded-lg border-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center",
        getSlotColor()
      )}
      onClick={() => onSlotClick(slot)}
    >
      <div className={cn("text-xs font-medium", getTextColor())}>
        {slot.number}
      </div>
      {vehicle && (
        <div className={cn("text-[10px] truncate w-full text-center px-1", getTextColor())}>
          {vehicle.registrationNumber}
        </div>
      )}
      <div className="absolute top-1 right-1">
        <Car className={cn("h-3 w-3", getTextColor())} />
      </div>
    </div>
  );
}

function VehicleEntryDialog({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    registrationNumber: '',
    type: VehicleType.TWO_WHEELER,
    ownerName: '',
    phoneNumber: '',
    email: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      registrationNumber: '',
      type: VehicleType.TWO_WHEELER,
      ownerName: '',
      phoneNumber: '',
      email: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register New Vehicle</DialogTitle>
          <DialogDescription>
            Enter vehicle details to assign a parking slot
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="registration">Registration Number *</Label>
            <Input
              id="registration"
              placeholder="KA01AB1234"
              value={formData.registrationNumber}
              onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value.toUpperCase() })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Vehicle Type *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={VehicleType.TWO_WHEELER}>Two Wheeler</SelectItem>
                <SelectItem value={VehicleType.FOUR_WHEELER}>Four Wheeler</SelectItem>
                <SelectItem value={VehicleType.TRUCK}>Truck</SelectItem>
                <SelectItem value={VehicleType.BUS}>Bus</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner">Owner Name *</Label>
            <Input
              id="owner"
              placeholder="John Doe"
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              placeholder="9876543210"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Register Vehicle
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SlotDetailsDialog({ slot, vehicle, isOpen, onClose, onExit }) {
  if (!slot) return null;

  const handleExit = () => {
    if (vehicle) {
      onExit(vehicle._id || vehicle.id);
      onClose();
    }
  };

  const duration = vehicle ? Math.ceil((Date.now() - new Date(vehicle.entryTime).getTime()) / (1000 * 60)) : 0;
  const hours = Math.ceil(duration / 60);
  const baseRate = vehicle?.type === VehicleType.TWO_WHEELER ? 10 : 20;
  const amount = hours * baseRate;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Slot {slot.number}</DialogTitle>
          <DialogDescription>
            {slot.status === SlotStatus.OCCUPIED ? 'Occupied slot details' : 'Empty parking slot'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Slot Type: {slot.type.replace('_', ' ')}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={slot.status === SlotStatus.AVAILABLE ? 'default' : slot.status === SlotStatus.OCCUPIED ? 'destructive' : 'secondary'}>
              {slot.status}
            </Badge>
          </div>

          {vehicle && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium">Vehicle Information</h4>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Registration</div>
                    <div className="font-medium">{vehicle.registrationNumber}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Type</div>
                    <div className="font-medium">{vehicle.type.replace('_', ' ')}</div>
                  </div>
                </div>

                {vehicle.ownerName && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{vehicle.ownerName}</span>
                  </div>
                )}

                {vehicle.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{vehicle.phoneNumber}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Parked since {new Date(vehicle.entryTime).toLocaleString()}
                  </span>
                </div>

                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Duration:</span>
                    <span className="font-medium">{Math.floor(duration / 60)}h {duration % 60}m</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Amount:</span>
                    <span className="font-medium">₹{amount}</span>
                  </div>
                </div>

                <Button onClick={handleExit} className="w-full gap-2">
                  <CreditCard className="h-4 w-4" />
                  Process Exit (₹{amount})
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ParkingGrid() {
  const [slots, setSlots] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchData = async () => {
    try {
      const [slotsResponse, vehiclesResponse] = await Promise.all([
        fetch('/api/parking/slots'),
        fetch('/api/parking/vehicles')
      ]);

      const slotsData = await slotsResponse.json();
      const vehiclesData = await vehiclesResponse.json();

      if (slotsData.success) setSlots(slotsData.data);
      if (vehiclesData.success) setVehicles(vehiclesData.data);
    } catch (error) {
      console.error('Failed to fetch parking data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = slots;

    if (searchTerm) {
      filtered = filtered.filter(slot => {
        const vehicle = vehicles.find(v => v.slotId === slot.id);
        return (
          slot.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (vehicle?.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(slot => slot.status === statusFilter);
    }

    setFilteredSlots(filtered);
  }, [slots, vehicles, searchTerm, statusFilter]);

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    setIsDetailsDialogOpen(true);
  };

  const handleVehicleEntry = async (formData) => {
    try {
      // Validate required fields
      if (!formData.registrationNumber || !formData.ownerName || !formData.phoneNumber || !formData.email) {
        alert('Please fill in all required fields (Registration Number, Owner Name, Phone Number, and Email)');
        return;
      }

      const response = await fetch('/api/parking/enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (result.success) {
        // Show success message with slot information
        alert(`✅ Vehicle registered successfully!\n\n${result.message}\n\nNotifications have been sent to:\n📧 Email: ${formData.email}\n📱 SMS: ${formData.phoneNumber}`);
        fetchData(); // Refresh data
      } else {
        alert(`❌ Failed to register vehicle: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to register vehicle:', error);
      alert('❌ Network error. Please check your connection and try again.');
    }
  };

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
        fetchData(); // Refresh data
      } else {
        alert(`❌ Failed to process exit: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to process exit:', error);
      alert('❌ Network error. Please check your connection and try again.');
    }
  };

  const availableSlots = slots.filter(slot => slot.status === SlotStatus.AVAILABLE).length;
  const occupiedSlots = slots.filter(slot => slot.status === SlotStatus.OCCUPIED).length;
  const reservedSlots = slots.filter(slot => slot.status === SlotStatus.RESERVED).length;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
            {[...Array(50)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-foreground">Parking Grid</h1>
          <p className="text-muted-foreground">Real-time parking space management</p>
        </div>
        {isAuthenticated && (
          <Button onClick={() => setIsEntryDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Register Vehicle
          </Button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{availableSlots}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Occupied Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{occupiedSlots}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Reserved Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{reservedSlots}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by slot number or registration..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Slots</SelectItem>
                <SelectItem value={SlotStatus.AVAILABLE}>Available</SelectItem>
                <SelectItem value={SlotStatus.OCCUPIED}>Occupied</SelectItem>
                <SelectItem value={SlotStatus.RESERVED}>Reserved</SelectItem>
                <SelectItem value={SlotStatus.MAINTENANCE}>Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchData} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Parking Grid by Sections */}
      <div className="space-y-6">
        {Object.values(VehicleType).map((vehicleType) => {
          const typeSlots = filteredSlots.filter(slot => slot.type === vehicleType);
          if (typeSlots.length === 0) return null;

          const typeAvailable = typeSlots.filter(slot => slot.status === SlotStatus.AVAILABLE).length;
          const typeOccupied = typeSlots.filter(slot => slot.status === SlotStatus.OCCUPIED).length;

          // Get appropriate icon and color for each vehicle type
          const getSectionIcon = (type) => {
            switch (type) {
              case VehicleType.TWO_WHEELER: return <Bike className="h-5 w-5 text-blue-600" />;
              case VehicleType.FOUR_WHEELER: return <Car className="h-5 w-5 text-green-600" />;
              case VehicleType.TRUCK: return <Truck className="h-5 w-5 text-orange-600" />;
              case VehicleType.BUS: return <Bus className="h-5 w-5 text-purple-600" />;
              default: return <Car className="h-5 w-5" />;
            }
          };

          const getSectionColor = (type) => {
            switch (type) {
              case VehicleType.TWO_WHEELER: return 'border-l-4 border-blue-500';
              case VehicleType.FOUR_WHEELER: return 'border-l-4 border-green-500';
              case VehicleType.TRUCK: return 'border-l-4 border-orange-500';
              case VehicleType.BUS: return 'border-l-4 border-purple-500';
              default: return 'border-l-4 border-gray-500';
            }
          };

          return (
            <Card key={vehicleType} className={`${getSectionColor(vehicleType)} shadow-sm`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getSectionIcon(vehicleType)}
                      {vehicleType.replace('_', ' ')} Section
                    </CardTitle>
                    <CardDescription>
                      {typeSlots.length} total slots • {typeAvailable} available • {typeOccupied} occupied
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-success border-success">
                      {typeAvailable} Available
                    </Badge>
                    <Badge variant="outline" className="text-destructive border-destructive">
                      {typeOccupied} Occupied
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))' }}>
                  {typeSlots.map((slot) => {
                    const vehicle = vehicles.find(v => v.slotId === slot.id);
                    return (
                      <ParkingSlotComponent
                        key={slot._id || slot.id || slot.number}
                        slot={slot}
                        vehicle={vehicle}
                        onSlotClick={handleSlotClick}
                      />
                    );
                  })}
                </div>
                {typeSlots.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Car className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No {vehicleType.replace('_', ' ').toLowerCase()} slots available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {filteredSlots.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Car className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground">No slots match your search criteria</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <VehicleEntryDialog
        isOpen={isEntryDialogOpen}
        onClose={() => setIsEntryDialogOpen(false)}
        onSubmit={handleVehicleEntry}
      />

      <SlotDetailsDialog
        slot={selectedSlot}
        vehicle={selectedSlot ? vehicles.find(v => v.slotId === selectedSlot.id) || null : null}
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        onExit={handleVehicleExit}
      />
    </div>
  );
}
