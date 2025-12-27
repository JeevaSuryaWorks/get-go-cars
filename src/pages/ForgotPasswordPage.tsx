import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, ArrowRight, Loader2, Key, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            });

            if (error) throw error;

            setIsSubmitted(true);
            toast({
                title: "Recovery Code Dispatched",
                description: "Check your inbox for the emergency access link.",
            });
        } catch (error: any) {
            toast({
                title: "Dispatch Failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-slate-100 p-4 relative overflow-hidden font-sans">

            {/* Background Ambience */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)] opacity-10"></div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 opacity-40"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 opacity-40"></div>
            </div>

            <Card className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border-slate-800 shadow-2xl relative z-10 animate-fade-up group overflow-hidden">
                {/* Top Danger Stripe */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 loading-bar"></div>

                <CardHeader className="text-center space-y-4 pt-8">
                    <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center ring-1 ring-red-500/30 group-hover:scale-110 transition-transform duration-500">
                        <ShieldAlert className="w-8 h-8 text-red-500" />
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-bold tracking-tight text-white">Emergency Access</CardTitle>
                        <CardDescription className="text-slate-400">
                            Lost your keys? We'll mobilize a recovery team.
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6 pb-8 px-8">
                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-300">Registered Email</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="driver@driveyoo.com"
                                        className="pl-10 bg-slate-950/50 border-slate-700 focus:border-red-500/50 focus:ring-red-500/20 text-slate-100 h-11"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-semibold transition-all shadow-lg hover:shadow-red-500/25"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Dispatching...
                                    </>
                                ) : (
                                    <>
                                        Send Recovery Link
                                    </>
                                )}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                                <p className="font-semibold">Signal Sent Successfully</p>
                                <p className="mt-1 opacity-80">Check your email inbox for the password reset link.</p>
                            </div>
                        </div>
                    )}

                    <div className="pt-2 text-center">
                        <Button variant="link" className="text-slate-400 hover:text-white" asChild>
                            <Link to="/auth" className="flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Login
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
