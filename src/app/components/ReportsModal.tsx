import { useMemo, useState } from "react";
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  XCircle,
  FileSpreadsheet,
  FileText,
  Printer,
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import { AnimatePresence, motion } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Status = "Completed" | "Pending" | "In Review" | "Rejected";

interface TimesheetEntry {
  id: string;
  taskName: string;
  project: string;
  category: string;
  startTime: string;
  endTime: string;
  status: Status;
  description?: string;
  date: string;
}

interface ReportsModalProps {
  open: boolean;
  onClose: () => void;
  entries: TimesheetEntry[];
}

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export default function ReportsModal({
  open,
  onClose,
  entries,
}: ReportsModalProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "charts" | "export"
  >("overview");

  const totalMinutes = useMemo(() => {
    return entries.reduce((total, task) => {
      const diff =
        toMinutes(task.endTime) -
        toMinutes(task.startTime);

      return total + (diff > 0 ? diff : 0);
    }, 0);
  }, [entries]);

  const completed = entries.filter(
    (e) => e.status === "Completed"
  ).length;

  const pending = entries.filter(
    (e) => e.status === "Pending"
  ).length;

  const review = entries.filter(
    (e) => e.status === "In Review"
  ).length;

  const rejected = entries.filter(
    (e) => e.status === "Rejected"
  ).length;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const productivity =
    entries.length === 0
      ? 0
      : Math.round((completed / entries.length) * 100);

  const statusData = [
    {
      name: "Completed",
      value: completed,
      color: "#22c55e",
    },
    {
      name: "Pending",
      value: pending,
      color: "#f59e0b",
    },
    {
      name: "In Review",
      value: review,
      color: "#8b5cf6",
    },
    {
      name: "Rejected",
      value: rejected,
      color: "#ef4444",
    },
  ];

  const projectMap: Record<string, number> = {};

  entries.forEach((task) => {
    const diff =
      toMinutes(task.endTime) -
      toMinutes(task.startTime);

    if (diff > 0) {
      projectMap[task.project] =
        (projectMap[task.project] || 0) + diff;
    }
  });

  const projectData = Object.entries(projectMap).map(
    ([name, mins]) => ({
      project: name,
      hours: +(mins / 60).toFixed(1),
    })
  );

  const weeklyData = [
    {
      name: "Worked",
      hours: +(totalMinutes / 60).toFixed(1),
    },
  ];

const handleExportExcel = async () => {
  try {
    const res = await fetch(
  `${import.meta.env.VITE_API_URL}/export/excel`,
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
);  const data = await res.json();

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

  const handleExportPDF = () => {
  const doc = new jsPDF("landscape");

  doc.setFontSize(18);
  doc.text("Intellysis Digital - Timesheet Report", 14, 15);

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

  autoTable(doc, {
    startY: 30,

    head: [[
      "Task",
      "Project",
      "Category",
      "Date",
      "Start Time",
      "End Time",
      "Status",
      "Description",
    ]],

    body: entries.map((entry) => [
      entry.taskName,
      entry.project,
      entry.category,
      entry.date,
      entry.startTime,
      entry.endTime,
      entry.status,
      entry.description || "-",
    ]),

    styles: {
      fontSize: 8,
      cellPadding: 3,
    },

    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: "bold",
    },

    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  doc.save("Timesheet_Report.pdf");
};

const handlePrint = () => {
  const printWindow = window.open("", "_blank");

  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Timesheet Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }

          h1 {
            text-align: center;
            margin-bottom: 20px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th,
          td {
            border: 1px solid #ccc;
            padding: 8px;
            font-size: 13px;
            text-align: left;
          }

          th {
            background: #2563eb;
            color: white;
          }

          tr:nth-child(even) {
            background: #f5f5f5;
          }
        </style>
      </head>

      <body>
        <h1>Intellysis Digital - Timesheet Report</h1>

        <table>
          <thead>
            <tr>
              <th>Task</th>
              <th>Project</th>
              <th>Category</th>
              <th>Date</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            ${entries
              .map(
                (e) => `
                <tr>
                  <td>${e.taskName}</td>
                  <td>${e.project}</td>
                  <td>${e.category}</td>
                  <td>${e.date}</td>
                  <td>${e.startTime}</td>
                  <td>${e.endTime}</td>
                  <td>${e.status}</td>
                </tr>
              `
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-6xl h-[88vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}

        <div className="flex items-center justify-between px-8 py-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">My Reports</h2>

            <p className="text-sm text-slate-500 mt-1">
              Productivity overview of your timesheet
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        </div>

        {/* Tabs */}

        <div className="border-b">
          <div className="flex">
            {[
              {
                key: "overview",
                label: "Overview",
              },
              {
                key: "charts",
                label: "Charts",
              },
              {
                key: "export",
                label: "Export",
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() =>
                  setActiveTab(tab.key as "overview" | "charts" | "export")
                }
                className={`px-6 py-4 text-sm font-semibold transition-all

                ${
                  activeTab === tab.key
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}

        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === "overview" && (
                <div className="space-y-8">
                  {/* Stats */}

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
                    <StatCard
                      title="Hours Worked"
                      value={`${hours}h ${minutes}m`}
                      icon={<Clock size={22} />}
                      color="bg-blue-100 text-blue-700"
                    />

                    <StatCard
                      title="Completed"
                      value={completed}
                      icon={<CheckCircle2 size={22} />}
                      color="bg-green-100 text-green-700"
                    />

                    <StatCard
                      title="Pending"
                      value={pending}
                      icon={<AlertCircle size={22} />}
                      color="bg-yellow-100 text-yellow-700"
                    />

                    <StatCard
                      title="In Review"
                      value={review}
                      icon={<Eye size={22} />}
                      color="bg-purple-100 text-purple-700"
                    />

                    <StatCard
                      title="Rejected"
                      value={rejected}
                      icon={<XCircle size={22} />}
                      color="bg-red-100 text-red-700"
                    />
                  </div>

                  {/* Productivity */}

                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-slate-200 p-6">
                      <h3 className="text-lg font-semibold">
                        Productivity Score
                      </h3>

                      <div className="mt-6 flex items-center justify-between">
                        <div>
                          <p className="text-5xl font-bold text-blue-600">
                            {productivity}%
                          </p>

                          <p className="text-slate-500 mt-2">
                            {productivity >= 90
                              ? "Outstanding Performance"
                              : productivity >= 75
                                ? "Excellent Performance"
                                : productivity >= 60
                                  ? "Good Performance"
                                  : "Needs Improvement"}
                          </p>
                        </div>

                        <div className="w-28 h-28 rounded-full border-[10px] border-blue-500 flex items-center justify-center">
                          <span className="text-xl font-bold">
                            {productivity}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Summary */}

                    <div className="rounded-2xl border border-slate-200 p-6">
                      <h3 className="text-lg font-semibold mb-6">Summary</h3>

                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Total Tasks</span>

                          <span className="font-semibold">
                            {entries.length}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-500">
                            Active Projects
                          </span>

                          <span className="font-semibold">
                            {Object.keys(projectMap).length}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-500">Total Hours</span>

                          <span className="font-semibold">
                            {hours}h {minutes}m
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-500">
                            Completion Rate
                          </span>

                          <span className="font-semibold text-green-600">
                            {productivity}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "charts" && (

<div className="space-y-6">

  {/* Top Charts */}

  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

    {/* Weekly Productivity */}

    <div className="rounded-2xl border border-slate-200 p-6 bg-white shadow-sm">

      <h3 className="text-lg font-semibold mb-5">
        Weekly Productivity
      </h3>

      <ResponsiveContainer width="100%" height={260}>

        <BarChart data={weeklyData}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="name" />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="hours"
            radius={[8,8,0,0]}
            fill="#2563EB"
          />

        </BarChart>

      </ResponsiveContainer>

    </div>

    {/* Status */}

    <div className="rounded-2xl border border-slate-200 p-6 bg-white shadow-sm">

      <h3 className="text-lg font-semibold mb-5">
        Task Status Distribution
      </h3>

      <ResponsiveContainer width="100%" height={260}>

        <PieChart>

          <Pie
            data={statusData}
            dataKey="value"
            innerRadius={60}
            outerRadius={90}
          >

            {statusData.map((item,index)=>(
              <Cell
                key={index}
                fill={item.color}
              />
            ))}

          </Pie>

          <Tooltip />

        </PieChart>

      </ResponsiveContainer>

      {/* Legend */}

      <div className="grid grid-cols-2 gap-3 mt-4">

        {statusData.map((item)=>(
          <div
            key={item.name}
            className="flex items-center justify-between text-sm"
          >

            <div className="flex items-center gap-2">

              <span
                className="w-3 h-3 rounded-full"
                style={{
                  background:item.color
                }}
              />

              {item.name}

            </div>

            <span className="font-semibold">

              {item.value}

            </span>

          </div>
        ))}

      </div>

    </div>

  </div>

  {/* Project Hours */}

  <div className="rounded-2xl border border-slate-200 p-6 bg-white shadow-sm">

    <h3 className="text-lg font-semibold mb-5">
      Project Wise Hours
    </h3>

    <ResponsiveContainer width="100%" height={320}>

      <BarChart data={projectData}>

        <CartesianGrid strokeDasharray="3 3"/>

        <XAxis dataKey="project"/>

        <YAxis/>

        <Tooltip/>

        <Bar
          dataKey="hours"
          radius={[8,8,0,0]}
          fill="#16A34A"
        />

      </BarChart>

    </ResponsiveContainer>

  </div>

</div>

)}

{activeTab === "export" && (

<div className="space-y-8">

  {/* Report Summary */}

  <div className="rounded-2xl border border-slate-200 p-6">

    <h3 className="text-xl font-semibold mb-6">
      Export Reports
    </h3>

    <div className="grid md:grid-cols-2 gap-6">

      <div className="space-y-4">

        <div className="flex justify-between">
          <span className="text-slate-500">
            Report Date
          </span>

          <span className="font-semibold">
            {new Date().toLocaleDateString()}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">
            Total Entries
          </span>

          <span className="font-semibold">
            {entries.length}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">
            Hours Worked
          </span>

          <span className="font-semibold">
            {hours}h {minutes}m
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">
            Productivity
          </span>

          <span className="font-semibold text-green-600">
            {productivity}%
          </span>
        </div>

      </div>

      <div className="rounded-xl bg-slate-50 p-5">

        <p className="text-sm text-slate-600">

          Export your complete timesheet report as
          Excel or PDF, or print it directly.

        </p>

      </div>

    </div>

  </div>

  {/* Buttons */}

  <div className="grid md:grid-cols-3 gap-5">

    <button
      onClick={handleExportExcel}
      className="rounded-2xl border border-green-200 bg-green-50 hover:bg-green-100 transition p-6 text-left"
    >

      <FileSpreadsheet
        size={34}
        className="text-green-600 mb-4"
      />

      <h3 className="font-bold text-lg">
        Export Excel
      </h3>

      <p className="text-sm text-slate-500 mt-2">
        Download your report as an Excel file.
      </p>

    </button>

    <button
      onClick={handleExportPDF}
      className="rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 transition p-6 text-left"
    >

      <FileText
        size={34}
        className="text-red-600 mb-4"
      />

      <h3 className="font-bold text-lg">
        Export PDF
      </h3>

      <p className="text-sm text-slate-500 mt-2">
        Download a printable PDF report.
      </p>

    </button>

    <button
      onClick={handlePrint}
      className="rounded-2xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition p-6 text-left"
    >

      <Printer
        size={34}
        className="text-blue-600 mb-4"
      />

      <h3 className="font-bold text-lg">
        Print Report
      </h3>

      <p className="text-sm text-slate-500 mt-2">
        Print your report directly from the browser.
      </p>

    </button>

  </div>

</div>

)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: CardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>

          <h2 className="text-3xl font-bold mt-2">{value}</h2>
        </div>

        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
