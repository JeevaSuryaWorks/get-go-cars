import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface PageProps {
    user?: { name: string; role: 'customer' | 'admin' } | null;
    onLogout?: () => void;
}

export function FaqPage({ user, onLogout }: PageProps) {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar user={user} onLogout={onLogout} />
            <main className="flex-1 py-12 pt-32 bg-muted/30">
                <div className="container max-w-3xl">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
                        <p className="text-muted-foreground text-lg">Everything you need to know about DriveYoo.</p>
                    </div>

                    <div className="bg-white p-8 rounded-lg shadow-sm border">
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>What documents do I need to rent a car?</AccordionTrigger>
                                <AccordionContent>
                                    You need a valid driver's license, an ID proof (Aadhaar/Passport), and a credit/debit card for the security deposit. International renters must provide a valid passport and international driving permit.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>Is there a daily mileage limit?</AccordionTrigger>
                                <AccordionContent>
                                    Most of our rentals come with unlimited mileage. However, some luxury vehicles may have a daily limit of 250km, after which excess charges apply. Please check the specific car details page.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger>Can I cancel my booking?</AccordionTrigger>
                                <AccordionContent>
                                    Yes, you can cancel your booking. Cancellations made 24 hours before pickup are eligible for a full refund. Late cancellations may incur a fee. Please refer to our Cancellation Policy for more details.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-4">
                                <AccordionTrigger>How do I pay for my rental?</AccordionTrigger>
                                <AccordionContent>
                                    We accept all major credit/debit cards, UPI, and Digital Wallets. You can pay securely online at the time of booking.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-5">
                                <AccordionTrigger>What happens if the car breaks down?</AccordionTrigger>
                                <AccordionContent>
                                    All our cars include 24/7 roadside assistance. In the unlikely event of a breakdown, call our support line immediately, and we will arrange for assistance or a replacement vehicle.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
