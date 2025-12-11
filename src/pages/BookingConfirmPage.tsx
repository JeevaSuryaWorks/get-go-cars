import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ChevronLeft, CreditCard, Wallet, CheckCircle2,
  Calendar, MapPin, ArrowRight, Tag, Smartphone, QrCode,
  Upload, User, FileText, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { Car, Addon } from '@/types';
import QRCode from 'react-qr-code';

interface BookingConfirmPageProps {
  user?: { name: string; role: 'customer' | 'admin' } | null;
  onLogout?: () => void;
}

interface BookingState {
  car: Car;
  startDate: Date;
  endDate: Date;
  addons: Addon[];
  total: number;
}

export function BookingConfirmPage({ user, onLogout }: BookingConfirmPageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as BookingState | null;

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet' | 'upi'>('upi');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Expanded Billing State
  const [billingInfo, setBillingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    licenseNumber: '',
    city: '',
    pinCode: '',
    emergencyContact: '',
    idType: 'aadhaar' as 'aadhaar' | 'pan', // Default to Aadhaar
    idNumber: '',
    alternateId: ''
  });

  // Simple state for file inputs (just visual for now)
  const [files, setFiles] = useState({
    licenseFront: null as File | null,
    licenseBack: null as File | null,
    profilePhoto: null as File | null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof typeof files) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
    }
  };

  if (!state) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} onLogout={onLogout} />
        <main className="flex-1 flex items-center justify-center">
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

  const { car, startDate, endDate, addons, total } = state;
  const discount = promoApplied ? total * 0.1 : 0;
  const finalTotal = total - discount;

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === 'drive10') {
      setPromoApplied(true);
      toast({
        title: "Promo applied!",
        description: "10% discount has been applied to your booking.",
      });
    } else {
      toast({
        title: "Invalid code",
        description: "The promo code you entered is not valid.",
        variant: "destructive",
      });
    }
  };

  const handlePayment = async () => {
    if (!termsAccepted) {
      toast({
        title: "Accept terms",
        description: "Please accept the terms and conditions to proceed.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to book.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create Booking
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: (user as any).id, // casting because user object structure might differ slightly in auth context vs db
          car_id: car.id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          total_price: finalTotal,
          status: 'pending',
          addons: addons // storing addons as JSON
        })
        .select() // select to get the ID
        .single();

      if (bookingError) throw bookingError;

      // 2. Create Payment Record (Mock)
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          booking_id: bookingData.id,
          amount: finalTotal,
          status: 'succeeded', // assuming instant success for demo
          payment_method: paymentMethod
        });

      if (paymentError) {
        console.error('Payment Error', paymentError);
        // In a real app we might roll back booking or mark as payment_failed
      }

      toast({
        title: "Booking confirmed!",
        description: "Your booking has been successfully placed.",
      });

      navigate('/booking/success', {
        state: {
          bookingId: bookingData.id,
          car,
          startDate,
          endDate,
          total: finalTotal,
        },
      });

    } catch (error: any) {
      console.error('Booking Error:', error);
      toast({
        title: "Booking failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} onLogout={onLogout} />

      <main className="flex-1 container py-8 pt-32">
        <div className="container max-w-4xl">
          <Button variant="ghost" asChild className="mb-6">
            <Link to={`/cars/${car.id}`}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Car
            </Link>
          </Button>

          <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left Column: Form Section */}
            <div className="lg:col-span-3 space-y-6">

              {/* Personal & Verification Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal & Verification Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullname">Full Name</Label>
                      <Input
                        id="fullname"
                        placeholder="John Doe"
                        value={billingInfo.fullName}
                        onChange={(e) => setBillingInfo({ ...billingInfo, fullName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        placeholder="john@example.com"
                        value={billingInfo.email}
                        onChange={(e) => setBillingInfo({ ...billingInfo, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="+91 98765 43210"
                        value={billingInfo.phone}
                        onChange={(e) => setBillingInfo({ ...billingInfo, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={billingInfo.dob}
                        onChange={(e) => setBillingInfo({ ...billingInfo, dob: e.target.value })}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* License Info */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Driving License Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="license">License Number</Label>
                        <Input
                          id="license"
                          placeholder="DL-1234567890"
                          value={billingInfo.licenseNumber}
                          onChange={(e) => setBillingInfo({ ...billingInfo, licenseNumber: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Valid Upto (Optional)</Label>
                        <Input id="expiry" placeholder="MM/YYYY" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="front-dl">License Front Image</Label>
                        <div className="border border-dashed border-input rounded-md p-4 text-center cursor-pointer hover:bg-muted/50 transition relative">
                          <Input
                            id="front-dl"
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'licenseFront')}
                          />
                          <div className="flex flex-col items-center gap-1">
                            <Upload className="h-5 w-5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{files.licenseFront ? files.licenseFront.name : "Upload Front Side"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="back-dl">License Back Image</Label>
                        <div className="border border-dashed border-input rounded-md p-4 text-center cursor-pointer hover:bg-muted/50 transition relative">
                          <Input
                            id="back-dl"
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'licenseBack')}
                          />
                          <div className="flex flex-col items-center gap-1">
                            <Upload className="h-5 w-5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{files.licenseBack ? files.licenseBack.name : "Upload Back Side"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Identity Proof */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Identity Proof</h4>
                    <RadioGroup
                      value={billingInfo.idType}
                      onValueChange={(v) => setBillingInfo({ ...billingInfo, idType: v as 'aadhaar' | 'pan' })}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="aadhaar" id="r1" />
                        <Label htmlFor="r1">Aadhaar Card</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pan" id="r2" />
                        <Label htmlFor="r2">PAN Card</Label>
                      </div>
                    </RadioGroup>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="id-num">{billingInfo.idType === 'aadhaar' ? 'Aadhaar Number' : 'PAN Number'}</Label>
                        <Input
                          id="id-num"
                          placeholder={billingInfo.idType === 'aadhaar' ? 'XXXX XXXX XXXX' : 'ABCDE1234F'}
                          value={billingInfo.idNumber}
                          onChange={(e) => setBillingInfo({ ...billingInfo, idNumber: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="alt-id">Alternate ID (Optional)</Label>
                        <Input
                          id="alt-id"
                          placeholder="Passport / Voter ID"
                          value={billingInfo.alternateId}
                          onChange={(e) => setBillingInfo({ ...billingInfo, alternateId: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Address & Emergency */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Additional Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          placeholder="Chennai"
                          value={billingInfo.city}
                          onChange={(e) => setBillingInfo({ ...billingInfo, city: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pincode">PIN Code</Label>
                        <Input
                          id="pincode"
                          placeholder="600001"
                          value={billingInfo.pinCode}
                          onChange={(e) => setBillingInfo({ ...billingInfo, pinCode: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergency">Emergency Contact (Optional)</Label>
                        <Input
                          id="emergency"
                          placeholder="Name & Phone"
                          value={billingInfo.emergencyContact}
                          onChange={(e) => setBillingInfo({ ...billingInfo, emergencyContact: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-pic">Profile Photo (Optional)</Label>
                        <div className="border border-dashed border-input rounded-md px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition relative">
                          <Input
                            id="profile-pic"
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'profilePhoto')}
                          />
                          <span className="text-sm text-muted-foreground truncate max-w-[150px]">{files.profilePhoto ? files.profilePhoto.name : "Select Photo"}</span>
                          <Upload className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'card' | 'wallet' | 'upi')}>

                    {/* UPI Option */}
                    <div className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                      <RadioGroupItem value="upi" id="upi" className="mt-1" />
                      <Label htmlFor="upi" className="flex flex-col gap-2 cursor-pointer flex-1">
                        <div className="flex items-center gap-2">
                          <QrCode className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">UPI / QR Code</p>
                            <p className="text-xs text-muted-foreground">Scan and pay with GPay, PhonePe, Paytm</p>
                          </div>
                        </div>
                        {paymentMethod === 'upi' && (
                          <div className="mt-3 bg-white p-4 rounded border flex flex-col items-center animate-in fade-in slide-in-from-top-2">
                            <p className="text-xs font-semibold text-center mb-2 uppercase tracking-wide">Scan to Pay ₹{finalTotal.toFixed(2)}</p>
                            <QRCode value={`upi://pay?pa=jsrental@upi&pn=JS Corp&am=${finalTotal.toFixed(2)}&cu=INR`} size={150} />
                            <div className="flex gap-4 mt-4 opacity-70">
                              <Smartphone className="h-4 w-4" />
                              <span className="text-xs">Supported by all UPI apps</span>
                            </div>
                          </div>
                        )}
                      </Label>
                    </div>

                    <div className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                        <CreditCard className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Credit/Debit Card</p>
                          <p className="text-xs text-muted-foreground">Pay securely with your card</p>
                        </div>
                      </Label>
                    </div>

                    {paymentMethod === 'card' && (
                      <div className="ml-8 space-y-4 border-l-2 pl-4 py-2 animate-in fade-in slide-in-from-left-2">
                        <div className="space-y-2">
                          <Label htmlFor="card-number">Card Number</Label>
                          <Input id="card-number" placeholder="1234 5678 9012 3456" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <Input id="expiry" placeholder="MM/YY" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvv">CVV</Label>
                            <Input id="cvv" placeholder="123" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="name">Cardholder Name</Label>
                          <Input id="name" placeholder="John Doe" />
                        </div>
                      </div>
                    )}

                    <div className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${paymentMethod === 'wallet' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                      <RadioGroupItem value="wallet" id="wallet" />
                      <Label htmlFor="wallet" className="flex items-center gap-3 cursor-pointer flex-1">
                        <Wallet className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Digital Wallet</p>
                          <p className="text-xs text-muted-foreground">Apple Pay, Google Pay</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Promo Code */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Promo Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={promoApplied}
                    />
                    <Button
                      variant="outline"
                      onClick={applyPromoCode}
                      disabled={promoApplied || !promoCode}
                    >
                      {promoApplied ? <CheckCircle2 className="h-4 w-4 text-success" /> : 'Apply'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Try code: DRIVE10 for 10% off
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Summary */}
            <div className="lg:col-span-2">
              <Card className="sticky top-24 shadow-card border-none bg-secondary/5">
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Car Thumbnail */}
                  <div className="flex gap-3 mb-4">
                    <div className="w-20 h-14 rounded overflow-hidden bg-muted flex-shrink-0">
                      <img src={car.images[0]} alt={car.model} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{car.brand} {car.model}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(startDate), 'MMM dd')} - {format(new Date(endDate), 'MMM dd')}</p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Car rental</span>
                      <span>₹{total - addons.reduce((s, a) => s + a.price, 0)}</span>
                    </div>
                    {addons.length > 0 && (
                      <>
                        {addons.map((addon) => (
                          <div key={addon.id} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{addon.name}</span>
                            <span>₹{addon.price}</span>
                          </div>
                        ))}
                      </>
                    )}
                    {promoApplied && (
                      <div className="flex justify-between text-sm text-success">
                        <span>Promo discount (10%)</span>
                        <span>-₹{discount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>

                  <div className="flex items-start gap-2 pt-4">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                    />
                    <label htmlFor="terms" className="text-xs text-muted-foreground cursor-pointer leading-tight">
                      I agree to the <span className="underline hover:text-primary">Terms of Service</span>, <span className="underline hover:text-primary">Privacy Policy</span>, and <span className="underline hover:text-primary">Cancellation Policy</span>
                    </label>
                  </div>

                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full shadow-lg"
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      'Processing Payment...'
                    ) : (
                      <>
                        Pay ₹{finalTotal.toFixed(2)}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
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
