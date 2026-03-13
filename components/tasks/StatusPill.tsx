import { cn } from "@/lib/utils";

interface StatusPillProps {
  status: "TODO" | "IN_PROGRESS" | "WAITING" | "DONE";
}

const statusConfig = {
  TODO: {
    label: "Todo",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    dot: "bg-blue-400",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dot: "bg-amber-400",
  },
  WAITING: {
    label: "Waiting",
    className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    dot: "bg-purple-400",
  },
  DONE: {
    label: "Done",
    className:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-400",
  },
};

export function StatusPill({ status }: StatusPillProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
        config.className
      )}
    >
      <span
        className={cn("h-1 w-1 rounded-full", config.dot)}
      />
      {config.label}
    </span>
  );
}
