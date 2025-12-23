import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { 
  Shield, 
  QrCode, 
  CheckCircle2, 
  AlertTriangle, 
  Scan,
  ArrowLeft,
  Calendar,
  Building2,
  Hash,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRScanner } from "@/components/QRScanner";
import { ScanTimeline } from "@/components/ScanTimeline";
import { mockDrugs, Drug } from "@/lib/mockData";

export const ConsumerVerifyPage = () => {
  const { drugId } = useParams();
  const [showScanner, setShowScanner] = useState(false);
  const [verifiedDrug, setVerifiedDrug] = useState<Drug | null>(
    drugId ? mockDrugs.find(d => d.id === drugId) || null : null
  );
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = (result: string) => {
    setShowScanner(false);
    setIsScanning(true);
    
    // Simulate verification delay
    setTimeout(() => {
      const scannedId = result.split('/').pop() || '';
      const drug = mockDrugs.find(d => d.id === scannedId);
      setVerifiedDrug(drug || null);
      setIsScanning(false);
    }, 1500);
  };

  const resetScan = () => {
    setVerifiedDrug(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 glass">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            <span className="font-display font-bold text-xl text-foreground">MediTrack</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-xl mx-auto">
          <AnimatePresence mode="wait">
            {!verifiedDrug && !isScanning ? (
              <motion.div
                key="scan-prompt"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
                  <QrCode className="w-12 h-12 text-primary-foreground" />
                </div>
                <h1 className="text-3xl font-display font-bold text-foreground mb-3">
                  Verify Your Medicine
                </h1>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Scan the QR code on your medicine packaging to verify its authenticity 
                  and view its complete supply chain history.
                </p>
                <Button 
                  size="lg" 
                  onClick={() => setShowScanner(true)}
                  className="btn-hero text-lg"
                >
                  <Scan className="w-5 h-5 mr-2" />
                  Scan QR Code
                </Button>

                {/* Demo Links */}
                <div className="mt-12 pt-8 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-4">Demo: Try these sample drugs</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {mockDrugs.slice(0, 3).map((drug) => (
                      <button
                        key={drug.id}
                        onClick={() => setVerifiedDrug(drug)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          drug.isAuthentic 
                            ? 'bg-success/10 text-success hover:bg-success/20' 
                            : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                        }`}
                      >
                        {drug.name}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : isScanning ? (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <Shield className="w-12 h-12 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                  Verifying...
                </h2>
                <p className="text-muted-foreground">
                  Checking drug authenticity across the supply chain
                </p>
              </motion.div>
            ) : verifiedDrug ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Verification Status */}
                <div className={`p-8 rounded-2xl text-center ${
                  verifiedDrug.isAuthentic 
                    ? 'bg-success/10 border-2 border-success' 
                    : 'bg-destructive/10 border-2 border-destructive'
                }`}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                  >
                    {verifiedDrug.isAuthentic ? (
                      <CheckCircle2 className="w-20 h-20 text-success mx-auto mb-4" />
                    ) : (
                      <AlertTriangle className="w-20 h-20 text-destructive mx-auto mb-4" />
                    )}
                  </motion.div>
                  <h2 className={`text-2xl font-display font-bold mb-2 ${
                    verifiedDrug.isAuthentic ? 'text-success' : 'text-destructive'
                  }`}>
                    {verifiedDrug.isAuthentic ? 'VERIFIED AUTHENTIC' : 'COUNTERFEIT ALERT!'}
                  </h2>
                  <p className={`${verifiedDrug.isAuthentic ? 'text-success/80' : 'text-destructive/80'}`}>
                    {verifiedDrug.isAuthentic 
                      ? 'This medicine is genuine and safe to use' 
                      : 'DO NOT USE - Report to authorities immediately'}
                  </p>
                </div>

                {/* Drug Details */}
                <div className="card-elevated p-6">
                  <h3 className="text-lg font-display font-semibold text-foreground mb-4">
                    Medicine Details
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Drug Name</p>
                        <p className="font-semibold text-foreground">{verifiedDrug.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Hash className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Batch Number</p>
                        <p className="font-semibold text-foreground">{verifiedDrug.batchNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Manufacturer</p>
                        <p className="font-semibold text-foreground">{verifiedDrug.manufacturer}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Expiry Date</p>
                        <p className="font-semibold text-foreground">
                          {new Date(verifiedDrug.expiryDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Supply Chain History */}
                <div className="card-elevated p-6">
                  <h3 className="text-lg font-display font-semibold text-foreground mb-4">
                    Supply Chain Journey
                  </h3>
                  <ScanTimeline scanHistory={verifiedDrug.scanHistory} />
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <Button 
                    onClick={resetScan} 
                    variant="outline" 
                    className="flex-1"
                  >
                    Scan Another
                  </Button>
                  {!verifiedDrug.isAuthentic && (
                    <Button 
                      className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Report Counterfeit
                    </Button>
                  )}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </main>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
};

export default ConsumerVerifyPage;
