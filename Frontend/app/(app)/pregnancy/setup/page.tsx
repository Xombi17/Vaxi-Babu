'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Baby, Calendar, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { createPregnancy } from '@/lib/api';
import { getStoredHouseholdId } from '@/hooks/use-household';

export default function PregnancySetupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const householdId = getStoredHouseholdId();

  // Form State
  const [lmpDate, setLmpDate] = useState('');
  const [highRiskFlags, setHighRiskFlags] = useState('');

  const calculateDueDate = (lmp: string) => {
    if (!lmp) return '';
    const lmpDate = new Date(lmp);
    const dueDate = new Date(lmpDate);
    dueDate.setDate(dueDate.getDate() + 280); // 40 weeks
    return dueDate.toISOString().split('T')[0];
  };

  const expectedDueDate = calculateDueDate(lmpDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!householdId) {
        throw new Error('No household found. Please sign in again.');
      }

      await createPregnancy({
        household_id: householdId,
        lmp_date: lmpDate,
        high_risk_flags: highRiskFlags || undefined,
      });

      router.push('/pregnancy');
      router.refresh();
    } catch (err: any) {
      console.error('Failed to create pregnancy profile:', err);
      setError(err.message || 'Failed to start tracking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-2">Start Pregnancy Tracking</h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">Get personalized ANC visit reminders</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 text-rose-700 dark:text-rose-400 font-bold rounded-r-2xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#f3f6fd] dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-[10px_10px_20px_rgba(0,0,0,0.05),-10px_-10px_20px_rgba(255,255,255,0.8)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(255,255,255,0.05)] space-y-6">

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 flex items-start gap-4">
          <Baby className="text-blue-500 shrink-0 mt-1" size={24} />
          <div>
            <p className="text-blue-800 dark:text-blue-200 font-bold text-sm leading-relaxed">
              We&apos;ll calculate your due date and schedule ANC visits based on WHO guidelines. Your pregnancy week and trimester will be automatically tracked.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-black ml-2">
            <Calendar size={20} className="text-blue-500 dark:text-blue-400" /> Last Menstrual Period (LMP) *
          </label>
          <input
            required
            type="date"
            value={lmpDate}
            onChange={(e) => setLmpDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full bg-white dark:bg-slate-700 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold outline-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3)] transition-all"
          />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-bold ml-2 mt-2">
            First day of your last menstrual period
          </p>
        </div>

        {expectedDueDate && (
          <div className="bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl p-6 text-white">
            <p className="text-white/80 text-sm font-bold mb-2">Expected Due Date</p>
            <p className="text-3xl font-black">
              {new Date(expectedDueDate).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <p className="text-white/70 text-sm font-bold mt-2">
              Approximately 40 weeks from LMP
            </p>
          </div>
        )}

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-black ml-2">
            <AlertCircle size={20} className="text-blue-500 dark:text-blue-400" /> High Risk Factors (Optional)
          </label>
          <textarea
            rows={3}
            value={highRiskFlags}
            onChange={(e) => setHighRiskFlags(e.target.value)}
            placeholder="e.g. Diabetes, High blood pressure, Previous complications"
            className="w-full bg-white dark:bg-slate-700 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold placeholder:text-slate-400 outline-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3)] transition-all resize-none"
          />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-bold ml-2 mt-2">
            Any medical conditions or risk factors your doctor mentioned
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !lmpDate}
          className="w-full mt-8 bg-blue-400 dark:bg-blue-500 text-white rounded-2xl py-5 font-black text-lg flex items-center justify-center gap-3 transition-all shadow-[6px_6px_12px_rgba(96,165,250,0.3)] hover:-translate-y-1 active:translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : 'Start Tracking'}
          {!isSubmitting && <ArrowRight size={24} strokeWidth={3} />}
        </button>
      </form>
    </div>
  );
}
