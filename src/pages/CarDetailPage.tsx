import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CarLoader } from '@/components/CarLoader';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Star, Users, Fuel, Gauge, Calendar as CalendarIcon,
  ChevronLeft, Check, Shield, Clock, ArrowRight
} from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Addon, Car as CarType } from '@/types';

interface CarDetailPageProps {
  user?: { name: string; role: 'customer' | 'admin' } | null;
  onLogout?: () => void;
}

const mockAddons: Addon[] = [
  { id: '1', name: 'GPS Navigation', price: 10, description: 'Built-in GPS navigation system' },
  { id: '2', name: 'Child Seat', price: 15, description: 'Safety seat for children' },
  { id: '3', name: 'Wait & Save', price: 50, description: 'Driver waits for you' },
];

export function CarDetailPage({ user, onLogout }: CarDetailPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);

  // Fetch Car Details
  const { data: car, isLoading } = useQuery({
    queryKey: ['car', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        ...data,
        pricePerDay: data.price_per_day,
        fuelType: data.fuel_type,
        images: data.images || [],
        features: data.features || []
      } as CarType;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} onLogout={onLogout} />
        <main className="flex-1 flex items-center justify-center">
          <CarLoader size="lg" label="Loading car details..." />
        </main>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} onLogout={onLogout} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Car not found</h1>
            <Button asChild>
              <Link to="/cars">Back to Cars</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const days = startDate && endDate ? differenceInDays(endDate, startDate) : 0;
  const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price * days, 0);
  const subtotal = car.pricePerDay * days;
  const total = subtotal + addonsTotal;

  const toggleAddon = (addon: Addon) => {
    setSelectedAddons((prev) =>
      prev.find((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  const handleBooking = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to make a booking.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: "Select dates",
        description: "Please select pickup and return dates.",
        variant: "destructive",
      });
      return;
    }

    // Navigate to booking confirmation
    navigate(`/booking/confirm`, {
      state: {
        car,
        startDate,
        endDate,
        addons: selectedAddons,
        total,
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} onLogout={onLogout} />

      <main className="flex-1 py-8 pt-32">
        <div className="container">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/cars">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Cars
            </Link>
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Car Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                {car.images[0] ? (
                  <img
                    src={car.images[0]}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200" />
                )}
                <Badge
                  className={cn(
                    "absolute top-4 right-4",
                    car.status === 'available' && "bg-success text-success-foreground"
                  )}
                >
                  {car.status}
                </Badge>
              </div>

              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-muted-foreground">{car.brand}</p>
                    <h1 className="text-3xl font-bold">{car.model}</h1>
                    <p className="text-muted-foreground">{car.year}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="h-5 w-5 fill-secondary text-secondary" />
                      <span className="font-semibold text-lg">{car.rating}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Based on 124 reviews</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{car.seats} Seats</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
                    <Fuel className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm capitalize">{car.fuelType}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm capitalize">{car.transmission}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted capitalize">
                    <span className="text-sm">{car.type}</span>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="font-semibold text-lg mb-4">Features</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {car.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-success" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Book This Car</span>
                    <span className="text-2xl">
                      ₹{car.pricePerDay}
                      <span className="text-sm text-muted-foreground font-normal">/day</span>
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Date Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Pickup Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {startDate ? format(startDate, 'PP') : 'Select'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={(date) => {
                              setStartDate(date);
                              if (date && (!endDate || endDate <= date)) {
                                setEndDate(addDays(date, 1));
                              }
                            }}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Return Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {endDate ? format(endDate, 'PP') : 'Select'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            disabled={(date) => date <= (startDate || new Date())}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <Separator />

                  {/* Add-ons */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Optional Add-ons</h4>
                    {mockAddons.map((addon) => (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddon(addon)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                          selectedAddons.find((a) => a.id === addon.id)
                            ? "border-secondary bg-secondary/5"
                            : "border-border hover:border-secondary/50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "h-5 w-5 rounded border flex items-center justify-center transition-colors",
                              selectedAddons.find((a) => a.id === addon.id)
                                ? "bg-secondary border-secondary"
                                : "border-muted-foreground"
                            )}
                          >
                            {selectedAddons.find((a) => a.id === addon.id) && (
                              <Check className="h-3 w-3 text-secondary-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{addon.name}</p>
                            <p className="text-xs text-muted-foreground">{addon.description}</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium">₹{addon.price}/day</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Price Summary */}
                  {days > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          ₹{car.pricePerDay} × {days} days
                        </span>
                        <span>₹{subtotal}</span>
                      </div>
                      {addonsTotal > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Add-ons</span>
                          <span>₹{addonsTotal}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>₹{total}</span>
                      </div>
                    </div>
                  )}

                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full"
                    onClick={handleBooking}
                    disabled={car.status !== 'available'}
                  >
                    {car.status === 'available' ? (
                      <>
                        Book Now
                        <ArrowRight className="h-4 w-4" />
                      </>
                    ) : (
                      'Currently Unavailable'
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Free cancellation
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      24/7 support
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
