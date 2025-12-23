import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { DrugCard } from "@/components/DrugCard";
import { QRScanner } from "@/components/QRScanner";
import { ScanTimeline } from "@/components/ScanTimeline";
import { mockDrugs, Drug } from "@/lib/mockData";
import { Store, Package, QrCode, CheckCircle2, AlertTriangle, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export const PharmacyDashboard = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedDrug, setScannedDrug] = useState<Drug | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  const pharmacyDrugs = mockDrugs.filter(d => d.status === 'at-pharmacy' || d.status === 'sold');

  const stats = [
    { title: 'In Stock', value: pharmacyDrugs.filter(d => d.status === 'at-pharmacy').length, icon: Store },
    { title: 'Total Verified', value: pharmacyDrugs.length, icon: Package },
    { title: 'Scanned Today', value: 8, icon: QrCode },
    { title: 'Alerts', value: mockDrugs.filter(d => !d.isAuthentic).length, icon: AlertTriangle, variant: 'danger' as const },
  ];

  const handleScan = (result: string) => {
    setShowScanner(false);
    const drugId = result.split('/').pop() || '';
    const drug = mockDrugs.find(d => d.id === drugId);
    
    if (drug) {
      setScannedDrug(drug);
      setShowDetails(true);
      toast({
        title: drug.isAuthentic ? "Drug Verified" : "⚠️ COUNTERFEIT ALERT!",
        description: drug.isAuthentic 
          ? `${drug.name} is authentic and safe to sell` 
          : "DO NOT SELL - This drug is counterfeit!",
        variant: drug.isAuthentic ? "default" : "destructive",
      });
    } else {
      toast({
        title: "Unknown Drug",
        description: "This QR code is not registered in MediTrack",
        variant: "destructive",
      });
    }
  };

  const handleSell = () => {
    toast({
      title: "Sale Recorded",
      description: "Drug marked as sold. Consumer can now verify.",
    });
    setShowDetails(false);
  };

  return (
    <DashboardLayout title="Pharmacy Dashboard" role="pharmacy">
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <StatsCard {...stat} />
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => setShowScanner(true)} className="btn-hero">
            <Scan className="w-5 h-5 mr-2" />
            Verify Drug Before Sale
          </Button>
        </div>

        {/* Pharmacy Inventory */}
        <div>
          <h2 className="text-xl font-display font-semibold text-foreground mb-4">
            Current Inventory
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pharmacyDrugs.map((drug) => (
              <DrugCard 
                key={drug.id} 
                drug={drug}
                onClick={() => {
                  setScannedDrug(drug);
                  setShowDetails(true);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* QR Scanner */}
      {showScanner && (
        <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}

      {/* Drug Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Drug Verification</DialogTitle>
          </DialogHeader>
          
          {scannedDrug && (
            <div className="space-y-6">
              <div className={`p-6 rounded-xl text-center ${scannedDrug.isAuthentic ? 'bg-success/10 border-2 border-success' : 'bg-destructive/10 border-2 border-destructive'}`}>
                {scannedDrug.isAuthentic ? (
                  <>
                    <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-3" />
                    <p className="text-xl font-bold text-success">VERIFIED AUTHENTIC</p>
                    <p className="text-sm text-success/80 mt-1">Safe to dispense to patients</p>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-3" />
                    <p className="text-xl font-bold text-destructive">COUNTERFEIT DETECTED</p>
                    <p className="text-sm text-destructive/80 mt-1">DO NOT SELL - Report immediately</p>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Drug Name</p>
                  <p className="font-medium text-foreground">{scannedDrug.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Batch Number</p>
                  <p className="font-medium text-foreground">{scannedDrug.batchNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Manufacturer</p>
                  <p className="font-medium text-foreground">{scannedDrug.manufacturer}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expiry Date</p>
                  <p className="font-medium text-foreground">{new Date(scannedDrug.expiryDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-4">Supply Chain History</h3>
                <ScanTimeline scanHistory={scannedDrug.scanHistory} />
              </div>

              {scannedDrug.isAuthentic && scannedDrug.status === 'at-pharmacy' && (
                <Button onClick={handleSell} className="w-full gradient-success text-success-foreground">
                  Mark as Sold
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PharmacyDashboard;
