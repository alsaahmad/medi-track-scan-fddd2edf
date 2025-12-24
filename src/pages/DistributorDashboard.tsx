import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { DrugCard } from "@/components/DrugCard";
import { QRScanner } from "@/components/QRScanner";
import { ScanTimeline } from "@/components/ScanTimeline";
import { AIChat } from "@/components/AIChat";
import { Truck, Package, QrCode, CheckCircle2, Scan, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  useDrugs, 
  useDrugByQRHash, 
  useUpdateDrugStatus, 
  useScanLogs,
  useDrugStats 
} from "@/hooks/useDrugs";
import { 
  Drug, 
  ScanLog, 
  mapDatabaseDrugToUI, 
  mapDatabaseScanLogToUI 
} from "@/lib/mockData";

export const DistributorDashboard = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedDrug, setScannedDrug] = useState<Drug | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanLog[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [qrHash, setQrHash] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const { data: allDrugs, isLoading: drugsLoading } = useDrugs();
  const { data: stats } = useDrugStats();
  const updateStatus = useUpdateDrugStatus();

  // Filter drugs that are in distribution pipeline
  const transitDrugs = (allDrugs || [])
    .filter(d => d.current_status === 'created' || d.current_status === 'distributed')
    .map(d => mapDatabaseDrugToUI(d));

  const dashboardStats = [
    { title: 'In Transit', value: transitDrugs.length, icon: Truck, variant: 'warning' as const },
    { title: 'Total Handled', value: stats?.roleCounts.distributor || 0, icon: Package },
    { title: 'Scanned Today', value: stats?.roleCounts.distributor || 0, icon: QrCode },
    { title: 'Verified', value: (allDrugs || []).filter(d => d.current_status !== 'flagged').length, icon: CheckCircle2, variant: 'success' as const },
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
        title: drug.current_status !== 'flagged' ? "Drug Found" : "Warning: Flagged Drug!",
        description: drug.current_status !== 'flagged' 
          ? `${drug.drug_name} is in the system` 
          : "This drug has been flagged as suspicious",
        variant: drug.current_status !== 'flagged' ? "default" : "destructive",
      });
    } else {
      toast({
        title: "Drug Not Found",
        description: "This QR code is not registered in MediTrack",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async () => {
    if (!scannedDrug || !qrHash) return;
    
    // Find drug ID from allDrugs using qrHash
    const drug = (allDrugs || []).find(d => d.qr_code_hash === qrHash);
    if (!drug) return;

    try {
      await updateStatus.mutateAsync({
        drugId: drug.id,
        newStatus: 'distributed',
        userId: user?.id || null,
        role: 'distributor',
        location: profile?.organization || 'Distribution Center',
      });
      
      toast({
        title: "Status Updated",
        description: "Drug status updated to 'Distributed'",
      });
      setShowDetails(false);
      setScannedDrug(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <DashboardLayout title="Distributor Dashboard" role="distributor">
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
            Scan Drug QR
          </Button>
        </div>

        {/* In Transit Drugs */}
        <div>
          <h2 className="text-xl font-display font-semibold text-foreground mb-4">
            Drugs Awaiting Distribution
          </h2>
          {drugsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : transitDrugs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No drugs awaiting distribution.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {transitDrugs.map((drug) => (
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
            <DialogTitle className="font-display">Drug Details</DialogTitle>
          </DialogHeader>
          
          {scannedDrug && (
            <div className="space-y-6">
              <div className={`p-4 rounded-lg ${scannedDrug.isAuthentic ? 'bg-success/10 border border-success/20' : 'bg-destructive/10 border border-destructive/20'}`}>
                <div className="flex items-center gap-2">
                  {scannedDrug.isAuthentic ? (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  )}
                  <p className={`font-semibold ${scannedDrug.isAuthentic ? 'text-success' : 'text-destructive'}`}>
                    {scannedDrug.isAuthentic ? 'Verified Authentic' : 'Flagged - Suspicious'}
                  </p>
                </div>
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
                <div>
                  <p className="text-muted-foreground">Current Status</p>
                  <p className="font-medium text-foreground capitalize">{scannedDrug.status.replace('_', ' ')}</p>
                </div>
              </div>

              {scannedDrug.scanHistory && scannedDrug.scanHistory.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-4">Scan History</h3>
                  <ScanTimeline scanHistory={scannedDrug.scanHistory} />
                </div>
              )}

              {scannedDrug.isAuthentic && scannedDrug.status !== 'distributed' && (
                <Button 
                  onClick={handleUpdateStatus} 
                  className="w-full btn-hero"
                  disabled={updateStatus.isPending}
                >
                  {updateStatus.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Mark as Distributed'
                  )}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Chat */}
      <AIChat context={scannedDrug ? { drugId: scannedDrug.id } : undefined} />
    </DashboardLayout>
  );
};

export default DistributorDashboard;
