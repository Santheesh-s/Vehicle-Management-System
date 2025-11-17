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
  CreditCard
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
import { ParkingSlot, Vehicle, VehicleType, SlotStatus } from '@shared/parking';

interface ParkingSlotProps {
  slot: ParkingSlot;
  vehicle?: Vehicle;
  onSlotClick: (slot: ParkingSlot) => void;
}

function ParkingSlotComponent({ slot, vehicle, onSlotClick }: ParkingSlotProps) {
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

interface VehicleEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

function VehicleEntryDialog({ isOpen, onClose, onSubmit }: VehicleEntryDialogProps) {
  const [formData, setFormData] = useState({
    registrationNumber: '',
    type: VehicleType.TWO_WHEELER,
    ownerName: '',
    phoneNumber: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      registrationNumber: '',
      type: VehicleType.TWO_WHEELER,
      ownerName: '',
      phoneNumber: ''
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
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as VehicleType })}>
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
            <Label htmlFor="owner">Owner Name</Label>
            <Input
              id="owner"
              placeholder="John Doe"
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="9876543210"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
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

interface SlotDetailsDialogProps {
  slot: ParkingSlot | null;
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onExit: (vehicleId: string) => void;
}

function SlotDetailsDialog({ slot, vehicle, isOpen, onClose, onExit }: SlotDetailsDialogProps) {
  if (!slot) return null;

  const handleExit = () => {
    if (vehicle) {
      onExit(vehicle.id);
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
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredSlots, setFilteredSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

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

  const handleSlotClick = (slot: ParkingSlot) => {
    setSelectedSlot(slot);
    setIsDetailsDialogOpen(true);
  };

  const handleVehicleEntry = async (formData: any) => {
    try {
      const response = await fetch('/api/parking/enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (result.success) {
        fetchData(); // Refresh data
      } else {
        alert(result.error || 'Failed to register vehicle');
      }
    } catch (error) {
      console.error('Failed to register vehicle:', error);
      alert('Failed to register vehicle');
    }
  };

  const handleVehicleExit = async (vehicleId: string) => {
    try {
      const response = await fetch('/api/parking/exit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId, paymentMethod: 'cash' })
      });

      const result = await response.json();
      if (result.success) {
        alert(result.message);
        fetchData(); // Refresh data
      } else {
        alert(result.error || 'Failed to process exit');
      }
    } catch (error) {
      console.error('Failed to process exit:', error);
      alert('Failed to process exit');
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
        <Button onClick={() => setIsEntryDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Register Vehicle
        </Button>
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

      {/* Parking Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Parking Layout</CardTitle>
          <CardDescription>
            Click on any slot to view details. Available: <span className="text-success">Green</span>, 
            Occupied: <span className="text-destructive">Red</span>, 
            Reserved: <span className="text-warning">Orange</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))' }}>
            {filteredSlots.map((slot) => {
              const vehicle = vehicles.find(v => v.slotId === slot.id);
              return (
                <ParkingSlotComponent
                  key={slot.id}
                  slot={slot}
                  vehicle={vehicle}
                  onSlotClick={handleSlotClick}
                />
              );
            })}
          </div>
          {filteredSlots.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No slots match your search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

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
