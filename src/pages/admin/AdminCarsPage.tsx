import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Car, Plus, Search, MoreVertical, Edit, Trash2,
  Eye, Database
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Car as CarType } from '@/types';
import { seedCars } from '@/utils/seedData';

interface AdminCarsPageProps {
  user?: { name: string; role: 'customer' | 'admin' } | null;
  onLogout?: () => void;
}

export function AdminCarsPage({ user, onLogout }: AdminCarsPageProps) {
  const location = useLocation();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(true); // Keeping for now if used elsewhere, but actually it was only used for sidebar which we are removing.
  // Wait, I should remove it.
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarType | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  // Fetch Cars
  const { data: cars = [], isLoading } = useQuery({
    queryKey: ['admin-cars'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match CarType
      return data.map((car: any) => ({
        ...car,
        pricePerDay: car.price_per_day,
        fuelType: car.fuel_type,
        images: car.images || [],
        features: car.features || []
      })) as CarType[];
    }
  });

  // Delete Car Mutation
  const deleteMutation = useMutation({
    mutationFn: async (carId: string) => {
      const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', carId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cars'] });
      toast({
        title: "Car deleted",
        description: `${selectedCar?.brand} ${selectedCar?.model} has been removed.`,
      });
      setDeleteDialogOpen(false);
      setSelectedCar(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting car",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await seedCars();
      queryClient.invalidateQueries({ queryKey: ['admin-cars'] });
      toast({
        title: "Data Seeded",
        description: "Successfully added 100 sample cars.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to seed data.",
        variant: "destructive"
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const filteredCars = cars.filter(
    (car) =>
      car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = () => {
    if (selectedCar) {
      deleteMutation.mutate(selectedCar.id);
    }
  };

  return (
    <AdminLayout
      title="Car Management"
      subtitle={`${cars.length} total cars`}
      user={user}
      onLogout={onLogout}
      actions={
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSeedData} disabled={isSeeding}>
            <Database className="h-4 w-4 mr-2" />
            {isSeeding ? 'Seeding...' : 'Seed Data (100)'}
          </Button>
          <Button variant="default" className="bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/20 transition-all" asChild>
            <Link to="/admin/cars/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Car
            </Link>
          </Button>
        </div>
      }
    >
      <Card className="border-border/50 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <CardTitle>Fleet Inventory</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cars..."
                className="pl-9 bg-background/50 border-input/50 focus:bg-background transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-primary/20">
                <TableHead>Car</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price/Day</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading cars...
                  </TableCell>
                </TableRow>
              ) : filteredCars.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No cars found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCars.map((car) => (
                  <TableRow key={car.id} className="hover:bg-primary/5 border-border/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-12 rounded bg-muted overflow-hidden">
                          {car.images[0] ? (
                            <img
                              src={car.images[0]}
                              alt={car.model}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-200" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{car.brand}</p>
                          <p className="text-sm text-muted-foreground">{car.model} ({car.year})</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{car.type}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize",
                          car.status === 'available' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                          car.status === 'rented' && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                          car.status === 'maintenance' && "bg-rose-500/10 text-rose-500 border-rose-500/20"
                        )}
                      >
                        {car.status}
                      </Badge>
                    </TableCell>
                    <TableCell>₹{car.pricePerDay}</TableCell>
                    <TableCell>{car.rating}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/cars/${car.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/cars/${car.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              setSelectedCar(car);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Car</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedCar?.brand} {selectedCar?.model}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
