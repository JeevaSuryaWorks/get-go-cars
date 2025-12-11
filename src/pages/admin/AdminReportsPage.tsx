import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Car, LogOut, LayoutDashboard,
    CarFront, ClipboardList, UserCog, BarChart3, Menu,
    DollarSign, TrendingUp, Calendar, Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subMonths } from 'date-fns';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { AdminLayout } from '@/components/admin/AdminLayout';

interface AdminReportsPageProps {
    user?: { name: string; role: 'customer' | 'admin' } | null;
    onLogout?: () => void;
}

export function AdminReportsPage({ user, onLogout }: AdminReportsPageProps) {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const sidebarLinks = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: CarFront, label: 'Cars', path: '/admin/cars' },
        { icon: ClipboardList, label: 'Bookings', path: '/admin/bookings' },
        { icon: UserCog, label: 'Users', path: '/admin/users' },
        { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
    ];

    const isActive = (path: string) => location.pathname === path;

    // Fetch Payment Stats (Revenue)
    const { data: revenueData = [] } = useQuery({
        queryKey: ['admin-reports-revenue'],
        queryFn: async () => {
            // Mocking monthly aggregation for now as Supabase aggregation requires RPCS or raw SQL usually
            // Using raw data to aggregate in JS for simplicity
            const { data, error } = await supabase
                .from('payments')
                .select('amount, created_at')
                .eq('status', 'succeeded')
                .gte('created_at', subMonths(new Date(), 6).toISOString());

            if (error) throw error;

            const monthlyStats: Record<string, number> = {};
            data?.forEach((payment: any) => {
                const month = format(new Date(payment.created_at), 'MMM yyyy');
                monthlyStats[month] = (monthlyStats[month] || 0) + Number(payment.amount);
            });

            // Fill in last 6 months even if empty
            const result = [];
            for (let i = 5; i >= 0; i--) {
                const date = subMonths(new Date(), i);
                const key = format(date, 'MMM yyyy');
                result.push({
                    name: key,
                    total: monthlyStats[key] || 0
                });
            }
            return result;
        }
    });

    // Fetch Booking Status Distribution
    const { data: bookingStats = [] } = useQuery({
        queryKey: ['admin-reports-bookings'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('bookings')
                .select('status');

            if (error) throw error;

            const stats: Record<string, number> = {};
            data?.forEach((b: any) => {
                stats[b.status] = (stats[b.status] || 0) + 1;
            });

            return Object.entries(stats).map(([name, value]) => ({ name, value }));
        }
    });

    const handleExportCSV = () => {
        const headers = ['Month', 'Revenue', 'Bookings', 'Status'];
        const rows = revenueData.map((data, index) => {
            const bookingCount = bookingStats.reduce((acc, curr) => acc + curr.value, 0); // Simplified for demo as we don't have monthly booking count in this state
            // In real app, we'd map monthly stats accurately.
            return [data.name, data.total, 'N/A', 'N/A'];
        });

        // Add booking status summary to CSV
        rows.push(['---', '---', '---', '---']);
        bookingStats.forEach(stat => {
            rows.push(['Booking Status', stat.name, stat.value, '']);
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(e => e.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `reports_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AdminLayout
            user={user}
            onLogout={onLogout}
            title="Reports & Analytics"
            subtitle="Overview of business performance"
            actions={
                <Button variant="outline" onClick={handleExportCSV} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export CSV
                </Button>
            }
        >
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-none shadow-card hover:shadow-lg transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ₹{revenueData.reduce((acc, curr) => acc + curr.total, 0).toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Lifetime earnings
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-card hover:shadow-lg transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {bookingStats.reduce((acc, curr) => acc + curr.value, 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                All time bookings
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-card hover:shadow-lg transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Growth</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold font-mono text-emerald-500">+12.5%</div>
                            <p className="text-xs text-muted-foreground">
                                From last month
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4 border-none shadow-card">
                        <CardHeader>
                            <CardTitle>Revenue Overview</CardTitle>
                            <CardDescription>Monthly revenue for the last 6 months</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={revenueData}>
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `₹${value}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px' }}
                                        formatter={(value) => [`₹${value}`, 'Revenue']}
                                    />
                                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="col-span-3 border-none shadow-card">
                        <CardHeader>
                            <CardTitle>Booking Status</CardTitle>
                            <CardDescription>Distribution of booking statuses</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {bookingStats.map((stat) => (
                                    <div key={stat.name} className="flex items-center">
                                        <div className="w-full space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium leading-none capitalize">{stat.name}</p>
                                                <span className="text-sm text-muted-foreground">{stat.value}</span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-secondary/20">
                                                <div
                                                    className="h-full rounded-full bg-primary"
                                                    style={{ width: `${(stat.value / bookingStats.reduce((acc, curr) => acc + curr.value, 0)) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
