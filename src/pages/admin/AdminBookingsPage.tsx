import { useState } from 'react';
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
  Eye, Calendar, User, CreditCard
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { CarLoader } from '@/components/CarLoader';

interface AdminBookingsPageProps {
  user?: { name: string; role: 'customer' | 'admin' } | null;
  onLogout?: () => void;
}

export function AdminBookingsPage({ user, onLogout }: AdminBookingsPageProps) {
  const queryClient = useQueryClient();
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
    pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    confirmed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    active: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    completed: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    cancelled: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
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
      subtitle={`${bookings.length} reservations`}
      user={user}
      onLogout={onLogout}
    >
      <div className="space-y-6 animate-fade-up">

        <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex gap-3 flex-1">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search bookings..."
                className="pl-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <SelectValue placeholder="Status" />
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
          </div>
        </div>

        {/* Mobile Grid */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {isLoading ? (
            <CarLoader size="md" label="Loading bookings..." className="mx-auto my-12" />
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-950 rounded-xl border border-dashed border-slate-300">
              No bookings found.
            </div>
          ) : (
            filteredBookings.map((booking: any) => (
              <div key={booking.id} className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-500">
                      {booking.user?.name?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{booking.user?.name}</h4>
                      <p className="text-xs text-slate-500">#{booking.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setSelectedBooking(booking); setViewDialogOpen(true); }}>
                        View Details
                      </DropdownMenuItem>
                      {booking.status === 'pending' && (
                        <>
                          <DropdownMenuItem onClick={() => handleApprove(booking.id)}><CheckCircle className="h-4 w-4 mr-2" />Approve</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => initiateReject(booking.id)}><XCircle className="h-4 w-4 mr-2" />Reject</DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium">{booking.car?.brand} {booking.car?.model}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-bold">₹{booking.totalPrice}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(booking.startDate), 'MMM dd')} - {format(new Date(booking.endDate), 'MMM dd')}
                  </div>
                  <Badge variant="outline" className={cn("capitalize", statusColors[booking.status])}>
                    {booking.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table */}
        <Card className="hidden md:block border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Car Detail</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Trip Dates</TableHead>
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
                    <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                      No bookings found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking: any) => (
                    <TableRow key={booking.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 border-slate-200 dark:border-slate-800 transition-colors">
                      <TableCell className="font-mono text-xs text-slate-500">
                        #{booking.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-9 rounded bg-slate-100 overflow-hidden shrink-0">
                            {booking.car?.images?.[0] ? (
                              <img src={booking.car.images[0]} alt={booking.car.model} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400"><Car className="w-4 h-4" /></div>
                            )}
                          </div>
                          <span className="text-sm font-medium">{booking.car?.brand} {booking.car?.model}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                            {booking.user?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm">{booking.user?.name || 'Unknown'}</p>
                            <p className="text-[10px] text-slate-400">{booking.user?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm flex flex-col">
                          <span className="font-medium">{format(new Date(booking.startDate), 'MMM dd')}</span>
                          <span className="text-xs text-slate-400">to {format(new Date(booking.endDate), 'MMM dd')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("capitalize font-medium border-0 ring-1 ring-inset", statusColors[booking.status])}
                        >
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-slate-700">₹{booking.totalPrice}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-slate-100">
                              <MoreVertical className="h-4 w-4 text-slate-400" />
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
                                <DropdownMenuItem className="text-emerald-600 focus:text-emerald-700" onClick={() => handleApprove(booking.id)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
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
          </div>
        </Card>

        {/* Booking Details Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
              <DialogDescription>Transaction ID: #{selectedBooking?.id}</DialogDescription>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-6 pt-4">
                <div className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <div className="w-24 h-16 rounded-lg bg-white overflow-hidden shadow-sm shrink-0">
                    <img src={selectedBooking.car.images[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{selectedBooking.car.brand} {selectedBooking.car.model}</h4>
                    <p className="text-sm text-slate-500">{selectedBooking.car.type}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase font-semibold">Customer</label>
                    <p className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400" /> {selectedBooking.user.name}
                    </p>
                    <p className="text-xs text-slate-400 pl-6">{selectedBooking.user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase font-semibold">Total Amount</label>
                    <p className="font-bold text-lg text-emerald-600">₹{selectedBooking.totalPrice}</p>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs text-slate-400 uppercase font-semibold">Trip Duration</label>
                    <div className="flex items-center gap-4 p-3 border border-slate-100 rounded-lg">
                      <div className="text-center">
                        <p className="text-xs text-slate-400">Start</p>
                        <p className="font-medium">{format(new Date(selectedBooking.startDate), 'MMM dd, yyyy')}</p>
                      </div>
                      <div className="flex-1 h-[1px] bg-slate-200 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-slate-400">to</div>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-400">End</p>
                        <p className="font-medium">{format(new Date(selectedBooking.endDate), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant="outline" className={cn("capitalize px-3 py-1", statusColors[selectedBooking.status])}>
                    {selectedBooking.status}
                  </Badge>
                </div>

                {selectedBooking.cancellationReason && (
                  <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg text-rose-700 text-sm">
                    <p className="font-bold flex items-center gap-2"><XCircle className="h-4 w-4" /> Cancellation Reason</p>
                    <p className="mt-1 opacity-90">{selectedBooking.cancellationReason}</p>
                  </div>
                )}


                {selectedBooking.status === 'pending' && (
                  <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    <Button variant="outline" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200" onClick={() => {
                      setViewDialogOpen(false);
                      initiateReject(selectedBooking.id);
                    }}>Reject</Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => {
                      handleApprove(selectedBooking.id);
                      setViewDialogOpen(false);
                    }}>Approve Request</Button>
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
              <DialogDescription>Please provide a reason for rejecting this booking.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="e.g. Car is currently in maintenance..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="resize-none"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmReject}>Confirm Rejection</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </AdminLayout>
  );
}
