import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { DrugCard } from "@/components/DrugCard";
import { AIChat } from "@/components/AIChat";
import { Package, QrCode, CheckCircle2, AlertTriangle, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useManufacturerDrugs, useCreateDrug, useScanLogs } from "@/hooks/useDrugs";
import { mapDatabaseDrugToUI, mapDatabaseScanLogToUI, Drug } from "@/lib/mockData";

export const ManufacturerDashboard = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [newDrug, setNewDrug] = useState({ name: '', batchNumber: '', expiryDate: '' });
  const [generatedQR, setGeneratedQR] = useState<{ hash: string; name: string } | null>(null);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  
  const { data: drugs, isLoading } = useManufacturerDrugs(user?.id);
  const createDrug = useCreateDrug();

  // Map database drugs to UI format
  const manufacturerDrugs: Drug[] = (drugs || []).map(d => 
    mapDatabaseDrugToUI(d, profile?.organization || profile?.name || 'Unknown')
  );
  
  const stats = [
    { title: 'Total Drugs', value: manufacturerDrugs.length, icon: Package },
    { title: 'QR Generated', value: manufacturerDrugs.length, icon: QrCode },
    { title: 'Verified', value: manufacturerDrugs.filter(d => d.isAuthentic).length, icon: CheckCircle2, variant: 'success' as const },
    { title: 'Flagged', value: manufacturerDrugs.filter(d => !d.isAuthentic).length, icon: AlertTriangle, variant: 'danger' as const },
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to register drugs",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createDrug.mutateAsync({
        drug_name: newDrug.name,
        batch_number: newDrug.batchNumber,
        expiry_date: newDrug.expiryDate,
        manufacturer_id: user.id,
      });
      
      setGeneratedQR({ hash: result.qr_code_hash, name: newDrug.name });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCloseRegister = () => {
    setGeneratedQR(null);
    setNewDrug({ name: '', batchNumber: '', expiryDate: '' });
    setShowRegister(false);
  };

  return (
    <DashboardLayout title="Manufacturer Dashboard" role="manufacturer">
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
          <Button onClick={() => setShowRegister(true)} className="btn-hero">
            <Plus className="w-5 h-5 mr-2" />
            Register New Drug
          </Button>
        </div>

        {/* Recent Drugs */}
        <div>
          <h2 className="text-xl font-display font-semibold text-foreground mb-4">
            Recent Registrations
          </h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : manufacturerDrugs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No drugs registered yet. Click "Register New Drug" to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {manufacturerDrugs.map((drug) => (
                <DrugCard 
                  key={drug.id} 
                  drug={drug} 
                  showQR 
                  onClick={() => setSelectedDrug(drug)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Register Drug Dialog */}
      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Register New Drug</DialogTitle>
          </DialogHeader>
          
          {!generatedQR ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Drug Name</label>
                <input
                  type="text"
                  value={newDrug.name}
                  onChange={(e) => setNewDrug({ ...newDrug, name: e.target.value })}
                  className="input-field"
                  placeholder="Amoxicillin 500mg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Batch Number</label>
                <input
                  type="text"
                  value={newDrug.batchNumber}
                  onChange={(e) => setNewDrug({ ...newDrug, batchNumber: e.target.value })}
                  className="input-field"
                  placeholder="BTH-AMX-2024-0001"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Expiry Date</label>
                <input
                  type="date"
                  value={newDrug.expiryDate}
                  onChange={(e) => setNewDrug({ ...newDrug, expiryDate: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full btn-hero"
                disabled={createDrug.isPending}
              >
                {createDrug.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Generate QR Code'
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="bg-background p-6 rounded-xl inline-block mb-4">
                <QRCodeSVG 
                  value={`${window.location.origin}/verify/${generatedQR.hash}`} 
                  size={200} 
                  level="H" 
                />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                QR Code generated for {generatedQR.name}
              </p>
              <p className="text-xs text-muted-foreground mb-4 font-mono">
                Hash: {generatedQR.hash}
              </p>
              <Button onClick={handleCloseRegister} variant="outline">
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Chat */}
      <AIChat context={selectedDrug ? { drugId: selectedDrug.id } : undefined} />
    </DashboardLayout>
  );
};

export default ManufacturerDashboard;
