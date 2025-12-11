import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import { CarsPage } from "./pages/CarsPage";
import { CarDetailPage } from "./pages/CarDetailPage";
import { BookingConfirmPage } from "./pages/BookingConfirmPage";
import { BookingSuccessPage } from "./pages/BookingSuccessPage";
import { BookingsPage } from "./pages/BookingsPage";
import { AuthPage } from "./pages/AuthPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminCarsPage } from "./pages/admin/AdminCarsPage";
import { AdminBookingsPage } from "./pages/admin/AdminBookingsPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminReportsPage } from "./pages/admin/AdminReportsPage";
import { AdminCarForm } from "./pages/admin/AdminCarForm";
import { AdminEditCarPage } from "./pages/admin/AdminEditCarPage";
import { ProfilePage } from "./pages/ProfilePage";
import { HelpCenterPage } from "./pages/HelpCenterPage";
import { ContactPage } from "./pages/ContactPage";
import { FaqPage } from "./pages/FaqPage";
import { TermsPage } from "./pages/TermsPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { CancellationPolicyPage } from "./pages/CancellationPolicyPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, signOut } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={<Index user={user} onLogout={signOut} />}
      />
      <Route
        path="/cars"
        element={<CarsPage user={user} onLogout={signOut} />}
      />
      <Route
        path="/cars/:id"
        element={<CarDetailPage user={user} onLogout={signOut} />}
      />
      <Route
        path="/auth"
        element={
          user ? (
            <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />
          ) : (
            <AuthPage />
          )
        }
      />

      {/* Customer routes */}
      <Route
        path="/booking/confirm"
        element={<BookingConfirmPage user={user} onLogout={signOut} />}
      />
      <Route
        path="/booking/success"
        element={<BookingSuccessPage user={user} onLogout={signOut} />}
      />
      <Route
        path="/bookings"
        element={
          user ? (
            <BookingsPage user={user} onLogout={signOut} />
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          user?.role === 'admin' ? (
            <AdminDashboard user={user} onLogout={signOut} />
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
      <Route
        path="/admin/cars"
        element={
          user?.role === 'admin' ? (
            <AdminCarsPage user={user} onLogout={signOut} />
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
      <Route
        path="/admin/cars/new"
        element={
          user?.role === 'admin' ? (
            <AdminCarForm user={user} onLogout={signOut} />
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
      <Route
        path="/admin/cars/:id/edit"
        element={
          user?.role === 'admin' ? (
            <AdminEditCarPage user={user} onLogout={signOut} />
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
      <Route
        path="/admin/bookings"
        element={
          user?.role === 'admin' ? (
            <AdminBookingsPage user={user} onLogout={signOut} />
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
      <Route
        path="/admin/users"
        element={
          user?.role === 'admin' ? (
            <AdminUsersPage user={user} onLogout={signOut} />
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
      <Route
        path="/admin/reports"
        element={
          user?.role === 'admin' ? (
            <AdminReportsPage user={user} onLogout={signOut} />
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />

      {/* Support & Legal Routes */}
      <Route path="/help" element={<HelpCenterPage user={user} onLogout={signOut} />} />
      <Route path="/contact" element={<ContactPage user={user} onLogout={signOut} />} />
      <Route path="/faqs" element={<FaqPage user={user} onLogout={signOut} />} />
      <Route path="/terms" element={<TermsPage user={user} onLogout={signOut} />} />
      <Route path="/privacy" element={<PrivacyPage user={user} onLogout={signOut} />} />
      <Route path="/cancellation-policy" element={<CancellationPolicyPage user={user} onLogout={signOut} />} />

      {/* Profile Route */}
      <Route
        path="/profile"
        element={
          user ? (
            <ProfilePage user={user} onLogout={signOut} />
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
