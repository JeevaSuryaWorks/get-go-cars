import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
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
  Car, Users, Calendar, DollarSign,
  MoreVertical, Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { AdminLayout } from '@/components/admin/AdminLayout';

interface AdminDashboardProps {
  user?: { name: string; role: 'customer' | 'admin' } | null;
  onLogout?: () => void;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {


  // Fetch Dashboard Stats
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [
        { count: carCount },
        { count: userCount },
        { count: bookingCount },
        { data: revenueData }
      ] = await Promise.all([
        supabase.from('cars').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('payments').select('amount').eq('status', 'succeeded')
      ]);

      const totalRevenue = revenueData?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;

      return {
        cars: carCount || 0,
        users: userCount || 0,
        activeBookings: bookingCount || 0,
        revenue: totalRevenue
      };
    }
  });

  // Fetch Recent Bookings
  const { data: recentBookings = [] } = useQuery({
    queryKey: ['admin-recent-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          car:cars(brand, model),
          user:profiles(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    }
  });

  // Fetch Recent Cars
  const { data: recentCars = [] } = useQuery({
    queryKey: ['admin-recent-cars'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    }
  });

  const dashboardStats = [
    {
      title: 'Total Revenue',
      value: `₹${stats?.revenue.toLocaleString() || '0'}`,
      change: '+12.5%', // Calculate real change if needed
      icon: DollarSign,
      color: 'bg-success/10 text-success'
    },
    {
      title: 'Active Bookings',
      value: stats?.activeBookings.toString() || '0',
      change: '+4.3%',
      icon: Calendar,
      color: 'bg-primary/10 text-primary'
    },
    {
      title: 'Total Cars',
      value: stats?.cars.toString() || '0',
      change: '-2.1%',
      icon: Car,
      color: 'bg-secondary/10 text-secondary'
    },
    {
      title: 'Total Customers',
      value: stats?.users.toString() || '0',
      change: '+8.2%',
      icon: Users,
      color: 'bg-warning/10 text-warning'
    },
  ];



  const statusColors: Record<string, string> = {
    pending: 'bg-warning/10 text-warning',
    confirmed: 'bg-success/10 text-success',
    active: 'bg-primary/10 text-primary',
    completed: 'bg-muted text-muted-foreground',
    cancelled: 'bg-destructive/10 text-destructive',
  };

  return (
    <AdminLayout
      user={user}
      onLogout={onLogout}
      title="Dashboard"
      subtitle={`Welcome back, ${user?.name}`}
      actions={
        <Button variant="default" asChild className="bg-primary shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
          <Link to="/admin/cars/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Car
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardStats.map((stat, i) => (
            <Card key={stat.title} className="border-none shadow-card hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                    <p className={cn(
                      "text-xs mt-1 font-medium inline-flex items-center",
                      stat.change.startsWith('+') ? "text-emerald-500" : "text-rose-500"
                    )}>
                      {stat.change} <span className="text-muted-foreground/60 ml-1">from last month</span>
                    </p>
                  </div>
                  <div className={cn("p-4 rounded-xl shadow-inner", stat.color)}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <Card className="border-none shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Bookings</CardTitle>
              <Button variant="ghost" size="sm" asChild className="hover:bg-primary/5 text-primary">
                <Link to="/admin/bookings">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead>Booking</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBookings.map((booking: any) => (
                    <TableRow key={booking.id} className="hover:bg-muted/30 border-border/50">
                      <TableCell>
                        <div>
                          <p className="font-semibold text-foreground/80">{booking.car?.brand} {booking.car?.model}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(booking.start_date), 'PP')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn("font-medium", statusColors[booking.status])}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-foreground/80">
                        ₹{booking.total_price}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Fleet Overview */}
          <Card className="border-none shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Fleet Overview</CardTitle>
              <Button variant="ghost" size="sm" asChild className="hover:bg-primary/5 text-primary">
                <Link to="/admin/cars">Manage</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead>Car</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Price/Day</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCars.map((car: any) => (
                    <TableRow key={car.id} className="hover:bg-muted/30 border-border/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shadow-sm">
                            {car.images?.[0] ? (
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
                            <p className="font-semibold text-foreground/80">{car.brand}</p>
                            <p className="text-xs text-muted-foreground">{car.model}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize font-medium shadow-sm",
                            car.status === 'available' && "bg-emerald-500/10 text-emerald-600 border-emerald-200",
                            car.status === 'rented' && "bg-amber-500/10 text-amber-600 border-amber-200",
                            car.status === 'maintenance' && "bg-rose-500/10 text-rose-600 border-rose-200"
                          )}
                        >
                          {car.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground/80">₹{car.price_per_day}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-primary/5">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
