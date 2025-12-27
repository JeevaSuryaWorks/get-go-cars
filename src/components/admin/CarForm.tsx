
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, Loader2, Plus, X, Upload, Save, Car, Fuel, Settings, Users, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface CarFormProps {
    mode: 'create' | 'edit';
    initialData?: any;
    carId?: string;
}

export function CarForm({ mode, initialData, carId }: CarFormProps) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        pricePerDay: '',
        type: 'luxury',
        fuelType: 'petrol',
        transmission: 'automatic',
        seats: 4,
        images: [''],
        features: [''],
        rating: 5.0,
        registrationNumber: '',
        status: 'available',
        description: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                brand: initialData.brand || '',
                model: initialData.model || '',
                year: initialData.year || new Date().getFullYear(),
                pricePerDay: initialData.price_per_day?.toString() || '',
                type: initialData.type || 'luxury',
                fuelType: initialData.fuel_type || 'petrol',
                transmission: initialData.transmission || 'automatic',
                seats: initialData.seats || 4,
                images: initialData.images && initialData.images.length > 0 ? initialData.images : [''],
                features: initialData.features && initialData.features.length > 0 ? initialData.features : [''],
                rating: initialData.rating || 5.0,
                registrationNumber: initialData.registration_number || '',
                status: initialData.status || 'available',
                description: initialData.description || ''
            });
        }
    }, [initialData]);

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

    const mutation = useMutation({
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
                registration_number: data.registrationNumber,
                status: data.status,
                description: data.description
            };

            if (mode === 'create') {
                const { error } = await supabase.from('cars').insert([cleanedData]);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('cars').update(cleanedData).eq('id', carId);
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-cars'] });
            if (mode === 'edit') {
                queryClient.invalidateQueries({ queryKey: ['car', carId] });
            }
            toast({
                title: "Success",
                description: `Car ${mode === 'create' ? 'created' : 'updated'} successfully`,
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
        mutation.mutate(formData);
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
            {/* Header / Main Info Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Car className="h-5 w-5 text-indigo-500" />
                                Vehicle Information
                            </CardTitle>
                            <CardDescription>Essential details about the car.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="registrationNumber">Registration / Plate No.</Label>
                                <Input
                                    id="registrationNumber" name="registrationNumber"
                                    value={formData.registrationNumber} onChange={handleChange} required
                                    placeholder="e.g. MH-12-AB-1234"
                                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="brand">Brand</Label>
                                <Input
                                    id="brand" name="brand"
                                    value={formData.brand} onChange={handleChange} required
                                    placeholder="e.g. BMW"
                                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="model">Model</Label>
                                <Input
                                    id="model" name="model"
                                    value={formData.model} onChange={handleChange} required
                                    placeholder="e.g. M4 Competition"
                                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="year">Year</Label>
                                <Input
                                    id="year" name="year" type="number"
                                    value={formData.year} onChange={handleChange} required
                                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
                                    <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="available">Available</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                        <SelectItem value="unavailable">Unavailable</SelectItem>
                                        <SelectItem value="rented" disabled>Rented (Auto)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description" name="description"
                                    value={formData.description} onChange={handleChange}
                                    placeholder="Detailed description of the car..."
                                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 min-h-[100px]"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-indigo-500" />
                                Specifications
                            </CardTitle>
                            <CardDescription>Technical details and performance.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="type">Body Type</Label>
                                <Select value={formData.type} onValueChange={(v) => handleSelectChange('type', v)}>
                                    <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="luxury">Luxury</SelectItem>
                                        <SelectItem value="sport">Sport</SelectItem>
                                        <SelectItem value="suv">SUV</SelectItem>
                                        <SelectItem value="sedan">Sedan</SelectItem>
                                        <SelectItem value="convertible">Convertible</SelectItem>
                                        <SelectItem value="electric">Electric</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fuelType">Fuel Type</Label>
                                <Select value={formData.fuelType} onValueChange={(v) => handleSelectChange('fuelType', v)}>
                                    <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                        <SelectValue placeholder="Select fuel type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="petrol">Petrol</SelectItem>
                                        <SelectItem value="diesel">Diesel</SelectItem>
                                        <SelectItem value="electric">Electric</SelectItem>
                                        <SelectItem value="hybrid">Hybrid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="transmission">Transmission</Label>
                                <Select value={formData.transmission} onValueChange={(v) => handleSelectChange('transmission', v)}>
                                    <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
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
                                <Input
                                    id="seats" name="seats" type="number"
                                    value={formData.seats} onChange={handleChange} required min={1}
                                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-8">
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-indigo-500" />
                                Pricing
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="pricePerDay">Price per Day (₹)</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                                    <Input
                                        id="pricePerDay" name="pricePerDay" type="number"
                                        value={formData.pricePerDay} onChange={handleChange} required
                                        placeholder="0"
                                        className="pl-8 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-lg font-semibold"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Includes basic insurance and tax.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Upload className="h-5 w-5 text-indigo-500" />
                                Images
                            </CardTitle>
                            <CardDescription>Add URLs for car images.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {formData.images.map((url, index) => (
                                <div key={index} className="flex gap-2 group">
                                    <Input
                                        value={url}
                                        onChange={(e) => handleArrayChange(index, e.target.value, 'images')}
                                        placeholder="https://..."
                                        className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs"
                                    />
                                    {formData.images.length > 1 && (
                                        <Button
                                            type="button" variant="ghost" size="icon"
                                            onClick={() => removeArrayItem(index, 'images')}
                                            className="text-slate-400 hover:text-red-500"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem('images')} className="w-full border-dashed">
                                <Plus className="h-4 w-4 mr-2" /> Add Image URL
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-indigo-500" />
                                Features
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {formData.features.map((feature, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={feature}
                                        onChange={(e) => handleArrayChange(index, e.target.value, 'features')}
                                        placeholder="e.g. GPS, Bluetooth"
                                        className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs"
                                    />
                                    {formData.features.length > 1 && (
                                        <Button
                                            type="button" variant="ghost" size="icon"
                                            onClick={() => removeArrayItem(index, 'features')}
                                            className="text-slate-400 hover:text-red-500"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem('features')} className="w-full border-dashed">
                                <Plus className="h-4 w-4 mr-2" /> Add Feature
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Footer / Actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => navigate('/admin/cars')} className="w-24">
                    Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending} className="w-32 bg-indigo-600 hover:bg-indigo-700 text-white">
                    {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {mode === 'create' ? 'Create Car' : 'Save Changes'}
                </Button>
            </div>
        </form>
    );
}
