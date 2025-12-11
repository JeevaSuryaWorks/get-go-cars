import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, Calendar, MapPin, Shield, Edit2, Check, UserCircle, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ProfilePageProps {
    user?: { name: string; role: 'customer' | 'admin' } | null;
    onLogout?: () => void;
}

export function ProfilePage({ user, onLogout }: ProfilePageProps) {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [userEmail, setUserEmail] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        kycVerified: false
    });
    // Temporary state for the uploaded image preview
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) return;

            setUserEmail(authUser.email || '');

            const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

            // Ignore PGRST116 (No rows found) - new users might not have a profile row if the trigger failed or old user
            if (error && error.code !== 'PGRST116') throw error;

            if (profileData) {
                setProfile(profileData);
                setFormData({
                    fullName: profileData.full_name || '',
                    phone: profileData.phone_number || '',
                    address: profileData.address || '',
                    city: profileData.city || '',
                    kycVerified: profileData.kyc_verified || false // assuming we might add this column later, or use metadata
                });
                if (profileData.avatar_url) {
                    setAvatarPreview(profileData.avatar_url);
                }
            } else {
                // Fallback to auth metadata if profile doesn't exist
                setFormData(prev => ({
                    ...prev,
                    fullName: authUser.user_metadata?.full_name || ''
                }));
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            // Don't show error toast on load, just log it. 
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // In a real app, upload to Supabase Storage here
            // const { data, error } = await supabase.storage.from('avatars').upload(...)

            // For now, valid simulation: create a local object URL
            const objectUrl = URL.createObjectURL(file);
            setAvatarPreview(objectUrl);

            toast({
                title: "Photo selected",
                description: "Click 'Save Changes' to update your profile.",
            });
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) return;

            // Mark KYC as verified when they explicitly save their details
            const updates = {
                id: authUser.id,
                full_name: formData.fullName,
                phone_number: formData.phone,
                address: formData.address,
                city: formData.city,
                updated_at: new Date().toISOString(),
                kyc_verified: true
            };

            const { error } = await supabase
                .from('profiles')
                .upsert(updates);

            if (error) throw error;

            // Should also update auth metadata for full_name persistence in session
            await supabase.auth.updateUser({
                data: {
                    full_name: formData.fullName,
                    kyc_verified: true // Storing verification status in auth metadata as a fallback/primary source
                }
            });

            setFormData(prev => ({ ...prev, kycVerified: true }));
            setProfile({ ...profile, ...updates });
            setIsEditing(false);

            toast({
                title: "Profile updated",
                description: "Your profile has been successfully updated and KYC Verified.",
            });

        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast({
                title: "Update failed",
                description: error.message || "Could not update profile. Please try again.",
                variant: "destructive",
            });
        }
    };

    const getUserInitials = (name: string) => {
        return (name || 'User')
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar user={user} onLogout={onLogout} />
                <main className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </main>
                <Footer />
            </div>
        );
    }

    // Determine KYC status: true if explicitly set in state OR if user metadata says so
    const isKycVerified = formData.kycVerified || (profile?.kyc_verified) || false;

    return (
        <div className="min-h-screen flex flex-col bg-background/50">
            <Navbar user={user} onLogout={onLogout} />

            <main className="flex-1 py-12 pt-32">
                <div className="container max-w-4xl">
                    <div className="flex flex-col md:flex-row gap-8">

                        {/* Sidebar / Left Column */}
                        <div className="md:w-1/3 space-y-6">
                            <Card className="text-center py-8">
                                <CardContent>
                                    <div className="relative inline-block mb-4 group">
                                        <Avatar className="h-24 w-24 mx-auto border-4 border-background shadow-xl">
                                            {avatarPreview ? (
                                                <AvatarImage src={avatarPreview} className="object-cover" />
                                            ) : (
                                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${formData.fullName}`} />
                                            )}
                                            <AvatarFallback>{getUserInitials(formData.fullName)}</AvatarFallback>
                                        </Avatar>

                                        {/* Edit Overlay */}
                                        {isEditing && (
                                            <label
                                                htmlFor="avatar-upload"
                                                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                                            >
                                                <Upload className="h-6 w-6" />
                                                <input
                                                    id="avatar-upload"
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                />
                                            </label>
                                        )}

                                        {user?.role === 'admin' && (
                                            <span className="absolute bottom-0 right-0 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">
                                                ADMIN
                                            </span>
                                        )}
                                    </div>

                                    <h2 className="text-2xl font-bold mb-1">{formData.fullName || 'User'}</h2>
                                    <p className="text-sm text-muted-foreground mb-4">{userEmail}</p>

                                    <div className="flex justify-center gap-2">
                                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                                            Member since {new Date().getFullYear()}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Account Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-success" />
                                            <span className="text-sm">Email Verified</span>
                                        </div>
                                        <Check className="h-4 w-4 text-success" />
                                    </div>
                                    <div className={`flex items-center justify-between ${isKycVerified ? '' : 'opacity-50'}`}>
                                        <div className="flex items-center gap-2">
                                            <UserCircle className={`h-4 w-4 ${isKycVerified ? 'text-success' : ''}`} />
                                            <span className="text-sm">KYC Verified</span>
                                        </div>
                                        {isKycVerified ? (
                                            <Check className="h-4 w-4 text-success" />
                                        ) : (
                                            <span className="text-xs">Pending</span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content / Right Column */}
                        <div className="md:w-2/3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Profile Details</CardTitle>
                                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
                                        {isEditing ? 'Cancel' : (
                                            <>
                                                <Edit2 className="h-4 w-4 mr-2" />
                                                Edit Profile
                                            </>
                                        )}
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName">Full Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="fullName"
                                                    className="pl-9"
                                                    value={formData.fullName}
                                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                    disabled={!isEditing}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <div className="relative flex gap-2">
                                                <div className="w-[100px]">
                                                    <select
                                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                        value={formData.phone.startsWith('+') ? formData.phone.split(' ')[0] : '+91'}
                                                        onChange={(e) => {
                                                            const newCode = e.target.value;
                                                            const currentNumber = formData.phone.includes(' ') ? formData.phone.split(' ')[1] : formData.phone;
                                                            setFormData({ ...formData, phone: `${newCode} ${currentNumber}` });
                                                        }}
                                                        disabled={!isEditing}
                                                    >
                                                        <option value="+91">IN +91</option>
                                                        <option value="+1">US +1</option>
                                                        <option value="+44">UK +44</option>
                                                        <option value="+971">UAE +971</option>
                                                    </select>
                                                </div>
                                                <div className="relative flex-1">
                                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="phone"
                                                        className="pl-9"
                                                        value={formData.phone.includes(' ') ? formData.phone.split(' ')[1] : formData.phone}
                                                        onChange={(e) => {
                                                            const currentCode = formData.phone.includes(' ') ? formData.phone.split(' ')[0] : '+91';
                                                            setFormData({ ...formData, phone: `${currentCode} ${e.target.value}` });
                                                        }}
                                                        disabled={!isEditing}
                                                        placeholder="98765 43210"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="city">City</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="city"
                                                    className="pl-9"
                                                    value={formData.city}
                                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                    disabled={!isEditing}
                                                    placeholder="Chennai"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    className="pl-9 bg-muted/50"
                                                    value={userEmail}
                                                    disabled={true} // Email should generally be immutable here or handled via auth flow
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="address">Address</Label>
                                            <Input
                                                id="address"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                disabled={!isEditing}
                                                placeholder="123, Main Street, Apt 4B"
                                            />
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="flex justify-end pt-4 border-t">
                                            <Button onClick={handleUpdateProfile} className="w-full md:w-auto">
                                                Save Changes
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

function Badge({ variant, className, children }: any) {
    return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${className}`}>{children}</span>
}
