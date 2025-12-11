import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { HelpCircle, Mail, Phone, MessageSquare } from "lucide-react";

interface PageProps {
    user?: { name: string; role: 'customer' | 'admin' } | null;
    onLogout?: () => void;
}

export function HelpCenterPage({ user, onLogout }: PageProps) {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar user={user} onLogout={onLogout} />
            <main className="flex-1 py-12 pt-32 bg-muted/30">
                <div className="container max-w-4xl">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold mb-4">How can we help?</h1>
                        <p className="text-muted-foreground text-lg">Browse our guides or contact support.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                            <Phone className="h-10 w-10 mx-auto text-primary mb-4" />
                            <h3 className="font-semibold text-lg mb-2">Call Us</h3>
                            <p className="text-sm text-muted-foreground mb-4">Available 09:00 - 18:00</p>
                            <Button variant="outline" asChild>
                                <a href="tel:+917604865437">+91 76048 65437</a>
                            </Button>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                            <Mail className="h-10 w-10 mx-auto text-primary mb-4" />
                            <h3 className="font-semibold text-lg mb-2">Email Us</h3>
                            <p className="text-sm text-muted-foreground mb-4">We reply within 24 hours</p>
                            <Button variant="outline" asChild>
                                <a href="mailto:support@driveyoo.com">Email Support</a>
                            </Button>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                            <MessageSquare className="h-10 w-10 mx-auto text-primary mb-4" />
                            <h3 className="font-semibold text-lg mb-2">Live Chat</h3>
                            <p className="text-sm text-muted-foreground mb-4">Chat with our agents</p>
                            <Button variant="outline" disabled>
                                Coming Soon
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Popular Topics</h2>
                        <div className="grid gap-4">
                            <Link to="/cancellation-policy" className="p-4 bg-white rounded border hover:bg-muted/50 transition-colors flex justify-between items-center bg-white">
                                <span className="font-medium">How to cancel a booking?</span>
                                <HelpCircle className="h-5 w-5 text-muted-foreground" />
                            </Link>
                            <Link to="/faqs" className="p-4 bg-white rounded border hover:bg-muted/50 transition-colors flex justify-between items-center bg-white">
                                <span className="font-medium">Payment methods accepted</span>
                                <HelpCircle className="h-5 w-5 text-muted-foreground" />
                            </Link>
                            <Link to="/faqs" className="p-4 bg-white rounded border hover:bg-muted/50 transition-colors flex justify-between items-center bg-white">
                                <span className="font-medium">Documents required for rental</span>
                                <HelpCircle className="h-5 w-5 text-muted-foreground" />
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
