import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    Car, LogOut, LayoutDashboard,
    CarFront, ClipboardList, UserCog, BarChart3, Menu, X, ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
    user?: { name: string; role: 'customer' | 'admin' } | null;
    onLogout?: () => void;
}

export function AdminLayout({ children, title, subtitle, actions, user, onLogout }: AdminLayoutProps) {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth < 1024) setSidebarOpen(false);
            else setSidebarOpen(true);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const sidebarLinks = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: CarFront, label: 'Cars', path: '/admin/cars' },
        { icon: ClipboardList, label: 'Bookings', path: '/admin/bookings' },
        { icon: ShieldAlert, label: 'Security', path: '/admin/incidents' },
        { icon: UserCog, label: 'Users', path: '/admin/users' },
        { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen flex bg-muted/30">
            {/* Sidebar Overlay for Mobile */}
            {isMobile && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex flex-col bg-gradient-to-b from-slate-950 to-slate-900 text-white transition-all duration-300 shadow-2xl border-r border-slate-800",
                    sidebarOpen ? "w-64" : "w-0 lg:w-20 -translate-x-full lg:translate-x-0"
                )}
            >
                <div className="flex h-16 items-center justify-between px-4 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
                    <Link to="/admin" className={cn("flex items-center gap-3 font-bold text-lg", !sidebarOpen && "lg:justify-center w-full")}>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 text-white shrink-0">
                            <Car className="h-5 w-5" />
                        </div>
                        {sidebarOpen && <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">DriveYoo</span>}
                    </Link>
                    {sidebarOpen && isMobile && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white/50 hover:text-white hover:bg-white/5"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    )}
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {sidebarLinks.map((link) => {
                        const active = isActive(link.path);
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                    active
                                        ? "bg-indigo-600/10 text-indigo-400"
                                        : "text-slate-400 hover:text-slate-100 hover:bg-white/5",
                                    !sidebarOpen && "lg:justify-center lg:px-2"
                                )}
                                title={!sidebarOpen ? link.label : undefined}
                            >
                                <link.icon className={cn(
                                    "h-5 w-5 shrink-0 transition-all duration-300",
                                    active ? "text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" : "group-hover:scale-110"
                                )} />
                                {sidebarOpen && <span className="font-medium tracking-wide text-sm">{link.label}</span>}

                                {active && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-transparent pointer-events-none" />
                                )}
                                {active && !sidebarOpen && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.6)]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/5 bg-slate-950/30">
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 group",
                            sidebarOpen ? "justify-start" : "justify-center px-0"
                        )}
                        onClick={onLogout}
                    >
                        <LogOut className={cn("h-5 w-5 transition-transform group-hover:-translate-x-1", sidebarOpen && "mr-3")} />
                        {sidebarOpen && <span>Logout</span>}
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={cn(
                "flex-1 min-h-screen transition-all duration-300",
                sidebarOpen ? "lg:ml-64" : "lg:ml-20"
            )}>
                <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 bg-background/80 backdrop-blur-xl border-b border-border/50 supports-[backdrop-filter]:bg-background/60">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{title}</h1>
                            {subtitle && <p className="text-sm text-muted-foreground hidden sm:block">{subtitle}</p>}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {actions}
                        <div className="h-8 w-[1px] bg-border mx-2 hidden sm:block" />
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium">{user?.name || 'Admin'}</p>
                                <p className="text-xs text-muted-foreground capitalize">{user?.role || 'Administrator'}</p>
                            </div>
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
