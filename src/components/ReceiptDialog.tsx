import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import QRCode from 'react-qr-code';
import { Printer, Share2, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from '@/hooks/use-toast';

interface ReceiptDialogProps {
    booking: any;
    children: React.ReactNode;
}

export function ReceiptDialog({ booking, children }: ReceiptDialogProps) {
    const contentRef = useRef<HTMLDivElement>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const handlePrint = () => {
        const printContent = contentRef.current;
        if (!printContent) return;

        const originalContents = document.body.innerHTML;
        const printContents = printContent.innerHTML;

        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
    };

    const handleDownloadPDF = async () => {
        if (!contentRef.current) return;

        setIsGeneratingPdf(true);
        try {
            const canvas = await html2canvas(contentRef.current, {
                scale: 2,
                logging: false,
                useCORS: true
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`Receipt-${booking.id.slice(0, 8)}.pdf`);

            toast({ title: "Success", description: "Receipt downloaded successfully" });
        } catch (error) {
            console.error('PDF Generation Error:', error);
            toast({ title: "Error", description: "Failed to generate PDF", variant: "destructive" });
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: `Receipt for ${booking.car?.brand} ${booking.car?.model}`,
            text: `Here is my booking receipt for ${booking.car?.brand} ${booking.car?.model}.\nBooking Ref: ${booking.id}\nDuration: ${format(new Date(booking.startDate), 'MMM dd')} - ${format(new Date(booking.endDate), 'MMM dd')}\nTotal: ₹${booking.totalPrice}`,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(`Booking Ref: ${booking.id} - ₹${booking.totalPrice}`);
                toast({ title: "Copied", description: "Booking details copied to clipboard" });
            }
        } catch (err) {
            console.error('Share Error:', err);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Booking Receipt</DialogTitle>
                </DialogHeader>

                <div className="max-h-[70vh] overflow-auto bg-gray-50/50 p-4 rounded-md">
                    <div ref={contentRef} className="p-8 bg-white text-black border-2 border-dashed border-gray-300 shadow-sm mx-auto my-4 max-w-xl font-mono">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-8 border-b-2 border-black pb-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tighter">DriveYoo</h1>
                                <p className="text-sm font-semibold uppercase">Premium Car Rental</p>
                                <p className="text-xs text-gray-500 mt-1">JS Corp HQ, Chennai, India</p>
                                <p className="text-xs text-gray-500">GSTIN: 33ABCDE1234F1Z5</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold uppercase tracking-widest border-2 border-black px-2 py-1 inline-block mb-2">RECEIPT</p>
                                <p className="text-xs text-gray-500">#{booking.id.slice(0, 8).toUpperCase()}</p>
                                <p className="text-xs text-gray-500">{format(new Date(), 'MMM dd, yyyy HH:mm')}</p>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="space-y-8">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Bill To</p>
                                    <p className="font-bold text-lg">{booking.user?.name || 'Valued Customer'}</p>
                                    <p className="text-sm text-gray-600">{booking.user?.email}</p>
                                </div>
                                <div className="text-right">
                                    <QRCode value={booking.id} size={80} level="M" />
                                </div>
                            </div>

                            <div className="border-2 border-black p-4">
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-3 border-b border-gray-200 pb-2">Vehicle Details</p>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-xl">{booking.car?.brand} {booking.car?.model}</p>
                                        <div className="flex gap-2 text-xs uppercase font-medium mt-1">
                                            <span className="bg-gray-100 px-2 py-0.5">{booking.car?.type}</span>
                                            <span className="bg-gray-100 px-2 py-0.5">{booking.car?.transmission}</span>
                                            <span className="bg-gray-100 px-2 py-0.5">{booking.car?.fuelType}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Rate / Day</p>
                                        <p className="font-bold text-lg">₹{booking.car?.pricePerDay}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 border-b-2 border-black pb-6">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Pick Up</p>
                                    <p className="font-bold text-lg">{format(new Date(booking.startDate), 'MMM dd, yyyy')}</p>
                                    <p className="text-xs text-gray-500">10:00 AM</p>
                                    <p className="text-xs text-gray-600 mt-1">JS Corp Hub, Chennai</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Return</p>
                                    <p className="font-bold text-lg">{format(new Date(booking.endDate), 'MMM dd, yyyy')}</p>
                                    <p className="text-xs text-gray-500">10:00 AM</p>
                                    <p className="text-xs text-gray-600 mt-1">JS Corp Hub, Chennai</p>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium">Subtotal</span>
                                    <span className="text-sm font-medium">₹{booking.totalPrice}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-500">Taxes & Fees (Included)</span>
                                    <span className="text-sm font-medium text-gray-500">₹0</span>
                                </div>
                                <div className="flex justify-between items-center text-xl font-bold bg-black text-white p-3 mt-4">
                                    <span>TOTAL PAID</span>
                                    <span>₹{booking.totalPrice}</span>
                                </div>
                                <p className="text-[10px] text-center text-gray-400 mt-2">Paid via Secure Online Payment</p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-8 border-t-2 border-black text-center">
                            <p className="font-bold text-sm mb-1">Thank you for choosing DriveYoo!</p>
                            <p className="text-xs text-gray-500">For issues, contact support at +91 76048 65437</p>
                            <p className="text-[10px] text-gray-400 mt-4">Computer generated receipt. No signature required.</p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:justify-center">
                    <Button onClick={handlePrint} className="gap-2 bg-slate-900 hover:bg-slate-800 text-white">
                        <Printer className="h-4 w-4" />
                        Print Receipt
                    </Button>
                    <Button variant="outline" onClick={handleShare} className="gap-2">
                        <Share2 className="h-4 w-4" />
                        Share
                    </Button>
                    <Button variant="outline" onClick={handleDownloadPDF} disabled={isGeneratingPdf} className="gap-2">
                        {isGeneratingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        Download PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
