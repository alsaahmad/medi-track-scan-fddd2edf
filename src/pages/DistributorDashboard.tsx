import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { DrugCard } from "@/components/DrugCard";
import { QRScanner } from "@/components/QRScanner";
import { ScanTimeline } from "@/components/ScanTimeline";
import { mockDrugs, Drug } from "@/lib/mockData";
import { Truck, Package, QrCode, CheckCircle2, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export const DistributorDashboard = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedDrug, setScannedDrug] = useState<Drug | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  const transitDrugs = mockDrugs.filter(d => d.status === 'in-transit' || d.status === 'at-distributor');

  const stats = [
    { title: 'In Transit', value: transitDrugs.length, icon: Truck, variant: 'warning' as const },
    { title: 'Total Handled', value: mockDrugs.length - 1, icon: Package },
    { title: 'Scanned Today', value: 12, icon: QrCode },
    { title: 'Verified', value: mockDrugs.filter(d => d.isAuthentic).length, icon: CheckCircle2, variant: 'success' as const },
  ];

  const handleScan = (result: string) => {
    setShowScanner(false);
    // Extract drug ID from scanned URL
    const drugId = result.split('/').pop() || '';
    const drug = mockDrugs.find(d => d.id === drugId);
    
    if (drug) {
      setScannedDrug(drug);
      setShowDetails(true);
      toast({
        title: drug.isAuthentic ? "Drug Verified" : "Warning: Counterfeit Detected!",
        description: drug.isAuthentic 
          ? `${drug.name} is authentic` 
          : "This drug has been flagged as counterfeit",
        variant: drug.isAuthentic ? "default" : "destructive",
      });
    } else {
      toast({
        title: "Drug Not Found",
        description: "This QR code is not in our system",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = () => {
    toast({
      title: "Status Updated",
      description: "Drug status updated to 'In Transit to Pharmacy'",
    });
    setShowDetails(false);
  };

  return (
    <DashboardLayout title="Distributor Dashboard" role="distributor">
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
            Scan Drug QR
          </Button>
        </div>

        {/* In Transit Drugs */}
        <div>
          <h2 className="text-xl font-display font-semibold text-foreground mb-4">
            Drugs In Transit
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {transitDrugs.map((drug) => (
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
            <DialogTitle className="font-display">Drug Details</DialogTitle>
          </DialogHeader>
          
          {scannedDrug && (
            <div className="space-y-6">
              <div className={`p-4 rounded-lg ${scannedDrug.isAuthentic ? 'bg-success/10 border border-success/20' : 'bg-destructive/10 border border-destructive/20'}`}>
                <p className={`font-semibold ${scannedDrug.isAuthentic ? 'text-success' : 'text-destructive'}`}>
                  {scannedDrug.isAuthentic ? '✓ Verified Authentic' : '⚠ Counterfeit Alert'}
                </p>
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
                <h3 className="font-semibold text-foreground mb-4">Scan History</h3>
                <ScanTimeline scanHistory={scannedDrug.scanHistory} />
              </div>

              {scannedDrug.isAuthentic && (
                <Button onClick={handleUpdateStatus} className="w-full btn-hero">
                  Update Status: Received at Distribution Center
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DistributorDashboard;
