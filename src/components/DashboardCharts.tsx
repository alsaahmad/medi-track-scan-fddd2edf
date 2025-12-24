import { useDrugStats } from '@/hooks/useDrugs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Loader2 } from 'lucide-react';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--warning))', 'hsl(var(--success))', 'hsl(var(--muted))', 'hsl(var(--destructive))'];

export const DrugStatusChart = () => {
  const { data: stats, isLoading } = useDrugStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) return null;

  const data = [
    { name: 'Created', value: stats.statusCounts.created, color: COLORS[0] },
    { name: 'Distributed', value: stats.statusCounts.distributed, color: COLORS[1] },
    { name: 'In Pharmacy', value: stats.statusCounts.in_pharmacy, color: COLORS[2] },
    { name: 'Sold', value: stats.statusCounts.sold, color: COLORS[3] },
    { name: 'Flagged', value: stats.statusCounts.flagged, color: COLORS[4] },
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No drug data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const ScansByRoleChart = () => {
  const { data: stats, isLoading } = useDrugStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) return null;

  const data = [
    { role: 'Manufacturer', scans: stats.roleCounts.manufacturer },
    { role: 'Distributor', scans: stats.roleCounts.distributor },
    { role: 'Pharmacy', scans: stats.roleCounts.pharmacy },
    { role: 'Consumer', scans: stats.roleCounts.consumer },
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="role" stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }} 
        />
        <Bar dataKey="scans" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const StatsOverview = () => {
  const { data: stats, isLoading } = useDrugStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="animate-pulse bg-muted h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-primary/10 rounded-lg p-4 text-center">
        <p className="text-2xl font-bold text-primary">{stats.totalDrugs}</p>
        <p className="text-sm text-muted-foreground">Total Drugs</p>
      </div>
      <div className="bg-success/10 rounded-lg p-4 text-center">
        <p className="text-2xl font-bold text-success">{stats.totalScans}</p>
        <p className="text-sm text-muted-foreground">Total Scans</p>
      </div>
      <div className="bg-warning/10 rounded-lg p-4 text-center">
        <p className="text-2xl font-bold text-warning">{stats.alertCount}</p>
        <p className="text-sm text-muted-foreground">Active Alerts</p>
      </div>
      <div className="bg-destructive/10 rounded-lg p-4 text-center">
        <p className="text-2xl font-bold text-destructive">{stats.statusCounts.flagged}</p>
        <p className="text-sm text-muted-foreground">Flagged Drugs</p>
      </div>
    </div>
  );
};
