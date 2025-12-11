import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail } from 'lucide-react';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className="bg-[#0f172a] text-slate-300 border-t border-slate-800">
      <div className="container py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">

          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 font-bold text-2xl text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 text-black shadow-lg shadow-yellow-500/20">
                <span className="font-extrabold">D</span>
              </div>
              <span>DriveYoo</span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm text-slate-400">
              Experience the thrill of the road with our premium fleet.
              Luxury, comfort, and performance delivered to your doorstep.
            </p>
            <div className="flex items-center gap-4">
              <SocialLink href="#" icon={Facebook} />
              <SocialLink href="#" icon={Twitter} />
              <SocialLink href="#" icon={Instagram} />
              <SocialLink href="#" icon={Linkedin} />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="font-bold text-white tracking-wide">Explore</h4>
            <ul className="space-y-3 text-sm">
              <li><FooterLink to="/cars">Browse Fleet</FooterLink></li>
              <li><FooterLink to="/bookings">My Bookings</FooterLink></li>
              <li><FooterLink to="/auth">Login / Sign Up</FooterLink></li>
              <li><FooterLink to="/about">About Us</FooterLink></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h4 className="font-bold text-white tracking-wide">Support</h4>
            <ul className="space-y-3 text-sm">
              <li><FooterLink to="/help">Help Center</FooterLink></li>
              <li><FooterLink to="/contact">Contact Support</FooterLink></li>
              <li><FooterLink to="/terms">Terms of Service</FooterLink></li>
              <li><FooterLink to="/privacy">Privacy Policy</FooterLink></li>
            </ul>
          </div>

          {/* Team Section */}
          <div className="space-y-6">
            <h4 className="font-bold text-white tracking-wide">Our Team</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex flex-col">
                <span className="font-semibold text-white">Magisesan S</span>
                <span className="text-xs text-yellow-500 font-medium">Team Lead</span>
              </li>
              <li className="flex flex-col">
                <span className="font-semibold text-white">Abdul Ajeez N</span>
                <span className="text-xs text-slate-500">Developer</span>
              </li>
              <li className="flex flex-col">
                <span className="font-semibold text-white">Danial Raj A</span>
                <span className="text-xs text-slate-500">Developer</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} JS Corp. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Made with ❤️ in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon: Icon }: { href: string; icon: any }) {
  return (
    <a
      href={href}
      className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-yellow-500 hover:text-black transition-all duration-300"
    >
      <Icon className="h-4 w-4" />
    </a>
  )
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="block hover:text-yellow-400 hover:translate-x-1 transition-all duration-200">
      {children}
    </Link>
  )
}
