import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, Edit2, Plus, Trash2 } from "lucide-react";
import StatusChip from "./StatusChip";

interface TaskTableProps {
  loading: boolean;
  filteredEntries: any[];
  selectedDate: string;
  tableKey: number;

  formatDisplay: (time: string) => string;
  calcDuration: (start: string, end: string) => string;

  handleEdit: (entry: any) => void;
  handleDelete: (id: string) => void;

  setEditEntry: (entry: any) => void;
  setModalOpen: (value: boolean) => void;
}

export default function TaskTable({
  filteredEntries,
  selectedDate,
  tableKey,
  formatDisplay,
  calcDuration,
  handleEdit,
  handleDelete,
  setEditEntry,
  setModalOpen,
}: TaskTableProps) {
  return (
    <div className="overflow-x-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedDate}-${tableKey}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
        >
          {filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <AlertCircle size={28} className="text-slate-300" />
              </div>

              <p className="text-sm font-semibold text-slate-500">
                No work logged for this day.
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Click "Add Entry" to log your first task.
              </p>

              <button
                onClick={() => {
                  setEditEntry(null);
                  setModalOpen(true);
                }}
                className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200"
              >
                <Plus size={13} />
                Add Entry
              </button>
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {[
                    "Task Name",
                    "Project",
                    "Category",
                    "Start",
                    "End",
                    "Duration",
                    "Status",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 whitespace-nowrap"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {filteredEntries.map((entry, i) => (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.18,
                      delay: i * 0.04,
                    }}
                    className="hover:bg-blue-50/40 transition-colors group"
                  >
                    <td className="px-4 py-3.5 font-semibold text-slate-800">
                      {entry.taskName}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {entry.project}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      {entry.category}
                    </td>

                    <td className="px-4 py-3.5 font-mono">
                      {formatDisplay(entry.startTime)}
                    </td>

                    <td className="px-4 py-3.5 font-mono">
                      {formatDisplay(entry.endTime)}
                    </td>

                    <td className="px-4 py-3.5 font-semibold font-mono">
                      {calcDuration(
                        entry.startTime,
                        entry.endTime
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <StatusChip status={entry.status} />
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="p-1.5 rounded-lg hover:bg-blue-100"
                        >
                          <Edit2 size={13} />
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(entry.id)
                          }
                          className="p-1.5 rounded-lg hover:bg-red-100"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}