import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, User, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

type UserRole = 'manufacturer' | 'distributor' | 'pharmacy' | 'admin' | 'consumer';

const roles: { value: UserRole; label: string; description: string }[] = [
  { value: 'manufacturer', label: 'Manufacturer', description: 'Register and track drugs' },
  { value: 'distributor', label: 'Distributor', description: 'Scan and update shipments' },
  { value: 'pharmacy', label: 'Pharmacy', description: 'Verify before selling' },
  { value: 'admin', label: 'Administrator', description: 'Monitor all activity' },
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
  const { signIn, signUp, user, role, loading } = useAuth();

  const roleRoutes: Record<UserRole, string> = {
    manufacturer: '/manufacturer',
    distributor: '/distributor',
    pharmacy: '/pharmacy',
    admin: '/admin',
    consumer: '/verify',
  };

  // Redirect if already logged in - only when fully loaded with role
  useEffect(() => {
    if (!loading && user && role) {
      const targetRoute = roleRoutes[role as UserRole] || '/';
      navigate(targetRoute, { replace: true });
    }
  }, [user, role, loading, navigate, roleRoutes]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 mb-8">
            <Shield className="w-8 h-8 text-primary" />
            <span className="font-display font-bold text-2xl text-foreground">MediTrack</span>
          </Link>

          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            {isLogin ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isLogin 
              ? "Sign in to access your dashboard" 
              : "Join MediTrack to start tracking drugs"
            }
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
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
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="PharmaCorp Inc."
                      className="input-field pl-12"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
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
              <label className="block text-sm font-medium text-foreground mb-2">
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
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  I am a...
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setSelectedRole(role.value)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        selectedRole === role.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <p className="font-medium text-sm text-foreground">{role.label}</p>
                      <p className="text-xs text-muted-foreground">{role.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" className="w-full btn-hero" disabled={isSubmitting}>
              {isSubmitting ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-medium hover:underline"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-lg text-center text-primary-foreground"
        >
          <div className="w-24 h-24 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-8">
            <Shield className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-display font-bold mb-4">
            Secure Drug Verification
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            Join thousands of healthcare providers ensuring medication authenticity 
            with our blockchain-grade verification system.
          </p>
          <div className="grid grid-cols-3 gap-6 mt-12">
            {[
              { value: "10M+", label: "Verified Drugs" },
              { value: "50K+", label: "Partners" },
              { value: "99.9%", label: "Accuracy" },
            ].map((stat, index) => (
              <div key={index}>
                <p className="text-2xl font-display font-bold">{stat.value}</p>
                <p className="text-sm text-primary-foreground/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
