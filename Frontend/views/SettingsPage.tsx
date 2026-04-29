"use client";
import { motion } from "framer-motion";
import { useAuthStore, type Language } from "../lib/auth-store";
import { useHousehold } from "../lib/hooks";
import { Globe, Bell, Mic, Download, LogOut, Shield, Info, Users } from "lucide-react";
import { useRouter } from "next/navigation";

const languages: Language[] = [
  "English",
  "Hindi",
  "Marathi",
  "Gujarati",
  "Bengali",
  "Tamil",
  "Telugu",
];

export default function SettingsPage() {
  const {
    language,
    setLanguage,
    voiceEnabled,
    toggleVoice,
    notificationsEnabled,
    toggleNotifications,
    chwMode,
    toggleCHWMode,
    logout,
  } = useAuthStore();
  const { data: household } = useHousehold();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleExport = () => {
    const data = JSON.stringify(household ?? {}, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${household?.family_name ?? "Vaxi Babu"}_health_records.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-heading font-800 text-2xl text-white mb-1">
          Settings
        </h1>
        <p className="text-sm text-white/35 mb-8">
          Manage your preferences and account
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Language */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface-800/40 border border-white/[0.06] rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center">
              <Globe size={16} className="text-teal-400" />
            </div>
            <div>
              <p className="font-heading font-700 text-sm text-white">
                Language Hub
              </p>
              <p className="text-xs text-white/30">
                Choose your preferred language
              </p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {languages.map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`py-2.5 rounded-xl text-xs font-medium transition-all ${language === l ? "bg-teal-500/15 text-teal-400 border border-teal-500/20" : "bg-surface-800/40 text-white/35 border border-white/[0.06] hover:text-white/60"}`}
              >
                {l}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Toggles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface-800/40 border border-white/[0.06] rounded-2xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-navy-500/10 flex items-center justify-center">
                <Bell size={16} className="text-navy-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Notifications</p>
                <p className="text-xs text-white/30">
                  Receive health reminders
                </p>
              </div>
            </div>
            <button
              onClick={toggleNotifications}
              className={`w-12 h-7 rounded-full transition-colors relative ${notificationsEnabled ? "bg-teal-500" : "bg-white/10"}`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all ${notificationsEnabled ? "left-6" : "left-1"}`}
              />
            </button>
          </div>

          <div className="border-t border-white/[0.04]" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-warm-500/10 flex items-center justify-center">
                <Mic size={16} className="text-warm-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  Voice Assistant
                </p>
                <p className="text-xs text-white/30">Enable voice FAB button</p>
              </div>
            </div>
            <button
              onClick={toggleVoice}
              className={`w-12 h-7 rounded-full transition-colors relative ${voiceEnabled ? "bg-teal-500" : "bg-white/10"}`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all ${voiceEnabled ? "left-6" : "left-1"}`}
              />
            </button>
          </div>
        </motion.div>

        {/* Data Export */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface-800/40 border border-white/[0.06] rounded-2xl p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sage-500/10 flex items-center justify-center">
                <Download size={16} className="text-sage-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  Export Health Data
                </p>
                <p className="text-xs text-white/30">
                  Download records for doctor visits
                </p>
              </div>
            </div>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-white/[0.06] border border-white/[0.08] rounded-xl text-xs font-medium text-white/60 hover:text-teal-400 hover:border-teal-500/20 transition-colors"
            >
              Download JSON
            </button>
          </div>
        </motion.div>

        {/* CHW / Worker Mode */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className={`rounded-2xl p-5 border transition-all duration-300 ${
            chwMode
              ? 'bg-orange-500/10 border-orange-500/25'
              : 'bg-surface-800/40 border-white/[0.06]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                chwMode ? 'bg-orange-500/20' : 'bg-white/[0.06]'
              }`}>
                <Shield size={16} className={chwMode ? 'text-orange-400' : 'text-white/30'} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white">CHW / Worker Mode</p>
                  {chwMode && (
                    <span className="text-[9px] font-black bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-md border border-orange-500/20">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/30">
                  {chwMode
                    ? 'CHW Field Dashboard visible in navigation'
                    : 'Enable for ASHA / Community Health Workers'}
                </p>
              </div>
            </div>
            <button
              id="chw-mode-toggle"
              onClick={toggleCHWMode}
              className={`w-12 h-7 rounded-full transition-colors relative ${
                chwMode ? 'bg-orange-500' : 'bg-white/10'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all ${
                  chwMode ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
          {chwMode && (
            <div className="mt-3 flex items-start gap-2 bg-orange-500/8 rounded-xl p-3 border border-orange-500/15">
              <Users size={12} className="text-orange-400 mt-0.5 shrink-0" />
              <p className="text-xs text-orange-300/70 leading-relaxed">
                CHW Field Dashboard is now in the navigation. Your backend account type must be ASHA, Anganwadi, or Health Worker to access household compliance data.
              </p>
            </div>
          )}
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-surface-800/40 border border-white/[0.06] rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-coral-500/10 flex items-center justify-center">
              <Shield size={16} className="text-coral-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Trust & Safety</p>
              <p className="text-xs text-white/30">Important information</p>
            </div>
          </div>
          <p className="text-xs text-white/30 leading-relaxed">
            Vaxi Babu does not provide medical diagnoses or treatment advice.
            All health schedules are based on verified guidelines. Always
            consult healthcare professionals for medical decisions.
          </p>
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-coral-500/10 border border-coral-500/20 rounded-2xl text-coral-400 font-heading font-700 text-sm hover:bg-coral-500/20 transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </motion.div>
      </div>
    </div>
  );
}
