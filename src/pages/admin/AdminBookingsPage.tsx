import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CarLoader } from '@/components/CarLoader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Car, Search, MoreVertical, CheckCircle, XCircle,
  Eye
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { Booking } from '@/types';

interface AdminBookingsPageProps {
  user?: { name: string; role: 'customer' | 'admin' } | null;
  onLogout?: () => void;
}

export function AdminBookingsPage({ user, onLogout }: AdminBookingsPageProps) {
  const queryClient = useQueryClient();
  // const [sidebarOpen, setSidebarOpen] = useState(true); // Removing sidebar state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Dialog State
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [bookingToReject, setBookingToReject] = useState<string | null>(null);

  // Fetch Bookings
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          car:cars(*),
          user:profiles(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match Booking type (mapped from snake_case)
      return data.map((booking: any) => ({
        id: booking.id,
        carId: booking.car_id,
        userId: booking.user_id,
        startDate: booking.start_date,
        endDate: booking.end_date,
        totalPrice: booking.total_price,
        status: booking.status,
        cancellationReason: booking.cancellation_reason,
        car: {
          ...booking.car,
          pricePerDay: booking.car.price_per_day,
          fuelType: booking.car.fuel_type,
          images: booking.car.images || [],
          features: booking.car.features || []
        },
        user: {
          id: booking.user.id,
          name: booking.user.full_name,
          email: booking.user.email,
          role: booking.user.role,
          phone: booking.user.phone,
        }
      }));
    }
  });

  // Update Booking Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: 'confirmed' | 'cancelled', reason?: string }) => {
      const updateData: any = { status };
      if (reason) {
        updateData.cancellation_reason = reason;
      }

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });

      const actionText = variables.status === 'confirmed' ? 'approved' : 'rejected';
      const emailText = variables.status === 'confirmed' ? 'Confirmation email sent to user.' : 'Rejection notification sent.';

      toast({
        title: `Booking ${actionText}`,
        description: `Booking has been ${actionText}. ${emailText}`,
        variant: variables.status === 'cancelled' ? 'destructive' : 'default',
      });

      setRejectDialogOpen(false);
      setRejectionReason('');
      setBookingToReject(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error updating booking",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const filteredBookings = bookings.filter((booking: any) => {
    if (statusFilter !== 'all' && booking.status !== statusFilter) return false;

    // Search query check (ID, User name, or Car Model)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        booking.id.toLowerCase().includes(query) ||
        booking.user?.name?.toLowerCase().includes(query) ||
        booking.car?.model?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const statusColors: Record<string, string> = {
    pending: 'bg-warning/10 text-warning border-warning/20',
    confirmed: 'bg-success/10 text-success border-success/20',
    active: 'bg-primary/10 text-primary border-primary/20',
    completed: 'bg-muted text-muted-foreground border-muted',
    cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  const handleApprove = (bookingId: string) => {
    updateStatusMutation.mutate({ id: bookingId, status: 'confirmed' });
  };

  const initiateReject = (bookingId: string) => {
    setBookingToReject(bookingId);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const confirmReject = () => {
    if (!bookingToReject) return;
    if (!rejectionReason.trim()) {
      toast({ title: "Reason Required", description: "Please enter a reason for cancellation", variant: "destructive" });
      return;
    }
    updateStatusMutation.mutate({ id: bookingToReject, status: 'cancelled', reason: rejectionReason });
  };

  return (
    <AdminLayout
      title="Booking Management"
      subtitle={`${bookings.length} total bookings`}
      user={user}
      onLogout={onLogout}
    >
      <Card className="border-border/50 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <CardTitle>All Bookings</CardTitle>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-background/50 border-input/50 focus:bg-background transition-colors">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookings..."
                  className="pl-9 bg-background/50 border-input/50 focus:bg-background transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-primary/20">
                <TableHead>Booking ID</TableHead>
                <TableHead>Car</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12">
                    <CarLoader size="md" label="Loading bookings..." className="mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No bookings found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking: any) => (
                  <TableRow key={booking.id} className="hover:bg-primary/5 border-border/50">
                    <TableCell className="font-mono text-sm">
                      #{booking.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 rounded bg-muted overflow-hidden">
                          {booking.car?.images?.[0] ? (
                            <img
                              src={booking.car.images[0]}
                              alt={booking.car.model}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-200" />
                          )}
                        </div>
                        <span className="text-sm">{booking.car?.brand} {booking.car?.model}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{booking.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{booking.user?.email}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{format(new Date(booking.startDate), 'PP')}</p>
                      <p className="text-xs text-muted-foreground">
                        to {format(new Date(booking.endDate), 'PP')}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("capitalize", statusColors[booking.status])}
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">₹{booking.totalPrice}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedBooking(booking);
                            setViewDialogOpen(true);
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {booking.status === 'pending' && (
                            <>
                              <DropdownMenuItem onClick={() => handleApprove(booking.id)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => initiateReject(booking.id)}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
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

      {/* Booking Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>ID: {selectedBooking?.id}</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-14 rounded bg-muted overflow-hidden">
                  <img src={selectedBooking.car.images[0]} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold">{selectedBooking.car.brand} {selectedBooking.car.model}</p>
                  <p className="text-sm text-muted-foreground">{selectedBooking.car.type}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedBooking.user.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedBooking.user.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Price</p>
                  <p className="font-medium">₹{selectedBooking.totalPrice}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Start Date</p>
                  <p className="font-medium">{format(new Date(selectedBooking.startDate), 'PP')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">End Date</p>
                  <p className="font-medium">{format(new Date(selectedBooking.endDate), 'PP')}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant="outline" className={cn("capitalize mt-1", statusColors[selectedBooking.status])}>
                    {selectedBooking.status}
                  </Badge>
                </div>
                {selectedBooking.cancellationReason && (
                  <div className="col-span-2 bg-destructive/10 p-2 rounded text-destructive text-sm">
                    <p className="font-semibold">Cancellation Reason:</p>
                    <p>{selectedBooking.cancellationReason}</p>
                  </div>
                )}
              </div>

              {selectedBooking.status === 'pending' && (
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="destructive" onClick={() => {
                    setViewDialogOpen(false);
                    initiateReject(selectedBooking.id);
                  }}>Reject</Button>
                  <Button onClick={() => {
                    handleApprove(selectedBooking.id);
                    setViewDialogOpen(false);
                  }}>Approve</Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Booking</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this booking. This will be visible to the user.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason (e.g. Car undefined, Maintenance required)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmReject}>Confirm Rejection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
