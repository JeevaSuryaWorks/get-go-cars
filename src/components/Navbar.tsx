import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, Menu, X, ChevronRight, LogOut, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface NavbarProps {
  user?: { name: string; role: 'customer' | 'admin' } | null;
  onLogout?: () => void;
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = user?.role === 'admin'
    ? [
      { path: '/admin', label: 'Dashboard' },
      { path: '/admin/cars', label: 'Fleet' },
      { path: '/admin/bookings', label: 'Bookings' },
      { path: '/admin/users', label: 'Users' },
    ]
    : [
      { path: '/', label: 'Home' },
      { path: '/cars', label: 'Browse Cars' },
      { path: '/bookings', label: 'My Bookings' },
      { path: '/contact', label: 'Contact' },
    ];

  return (
    <nav
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm"
          : "bg-transparent border-transparent pt-4"
      )}
    >
      <div className={cn("container flex items-center justify-between transition-all", scrolled ? "h-16" : "h-20")}>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg group-hover:shadow-primary/25 transition-all duration-300">
            <span className="font-extrabold text-xl">D</span>
          </div>
          <span className="font-bold text-xl tracking-tight">DriveYoo</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 bg-background/50 backdrop-blur-sm px-2 py-1 rounded-full border border-border/50 shadow-sm">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200",
                isActive(link.path)
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* User Actions */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3 pl-4 border-l border-border/50">
              <Link to='/profile'>
                <div className="flex items-center gap-3 group cursor-pointer">
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">{user.name}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider scale-90 origin-right">{user.role}</p>
                  </div>
                  <Avatar className="h-9 w-9 border-2 border-background shadow-sm group-hover:border-primary transition-colors">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                </div>
              </Link>
              <Button variant="ghost" size="icon" onClick={onLogout} title="Logout" className="rounded-full hover:bg-destructive/10 hover:text-destructive">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/auth" className="text-sm font-medium hover:text-primary transition-colors">
                Login
              </Link>
              <Button className="rounded-full px-6 shadow-gold hover:shadow-gold/50 transition-shadow" asChild>
                <Link to="/auth?mode=register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-xl border-b border-border shadow-xl animate-in slide-in-from-top-2">

          {user && (
            <div className="p-4 border-b border-border/50 bg-muted/30">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-muted-foreground uppercase">{user.role}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link to="/profile">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Profile
                </Link>
              </Button>
            </div>
          )}

          <div className="p-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl transition-colors",
                  isActive(link.path)
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
                <ChevronRight className="h-4 w-4 opacity-50" />
              </Link>
            ))}
          </div>

          <div className="p-4 border-t border-border/50 bg-muted/30">
            {user ? (
              <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/auth">Login</Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link to="/auth?mode=register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
