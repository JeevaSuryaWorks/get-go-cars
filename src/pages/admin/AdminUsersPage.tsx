import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CarLoader } from '@/components/CarLoader';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    Search, MoreVertical, Mail, Phone, User, CheckCircle, Clock,
    Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { AdminLayout } from '@/components/admin/AdminLayout';

interface AdminUsersPageProps {
    user?: { name: string; role: 'customer' | 'admin' } | null;
    onLogout?: () => void;
}

export function AdminUsersPage({ user, onLogout }: AdminUsersPageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<any>(null);

    // Fetch Users
    const { data: users = [], isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('full_name', { ascending: true });

            if (error) throw error;
            return data;
        }
    });

    const filteredUsers = users.filter((u: any) =>
        (u.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (u.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );


    return (
        <AdminLayout
            user={user}
            onLogout={onLogout}
            title="User Management"
            subtitle={`${users.length} active users`}
        >
            <div className="space-y-6 animate-fade-up">

                {/* Search Bar */}
                <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by name or email..."
                            className="pl-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="text-sm text-slate-500 font-medium">
                        Total Users: <span className="text-slate-900 dark:text-white">{users.length}</span>
                    </div>
                </div>

                {/* Mobile Grid */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {isLoading ? (
                        <CarLoader size="md" label="Loading users..." className="mx-auto my-12" />
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-950 rounded-xl border border-dashed border-slate-300">
                            No users found.
                        </div>
                    ) : (
                        filteredUsers.map((u: any) => (
                            <div key={u.id} className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex items-start gap-4">
                                <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0">
                                    {u.avatar_url ? (
                                        <img src={u.avatar_url} alt={u.full_name} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-lg font-bold text-slate-500">{u.full_name?.charAt(0) || 'U'}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-semibold text-slate-900 dark:text-white truncate">{u.full_name || 'Unknown'}</h4>
                                            <p className="text-xs text-slate-500 truncate">{u.email}</p>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setSelectedUser(u)}>View Profile</DropdownMenuItem>
                                                {u.phone_number && (
                                                    <DropdownMenuItem asChild>
                                                        <a href={`https://wa.me/${u.phone_number.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">Chat on WhatsApp</a>
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="text-[10px] px-1.5 h-5 capitalize">
                                            {u.role}
                                        </Badge>
                                        {u.kyc_verified ? (
                                            <span className="flex items-center text-[10px] text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded"><CheckCircle className="w-3 h-3 mr-1" /> Verified</span>
                                        ) : (
                                            <span className="flex items-center text-[10px] text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded"><Clock className="w-3 h-3 mr-1" /> Pending</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop Table */}
                <Card className="hidden md:block border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                                <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                                    <TableHead>User Profile</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Contact Info</TableHead>
                                    <TableHead>KYC Status</TableHead>
                                    <TableHead>Joined / Updated</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-12">
                                            <CarLoader size="md" label="Loading users..." className="mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                                            No users found matching your search.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((u: any) => (
                                        <TableRow key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 border-slate-200 dark:border-slate-800 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-800">
                                                        {u.avatar_url ? (
                                                            <img src={u.avatar_url} alt={u.full_name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <span className="text-sm font-medium text-slate-500">{u.full_name?.charAt(0) || 'U'}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white capitalize">{u.full_name || 'Unknown'}</p>
                                                        {u.username && <p className="text-xs text-slate-400">@{u.username}</p>}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="capitalize font-normal">
                                                    {u.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center text-xs text-slate-500">
                                                        <Mail className="h-3 w-3 mr-1.5 opacity-70" />
                                                        <span className={cn(!u.email && "italic opacity-50")}>
                                                            {u.email || 'No email linked'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center text-xs text-slate-500">
                                                        <Phone className="h-3 w-3 mr-1.5 opacity-70" />
                                                        <span className={cn(!u.phone_number && "italic opacity-50")}>
                                                            {u.phone_number || 'No phone'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {u.kyc_verified ? (
                                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Verified</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Pending</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-500">
                                                {u.created_at ? (
                                                    format(new Date(u.created_at), 'MMM dd, yyyy')
                                                ) : u.updated_at ? (
                                                    <div className="flex items-center gap-1" title="User record updated date (Joined date missing)">
                                                        <span>{format(new Date(u.updated_at), 'MMM dd, yyyy')}</span>
                                                        <span className="text-[10px] bg-slate-100 px-1 rounded text-slate-400">Updated</span>
                                                    </div>
                                                ) : (
                                                    <span className="italic opacity-50 text-xs">Unknown</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-800">
                                                            <MoreVertical className="h-4 w-4 text-slate-400" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => setSelectedUser(u)}>
                                                            <User className="h-4 w-4 mr-2" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        {u.phone_number && (
                                                            <DropdownMenuItem asChild>
                                                                <a
                                                                    href={`https://wa.me/${u.phone_number.replace(/\D/g, '')}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="cursor-pointer"
                                                                >
                                                                    <Phone className="h-4 w-4 mr-2" />
                                                                    Chat on WhatsApp
                                                                </a>
                                                            </DropdownMenuItem>
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
            </div>

            {/* User Details Dialog */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border-0 ring-1 ring-white/10 bg-white dark:bg-slate-900">
                        <CardHeader className="relative border-b border-slate-100 dark:border-slate-800 pb-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-4 top-4 hover:bg-slate-100 rounded-full"
                                onClick={() => setSelectedUser(null)}
                            >
                                <span className="text-xl leading-none">&times;</span>
                            </Button>
                            <CardTitle>User Profile</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="flex flex-col items-center text-center gap-3">
                                <div className="h-24 w-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg">
                                    {selectedUser.avatar_url ? (
                                        <img src={selectedUser.avatar_url} alt={selectedUser.full_name} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-bold text-slate-400">{selectedUser.full_name?.charAt(0) || 'U'}</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-slate-900 dark:text-white">{selectedUser.full_name}</h3>
                                    {selectedUser.username && <p className="text-sm text-slate-400">@{selectedUser.username}</p>}
                                    <div className="flex items-center justify-center gap-2 mt-2">
                                        <Badge variant={selectedUser.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                                            {selectedUser.role}
                                        </Badge>
                                        {selectedUser.kyc_verified ? (
                                            <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">KYC Verified</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">KYC Pending</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 space-y-4 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm text-slate-500">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-slate-400">Email Address</p>
                                        <p className={cn("text-sm font-medium truncate", !selectedUser.email && "text-slate-400 italic")}>
                                            {selectedUser.email || 'Not available'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm text-slate-500">
                                        <Phone className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400">Phone Number</p>
                                        <p className={cn("text-sm font-medium", !selectedUser.phone_number && "text-slate-400 italic")}>
                                            {selectedUser.phone_number || 'Not provided'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm text-slate-500">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400">Member Since</p>
                                        <p className="text-sm font-medium">{selectedUser.created_at ? format(new Date(selectedUser.created_at), 'MMMM dd, yyyy') : 'Unknown'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button className="flex-1 w-full" variant="outline" onClick={() => setSelectedUser(null)}>Dismiss</Button>
                                {selectedUser.phone_number && (
                                    <Button className="flex-1 w-full bg-[#25D366] hover:bg-[#128C7E] text-white border-0" asChild>
                                        <a href={`https://wa.me/${selectedUser.phone_number.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
                                            WhatsApp
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </AdminLayout>
    );
}
