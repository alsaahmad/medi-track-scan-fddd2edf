import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { DrugCard } from "@/components/DrugCard";
import { mockDrugs } from "@/lib/mockData";
import { Package, QrCode, CheckCircle2, AlertTriangle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export const ManufacturerDashboard = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [newDrug, setNewDrug] = useState({ name: '', batchNumber: '', expiryDate: '' });
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const { toast } = useToast();

  const manufacturerDrugs = mockDrugs.filter(d => d.manufacturerId === 'MFR-001');
  
  const stats = [
    { title: 'Total Drugs', value: manufacturerDrugs.length, icon: Package },
    { title: 'QR Generated', value: manufacturerDrugs.length, icon: QrCode },
    { title: 'Verified', value: manufacturerDrugs.filter(d => d.isAuthentic).length, icon: CheckCircle2, variant: 'success' as const },
    { title: 'Flagged', value: mockDrugs.filter(d => !d.isAuthentic).length, icon: AlertTriangle, variant: 'danger' as const },
  ];

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const drugId = `MED-2024-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    setGeneratedQR(`https://meditrack.app/verify/${drugId}`);
    toast({
      title: "Drug Registered Successfully",
      description: `QR code generated for ${newDrug.name}`,
    });
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {manufacturerDrugs.map((drug) => (
              <DrugCard key={drug.id} drug={drug} showQR />
            ))}
          </div>
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
              <Button type="submit" className="w-full btn-hero">
                Generate QR Code
              </Button>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="bg-background p-6 rounded-xl inline-block mb-4">
                <QRCodeSVG value={generatedQR} size={200} level="H" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                QR Code generated for {newDrug.name}
              </p>
              <Button 
                onClick={() => {
                  setGeneratedQR(null);
                  setNewDrug({ name: '', batchNumber: '', expiryDate: '' });
                  setShowRegister(false);
                }}
                variant="outline"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ManufacturerDashboard;
