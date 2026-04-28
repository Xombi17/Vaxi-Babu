"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  ChevronRight,
  Mail,
  Lock,
  UserPlus,
  ArrowLeft,
  Loader2,
  Github,
  Users,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { authApi, toLanguageCode } from "@/lib/api";
import VoiceWaveform from "@/components/VoiceWaveform";

type Tab = "login" | "signup" | "demo";

const demoUsers = [
  { id: "sharma", name: "Sharma Family", location: "Noida, UP", focus: "Pediatric", color: "from-teal-500 to-emerald-500" },
  { id: "patel", name: "Patel Family", location: "Ahmedabad, GJ", focus: "Maternal", color: "from-blue-500 to-indigo-500" },
  { id: "kumar", name: "Kumar Family", location: "Patna, BR", focus: "General", color: "from-purple-500 to-pink-500" },
  { id: "singh", name: "Singh Family", location: "Amritsar, PB", focus: "Pediatric", color: "from-orange-500 to-red-500" },
  { id: "verma", name: "Verma Family", location: "Indore, MP", focus: "General", color: "from-cyan-500 to-blue-500" },
];

const languages = [
  "Hindi",
  "Marathi",
  "Gujarati",
  "Bengali",
  "Tamil",
  "Telugu",
  "English",
] as const;

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [language, setLanguage] = useState("Hindi");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const {
    loginWithToken,
    setLanguage: setStoreLang,
  } = useAuthStore();
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const normalizedUsername = email.trim();

      if (tab === "signup") {
        await authApi.signup({
          name: familyName.trim(),
          username: normalizedUsername,
          password,
          primary_language: toLanguageCode(language),
        });
      }

      const res = await authApi.login(normalizedUsername, password);
      loginWithToken(res.access_token, res.household_id, res.household_id);

      if (tab === "signup") {
        setStoreLang(toLanguageCode(language) as any);
      }

      router.push("/dashboard");
    } catch (err: any) {
      const msg =
        err?.message ??
        err?.response?.data?.detail ??
        "Authentication failed. Please check your credentials.";
      setError(typeof msg === "string" ? msg : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    try {
      setLoading(true);
      await authApi.signInWithGithub();
    } catch (err: any) {
      setError(err.message || "GitHub login failed");
      setLoading(false);
    }
  };

  const handleDemoLogin = async (username: string) => {
    setError("");
    setDemoLoading(username);
    try {
      // Default demo password from seed_dev.py
      const demoPassword = "Vaxi Babu_demo_secure_2026";
      const res = await authApi.login(username, demoPassword);
      loginWithToken(res.access_token, res.household_id, res.household_id);
      router.push("/dashboard");
    } catch (err: any) {
      setError(`Demo login failed for ${username}. Ensure demo users are seeded.`);
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050A0F] flex flex-col lg:flex-row overflow-hidden">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-[#0A121A]">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-navy-900/20" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-500/[0.08] rounded-full blur-[100px]" />
        <div className="absolute top-1/2 -right-48 w-96 h-96 bg-blue-500/[0.08] rounded-full blur-[100px]" />
        
        <div className="relative z-10 flex flex-col justify-center px-16 w-full">
          <Link href="/" className="flex items-center gap-3 mb-16 group">
            <div className="w-12 h-12 bg-gradient-to-tr from-teal-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform duration-300">
              <Image
                src="/images/logo-icon.png"
                alt="Vaxi Babu logo"
                width={32}
                height={32}
                className="w-8 h-8 brightness-0 invert"
              />
            </div>
            <span className="font-heading font-800 text-3xl text-white tracking-tight">
              WellSync<span className="text-teal-400">Vaxi</span>
            </span>
          </Link>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="font-heading font-800 text-5xl text-white leading-[1.1] mb-6">
                The health memory <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">
                  for every family
                </span>
              </h1>
              <p className="text-white/40 text-lg leading-relaxed max-w-md">
                Voice-first preventive healthcare that helps your family remember, understand, and act on health tasks.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 mt-12">
              {[
                { icon: ShieldCheck, text: "Secure health record keeping", sub: "Fully encrypted & private" },
                { icon: Zap, text: "Deterministic health schedules", sub: "Based on medical guidelines" },
                { icon: Mic, text: "Local language voice support", sub: "Hindi, Marathi & 5 more" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <p className="text-white/80 font-medium text-sm">{item.text}</p>
                    <p className="text-white/30 text-xs">{item.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="mt-16 flex items-center gap-4">
            <VoiceWaveform bars={8} size="md" color="bg-teal-500/50" />
            <span className="text-xs font-medium text-white/20 tracking-widest uppercase">
              AI Voice Assistant Ready
            </span>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth */}
      <div className="flex-1 relative flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500/50 via-blue-500/50 to-teal-500/50 opacity-20" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="lg:hidden flex items-center justify-between mb-12">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                <Image src="/images/logo-icon.png" alt="Vaxi Babu" width={20} height={20} className="brightness-0 invert" />
              </div>
              <span className="font-heading font-800 text-white text-xl">WellSync Vaxi</span>
            </Link>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="font-heading font-800 text-3xl text-white mb-2">
              {tab === "login" ? "Welcome back" : tab === "signup" ? "Get started" : "Demo Access"}
            </h2>
            <p className="text-white/40">
              {tab === "login" 
                ? "Sign in to manage your family's health" 
                : tab === "signup" 
                ? "Create a health profile for your household"
                : "Explore the platform with preset demo families"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex p-1 bg-white/[0.03] border border-white/[0.08] rounded-2xl mb-8">
            {[
              { key: "login" as Tab, label: "Sign In", icon: Mail },
              { key: "signup" as Tab, label: "Sign Up", icon: UserPlus },
              { key: "demo" as Tab, label: "Demo", icon: Sparkles },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setTab(t.key);
                  setError("");
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  tab === t.key 
                    ? "bg-teal-500 text-black shadow-lg shadow-teal-500/20" 
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.02]"
                }`}
              >
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 shrink-0 mt-0.5">
                  <span className="text-xs font-bold">!</span>
                </div>
                <p className="text-sm text-red-400 font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {tab === "demo" ? (
              <motion.div
                key="demo"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                {demoUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleDemoLogin(user.id)}
                    disabled={demoLoading !== null}
                    className="w-full group relative flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-teal-500/30 hover:bg-white/[0.05] transition-all duration-300"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${user.color} p-0.5`}>
                      <div className="w-full h-full rounded-[10px] bg-[#050A0F] flex items-center justify-center">
                        <Users size={20} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white font-bold">{user.name}</p>
                      <p className="text-white/30 text-xs flex items-center gap-2">
                        <span>{user.location}</span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span className="text-teal-500/70">{user.focus}</span>
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {demoLoading === user.id ? (
                        <Loader2 size={18} className="animate-spin text-teal-400" />
                      ) : (
                        <ChevronRight size={18} className="text-white/20" />
                      )}
                    </div>
                  </button>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="auth"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <form onSubmit={handleAuth} className="space-y-4">
                  {tab === "signup" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="text-xs font-bold text-white/30 mb-2 block uppercase tracking-wider">
                          Family Name
                        </label>
                        <input
                          type="text"
                          value={familyName}
                          onChange={(e) => setFamilyName(e.target.value)}
                          placeholder="e.g. Sharma"
                          required
                          className="w-full px-5 py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-teal-500/40 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-white/30 mb-2 block uppercase tracking-wider">
                          Preferred Language
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {languages.map((l) => (
                            <button
                              key={l}
                              type="button"
                              onClick={() => setLanguage(l)}
                              className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                                language === l 
                                  ? "bg-teal-500/10 text-teal-400 border border-teal-500/30" 
                                  : "bg-white/[0.02] text-white/30 border border-white/[0.05] hover:text-white/60"
                              }`}
                            >
                              {l}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-white/30 mb-2 block uppercase tracking-wider">
                      Username or Email
                    </label>
                    <div className="relative group">
                      <Mail
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-teal-400 transition-colors"
                      />
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="sharma or family@example.com"
                        required
                        className="w-full pl-12 pr-5 py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-teal-500/40 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-white/30 mb-2 block uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative group">
                      <Lock
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-teal-400 transition-colors"
                      />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-12 pr-5 py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-teal-500/40 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-black font-heading font-800 rounded-2xl transition-all hover:shadow-lg hover:shadow-teal-500/20 disabled:opacity-60 flex items-center justify-center gap-2 mt-4"
                  >
                    {loading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      tab === "login" ? "Sign In" : "Create Family Account"
                    )}
                  </button>

                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/[0.06]"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-widest">
                      <span className="bg-[#050A0F] px-4 text-white/20 font-bold">Or continue with</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGithubLogin}
                    disabled={loading}
                    className="w-full py-4 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/20 text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-3"
                  >
                    <Github size={20} />
                    GitHub
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 text-center">
            <p className="text-white/20 text-xs">
              By continuing, you agree to our <span className="text-white/40 hover:text-teal-400 cursor-pointer transition-colors underline decoration-white/10 underline-offset-4">Terms of Service</span> and <span className="text-white/40 hover:text-teal-400 cursor-pointer transition-colors underline decoration-white/10 underline-offset-4">Privacy Policy</span>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
