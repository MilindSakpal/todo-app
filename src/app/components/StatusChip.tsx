interface StatusChipProps {
  status: "Completed" | "Pending" | "In Review" | "Rejected";
}

const STATUS_CONFIG = {
  Completed: {
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-500",
  },
  Pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  "In Review": {
    bg: "bg-purple-50",
    text: "text-purple-700",
    dot: "bg-purple-500",
  },
  Rejected: {
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
  },
};

export default function StatusChip({ status }: StatusChipProps) {
  const cfg = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}