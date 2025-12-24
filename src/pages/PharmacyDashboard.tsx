import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { DrugCard } from "@/components/DrugCard";
import { QRScanner } from "@/components/QRScanner";
import { ScanTimeline } from "@/components/ScanTimeline";
import { AIChat } from "@/components/AIChat";
import { Store, Package, QrCode, CheckCircle2, AlertTriangle, Scan, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  useDrugs, 
  useUpdateDrugStatus, 
  useDrugStats,
  useCreateAlert 
} from "@/hooks/useDrugs";
import { Drug, mapDatabaseDrugToUI } from "@/lib/mockData";

export const PharmacyDashboard = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedDrug, setScannedDrug] = useState<Drug | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [qrHash, setQrHash] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const { data: allDrugs, isLoading: drugsLoading } = useDrugs();
  const { data: stats } = useDrugStats();
  const updateStatus = useUpdateDrugStatus();
  const createAlert = useCreateAlert();

  // Filter drugs that are at pharmacy or sold
  const pharmacyDrugs = (allDrugs || [])
    .filter(d => d.current_status === 'in_pharmacy' || d.current_status === 'sold' || d.current_status === 'distributed')
    .map(d => mapDatabaseDrugToUI(d));

  const dashboardStats = [
    { title: 'In Stock', value: pharmacyDrugs.filter(d => d.status === 'in_pharmacy' || d.status === 'distributed').length, icon: Store },
    { title: 'Total Verified', value: stats?.roleCounts.pharmacy || 0, icon: Package },
    { title: 'Scanned Today', value: stats?.roleCounts.pharmacy || 0, icon: QrCode },
    { title: 'Alerts', value: stats?.alertCount || 0, icon: AlertTriangle, variant: 'danger' as const },
  ];

  const handleScan = async (result: string) => {
    setShowScanner(false);
    
    // Extract QR hash from URL or use directly
    const hash = result.includes('/verify/') 
      ? result.split('/verify/').pop() || ''
      : result;
    
    // Find drug in loaded data
    const drug = (allDrugs || []).find(d => d.qr_code_hash === hash);
    
    if (drug) {
      const mappedDrug = mapDatabaseDrugToUI(drug);
      setScannedDrug(mappedDrug);
      setQrHash(hash);
      setShowDetails(true);
      
      toast({
        title: drug.current_status !== 'flagged' ? "Drug Verified" : "⚠️ COUNTERFEIT ALERT!",
        description: drug.current_status !== 'flagged' 
          ? `${drug.drug_name} is authentic and safe to sell` 
          : "DO NOT SELL - This drug is flagged!",
        variant: drug.current_status !== 'flagged' ? "default" : "destructive",
      });
    } else {
      toast({
        title: "Unknown Drug",
        description: "This QR code is not registered in MediTrack",
        variant: "destructive",
      });
    }
  };

  const handleReceive = async () => {
    if (!scannedDrug || !qrHash) return;
    
    const drug = (allDrugs || []).find(d => d.qr_code_hash === qrHash);
    if (!drug) return;

    try {
      await updateStatus.mutateAsync({
        drugId: drug.id,
        newStatus: 'in_pharmacy',
        userId: user?.id || null,
        role: 'pharmacy',
        location: profile?.organization || 'Pharmacy',
      });
      
      toast({
        title: "Drug Received",
        description: "Drug status updated to 'At Pharmacy'",
      });
      setShowDetails(false);
      setScannedDrug(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleSell = async () => {
    if (!scannedDrug || !qrHash) return;
    
    const drug = (allDrugs || []).find(d => d.qr_code_hash === qrHash);
    if (!drug) return;

    try {
      await updateStatus.mutateAsync({
        drugId: drug.id,
        newStatus: 'sold',
        userId: user?.id || null,
        role: 'pharmacy',
        location: profile?.organization || 'Pharmacy',
      });
      
      toast({
        title: "Sale Recorded",
        description: "Drug marked as sold. Consumer can now verify.",
      });
      setShowDetails(false);
      setScannedDrug(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleFlag = async () => {
    if (!scannedDrug || !qrHash) return;
    
    const drug = (allDrugs || []).find(d => d.qr_code_hash === qrHash);
    if (!drug) return;

    try {
      await updateStatus.mutateAsync({
        drugId: drug.id,
        newStatus: 'flagged',
        userId: user?.id || null,
        role: 'pharmacy',
        location: profile?.organization || 'Pharmacy',
      });
      
      await createAlert.mutateAsync({
        drug_id: drug.id,
        alert_type: 'counterfeit_suspected',
        description: `Drug flagged as suspicious by pharmacy: ${profile?.organization || 'Unknown'}`,
      });
      
      toast({
        title: "Drug Flagged",
        description: "Alert created for this suspicious drug",
        variant: "destructive",
      });
      setShowDetails(false);
      setScannedDrug(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <DashboardLayout title="Pharmacy Dashboard" role="pharmacy">
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat, index) => (
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
          {drugsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : pharmacyDrugs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Store className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No drugs in inventory. Scan incoming shipments to add them.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pharmacyDrugs.map((drug) => (
                <DrugCard 
                  key={drug.id} 
                  drug={drug}
                  onClick={() => {
                    setScannedDrug(drug);
                    setQrHash(drug.qrCodeHash || null);
                    setShowDetails(true);
                  }}
                />
              ))}
            </div>
          )}
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

              {scannedDrug.scanHistory && scannedDrug.scanHistory.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-4">Supply Chain History</h3>
                  <ScanTimeline scanHistory={scannedDrug.scanHistory} />
                </div>
              )}

              <div className="flex gap-3">
                {scannedDrug.isAuthentic && scannedDrug.status === 'distributed' && (
                  <Button 
                    onClick={handleReceive} 
                    className="flex-1 btn-hero"
                    disabled={updateStatus.isPending}
                  >
                    {updateStatus.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mark as Received'}
                  </Button>
                )}
                
                {scannedDrug.isAuthentic && scannedDrug.status === 'in_pharmacy' && (
                  <Button 
                    onClick={handleSell} 
                    className="flex-1 gradient-success text-success-foreground"
                    disabled={updateStatus.isPending}
                  >
                    {updateStatus.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mark as Sold'}
                  </Button>
                )}

                {scannedDrug.isAuthentic && (
                  <Button 
                    onClick={handleFlag} 
                    variant="destructive"
                    className="flex-1"
                    disabled={updateStatus.isPending}
                  >
                    Flag as Suspicious
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Chat */}
      <AIChat context={scannedDrug ? { drugId: scannedDrug.id } : undefined} />
    </DashboardLayout>
  );
};

export default PharmacyDashboard;
