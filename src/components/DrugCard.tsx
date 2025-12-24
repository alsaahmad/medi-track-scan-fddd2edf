import { motion } from "framer-motion";
import { Pill, Calendar, Building2, Hash } from "lucide-react";
import { Drug, DrugStatus, getStatusColor, getStatusLabel } from "@/lib/mockData";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

interface DrugCardProps {
  drug: Drug;
  showQR?: boolean;
  onClick?: () => void;
}

// Local StatusBadge to avoid import issues
const StatusBadge = ({ status }: { status: DrugStatus }) => {
  return (
    <span className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
      getStatusColor(status)
    )}>
      {getStatusLabel(status)}
    </span>
  );
};

export const DrugCard = ({ drug, showQR = false, onClick }: DrugCardProps) => {
  const verificationUrl = drug.qrCodeHash 
    ? `${window.location.origin}/verify/${drug.qrCodeHash}`
    : `${window.location.origin}/verify/${drug.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="card-elevated p-6 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
            <Pill className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
              {drug.name}
            </h3>
            <p className="text-sm text-muted-foreground">{drug.manufacturer}</p>
          </div>
        </div>
        <StatusBadge status={drug.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Hash className="w-4 h-4" />
          <span className="truncate">{drug.batchNumber}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Exp: {new Date(drug.expiryDate).toLocaleDateString()}</span>
        </div>
      </div>

      {showQR && (
        <div className="flex justify-center pt-4 border-t border-border">
          <div className="p-3 bg-background rounded-lg">
            <QRCodeSVG 
              value={verificationUrl} 
              size={100}
              level="H"
              includeMargin={false}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="w-4 h-4" />
          <span>{drug.scanHistory?.length || 0} scans</span>
        </div>
        <div className={`w-3 h-3 rounded-full ${drug.isAuthentic ? 'bg-success' : 'bg-destructive'}`} />
      </div>
    </motion.div>
  );
};
