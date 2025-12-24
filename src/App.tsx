import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
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
              <Route path="/manufacturer" element={<ManufacturerDashboard />} />
              <Route path="/manufacturer/*" element={<ManufacturerDashboard />} />
              <Route path="/distributor" element={<DistributorDashboard />} />
              <Route path="/distributor/*" element={<DistributorDashboard />} />
              <Route path="/pharmacy" element={<PharmacyDashboard />} />
              <Route path="/pharmacy/*" element={<PharmacyDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
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
