import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Shield, Mail, Lock, User, Building2, ArrowRight, Factory, Truck, Store, UserCog, CheckCircle2, Package, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

type UserRole = 'manufacturer' | 'distributor' | 'pharmacy' | 'admin' | 'consumer';

const roles: { value: UserRole; label: string; description: string; icon: typeof Factory }[] = [
  { value: 'manufacturer', label: 'Manufacturer', description: 'Register and track drugs', icon: Factory },
  { value: 'distributor', label: 'Distributor', description: 'Manage shipments & logistics', icon: Truck },
  { value: 'pharmacy', label: 'Pharmacy', description: 'Verify & dispense medicines', icon: Store },
];

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  company: z.string().min(2, "Company name must be at least 2 characters").optional(),
});

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>('pharmacy');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, user, role, loading } = useAuth();

  const roleRoutes: Record<UserRole, string> = {
    manufacturer: '/manufacturer',
    distributor: '/distributor',
    pharmacy: '/pharmacy',
    admin: '/admin',
    consumer: '/verify',
  };

  // Show error from redirect
  useEffect(() => {
    const stateError = (location.state as { error?: string })?.error;
    if (stateError) {
      toast({
        title: "Authentication Error",
        description: stateError,
        variant: "destructive",
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state, toast]);

  // Redirect if already logged in - only when fully loaded with role
  useEffect(() => {
    // Only redirect when NOT loading AND we have both user AND role
    if (!loading && user && role) {
      const targetRoute = roleRoutes[role as UserRole] || '/';
      console.log('Redirecting to:', targetRoute, 'Role:', role);
      navigate(targetRoute, { replace: true });
    }
    // If user exists but no role after loading, show error and stay on auth page
    if (!loading && user && !role) {
      console.error('User has no role assigned');
      toast({
        title: "Profile Error",
        description: "Your account is missing a role. Please contact support or try signing up again.",
        variant: "destructive",
      });
    }
  }, [user, role, loading, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate input
      const validationData = isLogin 
        ? { email, password }
        : { email, password, name, company };
      
      authSchema.parse(validationData);

      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Login Failed",
            description: error.message === "Invalid login credentials" 
              ? "Invalid email or password" 
              : error.message,
            variant: "destructive",
          });
          return;
        }
        toast({
          title: "Welcome back!",
          description: "Redirecting to your dashboard...",
        });
      } else {
        const { error } = await signUp(email, password, name, company, selectedRole);
        if (error) {
          toast({
            title: "Signup Failed",
            description: error.message.includes("already registered")
              ? "This email is already registered. Please sign in."
              : error.message,
            variant: "destructive",
          });
          return;
        }
        toast({
          title: "Account created!",
          description: "Redirecting to your dashboard...",
        });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: err.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while auth is being resolved
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">
            {user ? 'Loading your profile...' : 'Checking authentication...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-2xl text-foreground">MediTrack</span>
          </Link>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-display font-bold text-foreground mb-3">
              {isLogin ? "Welcome back" : "Get started"}
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              {isLogin 
                ? "Sign in to access your dashboard and manage your supply chain." 
                : "Create your account to start tracking and verifying drugs."
              }
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="input-field pl-12"
                      required={!isLogin}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Organization
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="PharmaCorp Inc."
                      className="input-field pl-12"
                      required={!isLogin}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field pl-12"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-12"
                  required
                  minLength={6}
                />
              </div>
              {isLogin && (
                <p className="text-xs text-muted-foreground mt-2">
                  Must be at least 6 characters
                </p>
              )}
            </div>

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Select your role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => setSelectedRole(role.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all duration-200 group ${
                          selectedRole === role.value
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg transition-colors ${
                            selectedRole === role.value 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground">{role.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{role.description}</p>
                          </div>
                          {selectedRole === role.value && (
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold gradient-primary text-primary-foreground rounded-xl shadow-lg hover:shadow-glow transition-all duration-300 hover:-translate-y-0.5" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Please wait...
                </div>
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-semibold hover:underline underline-offset-2"
              >
                {isLogin ? "Create one" : "Sign in"}
              </button>
            </p>
          </div>

          {isLogin && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 p-4 rounded-xl bg-muted/50 border border-border"
            >
              <p className="text-xs text-muted-foreground text-center">
                <span className="font-medium text-foreground">New to MediTrack?</span> Sign up as a Manufacturer, Distributor, or Pharmacy to start tracking your pharmaceutical supply chain.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full border-2 border-primary-foreground/30" />
          <div className="absolute bottom-32 right-16 w-48 h-48 rounded-full border-2 border-primary-foreground/20" />
          <div className="absolute top-1/2 left-1/3 w-96 h-96 rounded-full border border-primary-foreground/10" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="max-w-lg text-center text-primary-foreground relative z-10"
        >
          <div className="w-28 h-28 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-10 shadow-2xl">
            <Shield className="w-14 h-14" />
          </div>
          <h2 className="text-4xl font-display font-bold mb-6 leading-tight">
            Secure Drug<br />Verification System
          </h2>
          <p className="text-primary-foreground/85 text-lg leading-relaxed mb-10">
            Join thousands of healthcare providers ensuring medication authenticity 
            with our blockchain-grade verification and complete supply chain visibility.
          </p>
          
          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {[
              { icon: QrCode, text: 'QR Tracking' },
              { icon: Package, text: 'Supply Chain' },
              { icon: CheckCircle2, text: 'AI Verification' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/15 backdrop-blur-sm border border-primary-foreground/20"
              >
                <feature.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </div>
          
          <div className="grid grid-cols-3 gap-8">
            {[
              { value: "10M+", label: "Drugs Verified" },
              { value: "50K+", label: "Partners" },
              { value: "99.9%", label: "Accuracy" },
            ].map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="p-4 rounded-xl bg-primary-foreground/10 backdrop-blur-sm"
              >
                <p className="text-3xl font-display font-bold">{stat.value}</p>
                <p className="text-sm text-primary-foreground/70 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
