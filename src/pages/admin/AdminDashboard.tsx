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
  MoreVertical, Plus, TrendingUp, TrendingDown,
  Activity, ArrowRight
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
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-amber-400 to-orange-500',
      shadow: 'shadow-amber-500/20'
    },
    {
      title: 'Active Bookings',
      value: stats?.activeBookings.toString() || '0',
      change: '+4.3%',
      trend: 'up',
      icon: Calendar,
      color: 'from-emerald-400 to-green-500',
      shadow: 'shadow-emerald-500/20'
    },
    {
      title: 'Total Cars',
      value: stats?.cars.toString() || '0',
      change: '-2.1%',
      trend: 'down',
      icon: Car,
      color: 'from-blue-400 to-indigo-500',
      shadow: 'shadow-indigo-500/20'
    },
    {
      title: 'Total Customers',
      value: stats?.users.toString() || '0',
      change: '+8.2%',
      trend: 'up',
      icon: Users,
      color: 'from-purple-400 to-pink-500',
      shadow: 'shadow-pink-500/20'
    },
  ];

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    confirmed: 'bg-green-500/10 text-green-500 border-green-500/20',
    active: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    completed: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  return (
    <AdminLayout
      user={user}
      onLogout={onLogout}
      title="Dashboard"
      subtitle={`Welcome back, ${user?.name}`}
      actions={
        <Button variant="default" asChild className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/25 transition-all text-white border-0">
          <Link to="/admin/cars/new">
            <Plus className="h-4 w-4 mr-2" />
            Add New Car
          </Link>
        </Button>
      }
    >
      <div className="space-y-8 animate-fade-up">
        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat, i) => (
            <div
              key={stat.title}
              className="group relative bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm custom-hover-effect overflow-hidden"
            >
              <div className={cn("absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500")}>
                <stat.icon className={cn("w-24 h-24 text-black dark:text-white")} />
              </div>

              <div className="relative">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br text-white shadow-lg mb-4", stat.color, stat.shadow)}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</h3>
                <div className="flex items-center gap-2 mt-2">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-rose-500" />
                  )}
                  <span className={cn("text-xs font-semibold", stat.trend === 'up' ? "text-emerald-500" : "text-rose-500")}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-slate-400">vs last month</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Bookings - Takes 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                Recent Bookings
              </h3>
              <Button variant="link" size="sm" asChild className="text-indigo-500 hover:text-indigo-600 p-0">
                <Link to="/admin/bookings" className="flex items-center gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                    <TableRow>
                      <TableHead>Car Detail</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBookings.map((booking: any) => (
                      <TableRow key={booking.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                        <TableCell>
                          <div className="font-medium text-slate-900 dark:text-slate-100">{booking.car?.brand} {booking.car?.model}</div>
                          <div className="text-xs text-slate-500">{format(new Date(booking.start_date), 'MMM dd')} - {format(new Date(booking.end_date), 'MMM dd')}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                              {booking.user?.full_name?.charAt(0)}
                            </div>
                            <span className="text-sm">{booking.user?.full_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("capitalize font-medium", statusColors[booking.status])}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-slate-900 dark:text-slate-100">
                          ₹{booking.total_price}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {recentBookings.length === 0 && (
                <div className="p-8 text-center text-slate-500">No bookings yet.</div>
              )}
            </div>
          </div>

          {/* Recent Cars - Takes 1 col */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Car className="w-5 h-5 text-purple-500" />
                New Arrivals
              </h3>
              <Button variant="link" size="sm" asChild className="text-purple-500 hover:text-purple-600 p-0">
                <Link to="/admin/cars" className="flex items-center gap-1">
                  Manage <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="space-y-4">
              {recentCars.map((car: any) => (
                <div key={car.id} className="group flex items-center gap-4 p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500/30 transition-all hover:shadow-md">
                  <div className="w-16 h-12 rounded-lg bg-slate-100 dark:bg-slate-900 overflow-hidden relative">
                    {car.images?.[0] ? (
                      <img
                        src={car.images[0]}
                        alt={car.model}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Car className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{car.brand} {car.model}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px] px-1.5 h-5">
                        {car.type}
                      </Badge>
                      <span className="text-xs text-slate-500">₹{car.price_per_day}/day</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4 text-slate-400" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
