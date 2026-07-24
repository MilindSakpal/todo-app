import { useNavigate } from "react-router-dom";
import Login from "./components/Login";
import TaskTable from "./components/TaskTable";
import ProfileModal from "./components/ProfileModal";
import Navbar from "./components/Navbar";
import DeleteModal from "./components/DeleteModal";
import ReportsModal from "./components/ReportsModal";
// import StatsCards from "./components/StatsCards";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/taskService";
import { useState, useMemo, useEffect } from "react";
import {
  Clock,
  Briefcase,
  CheckSquare,
  CheckCircle2,
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  RefreshCw,
  Upload,
  Download,
  X,
  Paperclip,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "motion/react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = "Completed" | "Pending" | "In Review" | "Rejected";

interface TimesheetEntry {
  id: string;
  taskName: string;
  project: string;
  category: string;
  startTime: string;
  endTime: string;
  duration?: string;
  status: Status;
  description?: string;
  date: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PROJECTS = [
  "Intellysis Portal",
  "Client Dashboard",
  "Mobile App",
  "Internal Tools",
  "QA Suite",
];

const CATEGORIES = [
  "Development",
  "Design",
  "Testing",
  "Meeting",
  "Documentation",
  "Research",
];

function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function calcDuration(start: string, end: string) {
  const diff = toMinutes(end) - toMinutes(start);
  if (diff <= 0) return "—";
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return h > 0 ? `${h}h ${m > 0 ? m + "m" : ""}`.trim() : `${m}m`;
}

function formatDisplay(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = h % 12 || 12;
  return `${hh}:${m.toString().padStart(2, "0")} ${ampm}`;
}

const today = new Date();
const fmt = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function daysAgo(n: number) {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return fmt(d);
}
// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatHours = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  return `${h}h ${m}m`;
};

const STATUS_CONFIG: Record<Status, { bg: string; text: string; dot: string }> =
  {
    Completed: {
      bg: "bg-green-50",
      text: "text-green-700",
      dot: "bg-green-500",
    },
    Pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
    "In Review": {
      bg: "bg-purple-50",
      text: "text-purple-700",
      dot: "bg-purple-500",
    },
    Rejected: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  };

function StatusChip({ status }: { status: Status }) {
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

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  entry?: TimesheetEntry | null;
  selectedDate: string;
  onSave: (e: TimesheetEntry) => void;
  onClose: () => void;
}

function EntryModal({ entry, selectedDate, onSave, onClose }: ModalProps) {
  const [form, setForm] = useState({
    taskName: entry?.taskName ?? "",
    project: entry?.project ?? PROJECTS[0],
    category: entry?.category ?? CATEGORIES[0],
    description: entry?.description ?? "",
    startTime: entry?.startTime ?? "09:00",
    endTime: entry?.endTime ?? "10:00",
    status: entry?.status ?? "Pending",
    date: entry?.date ?? selectedDate,
  });

  const duration = calcDuration(form.startTime, form.endTime);

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  function handleSave() {
    if (!form.taskName.trim()) return;
    onSave({ ...form, id: entry?.id ?? String(Date.now()) });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        style={{
          boxShadow:
            "0 24px 64px rgba(30,136,229,0.15), 0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {entry ? "Edit Entry" : "Add New Entry"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill in the task details below
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Task Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Task Name *
            </label>
            <input
              value={form.taskName}
              onChange={(e) => set("taskName", e.target.value)}
              placeholder="e.g. Dashboard UI Redesign"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-slate-50 placeholder:text-slate-400 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Project
              </label>
              <select
                value={form.project}
                onChange={(e) => set("project", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-slate-50 transition"
              >
                {PROJECTS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-slate-50 transition"
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              placeholder="Brief description of the task..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-slate-50 resize-none placeholder:text-slate-400 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-slate-50 transition"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => set("startTime", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-slate-50 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                End Time
              </label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => set("endTime", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-slate-50 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Duration
              </label>
              <div className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-100 text-slate-600 font-mono">
                {duration}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value as Status)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-slate-50 transition"
            >
              {(
                ["Completed", "Pending", "In Review", "Rejected"] as Status[]
              ).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Attachment */}
          {/* <div> 
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Attachment
            </label>
            <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-slate-300 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition text-sm text-slate-500 group">
              <Paperclip
                size={15}
                className="group-hover:text-blue-500 transition-colors"
              />
              <span className="group-hover:text-blue-600 transition-colors">
                Click to upload file
              </span>
              <input type="file" className="hidden" />
            </label>
          </div> */}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200"
          >
            {entry ? "Save Changes" : "Add Entry"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

function Calendar({
  selectedDate,
  onSelect,
  markedDates,
}: {
  selectedDate: string;
  onSelect: (d: string) => void;
  markedDates: Set<string>;
}) {
  const [viewDate, setViewDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const todayStr = fmt(today);

  return (
    <div className="select-none">
      {/* Nav */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-slate-800">
          {MONTH_NAMES[month]} {year}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-semibold text-slate-400 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const hasData = markedDates.has(dateStr);

          return (
            <motion.button
              key={dateStr}
              whileTap={{ scale: 0.88 }}
              onClick={() => onSelect(dateStr)}
              className={`relative mx-auto w-8 h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-all
                ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : isToday
                      ? "bg-blue-50 text-blue-600 ring-1 ring-blue-200"
                      : "text-slate-700 hover:bg-slate-100"
                }`}
            >
              {day}
              {hasData && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Weekly Productivity Donut ────────────────────────────────────────────────

interface WeeklyChartProps {
  summary: {
    completedMinutes: number;
    pendingMinutes: number;
    overtimeMinutes: number;
    totalMinutes: number;
  };
}

function WeeklyChart({ summary }: WeeklyChartProps) {
  const data = [
    {
      name: "Completed",
      value: summary.completedMinutes / 60,
      color: "#16A34A",
    },
    {
      name: "Pending",
      value: summary.pendingMinutes / 60,
      color: "#F59E0B",
    },
    {
      name: "Overtime",
      value: summary.overtimeMinutes / 60,
      color: "#8B5CF6",
    },
    {
      name: "Remaining",
      value: Math.max(0, 40 - summary.totalMinutes / 60),
      color: "#E2E8F0",
    },
  ];

  const total = 40;

  return (
    <div>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={72}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: number) => [`${v}h`, ""]}
            contentStyle={{
              borderRadius: "10px",
              border: "1px solid #E2E8F0",
              fontSize: "12px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center label — overlay */}
      <div className="-mt-[156px] flex flex-col items-center justify-center h-40 pointer-events-none">
        <span className="text-2xl font-bold text-slate-900">
          {formatHours(summary.totalMinutes)}
        </span>
        <span className="text-xs text-slate-500">of 40h</span>
      </div>

      <div className="mt-4 space-y-2.5">
        <div className="mt-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-xs text-slate-600">Completed</span>
            </div>

            <span className="text-xs font-semibold">
              {formatHours(summary.completedMinutes)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <span className="text-xs text-slate-600">Pending</span>
            </div>

            <span className="text-xs font-semibold">
              {formatHours(summary.pendingMinutes)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span className="text-xs text-slate-600">Overtime</span>
            </div>

            <span className="text-xs font-semibold">
              {formatHours(summary.overtimeMinutes)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Excel Panel ──────────────────────────────────────────────────────────────

function ExcelPanel() {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(true);

  function handleSync() {
    setSyncing(true);
    setSynced(false);
    setTimeout(() => {
      setSyncing(false);
      setSynced(true);
    }, 1800);
  }

  const handleExportExcel = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/export/excel`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();

      if (data.success) {
        window.open(data.downloadUrl, "_blank");
      } else {
        alert("Export failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  const employee = JSON.parse(localStorage.getItem("employee") || "{}");
  
  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-100">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-semibold text-green-700">
            Connected
          </span>
        </div>
        <span className="text-[10px] text-green-600 font-mono">
          Excel Online
        </span>
      </div>

      {/* File */}
      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
        <FileSpreadsheet size={16} className="text-green-600 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-800 truncate">
            {employee.full_name
              ? `${employee.full_name}_daily_task_tracker.xlsx`
              : "Timesheet.xlsx"}
          </p>
          <p className="text-[10px] text-slate-500">Last sync: 2 mins ago</p>
        </div>
      </div>

      {/* Auto Sync */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-600">Auto Sync</span>
        <div
          className={`w-8 h-4 rounded-full transition-colors cursor-pointer ${synced ? "bg-green-500" : "bg-slate-300"}`}
        >
          <div
            className={`w-3 h-3 bg-white rounded-full shadow m-0.5 transition-transform ${synced ? "translate-x-4" : "translate-x-0"}`}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-1 gap-2">
        <button
          onClick={handleSync}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200"
        >
          <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Syncing…" : "Sync Now"}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
          >
            <Download size={12} /> Export
          </button>
          <button
            onClick={() =>
              alert("🚧 Import feature will be available in a future update.")
            }
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
          >
            <Upload size={12} /> Import
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
  delta?: string;
  deltaUp?: boolean;
}

function StatCard({
  label,
  value,
  description,
  icon,
  gradient,
  iconBg,
  delta,
  deltaUp,
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 12px 32px rgba(0,0,0,0.10)" }}
      transition={{ duration: 0.18 }}
      className={`rounded-2xl p-5 border border-white/60 bg-gradient-to-br ${gradient} shadow-sm cursor-default`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} shadow-sm`}
        >
          {icon}
        </div>
        {delta && (
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${deltaUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {delta}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-900 mb-0.5">{value}</div>
      <div className="text-xs font-semibold text-slate-600">{label}</div>
      <div className="text-[11px] text-slate-400 mt-0.5">{description}</div>
    </motion.div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(fmt(today));
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "All">("All");
  const [sortBy, setSortBy] = useState<"time" | "name" | "status">("time");
  const [modalOpen, setModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<TimesheetEntry | null>(null);
  // const [darkMode, setDarkMode] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [tableKey, setTableKey] = useState(0);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [profile, setProfile] = useState(() => {
    const employee = localStorage.getItem("employee");

    if (employee) {
      const emp = JSON.parse(employee);

      const savedProfile = localStorage.getItem("profile");

      if (savedProfile) {
        return JSON.parse(savedProfile);
      }
      return {
        name: emp.full_name,
        email: emp.email,
        phone: "",
        department: emp.department,
        designation: emp.role,
      };
    }
    return {
      name: "John Doe",
      email: "john@example.com",
      phone: "",
      department: "Development",
      designation: "Employee",
    };
  });
  useEffect(() => {
    localStorage.setItem("profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (!timerActive) return;
    const id = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerActive]);

  const timerDisplay = `${String(Math.floor(timerSeconds / 3600)).padStart(2, "0")}:${String(Math.floor((timerSeconds % 3600) / 60)).padStart(2, "0")}:${String(timerSeconds % 60).padStart(2, "0")}`;

  // Dark mode toggle
  // useEffect(() => {
  //   document.documentElement.classList.toggle("dark", darkMode);
  // }, [darkMode]);

  const fetchTasks = async () => {
    console.log("Fetching tasks...");
    const data = await getTasks();
    console.log("Fetched:", data);
    try {
      const data = await getTasks();
      console.log("Fetched:", data);
      console.log(data);

      if (!Array.isArray(data)) {
        console.log("Not an array!", data);
        return;
      }

      const formatted = data.map((task: any) => ({
        id: String(task.id),
        taskName: task.task_name,
        project: task.project,
        category: task.category,
        description: task.description,
        startTime: task.start_time,
        endTime: task.end_time,
        status: task.status,
        date: new Intl.DateTimeFormat("en-CA").format(new Date(task.task_date)),
      }));

      console.log(formatted);

      setEntries(formatted);
      console.log("Entries updated");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteTask(Number(deleteId));
      await fetchTasks();

      setDeleteOpen(false);
      setDeleteId(null);
    } catch (error) {
      console.error(error);
    }
  };

  const markedDates = useMemo(
    () => new Set(entries.map((e) => e.date)),
    [entries],
  );
  console.log("First Entry:", entries[0]?.date);

  const filteredEntries = useMemo(() => {
    let list = entries.filter((e) => e.date === selectedDate);

    if (filterStatus !== "All") {
      list = list.filter((e) => e.status === filterStatus);
    }

    if (search.trim()) {
      const q = search.toLowerCase();

      list = list.filter(
        (e) =>
          e.taskName.toLowerCase().includes(q) ||
          e.project.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q),
      );
    }

    list = [...list].sort((a, b) => {
      if (sortBy === "time") return a.startTime.localeCompare(b.startTime);

      if (sortBy === "name") return a.taskName.localeCompare(b.taskName);

      return a.status.localeCompare(b.status);
    });

    return list;
  }, [entries, selectedDate, filterStatus, search, sortBy]);

  useEffect(() => {}, [filteredEntries]);

  const summary = useMemo(() => {
    let completedMinutes = 0;
    let pendingMinutes = 0;
    let totalMinutes = 0;

    const toMinutes = (duration: string) => {
      const hours = duration.match(/(\d+)h/);
      const minutes = duration.match(/(\d+)m/);

      return (
        (hours ? Number(hours[1]) * 60 : 0) + (minutes ? Number(minutes[1]) : 0)
      );
    };

    entries.forEach((task) => {
      const minutes = calcDuration(task.startTime, task.endTime)
        ? toMinutes(calcDuration(task.startTime, task.endTime))
        : 0;

      totalMinutes += minutes;

      if (task.status === "Completed") {
        completedMinutes += minutes;
      }

      if (task.status === "Pending") {
        pendingMinutes += minutes;
      }
    });

    const overtimeMinutes = Math.max(0, totalMinutes - 40 * 60);

    return {
      completedMinutes,
      pendingMinutes,
      overtimeMinutes,
      totalMinutes,
    };
  }, [entries]);

  console.log("Selected Date:", selectedDate);
  console.log(
    "Dates from API:",
    entries.map((e) => e.date),
  );

  const totalMinutes = useMemo(() => {
    return filteredEntries.reduce((acc, e) => {
      const d = toMinutes(e.endTime) - toMinutes(e.startTime);
      return acc + (d > 0 ? d : 0);
    }, 0);
  }, [filteredEntries]);

  const totalHoursDisplay = `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;

  function handleDateSelect(d: string) {
    setSelectedDate(d);
    setTableKey((k) => k + 1);
    setSearch("");
    setFilterStatus("All");
  }

  const handleSave = async (entryData: any) => {
    try {
      const payload = {
        task_name: entryData.taskName,
        project: entryData.project,
        category: entryData.category,
        description: entryData.description,
        task_date: entryData.date,
        start_time: entryData.startTime,
        end_time: entryData.endTime,
        status: entryData.status,
      };

      if (editEntry) {
        await updateTask(Number(editEntry.id), payload);
      } else {
        await createTask(payload);
      }

      await fetchTasks();

      setModalOpen(false);
      setEditEntry(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleEdit = (entry: any) => {
    setEditEntry(entry);
    setModalOpen(true);
  };

  const displayDate = (() => {
    const d = new Date(selectedDate + "T00:00:00");
    const isToday = selectedDate === fmt(today);
    const isYesterday = selectedDate === daysAgo(1);
    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  })();

  const todayEntries = entries.filter((e) => e.date === fmt(today));
  const todayCompleted = todayEntries.filter(
    (e) => e.status === "Completed",
  ).length;
  const todayMinutes = todayEntries.reduce((acc, e) => {
    const d = toMinutes(e.endTime) - toMinutes(e.startTime);
    return acc + (d > 0 ? d : 0);
  }, 0);
  const activeProjects = new Set(entries.map((e) => e.project)).size;

  const greetingHour = today.getHours();
  const greeting =
    greetingHour < 12
      ? "Good Morning"
      : greetingHour < 17
        ? "Good Afternoon"
        : "Good Evening";

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-[Inter,sans-serif] text-slate-900 transition-colors">
      <Navbar
        today={today}
        profile={profile}
        profileOpen={profileOpen}
        setProfileOpen={setProfileOpen}
        openProfileModal={() => setProfileModalOpen(true)}
        openReports={() => setReportsOpen(true)}
      />
      {profileOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setProfileOpen(false)}
        />
      )}

      <div className="max-w-[1440px] mx-auto px-6 py-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {greeting}, {profile.name} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Here's your productivity overview for today.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Hours Logged Today"
            value={`${Math.floor(todayMinutes / 60)}h ${todayMinutes % 60}m`}
            description={`Across ${todayEntries.length} entries`}
            icon={<Clock size={18} className="text-blue-600" />}
            gradient="from-blue-50 to-white"
            iconBg="bg-blue-100"
            delta="+1.5h"
            deltaUp
          />
          <StatCard
            label="Active Projects"
            value={String(activeProjects)}
            description="Across all teams"
            icon={<Briefcase size={18} className="text-purple-600" />}
            gradient="from-purple-50 to-white"
            iconBg="bg-purple-100"
            delta="+2"
            deltaUp
          />
          <StatCard
            label="Today's Tasks"
            value={String(todayEntries.length)}
            description="Assigned this session"
            icon={<CheckSquare size={18} className="text-amber-600" />}
            gradient="from-amber-50 to-white"
            iconBg="bg-amber-100"
          />
          <StatCard
            label="Completed Tasks"
            value={String(todayCompleted)}
            description={`${todayEntries.length > 0 ? Math.round((todayCompleted / todayEntries.length) * 100) : 0}% completion rate`}
            icon={<CheckCircle2 size={18} className="text-green-600" />}
            gradient="from-green-50 to-white"
            iconBg="bg-green-100"
            delta="↑ 20%"
            deltaUp
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
          {/* ── Left: Timesheet ── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Card Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Today's Time Sheet
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {displayDate} · {filteredEntries.length} entries
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tasks…"
                    className="pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-slate-50 w-40 transition"
                  />
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowFilterPanel((p) => !p)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Filter size={13} />
                    Filter
                    {filterStatus !== "All" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    )}
                  </button>
                  <AnimatePresence>
                    {showFilterPanel && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl border border-slate-100 shadow-xl z-20 py-1.5"
                      >
                        {(
                          [
                            "All",
                            "Completed",
                            "Pending",
                            "In Review",
                            "Rejected",
                          ] as const
                        ).map((s) => (
                          <button
                            key={s}
                            onClick={() => {
                              setFilterStatus(s);
                              setShowFilterPanel(false);
                            }}
                            className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors ${filterStatus === s ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}
                          >
                            {s}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                >
                  <option value="time">Sort: Time</option>
                  <option value="name">Sort: Name</option>
                  <option value="status">Sort: Status</option>
                </select>
                <button
                  onClick={() => {
                    setEditEntry(null);
                    setModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200"
                >
                  <Plus size={14} />
                  Add Entry
                </button>
              </div>
            </div>

            <DeleteModal
              open={deleteOpen}
              onClose={() => {
                setDeleteOpen(false);
                setDeleteId(null);
              }}
              onConfirm={confirmDelete}
            />

            <TaskTable
              loading={loading}
              filteredEntries={filteredEntries}
              selectedDate={selectedDate}
              tableKey={tableKey}
              formatDisplay={formatDisplay}
              calcDuration={calcDuration}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              setEditEntry={setEditEntry}
              setModalOpen={setModalOpen}
            />

            {filteredEntries.length > 0 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/60">
                <span className="text-xs text-slate-500">
                  {filteredEntries.length} entries
                </span>
                <div className="flex items-center gap-2">
                  <TrendingUp size={13} className="text-blue-500" />
                  <span className="text-xs font-semibold text-slate-700">
                    Total: {totalHoursDisplay}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                  <CheckSquare size={13} className="text-blue-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Calendar</h3>
              </div>
              <Calendar
                selectedDate={selectedDate}
                onSelect={handleDateSelect}
                markedDates={markedDates}
              />
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center">
                    <BarChart3 size={13} className="text-purple-600" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Weekly Summary
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  This Week
                </span>
              </div>
              <WeeklyChart summary={summary} />
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center">
                  <FileSpreadsheet size={13} className="text-green-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Excel Integration
                </h3>
              </div>
              <ExcelPanel />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <EntryModal
            entry={editEntry}
            selectedDate={selectedDate}
            onSave={handleSave}
            onClose={() => {
              setModalOpen(false);
              setEditEntry(null);
            }}
          />
        )}
      </AnimatePresence>

      {showFilterPanel && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowFilterPanel(false)}
        />
      )}

      <style>{`
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
        * { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <ProfileModal
        open={profileModalOpen}
        profile={profile}
        onClose={() => setProfileModalOpen(false)}
        onSave={(updatedProfile) => {
          setProfile(updatedProfile);
        }}
      />

      <ReportsModal
        open={reportsOpen}
        onClose={() => setReportsOpen(false)}
        entries={entries}
        profile={profile}
      />
    </div>
  );
}
