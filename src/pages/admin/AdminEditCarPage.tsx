import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, Loader2, Plus, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Car } from '@/types';

interface AdminEditCarPageProps {
    user?: { name: string; role: 'customer' | 'admin' } | null;
    onLogout?: () => void;
}

export function AdminEditCarPage({ user, onLogout }: AdminEditCarPageProps) {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        pricePerDay: '',
        type: 'Luxury',
        fuelType: 'Gasoline',
        transmission: 'automatic',
        seats: 4,
        images: [''],
        features: [''],
        rating: 5.0,
        status: 'available'
    });

    // Fetch Car Details
    const { data: car, isLoading: isFetching } = useQuery({
        queryKey: ['car', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('cars')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        }
    });

    useEffect(() => {
        if (car) {
            setFormData({
                brand: car.brand,
                model: car.model,
                year: car.year,
                pricePerDay: car.price_per_day.toString(),
                type: car.type.charAt(0).toUpperCase() + car.type.slice(1),
                fuelType: car.fuel_type.charAt(0).toUpperCase() + car.fuel_type.slice(1),
                transmission: car.transmission,
                seats: car.seats,
                images: car.images && car.images.length > 0 ? car.images : [''],
                features: car.features && car.features.length > 0 ? car.features : [''],
                rating: car.rating,
                status: car.status
            });
        }
    }, [car]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleArrayChange = (index: number, value: string, field: 'images' | 'features') => {
        const newArray = [...formData[field]];
        newArray[index] = value;
        setFormData(prev => ({ ...prev, [field]: newArray }));
    };

    const addArrayItem = (field: 'images' | 'features') => {
        setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
    };

    const removeArrayItem = (index: number, field: 'images' | 'features') => {
        const newArray = formData[field].filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, [field]: newArray }));
    };

    const updateMutation = useMutation({
        mutationFn: async (data: any) => {
            // Filter out empty strings from arrays
            const cleanedData = {
                brand: data.brand,
                model: data.model,
                year: Number(data.year),
                price_per_day: Number(data.pricePerDay),
                type: data.type.toLowerCase(),
                fuel_type: data.fuelType.toLowerCase(),
                transmission: data.transmission.toLowerCase(),
                seats: Number(data.seats),
                images: data.images.filter((i: string) => i.trim() !== ''),
                features: data.features.filter((f: string) => f.trim() !== ''),
                rating: Number(data.rating),
                status: data.status
            };

            const { error } = await supabase
                .from('cars')
                .update(cleanedData)
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-cars'] });
            queryClient.invalidateQueries({ queryKey: ['car', id] });
            toast({
                title: "Success",
                description: "Car updated successfully",
            });
            navigate('/admin/cars');
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        updateMutation.mutate(formData);
        setLoading(false);
    };

    if (isFetching) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen flex flex-col bg-muted/30">
            <main className="flex-1 container py-8 max-w-3xl">
                <div className="mb-6">
                    <Button variant="ghost" onClick={() => navigate('/admin/cars')} className="mb-4">
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back to Cars
                    </Button>
                    <h1 className="text-3xl font-bold">Edit Car</h1>
                    <p className="text-muted-foreground">{formData.brand} {formData.model}</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Car Details</CardTitle>
                        <CardDescription>Update the information below.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="brand">Brand</Label>
                                    <Input id="brand" name="brand" value={formData.brand} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="model">Model</Label>
                                    <Input id="model" name="model" value={formData.model} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="year">Year</Label>
                                    <Input id="year" name="year" type="number" value={formData.year} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pricePerDay">Price per Day (₹)</Label>
                                    <Input id="pricePerDay" name="pricePerDay" type="number" value={formData.pricePerDay} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select value={formData.type} onValueChange={(v) => handleSelectChange('type', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Luxury">Luxury</SelectItem>
                                            <SelectItem value="Sport">Sport</SelectItem>
                                            <SelectItem value="SUV">SUV</SelectItem>
                                            <SelectItem value="Sedan">Sedan</SelectItem>
                                            <SelectItem value="Electric">Electric</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fuelType">Fuel Type</Label>
                                    <Select value={formData.fuelType} onValueChange={(v) => handleSelectChange('fuelType', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select fuel type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Gasoline">Gasoline</SelectItem>
                                            <SelectItem value="Diesel">Diesel</SelectItem>
                                            <SelectItem value="Electric">Electric</SelectItem>
                                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="transmission">Transmission</Label>
                                    <Select value={formData.transmission} onValueChange={(v) => handleSelectChange('transmission', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select transmission" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="automatic">Automatic</SelectItem>
                                            <SelectItem value="manual">Manual</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="seats">Seats</Label>
                                    <Input id="seats" name="seats" type="number" value={formData.seats} onChange={handleChange} required min={1} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Images (URLs)</Label>
                                {formData.images.map((url, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={url}
                                            onChange={(e) => handleArrayChange(index, e.target.value, 'images')}
                                        />
                                        {formData.images.length > 1 && (
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayItem(index, 'images')}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem('images')} className="mt-2">
                                    <Plus className="h-4 w-4 mr-2" /> Add Image URL
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <Label>Features</Label>
                                {formData.features.map((feature, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={feature}
                                            onChange={(e) => handleArrayChange(index, e.target.value, 'features')}
                                        />
                                        {formData.features.length > 1 && (
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayItem(index, 'features')}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem('features')} className="mt-2">
                                    <Plus className="h-4 w-4 mr-2" /> Add Feature
                                </Button>
                            </div>

                            <div className="flex justify-end pt-6">
                                <Button type="button" variant="outline" className="mr-4" onClick={() => navigate('/admin/cars')}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={updateMutation.isPending}>
                                    {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Car
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
