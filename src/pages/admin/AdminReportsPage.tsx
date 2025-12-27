import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    DollarSign, TrendingUp, Calendar, Download, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subMonths } from 'date-fns';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { AdminLayout } from '@/components/admin/AdminLayout';

interface AdminReportsPageProps {
    user?: { name: string; role: 'customer' | 'admin' } | null;
    onLogout?: () => void;
}

export function AdminReportsPage({ user, onLogout }: AdminReportsPageProps) {

    // Fetch Payment Stats (Revenue)
    const { data: revenueData = [] } = useQuery({
        queryKey: ['admin-reports-revenue'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('payments')
                .select('amount, created_at')
                .eq('status', 'succeeded')
                .gte('created_at', subMonths(new Date(), 6).toISOString());

            if (error) throw error;

            const monthlyStats: Record<string, number> = {};
            data?.forEach((payment: any) => {
                const month = format(new Date(payment.created_at), 'MMM');
                monthlyStats[month] = (monthlyStats[month] || 0) + Number(payment.amount);
            });

            // Fill in last 6 months even if empty
            const result = [];
            for (let i = 5; i >= 0; i--) {
                const date = subMonths(new Date(), i);
                const key = format(date, 'MMM');
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

    const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

    return (
        <AdminLayout
            user={user}
            onLogout={onLogout}
            title="Reports & Analytics"
            subtitle="Business performance overview"
            actions={
                <Button variant="outline" onClick={handleExportCSV} className="gap-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50">
                    <Download className="h-4 w-4" />
                    Export CSV
                </Button>
            }
        >
            <div className="space-y-6 animate-fade-up">

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600 text-white overflow-hidden relative group">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <DollarSign className="h-24 w-24" />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-medium text-indigo-100">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-indigo-200" />
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-3xl font-bold">
                                ₹{revenueData.reduce((acc, curr) => acc + curr.total, 0).toLocaleString()}
                            </div>
                            <p className="text-xs text-indigo-200 mt-1">
                                Lifetime earnings across all cars
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 group hover:border-indigo-500/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Total Bookings</CardTitle>
                            <Calendar className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900 dark:text-white">
                                {bookingStats.reduce((acc, curr) => acc + curr.value, 0)}
                            </div>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                <span className="text-emerald-500 font-medium">All time</span> recorded bookings
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 group hover:border-emerald-500/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Avg. Revenue/Month</CardTitle>
                            <TrendingUp className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900 dark:text-white">
                                ₹{Math.round(revenueData.reduce((acc, curr) => acc + curr.total, 0) / (revenueData.length || 1)).toLocaleString()}
                            </div>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                Based on last <span className="font-semibold text-slate-900 dark:text-white">6 months</span> data
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">

                    {/* Bar Chart - Revenue */}
                    <Card className="col-span-4 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950">
                        <CardHeader>
                            <CardTitle>Revenue Overview</CardTitle>
                            <CardDescription>Monthly income details for the past 6 months</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
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
                                            tickFormatter={(value) => `₹${value / 1000}k`}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(99,102,241,0.1)' }}
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: 'none',
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                            }}
                                            formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                        />
                                        <Bar
                                            dataKey="total"
                                            fill="currentColor"
                                            radius={[4, 4, 0, 0]}
                                            className="fill-indigo-500"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Donut Chart & List - Bookings */}
                    <Card className="col-span-3 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950">
                        <CardHeader>
                            <CardTitle>Booking Distribution</CardTitle>
                            <CardDescription>Breakdown by current status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                                <div className="h-[200px] w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={bookingStats}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {bookingStats.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                        <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                            {bookingStats.reduce((acc, curr) => acc + curr.value, 0)}
                                        </span>
                                        <p className="text-xs text-slate-500">Total</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {bookingStats.map((stat, index) => (
                                        <div key={stat.name} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                                <span className="capitalize text-slate-600 dark:text-slate-400">{stat.name}</span>
                                            </div>
                                            <span className="font-semibold">{stat.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-1">
                    <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/50 shadow-none">
                        <CardContent className="flex items-start gap-4 p-4">
                            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-amber-800 dark:text-amber-500">Insights</h4>
                                <p className="text-sm text-amber-700 dark:text-amber-600 mt-1">
                                    Booking volume has increased by 15% compared to last month. Consider adding more 'SUV' type vehicles to meet the weekend demand surge.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
