import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CarLoader } from '@/components/CarLoader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Car, Plus, Search, MoreVertical, Edit, Trash2,
  Eye, Database, Filter, SlidersHorizontal, Image as ImageIcon, ImageOff, Check, XCircle, Loader2, RefreshCw
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
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [mediaFilter, setMediaFilter] = useState<string>('all'); // 'all' | 'with_images' | 'no_images' | 'broken'
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarType | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [invalidImageIds, setInvalidImageIds] = useState<Set<string>>(new Set());
  const [isScanning, setIsScanning] = useState(false);
  const [selectedCarIds, setSelectedCarIds] = useState<Set<string>>(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

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
        features: car.features || [],
        registrationNumber: car.registration_number
      })) as CarType[];
    }
  });

  // Bulk Delete Mutation
  const deleteCarsMutation = useMutation({
    mutationFn: async (vars: { carsToDelete: CarType[] }) => {
      const { carsToDelete } = vars;
      const idsToDelete = carsToDelete.map(c => c.id);

      // 1. Gather all images to delete in one go
      const allImageUrls = carsToDelete.flatMap(c => c.images || []);
      if (allImageUrls.length > 0) {
        const imagePaths = allImageUrls.map(url => {
          try {
            const urlObj = new URL(url);
            const pathSegments = urlObj.pathname.split('/');
            const publicIndex = pathSegments.indexOf('public', pathSegments.indexOf('car-images'));
            if (publicIndex !== -1) {
              return pathSegments.slice(publicIndex).join('/');
            }
          } catch (e) { return null; }
          return null;
        }).filter(Boolean) as string[];

        // Best effort image deletion - don't block DB delete on this
        if (imagePaths.length > 0) {
          supabase.storage.from('car-images').remove(imagePaths).catch(e => console.error("Image cleanup faied", e));
        }
      }

      // 2. Single DB Query to delete all rows
      const { error } = await supabase
        .from('cars')
        .delete()
        .in('id', idsToDelete);

      if (error) throw error;

      return idsToDelete.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['admin-cars'] });
      toast({
        title: "Deletion Successful",
        description: `Successfully removed ${count} car(s) from the fleet.`,
      });
      setDeleteDialogOpen(false);
      setBulkDeleteDialogOpen(false);
      setSelectedCar(null);
      setSelectedCarIds(new Set());
    },
    onError: (error: any) => {
      toast({
        title: "Deletion Failed",
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

  const checkImage = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  const scanImages = async () => {
    setIsScanning(true);
    const splitInvalidIds = new Set<string>();

    // Process in batches to avoid browser freeze, but basically checking all
    const checks = cars.map(async (car) => {
      if (!car.images || car.images.length === 0 || !car.images[0]) return; // Empty is not "broken URL", it's just empty.
      const isValid = await checkImage(car.images[0]);
      if (!isValid) {
        splitInvalidIds.add(car.id);
      }
    });

    await Promise.all(checks);
    setInvalidImageIds(splitInvalidIds);
    setIsScanning(false);
    toast({
      title: "Scan Complete",
      description: `Found ${splitInvalidIds.size} cars with broken images.`,
    });
  };

  const handleMediaFilterChange = (value: string) => {
    setMediaFilter(value);
    if (value === 'broken') {
      scanImages();
    }
  };

  const filteredCars = cars.filter(
    (car) => {
      const matchesSearch = car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (car.registrationNumber && car.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || car.status === statusFilter;
      const matchesType = typeFilter === 'all' || (car.type && car.type.toLowerCase() === typeFilter.toLowerCase());

      const hasImage = car.images && car.images.length > 0 && car.images[0].trim() !== '';

      let matchesMedia = true;
      if (mediaFilter === 'with_images') matchesMedia = hasImage;
      if (mediaFilter === 'no_images') matchesMedia = !hasImage;
      if (mediaFilter === 'broken') matchesMedia = invalidImageIds.has(car.id);

      return matchesSearch && matchesStatus && matchesType && matchesMedia;
    }
  );

  const handleDelete = () => {
    if (selectedCar) {
      deleteCarsMutation.mutate({ carsToDelete: [selectedCar] });
    }
  };

  const handleBulkDelete = () => {
    const carsToDelete = cars.filter(c => selectedCarIds.has(c.id));
    if (carsToDelete.length === 0) return;

    deleteCarsMutation.mutate({ carsToDelete });
  };

  const toggleSelectAll = () => {
    if (selectedCarIds.size === filteredCars.length && filteredCars.length > 0) {
      setSelectedCarIds(new Set());
    } else {
      setSelectedCarIds(new Set(filteredCars.map(c => c.id)));
    }
  };

  const toggleSelectCar = (id: string) => {
    const newSelected = new Set(selectedCarIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCarIds(newSelected);
  };

  return (
    <AdminLayout
      title="Car Management"
      subtitle={`${cars.length} vehicles in fleet`}
      user={user}
      onLogout={onLogout}
      actions={
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={handleSeedData} disabled={isSeeding} className="hidden sm:flex">
            <Database className="h-4 w-4 mr-2" />
            {isSeeding ? 'Seeding...' : 'Seed Data'}
          </Button>
          <Button variant="default" asChild size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all border-0">
            <Link to="/admin/cars/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Car
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-6 animate-fade-up">

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by brand, model, or reg no..."
              className="pl-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">

            {selectedCarIds.size > 0 && (
              <Button variant="destructive" size="sm" onClick={() => setBulkDeleteDialogOpen(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedCarIds.size})
              </Button>
            )}

            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={cn("gap-2", statusFilter !== 'all' && "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400")}>
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Status</span>
                  {statusFilter !== 'all' && <Badge variant="secondary" className="ml-1 h-5 px-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">{statusFilter}</Badge>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                  <Check className={cn("h-4 w-4 mr-2", statusFilter === 'all' ? "opacity-100" : "opacity-0")} /> All Statuses
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter('available')} className="text-emerald-600">
                  <Check className={cn("h-4 w-4 mr-2", statusFilter === 'available' ? "opacity-100" : "opacity-0")} /> Available
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('rented')} className="text-amber-600">
                  <Check className={cn("h-4 w-4 mr-2", statusFilter === 'rented' ? "opacity-100" : "opacity-0")} /> Rented
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('maintenance')} className="text-rose-600">
                  <Check className={cn("h-4 w-4 mr-2", statusFilter === 'maintenance' ? "opacity-100" : "opacity-0")} /> Maintenance
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('unavailable')} className="text-slate-600">
                  <Check className={cn("h-4 w-4 mr-2", statusFilter === 'unavailable' ? "opacity-100" : "opacity-0")} /> Unavailable
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={cn("gap-2", typeFilter !== 'all' && "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400")}>
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Type</span>
                  {typeFilter !== 'all' && <Badge variant="secondary" className="ml-1 h-5 px-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">{typeFilter}</Badge>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTypeFilter('all')}>
                  <Check className={cn("h-4 w-4 mr-2", typeFilter === 'all' ? "opacity-100" : "opacity-0")} /> All Types
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {['Luxury', 'Sport', 'SUV', 'Sedan', 'Electric', 'Convertible'].map(type => (
                  <DropdownMenuItem key={type} onClick={() => setTypeFilter(type.toLowerCase())}>
                    <Check className={cn("h-4 w-4 mr-2", typeFilter === type.toLowerCase() ? "opacity-100" : "opacity-0")} /> {type}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Media Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isScanning} className={cn("gap-2", mediaFilter !== 'all' && "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400")}>
                  {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : (mediaFilter === 'no_images' ? <ImageOff className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />)}
                  <span className="hidden sm:inline">Media</span>
                  {mediaFilter !== 'all' && <Badge variant="secondary" className="ml-1 h-5 px-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                    {mediaFilter === 'broken' ? 'Broken' : mediaFilter === 'no_images' ? 'None' : 'Images'}
                  </Badge>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleMediaFilterChange('all')}>
                  <Check className={cn("h-4 w-4 mr-2", mediaFilter === 'all' ? "opacity-100" : "opacity-0")} /> All Cars
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleMediaFilterChange('with_images')}>
                  <Check className={cn("h-4 w-4 mr-2", mediaFilter === 'with_images' ? "opacity-100" : "opacity-0")} /> With Valid Images
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMediaFilterChange('no_images')}>
                  <Check className={cn("h-4 w-4 mr-2", mediaFilter === 'no_images' ? "opacity-100" : "opacity-0")} /> No Images (Empty)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMediaFilterChange('broken')} className="text-red-500 font-medium">
                  <div className="flex items-center w-full justify-between">
                    <span className="flex items-center">
                      <Check className={cn("h-4 w-4 mr-2", mediaFilter === 'broken' ? "opacity-100" : "opacity-0")} />
                      Broken / Invalid
                    </span>
                    <RefreshCw className="h-3 w-3 ml-2 opacity-50" />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear Filters */}
            {(statusFilter !== 'all' || typeFilter !== 'all' || mediaFilter !== 'all') && (
              <Button variant="ghost" size="icon" onClick={() => { setStatusFilter('all'); setTypeFilter('all'); handleMediaFilterChange('all'); }} title="Clear Filters" className="text-slate-400 hover:text-red-500">
                <XCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Grid (Visible < md) */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {isLoading ? (
            <CarLoader size="md" label="Loading fleet..." className="mx-auto my-12" />
          ) : filteredCars.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-950 rounded-xl border border-dashed border-slate-300">
              No cars found matching your search.
            </div>
          ) : (
            filteredCars.map((car) => (
              <div key={car.id} className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex gap-4">
                <div className="w-24 h-24 rounded-lg bg-slate-100 dark:bg-slate-900 overflow-hidden shrink-0">
                  {invalidImageIds.has(car.id) ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-rose-500 bg-rose-50 dark:bg-rose-900/20">
                      <ImageOff className="h-6 w-6 mb-1" />
                      <span className="text-[10px] font-medium">Broken Link</span>
                    </div>
                  ) : car.images[0] ? (
                    <img src={car.images[0]} alt={car.model} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300"><Car /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate">{car.brand} {car.model}</h3>
                      <p className="text-xs text-slate-500">{car.type} • {car.year}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild><Link to={`/admin/cars/${car.id}/preview`}>View</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link to={`/admin/cars/${car.id}/edit`}>Edit</Link></DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedCar(car); setDeleteDialogOpen(true); }}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="secondary" className={cn(
                      "capitalize text-[10px] px-1.5",
                      car.status === 'available' && "bg-emerald-500/10 text-emerald-600",
                      car.status === 'rented' && "bg-amber-500/10 text-amber-600",
                      car.status === 'maintenance' && "bg-rose-500/10 text-rose-600"
                    )}>
                      {car.status}
                    </Badge>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">₹{car.pricePerDay}<span className="text-xs font-normal text-slate-400">/day</span></span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table (Hidden < md) */}
        <Card className="hidden md:block border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={filteredCars.length > 0 && selectedCarIds.size === filteredCars.length}
                      onCheckedChange={toggleSelectAll}
                      disabled={filteredCars.length === 0}
                      aria-label="Select all cars"
                    />
                  </TableHead>
                  <TableHead>Car Details</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pricing</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12">
                      <CarLoader size="md" label="Loading cars..." className="mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredCars.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                      No cars found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCars.map((car) => (
                    <TableRow key={car.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 group">
                      <TableCell>
                        <Checkbox
                          checked={selectedCarIds.has(car.id)}
                          onCheckedChange={() => toggleSelectCar(car.id)}
                          aria-label={`Select car ${car.model}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-12 rounded-lg bg-slate-100 dark:bg-slate-900 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
                            {invalidImageIds.has(car.id) ? (
                              <div className="w-full h-full flex items-center justify-center text-rose-500 bg-rose-50 dark:bg-rose-900/20" title="Image URL is broken">
                                <ImageOff className="h-4 w-4" />
                              </div>
                            ) : car.images[0] ? (
                              <img
                                src={car.images[0]}
                                alt={car.model}
                                className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400"><Car className="w-6 h-6" /></div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{car.brand} {car.model}</p>
                            <p className="text-xs text-slate-500 font-mono">{car.registrationNumber || 'N/A'}</p>
                            <p className="text-xs text-slate-500">{car.year} • {car.fuelType}</p>
                          </div>

                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">{car.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize font-medium border-0",
                            car.status === 'available' && "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20",
                            car.status === 'rented' && "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20",
                            car.status === 'maintenance' && "bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/20"
                          )}
                        >
                          {car.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">₹{car.pricePerDay}<span className="text-xs text-slate-400 font-normal">/day</span></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-bold">{car.rating}</span>
                          <span className="text-xs text-slate-400">/5.0</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/admin/cars/${car.id}/preview`} title="View Live Preview">
                              <Eye className="h-4 w-4 text-slate-500 hover:text-indigo-600" />
                            </Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-800">
                                <MoreVertical className="h-4 w-4 text-slate-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem asChild>
                                <Link to={`/admin/cars/${car.id}/preview`} className="cursor-pointer">
                                  <Eye className="h-4 w-4 mr-2 text-slate-500" />
                                  View Live Page
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/admin/cars/${car.id}/edit`} className="cursor-pointer">
                                  <Edit className="h-4 w-4 mr-2 text-slate-500" />
                                  Edit Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive cursor-pointer"
                                onClick={() => {
                                  setSelectedCar(car);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Car
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

      </div>


      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete
              <span className="font-semibold text-foreground"> {selectedCar?.brand} {selectedCar?.model}</span> and remove the data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Car
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCarIds.size} Cars?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete <span className="font-semibold text-foreground">{selectedCarIds.size} selected cars</span> and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete {selectedCarIds.size} Cars
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
