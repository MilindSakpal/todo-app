import {
  ClipboardList,
  Clock3,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";
import StatCard from "./StatCard";

interface StatsCardsProps {
  total: number;
  completed: number;
  pending: number;
  totalHours: number;
}

export default function StatsCards({
  total,
  completed,
  pending,
  totalHours,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      <StatCard
        title="Total Tasks"
        value={total}
        icon={<ClipboardList size={26} />}
        color="bg-blue-600"
      />

      <StatCard
        title="Completed"
        value={completed}
        icon={<CheckCircle2 size={26} />}
        color="bg-green-600"
      />

      <StatCard
        title="Pending"
        value={pending}
        icon={<Clock3 size={26} />}
        color="bg-amber-500"
      />

      <StatCard
        title="Total Hours"
        value={totalHours}
        icon={<CalendarDays size={26} />}
        color="bg-violet-600"
      />
    </div>
  );
}