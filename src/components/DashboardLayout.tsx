import { ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Shield, 
  Home, 
  Factory, 
  Truck, 
  Store, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChevronRight
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  role: 'manufacturer' | 'distributor' | 'pharmacy' | 'admin';
}

const navItems = {
  manufacturer: [
    { label: 'Dashboard', href: '/manufacturer', icon: Home },
    { label: 'Register Drug', href: '/manufacturer/register', icon: Factory },
    { label: 'My Drugs', href: '/manufacturer/drugs', icon: Shield },
  ],
  distributor: [
    { label: 'Dashboard', href: '/distributor', icon: Home },
    { label: 'Scan & Update', href: '/distributor/scan', icon: Truck },
    { label: 'Inventory', href: '/distributor/inventory', icon: Shield },
  ],
  pharmacy: [
    { label: 'Dashboard', href: '/pharmacy', icon: Home },
    { label: 'Verify Drug', href: '/pharmacy/verify', icon: Store },
    { label: 'Inventory', href: '/pharmacy/inventory', icon: Shield },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'All Drugs', href: '/admin/drugs', icon: Shield },
    { label: 'Users', href: '/admin/users', icon: User },
    { label: 'Analytics', href: '/admin/analytics', icon: Settings },
  ],
};

const roleLabels = {
  manufacturer: 'Manufacturer',
  distributor: 'Distributor',
  pharmacy: 'Pharmacy',
  admin: 'Administrator',
};

export const DashboardLayout = ({ children, title, role }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const items = navItems[role];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-lg">MediTrack</span>
          </Link>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-sidebar transform transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="w-7 h-7 text-sidebar-primary" />
              <span className="font-display font-bold text-xl text-sidebar-foreground">MediTrack</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Role Badge */}
          <div className="px-6 py-4">
            <div className="bg-sidebar-accent rounded-lg px-4 py-3">
              <p className="text-xs text-sidebar-foreground/60 mb-1">Logged in as</p>
              <p className="text-sm font-semibold text-sidebar-foreground">{roleLabels[role]}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-2 space-y-1">
            {items.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => navigate('/auth')}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground mb-6">
              {title}
            </h1>
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};
