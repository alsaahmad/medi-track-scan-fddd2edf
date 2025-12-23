import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  default: 'bg-card',
  primary: 'gradient-primary',
  success: 'gradient-success',
  warning: 'bg-warning',
  danger: 'bg-destructive',
};

const iconStyles = {
  default: 'bg-primary/10 text-primary',
  primary: 'bg-primary-foreground/20 text-primary-foreground',
  success: 'bg-success-foreground/20 text-success-foreground',
  warning: 'bg-warning-foreground/20 text-warning-foreground',
  danger: 'bg-destructive-foreground/20 text-destructive-foreground',
};

const textStyles = {
  default: 'text-foreground',
  primary: 'text-primary-foreground',
  success: 'text-success-foreground',
  warning: 'text-warning-foreground',
  danger: 'text-destructive-foreground',
};

export const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp, 
  variant = 'default' 
}: StatsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={cn(
        "rounded-xl p-6 shadow-lg border border-border/50",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={cn(
            "text-sm font-medium mb-1",
            variant === 'default' ? 'text-muted-foreground' : textStyles[variant] + '/80'
          )}>
            {title}
          </p>
          <p className={cn(
            "text-3xl font-display font-bold",
            textStyles[variant]
          )}>
            {value}
          </p>
          {trend && (
            <p className={cn(
              "text-sm mt-2",
              variant === 'default'
                ? trendUp ? 'text-success' : 'text-destructive'
                : textStyles[variant] + '/80'
            )}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          iconStyles[variant]
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};
