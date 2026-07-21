import { motion, AnimatePresence } from "motion/react";
import { Trash2, X } from "lucide-react";

interface DeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteModal({
  open,
  onClose,
  onConfirm,
}: DeleteModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="font-semibold text-lg">Delete Task</h2>

                <button onClick={onClose}>
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <Trash2 className="text-red-600" size={28} />
                </div>

                <h3 className="text-lg font-semibold">
                  Delete this task?
                </h3>

                <p className="text-sm text-slate-500 mt-2">
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t bg-slate-50">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  onClick={onConfirm}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}