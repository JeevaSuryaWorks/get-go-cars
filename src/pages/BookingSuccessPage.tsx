import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Calendar, Download, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Car } from '@/types';
import QRCode from 'react-qr-code';

interface BookingSuccessPageProps {
  user?: { name: string; role: 'customer' | 'admin' } | null;
  onLogout?: () => void;
}

interface SuccessState {
  bookingId: string;
  car: Car;
  startDate: Date;
  endDate: Date;
  total: number;
}

export function BookingSuccessPage({ user, onLogout }: BookingSuccessPageProps) {
  const location = useLocation();
  const state = location.state as SuccessState | null;

  if (!state) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} onLogout={onLogout} />
        <main className="flex-1 container flex items-center justify-center py-12 pt-32">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">No booking data</h1>
            <Button asChild>
              <Link to="/cars">Browse Cars</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const { bookingId, car, startDate, endDate, total } = state;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="print:hidden">
        <Navbar user={user} onLogout={onLogout} />
      </div>

      <main className="flex-1 py-16 print:py-0 print:m-0">
        <div className="container max-w-2xl print:max-w-none print:p-8">
          <div className="text-center mb-8 animate-fade-up print:hidden">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground">
              Your reservation has been successfully placed
            </p>
          </div>

          <Card className="shadow-card animate-fade-up print:shadow-none print:border-none" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-6 space-y-6 print:p-0">
              {/* Receipt Header for Print */}
              <div className="hidden print:block text-center mb-8 border-b pb-4">
                <h1 className="text-3xl font-bold">DriveYoo</h1>
                <p className="text-sm text-gray-500">Premium Car Rental Service</p>
                <p className="text-xl font-semibold mt-4">Booking Receipt</p>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-border pb-6">
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Booking Reference</p>
                  <p className="text-xl font-mono font-bold break-all">{bookingId}</p>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">Date Issued</p>
                    <p className="font-medium">{format(new Date(), 'PPP')}</p>
                  </div>
                </div>
                <div className="bg-white p-2 rounded-lg border w-fit mx-auto md:mx-0">
                  <QRCode value={bookingId} size={100} level="M" />
                </div>
              </div>

              <div className="flex gap-4 print:py-4">
                <div className="w-32 h-20 rounded-lg overflow-hidden bg-muted print:hidden">
                  <img
                    src={car.images[0]}
                    alt={car.model}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-lg">{car.brand} {car.model}</p>
                  <p className="text-sm text-muted-foreground">
                    {car.year} • {car.type} • {car.transmission}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Car ID: {car.id.slice(0, 8)}...</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 print:gap-8">
                <div className="p-4 rounded-lg bg-muted print:bg-transparent print:border print:p-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Pickup</span>
                  </div>
                  <p className="font-medium">{format(new Date(startDate), 'PPP')}</p>
                  <p className="text-sm text-muted-foreground">10:00 AM</p>
                </div>
                <div className="p-4 rounded-lg bg-muted print:bg-transparent print:border print:p-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Return</span>
                  </div>
                  <p className="font-medium">{format(new Date(endDate), 'PPP')}</p>
                  <p className="text-sm text-muted-foreground">10:00 AM</p>
                </div>
              </div>

              <div className="flex justify-between items-center py-4 border-t border-border print:border-t-2 print:border-black">
                <span className="text-muted-foreground print:text-black font-semibold">Total Paid</span>
                <span className="text-2xl font-bold">₹{total.toFixed(2)}</span>
              </div>

              <div className="hidden print:block text-center pt-8 text-sm text-gray-500">
                <p>Thank you for choosing DriveYoo!</p>
                <p>Support: support@driveyoo.com | +91 1800-123-4567</p>
                <p>© {new Date().getFullYear()} JS Corp.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 print:hidden justify-center items-center">
                <Button variant="secondary" className="w-full sm:w-auto" asChild>
                  <Link to="/bookings">
                    View My Bookings & Receipt
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8 animate-fade-up print:hidden" style={{ animationDelay: '0.2s' }}>
            <p className="text-sm text-muted-foreground mb-4">
              A confirmation email has been sent to your email address
            </p>
            <Button variant="ghost" asChild>
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
