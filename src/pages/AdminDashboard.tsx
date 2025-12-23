import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { DrugCard } from "@/components/DrugCard";
import { mockDrugs, mockUsers } from "@/lib/mockData";
import { 
  Shield, 
  Package, 
  Users, 
  AlertTriangle, 
  TrendingUp,
  Factory,
  Truck,
  Store
} from "lucide-react";

export const AdminDashboard = () => {
  const stats = [
    { title: 'Total Drugs', value: mockDrugs.length, icon: Package },
    { title: 'Active Users', value: mockUsers.length, icon: Users },
    { title: 'Verified', value: mockDrugs.filter(d => d.isAuthentic).length, icon: Shield, variant: 'success' as const },
    { title: 'Flagged', value: mockDrugs.filter(d => !d.isAuthentic).length, icon: AlertTriangle, variant: 'danger' as const },
  ];

  const roleStats = [
    { role: 'Manufacturers', count: mockUsers.filter(u => u.role === 'manufacturer').length, icon: Factory },
    { role: 'Distributors', count: mockUsers.filter(u => u.role === 'distributor').length, icon: Truck },
    { role: 'Pharmacies', count: mockUsers.filter(u => u.role === 'pharmacy').length, icon: Store },
  ];

  const recentActivity = mockDrugs
    .flatMap(drug => drug.scanHistory.map(scan => ({ ...scan, drugName: drug.name, drugId: drug.id })))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return (
    <DashboardLayout title="Admin Dashboard" role="admin">
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
                  <p className="text-sm text-muted-foreground">{stat.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Recent Activity
            </h2>
            <div className="card-elevated divide-y divide-border">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-foreground text-sm">{activity.drugName}</p>
                    <p className="text-xs text-muted-foreground">{activity.action}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground capitalize">{activity.role}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Flagged Drugs
            </h2>
            <div className="space-y-4">
              {mockDrugs.filter(d => !d.isAuthentic).map((drug) => (
                <DrugCard key={drug.id} drug={drug} />
              ))}
              {mockDrugs.filter(d => !d.isAuthentic).length === 0 && (
                <div className="card-elevated p-8 text-center">
                  <Shield className="w-12 h-12 text-success mx-auto mb-3" />
                  <p className="text-muted-foreground">No flagged drugs detected</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* All Drugs */}
        <div>
          <h2 className="text-xl font-display font-semibold text-foreground mb-4">
            All Registered Drugs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockDrugs.map((drug) => (
              <DrugCard key={drug.id} drug={drug} />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
