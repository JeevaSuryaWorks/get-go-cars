import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Shield, Truck, FileText, Siren, Search, Filter, Plus, Download, Mail, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface Incident {
    id: string;
    type: 'theft' | 'damage' | 'speeding' | 'maintenance' | 'other';
    severity: 'low' | 'medium' | 'critical';
    description: string;
    status: 'open' | 'investigating' | 'reported_to_police' | 'resolved';
    created_at: string;
    booking: {
        id: string;
        user: { name: string; email: string };
        billing_info: any;
    };
    car: {
        brand: string;
        model: string;
        registration_number: string;
    };
}

interface AdminIncidentsPageProps {
    user?: { name: string; role: 'customer' | 'admin' } | null;
    onLogout?: () => void;
}

export function AdminIncidentsPage({ user, onLogout }: AdminIncidentsPageProps) {
    const queryClient = useQueryClient();
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [policeReportOpen, setPoliceReportOpen] = useState(false);
    const [viewIncidentOpen, setViewIncidentOpen] = useState(false);
    const [openCombobox, setOpenCombobox] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        carId: '',
        type: 'damage',
        severity: 'medium',
        description: ''
    });

    // Fetch Incidents
    const { data: incidents = [], isLoading } = useQuery({
        queryKey: ['admin-incidents'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('incidents')
                .select(`
                    *,
                    cars!incidents_car_id_fkey (brand, model, registration_number),
                    bookings!incidents_booking_id_fkey (id, billing_info)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data.map((i: any) => {
                const bInfo = i.bookings?.billing_info || {};
                return {
                    ...i,
                    car: i.cars,
                    booking: i.bookings ? {
                        ...i.bookings,
                        user: {
                            name: bInfo.fullName || 'Unknown User',
                            email: bInfo.email || ''
                        },
                        billing_info: bInfo
                    } : null
                };
            }) as Incident[];
        }
    });

    // Fetch Cars for Dropdown
    const { data: cars = [] } = useQuery({
        queryKey: ['admin-cars-simple'],
        queryFn: async () => {
            const { data } = await supabase.from('cars').select('id, brand, model, registration_number');
            return data || [];
        }
    });

    const createMutation = useMutation({
        mutationFn: async (newIncident: any) => {
            // Auto-link latest booking if not provided
            let bookingId = newIncident.booking_id;

            if (!bookingId && newIncident.car_id) {
                // Find most recent non-cancelled booking for this car
                const { data: booking } = await supabase
                    .from('bookings')
                    .select('id')
                    .eq('car_id', newIncident.car_id)
                    .neq('status', 'cancelled')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (booking) {
                    bookingId = booking.id;
                }
            }

            const { error } = await supabase.from('incidents').insert([{
                ...newIncident,
                booking_id: bookingId
            }]);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-incidents'] });
            setIsReportOpen(false);
            toast({ title: "Incident Reported", description: "The security team has been notified." });
            setFormData({ carId: '', type: 'damage', severity: 'medium', description: '' });
        },
        onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" })
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const { error } = await supabase.from('incidents').update({ status }).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-incidents'] });
            setViewIncidentOpen(false);
            toast({ title: "Status Updated", description: "Incident status has been updated." });
        },
        onError: (err: any) => toast({ title: "Update Failed", description: err.message, variant: "destructive" })
    });

    const handleGeneratePoliceReport = () => {
        if (!selectedIncident || !selectedIncident.booking?.billing_info) {
            toast({ title: "Missing Data", description: "Cannot generate report: No billing info found for this booking.", variant: "destructive" });
            return;
        }

        try {
            const doc = new jsPDF();
            const info = selectedIncident.booking.billing_info;
            const car = selectedIncident.car;
            const regNo = car.registration_number || 'UNKNOWN';

            doc.setFontSize(20);
            doc.text("POLICE COMPLAINT / INCIDENT REPORT", 105, 20, { align: "center" });

            doc.setFontSize(12);
            doc.text(`Date: ${format(new Date(), 'dd MMM yyyy')}`, 20, 40);
            doc.text(`To: The Station House Officer,`, 20, 50);
            doc.text(`Subject: Report regarding ${selectedIncident.type.toUpperCase()} of Vehicle ${regNo}`, 20, 65);

            const body = `
            Respected Sir/Madam,

            I am writing to formally report an incident involving our rental vehicle.
            
            Vehicle Details:
            - Model: ${car.brand} ${car.model}
            - Registration No: ${regNo}
            
            Incident Details:
            - Type: ${selectedIncident.type.toUpperCase()}
            - Severity: ${selectedIncident.severity.toUpperCase()}
            - Date Detected: ${format(new Date(selectedIncident.created_at), 'dd MMM yyyy HH:mm')}
            - Description / Reason: ${selectedIncident.description}

            User / Renter Details (At time of incident):
            - Name: ${info.fullName || 'N/A'}
            - DOB: ${info.dob || 'N/A'}
            - Email: ${info.email || 'N/A'}
            - Phone: ${info.phone || 'N/A'}
            - License No: ${info.licenseNumber || 'N/A'}
            - ID Proof: ${info.idType?.toUpperCase() || 'ID'} - ${info.idNumber || 'N/A'}
            - Address: ${info.city || ''}, ${info.pinCode || ''}

            Transaction / Session Details:
            - Booking Ref / Session ID: ${selectedIncident.booking?.id || 'N/A'}

            Violation of Rules:
            The user has violated the rental agreement terms regarding vehicle safety and lawful usage. This incident specifically concerns ${selectedIncident.type}, which is a punishable offense under company policy and local laws.

            We request you to take necessary legal action and provide us with an FIR copy for insurance purposes.

            Sincerely,
            Admin, Fleet Management
            JS Corp Car Rentals
            `;

            doc.setFontSize(10);
            const splitText = doc.splitTextToSize(body, 170);
            doc.text(splitText, 20, 80);

            doc.save(`Police_Report_${regNo.replace(/\s+/g, '_')}.pdf`);
            toast({ title: "Report Downloaded", description: "Official police complaint PDF generated." });
            setPoliceReportOpen(false);
        } catch (error: any) {
            console.error("PDF Generation Error:", error);
            toast({ title: "Generation Failed", description: "Could not generate PDF report. Please check data.", variant: "destructive" });
        }
    };

    // Export Daily Log (CSV)
    const handleExportDailyLog = () => {
        const today = new Date();
        const dailyIncidents = incidents.filter(i =>
            new Date(i.created_at).toDateString() === today.toDateString()
        );

        if (dailyIncidents.length === 0) {
            toast({ title: "No Data", description: "No incidents recorded for today.", variant: "default" });
            return;
        }

        // CSV Header
        let csvContent = "Time,Type,Severity,Vehicle,Reg No,Description,Status,User\n";

        // CSV Rows
        dailyIncidents.forEach(i => {
            const time = format(new Date(i.created_at), 'HH:mm');
            const row = [
                time,
                i.type,
                i.severity,
                `${i.car.brand} ${i.car.model}`,
                i.car.registration_number || 'N/A',
                `"${i.description.replace(/"/g, '""')}"`, // Escape quotes
                i.status,
                i.booking?.user.name || 'Unknown'
            ].join(",");
            csvContent += row + "\n";
        });

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Security_Log_${format(today, 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Log Exported", description: "Today's security log downloaded." });
    };

    // Export Monthly Summary (PDF)
    const handleExportMonthlySummary = () => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyIncidents = incidents.filter(i => {
            const d = new Date(i.created_at);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        if (monthlyIncidents.length === 0) {
            toast({ title: "No Data", description: "No incidents recorded this month.", variant: "default" });
            return;
        }

        // Aggregate Stats
        const stats = {
            total: monthlyIncidents.length,
            critical: monthlyIncidents.filter(i => i.severity === 'critical').length,
            theft: monthlyIncidents.filter(i => i.type === 'theft').length,
            damage: monthlyIncidents.filter(i => i.type === 'damage').length,
            resolved: monthlyIncidents.filter(i => i.status === 'resolved').length
        };

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`Monthly Security Incident Summary`, 20, 20);
        doc.setFontSize(12);
        doc.text(`${format(now, 'MMMM yyyy')}`, 20, 30);

        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);

        doc.setFontSize(14);
        doc.text("Overview", 20, 45);
        doc.setFontSize(11);
        doc.text(`Total Incidents Reported: ${stats.total}`, 20, 55);
        doc.text(`Critical Severity: ${stats.critical}`, 20, 62);
        doc.text(`Theft Cases: ${stats.theft}`, 20, 69);
        doc.text(`Major Damage: ${stats.damage}`, 20, 76);
        doc.text(`Resolved Cases: ${stats.resolved} (${Math.round((stats.resolved / stats.total) * 100)}%)`, 20, 83);

        doc.setFontSize(14);
        doc.text("Incident Log", 20, 100);

        // Simple Table Header
        let y = 110;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Date", 20, y);
        doc.text("Type", 50, y);
        doc.text("Vehicle", 90, y);
        doc.text("Severity", 150, y);

        y += 5;
        doc.setFont("helvetica", "normal");

        monthlyIncidents.forEach(i => {
            y += 7;
            if (y > 280) {
                doc.addPage();
                y = 20;
            }
            doc.text(format(new Date(i.created_at), 'dd MMM'), 20, y);
            doc.text(i.type.toUpperCase(), 50, y);
            doc.text(`${i.car.brand} ${i.car.model}`, 90, y);
            doc.text(i.severity, 150, y);
        });

        doc.save(`Monthly_Security_Summary_${format(now, 'MMM_yyyy')}.pdf`);
        toast({ title: "Summary Exported", description: "Monthly incident report generated." });
    };

    return (
        <AdminLayout user={user} onLogout={onLogout} title="Security & Incidents" subtitle="Manage fleet safety and legal reports">
            <div className="space-y-6">

                {/* Stats / Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-rose-600 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Critical Incidents
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-rose-700 dark:text-rose-400">
                                {incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length}
                            </div>
                            <p className="text-sm text-rose-500 mt-1">Require immediate attention</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-indigo-600 flex items-center gap-2">
                                <Truck className="h-5 w-5" />
                                Tow Service
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => toast({ title: "Tow Requested", description: "Dispatching nearest unit to location." })}>
                                Request Tow Truck
                            </Button>
                            <div className="flex gap-2 mt-2">
                                <Button variant="outline" size="sm" className="flex-1 bg-white" onClick={() => toast({ title: "Insurance Notified", description: "Claim draft started." })}>
                                    <Shield className="h-3 w-3 mr-1" /> Claim
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1 bg-white" onClick={() => setIsReportOpen(true)}>
                                    <Plus className="h-3 w-3 mr-1" /> Report
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-50 dark:bg-slate-900/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Reports
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="ghost" size="sm" className="w-full justify-start text-sm" onClick={handleExportDailyLog}>
                                <Download className="h-4 w-4 mr-2" /> Daily Security Log
                            </Button>
                            <Button variant="ghost" size="sm" className="w-full justify-start text-sm" onClick={handleExportMonthlySummary}>
                                <Download className="h-4 w-4 mr-2" /> Incident Summary (Monthly)
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Main List */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Recent Activity</CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Filter className="h-4 w-4" /> Filter
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-8">Loading...</div>
                        ) : incidents.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 border border-dashed rounded-lg">
                                <Shield className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                                No active security incidents.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {incidents.map((incident) => (
                                    <div key={incident.id} className="flex items-start justify-between p-4 border rounded-lg bg-card hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-2 rounded-lg ${incident.type === 'theft' || incident.severity === 'critical' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                                {incident.type === 'theft' ? <Siren className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold">{incident.type.toUpperCase()}</h3>
                                                    <Badge variant={incident.severity === 'critical' ? 'destructive' : 'secondary'}>{incident.severity}</Badge>
                                                    <span className="text-xs text-muted-foreground">• {format(new Date(incident.created_at), 'MMM dd, HH:mm')}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {incident.car.brand} {incident.car.model} <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded ml-1">{incident.car.registration_number || 'No Reg'}</span>
                                                </p>
                                                <p className="text-sm mt-2">{incident.description}</p>
                                                {incident.booking && (
                                                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                                        <span className="font-medium text-slate-700 dark:text-slate-300">Renter:</span> {incident.booking.user?.name}
                                                        {incident.booking.billing_info && <Badge variant="outline" className="text-[10px] h-4">KYC Available</Badge>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {(incident.type === 'theft' || incident.type === 'damage') && (
                                                <Button size="sm" variant="destructive" onClick={() => { setSelectedIncident(incident); setPoliceReportOpen(true); }}>
                                                    <Siren className="h-4 w-4 mr-2" /> Police Report
                                                </Button>
                                            )}
                                            <Button size="sm" variant="outline" onClick={() => {
                                                setSelectedIncident(incident);
                                                setViewIncidentOpen(true);
                                            }}>View Details</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Report Dialog */}
                <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Report Security Incident</DialogTitle>
                            <DialogDescription>Log a new incident for a vehicle.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2 flex flex-col">
                                <Label>Select Vehicle</Label>
                                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openCombobox}
                                            className="justify-between"
                                        >
                                            {formData.carId
                                                ? cars.find((c: any) => c.id === formData.carId)?.brand + " " + cars.find((c: any) => c.id === formData.carId)?.model
                                                : "Search vehicle by name or Reg No..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder="Search car..." />
                                            <CommandList>
                                                <CommandEmpty>No vehicle found.</CommandEmpty>
                                                <CommandGroup>
                                                    {cars.map((c: any) => (
                                                        <CommandItem
                                                            key={c.id}
                                                            value={`${c.brand} ${c.model} ${c.registration_number}`}
                                                            onSelect={() => {
                                                                setFormData({ ...formData, carId: c.id });
                                                                setOpenCombobox(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    formData.carId === c.id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {c.brand} {c.model} <span className="text-muted-foreground text-xs ml-1">({c.registration_number || 'N/A'})</span>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Incident Type</Label>
                                    <Select onValueChange={(v) => setFormData({ ...formData, type: v })} defaultValue="damage">
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="damage">Damage / Accidental</SelectItem>
                                            <SelectItem value="theft">Theft / Missing</SelectItem>
                                            <SelectItem value="speeding">Speeding Violation</SelectItem>
                                            <SelectItem value="maintenance">Maintenance Issue</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Severity</Label>
                                    <Select onValueChange={(v) => setFormData({ ...formData, severity: v })} defaultValue="medium">
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low (Cosmetic)</SelectItem>
                                            <SelectItem value="medium">Medium (Operational)</SelectItem>
                                            <SelectItem value="critical">Critical (Safety/Total)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    placeholder="Describe what happened..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsReportOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={() => createMutation.mutate({
                                car_id: formData.carId,
                                type: formData.type,
                                severity: formData.severity,
                                description: formData.description,
                                status: 'open'
                            })}>Submit Report</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Police Report Confirmation */}
                <Dialog open={policeReportOpen} onOpenChange={setPoliceReportOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-red-600">
                                <Siren className="h-5 w-5" /> Generate Police Complaint
                            </DialogTitle>
                            <DialogDescription>
                                This will generate an official PDF complaint letter populated with the renter's KYC details (Aadhaar, Address, License).
                            </DialogDescription>
                        </DialogHeader>
                        {selectedIncident?.booking?.billing_info ? (
                            <div className="bg-slate-50 p-4 rounded text-sm space-y-2 border">
                                <p><strong>Subject:</strong> {selectedIncident.type.toUpperCase()} of {selectedIncident.car.brand} {selectedIncident.car.model}</p>
                                <p><strong>Suspect / Renter:</strong> {selectedIncident.booking.billing_info.fullName}</p>
                                <p><strong>ID Proof:</strong> {selectedIncident.booking.billing_info.idType?.toUpperCase()} - {selectedIncident.booking.billing_info.idNumber}</p>
                                <p><strong>Status:</strong> Use this document to file an FIR.</p>
                            </div>
                        ) : (
                            <div className="bg-red-50 p-4 rounded text-sm text-red-600 border border-red-200">
                                Warning: No booking/KYC data linked to this incident. Determining user manually may be required.
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setPoliceReportOpen(false)}>Cancel</Button>
                            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleGeneratePoliceReport}>
                                <FileText className="h-4 w-4 mr-2" /> Download & Print
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* View / Edit Detail Dialog */}
                <Dialog open={viewIncidentOpen} onOpenChange={setViewIncidentOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Incident Details</DialogTitle>
                            <DialogDescription className="sr-only">
                                View detailed information about the selected security incident.
                            </DialogDescription>
                        </DialogHeader>
                        {selectedIncident && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <label className="text-muted-foreground block text-xs">Vehicle</label>
                                        <div className="font-medium">{selectedIncident.car.brand} {selectedIncident.car.model}</div>
                                        <div className="text-xs">{selectedIncident.car.registration_number || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <label className="text-muted-foreground block text-xs">Reported On</label>
                                        <div className="font-medium">{format(new Date(selectedIncident.created_at), 'MMM dd, yyyy')}</div>
                                    </div>
                                    <div>
                                        <label className="text-muted-foreground block text-xs">Type</label>
                                        <div className="font-medium capitalize">{selectedIncident.type}</div>
                                    </div>
                                    <div>
                                        <label className="text-muted-foreground block text-xs">Sensitivity</label>
                                        <Badge variant={selectedIncident.severity === 'critical' ? 'destructive' : 'secondary'}>
                                            {selectedIncident.severity}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-muted-foreground block text-xs">Description</label>
                                    <p className="text-sm bg-muted p-2 rounded">{selectedIncident.description}</p>
                                </div>
                                <div className="space-y-2 pt-2 border-t">
                                    <label className="font-medium text-sm">Update Status</label>
                                    <div className="flex gap-2">
                                        {(['open', 'investigating', 'reported_to_police', 'resolved'] as const).map((s) => (
                                            <Button
                                                key={s}
                                                size="sm"
                                                variant={selectedIncident.status === s ? 'default' : 'outline'}
                                                onClick={() => updateStatusMutation.mutate({ id: selectedIncident.id, status: s })}
                                                className="capitalize text-xs"
                                                disabled={selectedIncident.status === s}
                                            >
                                                {s.replace(/_/g, ' ')}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
