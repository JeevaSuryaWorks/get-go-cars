import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car, Mail, Lock, User, ArrowRight, Loader2, Gauge, MapPin, Fuel } from 'lucide-react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export function AuthPage() {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (error) throw error;

      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        toast({ title: "Welcome back!", description: "Engine started. You have successfully logged in." });
        navigate(profile?.role === 'admin' ? '/admin' : '/');
      }
    } catch (error: any) {
      toast({ title: "Ignition Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({ title: "Gear Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: registerForm.email,
        password: registerForm.password,
        options: { data: { full_name: registerForm.name } },
      });

      if (error) throw error;
      toast({ title: "Registration Successful", description: "Please check your email to verify your account." });
      navigate('/');
    } catch (error: any) {
      toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#0f172a] text-slate-100 font-sans overflow-hidden">

      {/* Left: Form Cockpit */}
      <div className="relative flex flex-col items-center justify-center p-6 md:p-12 z-20">
        {/* Animated Road Background Texture */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)] mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f172a]/80 to-[#0f172a]"></div>
        </div>

        <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 group z-30">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 text-black shadow-lg shadow-yellow-500/20 transition-transform group-hover:scale-110">
            <span className="font-extrabold text-lg">D</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-white group-hover:text-yellow-500 transition-colors">DriveYoo</span>
        </Link>

        <div className={cn("w-full max-w-md space-y-8 relative z-10 transition-all duration-700 ease-out", mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10")}>
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
              {activeTab === 'login' ? 'Start Your Engine' : 'Join the Race'}
            </h1>
            <p className="text-slate-400">
              {activeTab === 'login' ? 'Enter your credentials to hit the road.' : 'Create an account to access our premium fleet.'}
            </p>
          </div>

          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 p-1 bg-slate-800/50 rounded-t-none border-b border-slate-700/50">
                <TabsTrigger value="login" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black font-semibold transition-all">ACCELERATE (LOGIN)</TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black font-semibold transition-all">IGNITE (SIGN UP)</TabsTrigger>
              </TabsList>

              <CardContent className="p-6 md:p-8">
                <TabsContent value="login" className="mt-0 space-y-6 animate-in slide-in-from-left-4 fade-in duration-300">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-slate-300">Driver Email</Label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-yellow-500 transition-colors" />
                        <Input id="login-email" type="email" placeholder="driver@driveyoo.com"
                          className="pl-10 bg-slate-950/50 border-slate-700 focus:border-yellow-500/50 focus:ring-yellow-500/20 text-slate-100 h-11"
                          value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="login-password" className="text-slate-300">Access Key</Label>
                        <Link to="/forgot-password" className="text-xs text-yellow-500 hover:text-yellow-400 transition-colors">Lost Key?</Link>
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-yellow-500 transition-colors" />
                        <Input id="login-password" type="password" placeholder="••••••••"
                          className="pl-10 bg-slate-950/50 border-slate-700 focus:border-yellow-500/50 focus:ring-yellow-500/20 text-slate-100 h-11"
                          value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold text-lg shadow-gold hover:shadow-yellow-500/20 transition-all transform hover:scale-[1.02]" disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <>START ENGINE <ArrowRight className="ml-2 h-5 w-5" /></>}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="mt-0 space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-name" className="text-slate-300">Full Name</Label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-yellow-500 transition-colors" />
                        <Input id="reg-name" placeholder="John Racer" className="pl-10 bg-slate-950/50 border-slate-700 focus:border-yellow-500/50 focus:ring-yellow-500/20 text-slate-100 h-11"
                          value={registerForm.name} onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email" className="text-slate-300">Email Address</Label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-yellow-500 transition-colors" />
                        <Input id="reg-email" type="email" placeholder="driver@driveyoo.com" className="pl-10 bg-slate-950/50 border-slate-700 focus:border-yellow-500/50 focus:ring-yellow-500/20 text-slate-100 h-11"
                          value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-pass" className="text-slate-300">Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-yellow-500 transition-colors" />
                        <Input id="reg-pass" type="password" placeholder="••••••••" className="pl-10 bg-slate-950/50 border-slate-700 focus:border-yellow-500/50 focus:ring-yellow-500/20 text-slate-100 h-11"
                          value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-confirm" className="text-slate-300">Confirm Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-yellow-500 transition-colors" />
                        <Input id="reg-confirm" type="password" placeholder="••••••••" className="pl-10 bg-slate-950/50 border-slate-700 focus:border-yellow-500/50 focus:ring-yellow-500/20 text-slate-100 h-11"
                          value={registerForm.confirmPassword} onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })} required />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold text-lg shadow-gold hover:shadow-yellow-500/20 transition-all transform hover:scale-[1.02]" disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <>JOIN THE FLEET <ArrowRight className="ml-2 h-5 w-5" /></>}
                    </Button>
                  </form>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-6 text-slate-500 text-sm font-medium opacity-70">
            <span className="flex items-center gap-1"><Car className="w-4 h-4" /> 50+ Cars</span>
            <span className="flex items-center gap-1"><User className="w-4 h-4" /> 2k+ Drivers</span>
            <span className="flex items-center gap-1"><Gauge className="w-4 h-4" /> 24/7 Service</span>
          </div>
        </div>
      </div>

      {/* Right: Immersive Visuals */}
      <div className="hidden lg:relative lg:flex items-center justify-center bg-black overflow-hidden group">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=2000&auto=format&fit=crop"
            alt="Supercar Dashboard"
            className="w-full h-full object-cover opacity-60 scale-105 group-hover:scale-110 transition-transform duration-[20s] ease-linear" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#0f172a]/50 to-[#0f172a]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-40"></div>
        </div>

        {/* HUD Overlay */}
        <div className="relative z-10 w-full max-w-lg p-8">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-yellow-500/20 rounded-full text-yellow-500">
                <Gauge className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-mono font-bold text-white">240 <span className="text-xs text-slate-400">KM/H</span></div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">Top Speed</div>
              </div>
            </div>
            <div className="bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-full text-blue-500">
                <Fuel className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-mono font-bold text-white">100%</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">Fuel Status</div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-5xl font-extrabold text-white leading-tight">
              Drive the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Extraordinary</span>
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed max-w-md">
              Unlock access to the world's most exclusive fleet. From Italian supercars to German engineering, your dream ride awaits.
            </p>

            <div className="flex items-center gap-2 pt-4">
              <div className="h-1 w-20 bg-yellow-500 rounded-full"></div>
              <div className="h-1 w-8 bg-slate-700 rounded-full"></div>
              <div className="h-1 w-8 bg-slate-700 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
