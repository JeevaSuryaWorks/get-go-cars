import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

interface PageProps {
    user?: { name: string; role: 'customer' | 'admin' } | null;
    onLogout?: () => void;
}

export function TermsPage({ user, onLogout }: PageProps) {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar user={user} onLogout={onLogout} />
            <main className="flex-1 py-12 pt-32">
                <div className="container max-w-4xl">
                    <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

                    <div className="prose max-w-none space-y-6 text-muted-foreground">
                        <p>Last updated: {new Date().toLocaleDateString()}</p>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">1. Agreement</h2>
                            <p>By accessing or using the DriveYoo website and services, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access our services.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">2. Eligibility</h2>
                            <p>To rent a vehicle, you must be at least 21 years old and possess a valid driver's license. You must verify your identity using government-issued ID documents.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">3. Vehicle Use</h2>
                            <p>The vehicle must only be driven by the person named in the rental agreement. You are responsible for any fines or penalties incurred during the rental period. Smoking and pets are strictly prohibited in the vehicles.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">4. Insurance and Liability</h2>
                            <p>Basic insurance is included with all rentals. However, you are liable for damages up to the deductible amount specified in your agreement. Negligence or violation of terms voids insurance coverage.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">5. Termination</h2>
                            <p>We reserve the right to terminate your rental and retrieve the vehicle without notice if you breach these terms or if the vehicle is used for illegal purposes.</p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
