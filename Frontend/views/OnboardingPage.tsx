"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  MapPin, 
  Users, 
  ChevronRight, 
  ArrowLeft, 
  CheckCircle2,
  Baby,
  Heart,
  Globe,
  Loader2,
  ShieldCheck
} from "lucide-react";
import { useAuthStore, type Language } from "@/lib/auth-store";
import { authApi, createDependent, getHousehold, Household } from "@/lib/api";
import { useUpdateHousehold } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";

const languages: Language[] = ["English", "Hindi", "Marathi", "Gujarati", "Bengali", "Tamil", "Telugu"];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [household, setHousehold] = useState<Household | null>(null);
  
  // Form State
  const [familyName, setFamilyName] = useState("");
  const [prefLanguage, setPrefLanguage] = useState<Language>("English");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  
  // Dependent State
  const [depName, setDepName] = useState("");
  const [depType, setDepType] = useState<'child' | 'adult' | 'elder' | 'pregnant'>('child');
  const [depDob, setDepDob] = useState("");
  const [depSex, setDepSex] = useState<'male' | 'female' | 'other'>('male');

  const { householdId, setLanguage } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const updateMutation = useUpdateHousehold();

  useEffect(() => {
    async function loadData() {
      if (!householdId) {
        router.push("/login");
        return;
      }
      try {
        const data = await getHousehold(householdId);
        
        // If already onboarded, redirect away
        if (data.last_onboarded_at) {
          router.replace("/dashboard");
          return;
        }

        setHousehold(data);
        setFamilyName(data.name || "");
        setPrefLanguage(data.primary_language as Language || "English");
        setCity(data.village_town || "");
        setState(data.state || "");
      } catch (err) {
        console.error("Failed to load household", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [householdId, router]);

  const handleCompleteStep1 = () => setStep(2);
  const handleCompleteStep2 = () => setStep(3);
  
  const handleFinalSubmit = async () => {
    if (!householdId) return;
    setSubmitting(true);
    try {
      // 1. Update Household
      await updateMutation.mutateAsync({
        name: familyName,
        primary_language: prefLanguage,
        village_town: city,
        state: state,
        last_onboarded_at: new Date().toISOString()
      });
      
      // Invalidate the query manually just in case the hook's onSuccess is delayed
      await queryClient.invalidateQueries({ queryKey: ['household', householdId] });
      
      // 2. Add first dependent if name is provided
      if (depName && depDob) {
        await createDependent({
          household_id: householdId,
          name: depName,
          type: depType,
          date_of_birth: depDob,
          sex: depSex
        });
      }
      
      setLanguage(prefLanguage);
      setStep(4); // Success step
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Onboarding failed", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050A0F] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050A0F] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        layout
        className="w-full max-w-2xl bg-white/[0.03] border border-white/[0.08] rounded-[32px] overflow-hidden backdrop-blur-xl shadow-2xl relative z-10"
      >
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-white/[0.05] flex">
          {[1, 2, 3].map((s) => (
            <div 
              key={s}
              className={`flex-1 transition-all duration-700 ${s <= step ? "bg-teal-500" : ""}`}
            />
          ))}
        </div>

        <div className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center md:text-left">
                  <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-400 mb-6 mx-auto md:mx-0">
                    <Users size={32} />
                  </div>
                  <h1 className="text-3xl font-heading font-800 mb-3">Welcome to WellSync Vaxi</h1>
                  <p className="text-white/40">First, let's set up your family profile.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-white/30 mb-3 block uppercase tracking-widest">Family Name</label>
                    <input 
                      type="text" 
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                      placeholder="e.g. Sharma Family"
                      className="w-full px-6 py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl focus:border-teal-500/50 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-white/30 mb-3 block uppercase tracking-widest">Primary Language</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {languages.map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setPrefLanguage(lang)}
                          className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                            prefLanguage === lang 
                              ? "bg-teal-500 text-black border-teal-500 shadow-lg shadow-teal-500/20" 
                              : "bg-white/[0.02] text-white/40 border-white/[0.05] hover:border-white/20"
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleCompleteStep1}
                  disabled={!familyName}
                  className="w-full py-5 bg-teal-500 hover:bg-teal-400 text-black font-heading font-800 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                >
                  Continue to Location <ChevronRight size={20} />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-white/30 hover:text-white transition-colors">
                  <ArrowLeft size={16} /> Back
                </button>

                <div className="text-center md:text-left">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6 mx-auto md:mx-0">
                    <MapPin size={32} />
                  </div>
                  <h1 className="text-3xl font-heading font-800 mb-3">Where are you from?</h1>
                  <p className="text-white/40">This helps us provide regional health schemes and local guidance.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-white/30 mb-3 block uppercase tracking-widest">State</label>
                    <input 
                      type="text" 
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Maharashtra"
                      className="w-full px-6 py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl focus:border-blue-500/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/30 mb-3 block uppercase tracking-widest">City / Village</label>
                    <input 
                      type="text" 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mumbai"
                      className="w-full px-6 py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl focus:border-blue-500/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleCompleteStep2}
                  disabled={!state || !city}
                  className="w-full py-5 bg-teal-500 hover:bg-teal-400 text-black font-heading font-800 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                >
                  Almost there <ChevronRight size={20} />
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <button onClick={() => setStep(2)} className="flex items-center gap-2 text-white/30 hover:text-white transition-colors">
                  <ArrowLeft size={16} /> Back
                </button>

                <div className="text-center md:text-left">
                  <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 mb-6 mx-auto md:mx-0">
                    <Baby size={32} />
                  </div>
                  <h1 className="text-3xl font-heading font-800 mb-3">Add family member</h1>
                  <p className="text-white/40">Start by adding your first child or dependent to track their health.</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-white/30 mb-2 block uppercase tracking-widest">Name</label>
                      <input 
                        type="text" 
                        value={depName}
                        onChange={(e) => setDepName(e.target.value)}
                        placeholder="e.g. Aarav"
                        className="w-full px-6 py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl focus:border-purple-500/50 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-white/30 mb-2 block uppercase tracking-widest">Type</label>
                      <select 
                        value={depType}
                        onChange={(e) => setDepType(e.target.value as any)}
                        className="w-full px-6 py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl focus:border-purple-500/50 outline-none transition-all appearance-none"
                      >
                        <option value="child" className="bg-[#0A121A]">Child</option>
                        <option value="pregnant" className="bg-[#0A121A]">Pregnant Mother</option>
                        <option value="elder" className="bg-[#0A121A]">Elder</option>
                        <option value="adult" className="bg-[#0A121A]">Adult</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-white/30 mb-2 block uppercase tracking-widest">Date of Birth</label>
                      <input 
                        type="date" 
                        value={depDob}
                        onChange={(e) => setDepDob(e.target.value)}
                        className="w-full px-6 py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl focus:border-purple-500/50 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-white/30 mb-2 block uppercase tracking-widest">Sex</label>
                      <div className="flex gap-2">
                        {['male', 'female'].map((s) => (
                          <button
                            key={s}
                            onClick={() => setDepSex(s as any)}
                            className={`flex-1 py-4 rounded-2xl font-bold capitalize border transition-all ${
                              depSex === s 
                                ? "bg-purple-500/10 text-purple-400 border-purple-500/30" 
                                : "bg-white/[0.02] text-white/30 border-white/[0.05]"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleFinalSubmit}
                  disabled={submitting}
                  className="w-full py-5 bg-teal-500 hover:bg-teal-400 text-black font-heading font-800 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>Creating Account <Loader2 className="animate-spin" /></>
                  ) : (
                    <>Complete Setup <Sparkles size={20} /></>
                  )}
                </button>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8 py-12"
              >
                <div className="w-24 h-24 bg-teal-500/10 rounded-full flex items-center justify-center text-teal-500 mx-auto">
                  <CheckCircle2 size={48} />
                </div>
                <div>
                  <h1 className="text-4xl font-heading font-800 mb-4">You're all set!</h1>
                  <p className="text-white/40 text-lg">Taking you to your dashboard...</p>
                </div>
                <div className="flex items-center justify-center gap-3 text-white/20">
                  <Heart className="animate-pulse text-teal-500" size={16} />
                  <span className="text-sm font-medium tracking-[0.2em] uppercase">Vaxi Babu Premium</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Footer Info */}
      <div className="mt-12 flex items-center gap-8 text-white/10 uppercase tracking-[0.2em] text-[10px] font-bold">
        <div className="flex items-center gap-2">
          <Globe size={14} /> Global Standards
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} /> Data Private
        </div>
      </div>
    </div>
  );
}
