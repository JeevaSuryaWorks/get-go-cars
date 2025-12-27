import { useParams, Link } from 'react-router-dom';
import { CarLoader } from '@/components/CarLoader';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Star, Users, Fuel, Gauge,
    ChevronLeft, Check, Shield, Clock, ArrowRight,
    AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Car as CarType } from '@/types';
import { AdminLayout } from '@/components/admin/AdminLayout';

interface AdminCarDetailsPageProps {
    user?: { name: string; email: string; role: 'customer' | 'admin' } | null;
    onLogout?: () => void;
}

export function AdminCarDetailsPage({ user, onLogout }: AdminCarDetailsPageProps) {
    const { id } = useParams();

    // Fetch Car Details
    const { data: car, isLoading } = useQuery({
        queryKey: ['admin-car-preview', id],
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
            <AdminLayout user={user} onLogout={onLogout} title="Loading Car Details" subtitle="Please wait...">
                <div className="flex items-center justify-center h-[60vh]">
                    <CarLoader size="lg" label="Loading car preview..." />
                </div>
            </AdminLayout>
        );
    }

    if (!car) {
        return (
            <AdminLayout user={user} onLogout={onLogout} title="Car Not Found" subtitle="Error">
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                    <h1 className="text-2xl font-bold mb-2">Car not found</h1>
                    <p className="text-muted-foreground mb-4">The car you are trying to preview does not exist.</p>
                    <Button asChild>
                        <Link to="/admin/cars">Back to Fleet</Link>
                    </Button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout user={user} onLogout={onLogout} title="Car Preview" subtitle={car ? `${car.brand} ${car.model}` : 'Car Details'}>
            <div className="space-y-6">
                {/* Header / Nav */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link to="/admin/cars">
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Back to Fleet
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Live Preview</h1>
                            <p className="text-muted-foreground text-sm">Viewing car details as customers see them</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Read Only Mode
                        </Badge>
                    </div>
                </div>

                {/* Preview Content (Mirrors CarDetailPage) */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Car Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            {car.images[0] ? (
                                <img
                                    src={car.images[0]}
                                    alt={`${car.brand} ${car.model}`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">No Image Available</div>
                            )}
                            <Badge
                                className={cn(
                                    "absolute top-4 right-4",
                                    car.status === 'available' && "bg-emerald-500 hover:bg-emerald-600",
                                    car.status === 'rented' && "bg-amber-500 hover:bg-amber-600",
                                    car.status === 'maintenance' && "bg-rose-500 hover:bg-rose-600",
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
                                    <div className="flex items-center gap-1 mb-1 justify-end">
                                        <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                                        <span className="font-semibold text-lg">{car.rating}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Average Rating</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 mb-6">
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                                    <Users className="h-4 w-4 text-slate-500" />
                                    <span className="text-sm">{car.seats} Seats</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                                    <Fuel className="h-4 w-4 text-slate-500" />
                                    <span className="text-sm capitalize">{car.fuelType}</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                                    <Gauge className="h-4 w-4 text-slate-500" />
                                    <span className="text-sm capitalize">{car.transmission}</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 capitalize">
                                    <span className="text-sm">{car.type}</span>
                                </div>
                            </div>

                            <Separator className="my-6" />

                            <div>
                                <h3 className="font-semibold text-lg mb-4">Features</h3>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {car.features.map((feature) => (
                                        <div key={feature} className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-emerald-500" />
                                            <span className="text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mock Booking Card */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24 shadow-sm border-slate-200 dark:border-slate-800">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Booking Preview</span>
                                    <span className="text-2xl">
                                        ₹{car.pricePerDay}
                                        <span className="text-sm text-muted-foreground font-normal">/day</span>
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-center text-sm text-muted-foreground">
                                    Booking controls are disabled in preview mode.
                                </div>

                                <Button
                                    size="lg"
                                    className="w-full opacity-50 cursor-not-allowed"
                                    disabled
                                >
                                    Book Now
                                    <ArrowRight className="h-4 w-4 ml-2" />
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
        </AdminLayout>
    );
}
