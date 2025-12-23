import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Shield, 
  QrCode, 
  Factory, 
  Truck, 
  Store, 
  Users,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Lock,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  {
    icon: QrCode,
    title: "QR Code Verification",
    description: "Instant drug authentication with secure QR codes at every step of the supply chain."
  },
  {
    icon: Factory,
    title: "Manufacturer Tracking",
    description: "Complete visibility from production to packaging with tamper-proof registration."
  },
  {
    icon: Truck,
    title: "Distribution Monitoring",
    description: "Real-time tracking as drugs move through distributors and logistics partners."
  },
  {
    icon: Store,
    title: "Pharmacy Verification",
    description: "Final verification before drugs reach patients, ensuring authenticity."
  }
];

const stats = [
  { value: "10M+", label: "Drugs Tracked" },
  { value: "50K+", label: "Pharmacies" },
  { value: "99.9%", label: "Accuracy" },
  { value: "24/7", label: "Monitoring" }
];

const supplyChainSteps = [
  { icon: Factory, label: "Manufacturer", description: "Drug registered & QR generated" },
  { icon: Truck, label: "Distributor", description: "Scanned & tracked in transit" },
  { icon: Store, label: "Pharmacy", description: "Verified before stocking" },
  { icon: Users, label: "Consumer", description: "Scan to confirm authenticity" }
];

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            <span className="font-display font-bold text-xl text-foreground">MediTrack</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#problem" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Problem</a>
            <a href="#solution" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Solution</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="ghost" className="hidden sm:flex">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button className="gradient-primary text-primary-foreground shadow-lg hover:shadow-glow transition-all">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img 
            src={heroBg} 
            alt="" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </div>
        <div className="absolute inset-0 pattern-dots opacity-30" />

        <div className="container relative mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Shield className="w-4 h-4" />
                <span>Protecting Lives Through Technology</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-6 leading-tight">
                Fight Counterfeit Drugs with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">Blockchain-Grade</span>{" "}
                Verification
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                MediTrack ensures every medication is authentic through QR-based tracking 
                across the entire pharmaceutical supply chain.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/verify">
                  <Button size="lg" className="btn-hero text-lg px-8">
                    <QrCode className="w-5 h-5 mr-2" />
                    Verify a Drug
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="outline" className="text-lg px-8 border-2">
                    Partner With Us
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl md:text-4xl font-display font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-muted-foreground/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full text-sm font-medium mb-4">
              <AlertTriangle className="w-4 h-4" />
              <span>A Global Crisis</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6">
              Counterfeit Drugs Kill Over 1 Million People Every Year
            </h2>
            <p className="text-lg text-muted-foreground">
              The WHO estimates that 10% of drugs in low and middle-income countries are substandard 
              or falsified. This leads to treatment failures, drug resistance, and preventable deaths.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { value: "$200B", label: "Annual counterfeit drug market", icon: Globe },
              { value: "1M+", label: "Deaths per year from fake medicines", icon: AlertTriangle },
              { value: "10%", label: "Of global medicines are counterfeit", icon: Shield }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-elevated p-8 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-destructive" />
                </div>
                <p className="text-4xl font-display font-bold text-foreground mb-2">{item.value}</p>
                <p className="text-muted-foreground">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full text-sm font-medium mb-4">
              <CheckCircle2 className="w-4 h-4" />
              <span>Our Solution</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6">
              Complete Supply Chain Visibility
            </h2>
            <p className="text-lg text-muted-foreground">
              MediTrack provides end-to-end tracking and verification, ensuring every drug 
              can be authenticated from manufacturer to patient.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-elevated p-6 group"
              >
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-4 shadow-lg group-hover:shadow-glow transition-shadow">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6">
              How MediTrack Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Simple QR-based verification at every step of the pharmaceutical supply chain.
            </p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            {/* Connection line */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-primary via-warning to-success rounded-full" />

            <div className="grid md:grid-cols-4 gap-8">
              {supplyChainSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="relative text-center"
                >
                  <div className="relative z-10 w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto shadow-xl">
                    <step.icon className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-background border-4 border-primary z-20" style={{ display: 'none' }} />
                  <h3 className="text-lg font-display font-semibold text-foreground mt-6 mb-2">
                    {step.label}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="card-elevated p-8 md:p-12 gradient-hero text-primary-foreground">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                    Ready to Protect Your Supply Chain?
                  </h2>
                  <p className="text-primary-foreground/80 mb-6">
                    Join thousands of manufacturers, distributors, and pharmacies 
                    already using MediTrack to ensure drug authenticity.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      <span className="text-sm">Secure & Encrypted</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      <span className="text-sm">Instant Verification</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <Link to="/auth" className="block">
                    <Button size="lg" className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-lg">
                      Start Free Trial
                    </Button>
                  </Link>
                  <Link to="/verify" className="block">
                    <Button size="lg" variant="outline" className="w-full border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 text-lg">
                      Verify a Drug Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-display font-bold text-lg">MediTrack</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 MediTrack. Protecting lives through verified medicine.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Partner Portal
              </Link>
              <Link to="/verify" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Verify Drug
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
