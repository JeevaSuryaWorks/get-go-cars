import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar, Clock, ChevronRight, Car as CarIcon,
  Phone, MessageCircle, Mail, Printer, Share2, Star, MapPin, AlertCircle, Info, XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Booking } from '@/types';
import { ReceiptDialog } from '@/components/ReceiptDialog';
import { RatingDialog } from '@/components/RatingDialog';
import { toast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';

interface BookingsPageProps {
  user?: { name: string; role: 'customer' | 'admin' } | null;
  onLogout?: () => void;
}

export function BookingsPage({ user, onLogout }: BookingsPageProps) {
  const [activeTab, setActiveTab] = useState('all');
  const queryClient = useQueryClient();

  // Fetch User Bookings
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('bookings')
        .select(`
            *,
            car:cars(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((booking: any) => ({
        id: booking.id,
        carId: booking.car_id,
        userId: booking.user_id,
        startDate: booking.start_date,
        endDate: booking.end_date,
        totalPrice: booking.total_price,
        status: booking.status,
        rating: booking.rating,
        cancellationReason: booking.cancellation_reason,
        car: {
          ...booking.car,
          pricePerDay: booking.car.price_per_day,
          fuelType: booking.car.fuel_type,
          images: booking.car.images || [],
          features: booking.car.features || []
        },
        user: {
          name: user.user_metadata?.full_name || 'User',
          email: user.email
        }
      }));
    },
    enabled: !!user
  });

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-warning/10 text-warning border-warning/20',
    confirmed: 'bg-success/10 text-success border-success/20',
    active: 'bg-primary/10 text-primary border-primary/20',
    completed: 'bg-muted text-muted-foreground border-muted',
    cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  const filteredBookings = bookings.filter((booking: any) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') return ['pending', 'confirmed'].includes(booking.status);
    if (activeTab === 'active') return booking.status === 'active';
    if (activeTab === 'completed') return booking.status === 'completed';
    return true;
  });

  const handleShare = async (booking: any) => {
    if (booking.status !== 'confirmed' && booking.status !== 'completed' && booking.status !== 'active') return;

    const shareData = {
      title: 'DriveYoo Booking',
      text: `Check out my ride: ${booking.car.brand} ${booking.car.model}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`Booking Ref: ${booking.id}`);
        toast({ title: "Copied to clipboard", description: "Booking reference copied." });
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const supportLinks = {
    phone: "tel:+917604865437",
    whatsapp: "https://wa.me/917604865437",
    email: "mailto:support@driveyoo.com"
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} onLogout={onLogout} />

      <main className="flex-1 py-12 pt-32 bg-muted/30">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
            <p className="text-muted-foreground">View and manage your car rentals</p>
          </div>

          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-6">
              {isLoading ? (
                <div className="py-16 text-center text-muted-foreground">Loading your bookings...</div>
              ) : filteredBookings.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <CarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No bookings found</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't made any bookings yet.
                    </p>
                    <Button variant="secondary" asChild>
                      <Link to="/cars">Browse Cars</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredBookings.map((booking: any) => {
                  const isActionEnabled = booking.status === 'confirmed' || booking.status === 'active' || booking.status === 'completed';
                  const disabledClass = !isActionEnabled ? "opacity-30 pointer-events-none grayscale" : "";

                  return (
                    <Card key={booking.id} className="hover:shadow-card-hover transition-shadow overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          {/* Image Section */}
                          <div className="w-full md:w-64 h-48 bg-muted relative">
                            {booking.car?.images?.[0] ? (
                              <img
                                src={booking.car.images[0]}
                                alt={booking.car.model}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-200" />
                            )}
                            <div className="absolute top-2 left-2">
                              <Badge variant="secondary" className="bg-background/90 text-foreground backdrop-blur-sm">
                                {booking.car?.brand}
                              </Badge>
                            </div>
                          </div>

                          {/* Info Section */}
                          <div className="flex-1 p-6 flex flex-col justify-between">
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-xl font-bold">
                                    {booking.car?.model}
                                  </h3>
                                  <Badge
                                    variant="outline"
                                    className={cn("capitalize ml-2", statusColors[booking.status])}
                                  >
                                    {booking.status}
                                  </Badge>
                                  {booking.status === 'cancelled' && booking.cancellationReason && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Info className="h-4 w-4 ml-2 text-destructive cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-destructive text-destructive-foreground">
                                          <p>Reason: {booking.cancellationReason}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                  {booking.rating && (
                                    <div className="flex items-center ml-2 text-yellow-500">
                                      <Star className="h-4 w-4 fill-current" />
                                      <span className="ml-1 text-sm font-medium">{booking.rating}</span>
                                    </div>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground font-mono">
                                  REF: {booking.id}
                                </p>
                                {booking.status === 'cancelled' && booking.cancellationReason && (
                                  <div className="mt-2 text-xs text-destructive bg-destructive/10 p-1.5 rounded inline-block">
                                    Reason: {booking.cancellationReason}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">Total</p>
                                <p className="text-2xl font-bold">₹{booking.totalPrice}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                              <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                                <div className="text-sm">
                                  <p className="font-medium">{format(new Date(booking.startDate), 'MMM dd, yyyy')} - {format(new Date(booking.endDate), 'MMM dd, yyyy')}</p>
                                  <p className="text-muted-foreground text-xs">Duration: {Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24))} Days</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                                <div className="text-sm">
                                  <p className="font-medium">Pickup & Drop</p>
                                  <p className="text-muted-foreground text-xs">JS Corp HQ, Chennai</p>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 pt-4 border-t border-border mt-auto">
                              <a href={isActionEnabled ? supportLinks.phone : undefined} className={cn("flex flex-col items-center gap-1 p-2 rounded hover:bg-muted transition-colors text-center", disabledClass)}>
                                <Phone className="h-5 w-5 text-primary" />
                                <span className="text-[10px] font-medium">Call</span>
                              </a>
                              <a href={isActionEnabled ? supportLinks.whatsapp : undefined} target="_blank" rel="noopener noreferrer" className={cn("flex flex-col items-center gap-1 p-2 rounded hover:bg-muted transition-colors text-center", disabledClass)}>
                                <MessageCircle className="h-5 w-5 text-green-600" />
                                <span className="text-[10px] font-medium">WhatsApp</span>
                              </a>
                              <a href={isActionEnabled ? supportLinks.email : undefined} className={cn("flex flex-col items-center gap-1 p-2 rounded hover:bg-muted transition-colors text-center", disabledClass)}>
                                <Mail className="h-5 w-5 text-blue-500" />
                                <span className="text-[10px] font-medium">Email</span>
                              </a>

                              <div className={cn("contents", disabledClass)}>
                                <ReceiptDialog booking={booking}>
                                  <button className="flex flex-col items-center gap-1 p-2 rounded hover:bg-muted transition-colors text-center">
                                    <Printer className="h-5 w-5 text-gray-700" />
                                    <span className="text-[10px] font-medium">Print</span>
                                  </button>
                                </ReceiptDialog>
                              </div>

                              <button onClick={() => handleShare(booking)} className={cn("flex flex-col items-center gap-1 p-2 rounded hover:bg-muted transition-colors text-center", disabledClass)}>
                                <Share2 className="h-5 w-5 text-purple-600" />
                                <span className="text-[10px] font-medium">Share</span>
                              </button>

                              <div className={cn("contents", disabledClass)}>
                                <RatingDialog
                                  bookingId={booking.id}
                                  onRatingSubmit={() => queryClient.invalidateQueries({ queryKey: ['my-bookings'] })}
                                  trigger={
                                    <button className="flex flex-col items-center gap-1 p-2 rounded hover:bg-muted transition-colors text-center">
                                      <Star className={cn("h-5 w-5", booking.rating ? "text-yellow-500 fill-yellow-500" : "text-yellow-500")} />
                                      <span className="text-[10px] font-medium">{booking.rating ? "Rated" : "Rate"}</span>
                                    </button>
                                  }
                                />
                              </div>

                              {/* Cancel Button - Only for Pending/Confirmed */}
                              {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <button className="flex flex-col items-center gap-1 p-2 rounded hover:bg-red-50 text-destructive transition-colors text-center">
                                      <XCircle className="h-5 w-5" />
                                      <span className="text-[10px] font-medium">Cancel</span>
                                    </button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Cancel Booking?</DialogTitle>
                                      <DialogDescription>
                                        To cancel this booking and request a refund, please contact our support team directly via email.
                                        Clicking the button below will open your email client.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                      <Button asChild variant="destructive">
                                        <a href={`mailto:support@driveyoo.com?subject=Cancellation Request - Booking ${booking.id}&body=I would like to request a cancellation for my booking (ID: ${booking.id}) for the ${booking.car.brand} ${booking.car.model}. Please process my refund.`}>
                                          Email Support Team
                                        </a>
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
