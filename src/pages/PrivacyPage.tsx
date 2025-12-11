import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

interface PageProps {
    user?: { name: string; role: 'customer' | 'admin' } | null;
    onLogout?: () => void;
}

export function PrivacyPage({ user, onLogout }: PageProps) {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar user={user} onLogout={onLogout} />
            <main className="flex-1 py-12 pt-32">
                <div className="container max-w-4xl">
                    <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

                    <div className="prose max-w-none space-y-6 text-muted-foreground">
                        <p>Last updated: {new Date().toLocaleDateString()}</p>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
                            <p>We collect information you provide directly to us, such as your name, email address, phone number, and payment information when you create an account or make a booking.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
                            <p>We use your information to facilitate your car rental, process payments, communicate with you about your booking, and improve our services.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">3. Data Sharing</h2>
                            <p>We do not share your personal information with third parties except as necessary to provide our services (e.g., payment processors, insurance providers) or as required by law.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">4. Security</h2>
                            <p>We implement reasonable security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.</p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
