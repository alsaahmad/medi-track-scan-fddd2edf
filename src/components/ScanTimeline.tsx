import { motion } from "framer-motion";
import { MapPin, User, Clock } from "lucide-react";
import { ScanLog, getRoleColor } from "@/lib/mockData";

interface ScanTimelineProps {
  scanHistory: ScanLog[];
}

export const ScanTimeline = ({ scanHistory }: ScanTimelineProps) => {
  if (!scanHistory || scanHistory.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No scan history available
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-6">
        {scanHistory.map((scan, index) => (
          <motion.div
            key={scan.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative pl-10"
          >
            {/* Timeline dot */}
            <div className={`absolute left-2 top-1 w-5 h-5 rounded-full ${getRoleColor(scan.role)} ring-4 ring-background`} />

            <div className="card-elevated p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground capitalize">
                  {scan.role}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {new Date(scan.timestamp).toLocaleString()}
                </div>
              </div>

              <p className="text-sm font-medium text-primary mb-2">{scan.action}</p>

              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {scan.location}
                </div>
                {scan.userName && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {scan.userName}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
