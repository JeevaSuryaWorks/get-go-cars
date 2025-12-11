import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

interface PageProps {
    user?: { name: string; role: 'customer' | 'admin' } | null;
    onLogout?: () => void;
}

export function CancellationPolicyPage({ user, onLogout }: PageProps) {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar user={user} onLogout={onLogout} />
            <main className="flex-1 py-12 pt-32">
                <div className="container max-w-4xl">
                    <h1 className="text-3xl font-bold mb-8">Cancellation Policy</h1>

                    <div className="prose max-w-none space-y-6 text-muted-foreground">
                        <p>We understand that plans can change. Here is our policy on cancellations and refunds.</p>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">1. Free Cancellation</h2>
                            <p>You can cancel your booking for free up to 24 hours before your scheduled pickup time. The full amount will be refunded to your original payment method.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">2. Late Cancellation</h2>
                            <p>Cancellations made within 24 hours of the pickup time will incur a cancellation fee equal to 50% of the first day's rental charge.</p>
                        </section>

                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-foreground mb-3">3. No Show</h2>
                            <p>If you fail to pick up the vehicle at the scheduled time without prior cancellation ("No Show"), no refund will be provided.</p>
                        </div>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">4. Refund Process</h2>
                            <p>Refunds are processed within 5-7 business days. To request a cancellation, please use the "My Bookings" page or contact our support team.</p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
