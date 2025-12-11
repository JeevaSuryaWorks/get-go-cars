import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CarCard } from '@/components/CarCard';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ArrowRight, Search, Shield, Clock, Award, Star, ChevronRight, CheckCircle2, Zap, MapPin } from 'lucide-react';
import heroCarImage from '@/assets/hero-car.jpg';
import { Car as CarType } from '@/types';

interface IndexPageProps {
  user?: { name: string; role: 'customer' | 'admin' } | null;
  onLogout?: () => void;
}

export default function Index({ user, onLogout }: IndexPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch featured cars (latest 4 available)
  const { data: featuredCars = [] } = useQuery({
    queryKey: ['featured-cars'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;

      return data.map((car: any) => ({
        ...car,
        pricePerDay: car.price_per_day,
        fuelType: car.fuel_type,
        images: car.images || [],
        features: car.features || []
      })) as CarType[];
    }
  });

  const features = [
    { 
        icon: Shield, 
        title: 'Fully Insured', 
        description: 'Drive with total peace of mind knowing you are fully covered.',
        color: 'text-blue-500',
        bg: 'bg-blue-500/10'
    },
    { 
        icon: Clock, 
        title: '24/7 Support', 
        description: 'Our dedicated team is always here to assist you, day or night.',
        color: 'text-green-500',
        bg: 'bg-green-500/10'
    },
    { 
        icon: Award, 
        title: 'Premium Fleet', 
        description: 'Experience the thrill of driving the world\'s finest automobiles.',
        color: 'text-purple-500',
        bg: 'bg-purple-500/10'
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar user={user} onLogout={onLogout} />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-40 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-secondary/20 blur-[100px] translate-y-1/2 -translate-x-1/2" />
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
        </div>

        <div className="container relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                {/* Text Content */}
                <div className="flex-1 text-center lg:text-left space-y-8 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-semibold uppercase tracking-wider">
                        <Star className="h-3 w-3 fill-secondary" />
                        #1 Premium Car Rental in India
                    </div>
                    
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
                        Drive the 
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600"> Extraordinary</span>
                    </h1>
                    
                    <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                        Unleash your journey with our curated collection of luxury and sports cars. 
                        Experience performance, comfort, and style like never before.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                        <Button size="xl" className="text-lg px-8 h-14 shadow-lg hover:shadow-primary/25 transition-all" asChild>
                            <Link to="/cars">
                                Browse Fleet
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button size="xl" variant="outline" className="text-lg px-8 h-14 bg-background/50 hover:bg-background/80 backdrop-blur-sm" asChild>
                            <Link to={user ? "/bookings" : "/auth"}>
                                {user ? "My Bookings" : "Sign Up Now"}
                            </Link>
                        </Button>
                    </div>

                    <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-sm font-medium text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-success" />
                            <span>No Hidden Charges</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-success" />
                            <span>Verified Cars</span>
                        </div>
                    </div>
                </div>

                {/* Hero Image */}
                <div className="flex-1 relative w-full max-w-[600px] lg:max-w-none">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-purple-500/30 rounded-full blur-[80px] animate-pulse-slow" />
                    <img 
                        src="https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop" 
                        alt="Luxury Sports Car" 
                        className="relative z-10 w-full h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    
                    {/* Floating Cards */}
                    <div className="absolute -bottom-6 -left-6 bg-card/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-xl hidden sm:block animate-float">
                        <div className="flex items-center gap-3">
                            <div className="bg-success/20 p-2 rounded-lg text-success">
                                <Zap className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">0-100 km/h</p>
                                <p className="font-bold">2.9s</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="py-24 bg-muted/30 relative">
        <div className="container">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Vehicles</h2>
              <p className="text-lg text-muted-foreground">Hand-picked selection of our finest cars, ready for your next adventure.</p>
            </div>
            <Button variant="ghost" className="group hidden md:flex" asChild>
              <Link to="/cars" className="text-primary text-lg">
                View All Cars
                <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {featuredCars.length > 0 ? (
                featuredCars.map((car) => (
                    <CarCard key={car.id} car={car} />
                ))
            ) : (
                // Skeleton/Loading State
                [1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-[350px] bg-card/50 rounded-xl animate-pulse" />
                ))
            )}
          </div>

          <div className="mt-12 text-center md:hidden">
            <Button size="lg" variant="outline" className="w-full" asChild>
              <Link to="/cars">View All Cars</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Value Proposition / Features */}
      <section className="py-24 bg-background">
        <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose DriveYoo?</h2>
                <p className="text-muted-foreground text-lg">We don't just rent cars; we deliver experiences. Here is what sets us apart.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                    <div key={index} className="group p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/50 hover:shadow-card-hover transition-all duration-300">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-2xl ${feature.bg} ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                            <feature.icon className="h-7 w-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/90">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-20" />
        </div>
        
        <div className="container relative z-10 text-center text-primary-foreground">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Ready to Hit the Road?
            </h2>
            <p className="text-xl opacity-90 leading-relaxed">
              Join thousands of satisfied customers who trust DriveYoo for their premium car rental needs. Your dream car is just a click away.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <Button size="xl" variant="secondary" className="text-lg px-10 h-16 shadow-2xl" asChild>
                <Link to="/cars">
                  Book Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
