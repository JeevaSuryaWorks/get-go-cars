import { useState } from 'react';
import { Link } from 'react-router-dom';
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
    Search, MoreVertical, Mail, Phone
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

    const [selectedUser, setSelectedUser] = useState<any>(null);

    return (
        <AdminLayout
            user={user}
            onLogout={onLogout}
            title="User Management"
            subtitle={`${users.length} total users`}
        >
            <div className="space-y-6">
                <Card className="border-none shadow-card">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row gap-4 justify-between">
                            <CardTitle>All Users</CardTitle>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search users..."
                                    className="pl-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-border/50">
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">
                                            Loading users...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">
                                            No users found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((u: any) => (
                                        <TableRow key={u.id} className="hover:bg-muted/30 border-border/50">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                                                        {u.avatar_url ? (
                                                            <img src={u.avatar_url} alt={u.full_name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <span className="text-sm font-medium">{u.full_name?.charAt(0) || 'U'}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground/80">{u.full_name || 'Unknown'}</p>
                                                        <p className="text-xs text-muted-foreground">{u.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="font-medium">
                                                    {u.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {u.email && (
                                                        <div className="flex items-center text-xs text-muted-foreground">
                                                            <Mail className="h-3 w-3 mr-1" />
                                                            {u.email}
                                                        </div>
                                                    )}
                                                    {u.phone_number && (
                                                        <div className="flex items-center text-xs text-muted-foreground">
                                                            <Phone className="h-3 w-3 mr-1" />
                                                            {u.phone_number}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {u.created_at ? format(new Date(u.created_at), 'PP') : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="hover:bg-primary/5">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => setSelectedUser(u)}>
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
                                                                    Chat with WhatsApp
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <CardHeader className="relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-4 top-4"
                                onClick={() => setSelectedUser(null)}
                            >
                                <MoreVertical className="hidden" /> {/* Dummy to keep import valid if needed, actually need X */}
                                <span className="text-xl font-bold">×</span>
                            </Button>
                            <CardTitle>User Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                                    {selectedUser.avatar_url ? (
                                        <img src={selectedUser.avatar_url} alt={selectedUser.full_name} className="h-full w-full object-cover rounded-full" />
                                    ) : (
                                        selectedUser.full_name?.charAt(0) || 'U'
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{selectedUser.full_name}</h3>
                                    <Badge variant={selectedUser.role === 'admin' ? 'default' : 'secondary'}>
                                        {selectedUser.role}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-[24px_1fr] gap-2 items-center">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{selectedUser.email}</span>
                                </div>
                                <div className="grid grid-cols-[24px_1fr] gap-2 items-center">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{selectedUser.phone_number || 'No phone number'}</span>
                                </div>
                                <div className="grid grid-cols-[24px_1fr] gap-2 items-center">
                                    <div className="h-4 w-4 flex items-center justify-center">
                                        <div className={`h-2 w-2 rounded-full ${selectedUser.kyc_verified ? 'bg-green-500' : 'bg-orange-400'}`} />
                                    </div>
                                    <span className="text-sm">
                                        {selectedUser.kyc_verified ? 'KYC Verified' : 'KYC Pending'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setSelectedUser(null)}>Close</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </AdminLayout>
    );
}
