'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Baby, Calendar, Heart, AlertCircle, Loader2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { getPregnancy, getTimeline, type PregnancyProfile, type HealthEvent } from '@/lib/api';
import { getStoredHouseholdId } from '@/hooks/use-household';

export default function PregnancyPage() {
  const router = useRouter();
  const [pregnancy, setPregnancy] = useState<PregnancyProfile | null>(null);
  const [prenatalEvents, setPrenatalEvents] = useState<HealthEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const householdId = getStoredHouseholdId();

  useEffect(() => {
    async function loadPregnancy() {
      try {
        if (!householdId) return;

        const profile = await getPregnancy(householdId);
        setPregnancy(profile);

        if (profile) {
          // Load prenatal events from timeline
          // Note: This assumes backend generates prenatal events for the household
          // In practice, you'd need a dependent_id for the pregnant mother
          // For MVP, we'll show the pregnancy profile without events
        }
      } catch (err) {
        console.error('Failed to load pregnancy:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPregnancy();
  }, [householdId]);

  const getTrimesterName = (trimester?: number) => {
    if (!trimester) return 'First Trimester';
    if (trimester === 1) return 'First Trimester';
    if (trimester === 2) return 'Second Trimester';
    return 'Third Trimester';
  };

  const getTrimesterColor = (trimester?: number) => {
    if (!trimester || trimester === 1) return 'blue';
    if (trimester === 2) return 'purple';
    return 'pink';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-500" size={48} />
        </div>
      </div>
    );
  }

  if (!pregnancy) {
    return (
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-2">Pregnancy Care</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">Track prenatal checkups and milestones</p>
        </div>

        <div className="bg-[#f3f6fd] dark:bg-slate-800 rounded-[2.5rem] p-12 text-center">
          <Baby className="mx-auto mb-4 text-slate-400" size={48} strokeWidth={2} />
          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">No Active Pregnancy</h3>
          <p className="text-slate-500 dark:text-slate-400 font-bold mb-6">Start tracking a pregnancy to get personalized ANC visit reminders</p>
          <button
            onClick={() => router.push('/pregnancy/setup')}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-2xl px-6 py-3 font-bold inline-flex items-center gap-2 transition-all"
          >
            <Plus size={20} strokeWidth={3} />
            Start Tracking
          </button>
        </div>
      </div>
    );
  }

  const trimesterColor = getTrimesterColor(pregnancy.trimester);
  const progressPercent = pregnancy.pregnancy_week ? Math.min((pregnancy.pregnancy_week / 40) * 100, 100) : 0;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-2">Pregnancy Care</h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">Track prenatal checkups and milestones</p>
      </div>

      {/* Pregnancy Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-pink-400 to-purple-500 rounded-[2.5rem] p-8 mb-6 text-white shadow-2xl"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Baby size={32} strokeWidth={3} />
          </div>
          <div>
            <h2 className="text-3xl font-black mb-1">Week {pregnancy.pregnancy_week || 0}</h2>
            <p className="text-white/80 font-bold text-lg">{getTrimesterName(pregnancy.trimester)}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/20 rounded-full h-4 mb-4 overflow-hidden">
          <div
            className="bg-white h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <p className="text-white/70 text-sm font-bold mb-1">Due Date</p>
            <p className="text-xl font-black">
              {new Date(pregnancy.expected_due_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <p className="text-white/70 text-sm font-bold mb-1">Days Until Due</p>
            <p className="text-xl font-black">{pregnancy.days_until_due || 0} days</p>
          </div>
        </div>

        {pregnancy.high_risk_flags && (
          <div className="mt-4 bg-amber-500/20 backdrop-blur-sm rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-sm mb-1">High Risk Flags</p>
              <p className="text-sm font-bold text-white/90">{pregnancy.high_risk_flags}</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* ANC Visit Timeline */}
      <div className="bg-[#f3f6fd] dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-[10px_10px_20px_rgba(0,0,0,0.05),-10px_-10px_20px_rgba(255,255,255,0.8)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(255,255,255,0.05)]">
        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-3">
          <Calendar size={24} className="text-blue-500" />
          ANC Visit Schedule
        </h3>

        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 text-center">
            <Heart className="mx-auto mb-3 text-blue-500" size={32} />
            <p className="text-slate-700 dark:text-slate-300 font-bold">
              Prenatal checkup events will appear on your timeline once the backend schedule is generated.
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold mt-2">
              Check the Timeline page for upcoming ANC visits
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
