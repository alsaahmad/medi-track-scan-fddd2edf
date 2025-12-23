import { cn } from "@/lib/utils";
import { Drug, getStatusColor, getStatusLabel } from "@/lib/mockData";

interface StatusBadgeProps {
  status: Drug['status'];
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  return (
    <span className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
      getStatusColor(status),
      className
    )}>
      {getStatusLabel(status)}
    </span>
  );
};
