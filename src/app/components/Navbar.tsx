import { AnimatePresence, motion } from "framer-motion";
import { Clock, ChevronDown, User, BarChart3, LogOut } from "lucide-react";
import logo from "../../assets/1.png";

interface Profile {
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
}

interface NavbarProps {
  today: Date;
  profile: Profile;
  profileOpen: boolean;
  setProfileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openProfileModal: () => void;
  openReports: () => void;
}

export default function Navbar({
  today,
  profile,
  profileOpen,
  setProfileOpen,
  openProfileModal,
  openReports,
}: NavbarProps) {
  const initials = profile.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("employee");
    localStorage.removeItem("profile");
    window.location.href = "/login";
    window.location.reload();
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src={logo}
            alt="Intellysis Digital"
            className="h-40 w-auto object-contain"
          />
        </div>

        <div className="hidden md:flex items-center px-4 py-2 rounded-xl bg-slate-50 border">
          <span className="text-xs text-slate-500">
            {today.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
              {initials}
            </div>

            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold">{profile.name}</p>

              <p className="text-xs text-slate-500">{profile.designation}</p>
            </div>

            <ChevronDown size={15} />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border overflow-hidden"
              >
                <button
                  onClick={() => {
                    openProfileModal();
                    setProfileOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-slate-100 text-sm"
                >
                  <User size={16} />
                  Profile Settings
                </button>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    openReports();
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-slate-100 text-sm"
                >
                  <BarChart3 size={16} />
                  My Reports
                </button>

                <hr />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
