import { useState } from 'react';
import { CarLoader } from '@/components/CarLoader';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Car } from '@/types';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CarCard } from '@/components/CarCard';
import { SearchFiltersComponent } from '@/components/SearchFilters';
import { SearchFilters } from '@/types';
import { Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CarsPageProps {
  user?: { name: string; role: 'customer' | 'admin' } | null;
  onLogout?: () => void;
}

export function CarsPage({ user, onLogout }: CarsPageProps) {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ['cars', filters],
    queryFn: async () => {
      let query = supabase.from('cars').select('*');

      if (filters.brand) query = query.eq('brand', filters.brand);
      if (filters.type) query = query.eq('type', filters.type);
      if (filters.fuelType) query = query.eq('fuel_type', filters.fuelType);
      if (filters.seats) query = query.gte('seats', filters.seats);
      if (filters.minPrice) query = query.gte('price_per_day', filters.minPrice);
      if (filters.maxPrice) query = query.lte('price_per_day', filters.maxPrice);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching cars:', error);
        return [];
      }

      // Transform snake_case to camelCase and ensure types match
      return (data || []).map(car => ({
        ...car,
        fuelType: car.fuel_type,
        pricePerDay: Number(car.price_per_day),
        status: car.status as any,
        transmission: car.transmission as any,
        features: car.features || [],
        images: car.images || [],
        rating: Number(car.rating || 0),
        id: car.id
      })) as Car[];
    }
  });

  const resetFilters = () => setFilters({});

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} onLogout={onLogout} />

      <main className="flex-1 py-12 pt-32 bg-muted/30">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Browse Our Fleet</h1>
            <p className="text-muted-foreground">
              {cars.length} vehicles available
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:w-80 shrink-0">
              <div className="sticky top-24">
                <SearchFiltersComponent
                  filters={filters}
                  onFiltersChange={setFilters}
                  onReset={resetFilters}
                />
              </div>
            </aside>

            {/* Cars Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing {cars.length} of {cars.length} cars
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-16">
                  <CarLoader size="lg" label="Loading cars..." />
                </div>
              ) : cars.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-lg font-medium mb-2">No cars found</p>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters to find what you're looking for.
                  </p>
                  <Button variant="outline" onClick={resetFilters}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className={cn(
                  "grid gap-6",
                  viewMode === 'grid'
                    ? "sm:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1"
                )}>
                  {cars.map((car) => (
                    <CarCard key={car.id} car={car} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
