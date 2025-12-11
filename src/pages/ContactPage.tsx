import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PageProps {
    user?: { name: string; role: 'customer' | 'admin' } | null;
    onLogout?: () => void;
}

export function ContactPage({ user, onLogout }: PageProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: "Message Sent",
            description: "We have received your message and will get back to you soon.",
        });
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar user={user} onLogout={onLogout} />
            <main className="flex-1 py-12 pt-32 bg-muted/30">
                <div className="container max-w-5xl">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
                        <p className="text-muted-foreground text-lg">We'd love to hear from you.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Send us a message</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Name</label>
                                                <Input placeholder="Your name" required />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Email</label>
                                                <Input type="email" placeholder="Your email" required />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Subject</label>
                                            <Input placeholder="How can we help?" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Message</label>
                                            <Textarea placeholder="Type your message here..." className="h-32" required />
                                        </div>
                                        <Button type="submit" className="w-full">Send Message</Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xl font-bold mb-4">Get in Touch</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <MapPin className="h-6 w-6 text-primary shrink-0" />
                                        <div>
                                            <h4 className="font-semibold">Visit Us</h4>
                                            <p className="text-muted-foreground">JS Corp HQ,<br />123 Rental Avenue,<br />Chennai, Tamil Nadu 600001,<br />India</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <Phone className="h-6 w-6 text-primary shrink-0" />
                                        <div>
                                            <h4 className="font-semibold">Call Us</h4>
                                            <p className="text-muted-foreground">+91 76048 65437</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <Mail className="h-6 w-6 text-primary shrink-0" />
                                        <div>
                                            <h4 className="font-semibold">Email Us</h4>
                                            <p className="text-muted-foreground">support@driveyoo.com</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <Clock className="h-6 w-6 text-primary shrink-0" />
                                        <div>
                                            <h4 className="font-semibold">Business Hours</h4>
                                            <p className="text-muted-foreground">Mon - Sat: 09:00 AM - 08:00 PM</p>
                                            <p className="text-muted-foreground">Sun: 10:00 AM - 06:00 PM</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
