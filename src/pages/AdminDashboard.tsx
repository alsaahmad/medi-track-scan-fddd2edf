import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { DrugCard } from "@/components/DrugCard";
import { AIChat } from "@/components/AIChat";
import { DrugStatusChart, ScansByRoleChart, StatsOverview } from "@/components/DashboardCharts";
import { 
  Shield, 
  Package, 
  Users, 
  AlertTriangle, 
  TrendingUp,
  Factory,
  Truck,
  Store,
  Loader2
} from "lucide-react";
import { useDrugs, useAllScanLogs, useAlerts, useDrugStats } from "@/hooks/useDrugs";
import { mapDatabaseDrugToUI, mapDatabaseScanLogToUI } from "@/lib/mockData";

export const AdminDashboard = () => {
  const { data: drugs, isLoading: drugsLoading } = useDrugs();
  const { data: scanLogs, isLoading: logsLoading } = useAllScanLogs();
  const { data: alerts } = useAlerts();
  const { data: stats, isLoading: statsLoading } = useDrugStats();

  const mappedDrugs = (drugs || []).map(d => mapDatabaseDrugToUI(d));
  const mappedLogs = (scanLogs || []).map(l => mapDatabaseScanLogToUI(l));
  const flaggedDrugs = mappedDrugs.filter(d => !d.isAuthentic);

  const dashboardStats = [
    { title: 'Total Drugs', value: stats?.totalDrugs || 0, icon: Package },
    { title: 'Total Scans', value: stats?.totalScans || 0, icon: Users },
    { title: 'Verified', value: (stats?.totalDrugs || 0) - (stats?.statusCounts.flagged || 0), icon: Shield, variant: 'success' as const },
    { title: 'Flagged', value: stats?.statusCounts.flagged || 0, icon: AlertTriangle, variant: 'danger' as const },
  ];

  const roleStats = [
    { role: 'Manufacturers', count: stats?.roleCounts.manufacturer || 0, icon: Factory },
    { role: 'Distributors', count: stats?.roleCounts.distributor || 0, icon: Truck },
    { role: 'Pharmacies', count: stats?.roleCounts.pharmacy || 0, icon: Store },
  ];

  if (drugsLoading || statsLoading) {
    return (
      <DashboardLayout title="Admin Dashboard" role="admin">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard" role="admin">
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-elevated p-6"
          >
            <h3 className="text-lg font-display font-semibold text-foreground mb-4">
              Drug Status Distribution
            </h3>
            <DrugStatusChart />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-elevated p-6"
          >
            <h3 className="text-lg font-display font-semibold text-foreground mb-4">
              Scans by Role
            </h3>
            <ScansByRoleChart />
          </motion.div>
        </div>

        {/* Role Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {roleStats.map((stat, index) => (
            <motion.div
              key={stat.role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="card-elevated p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center">
                  <stat.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-3xl font-display font-bold text-foreground">{stat.count}</p>
                  <p className="text-sm text-muted-foreground">{stat.role} Scans</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity & Flagged Drugs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Recent Activity
            </h2>
            <div className="card-elevated divide-y divide-border max-h-96 overflow-y-auto">
              {logsLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                </div>
              ) : mappedLogs.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No recent activity
                </div>
              ) : (
                mappedLogs.slice(0, 10).map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground capitalize">{activity.role}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Flagged Drugs ({flaggedDrugs.length})
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {flaggedDrugs.length === 0 ? (
                <div className="card-elevated p-8 text-center">
                  <Shield className="w-12 h-12 text-success mx-auto mb-3" />
                  <p className="text-muted-foreground">No flagged drugs detected</p>
                </div>
              ) : (
                flaggedDrugs.map((drug) => (
                  <DrugCard key={drug.id} drug={drug} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* All Drugs */}
        <div>
          <h2 className="text-xl font-display font-semibold text-foreground mb-4">
            All Registered Drugs ({mappedDrugs.length})
          </h2>
          {mappedDrugs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No drugs registered in the system yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mappedDrugs.map((drug) => (
                <DrugCard key={drug.id} drug={drug} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Chat */}
      <AIChat />
    </DashboardLayout>
  );
};

export default AdminDashboard;
