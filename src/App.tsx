import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import ManufacturerDashboard from "./pages/ManufacturerDashboard";
import DistributorDashboard from "./pages/DistributorDashboard";
import PharmacyDashboard from "./pages/PharmacyDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ConsumerVerifyPage from "./pages/ConsumerVerifyPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="meditrack-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/manufacturer" element={
                <ProtectedRoute allowedRoles={['manufacturer', 'admin']}>
                  <ManufacturerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/manufacturer/*" element={
                <ProtectedRoute allowedRoles={['manufacturer', 'admin']}>
                  <ManufacturerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/distributor" element={
                <ProtectedRoute allowedRoles={['distributor', 'admin']}>
                  <DistributorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/distributor/*" element={
                <ProtectedRoute allowedRoles={['distributor', 'admin']}>
                  <DistributorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/pharmacy" element={
                <ProtectedRoute allowedRoles={['pharmacy', 'admin']}>
                  <PharmacyDashboard />
                </ProtectedRoute>
              } />
              <Route path="/pharmacy/*" element={
                <ProtectedRoute allowedRoles={['pharmacy', 'admin']}>
                  <PharmacyDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/*" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/verify" element={<ConsumerVerifyPage />} />
              <Route path="/verify/:drugId" element={<ConsumerVerifyPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
