import { cn } from "@/lib/utils";

type Status = "online" | "away" | "busy" | "offline";

interface StatusIndicatorProps {
  status: Status;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const statusStyles: Record<Status, string> = {
  online: "bg-status-online",
  away: "bg-status-away",
  busy: "bg-status-busy",
  offline: "bg-status-offline",
};

const sizeStyles = {
  sm: "w-2 h-2",
  md: "w-3 h-3",
  lg: "w-4 h-4",
};

export function StatusIndicator({ 
  status, 
  size = "md", 
  className 
}: StatusIndicatorProps) {
  return (
    <div
      className={cn(
        "rounded-full border-2 border-background flex-shrink-0",
        statusStyles[status],
        sizeStyles[size],
        className
      )}
    />
  );
}