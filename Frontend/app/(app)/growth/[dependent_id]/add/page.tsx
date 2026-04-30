'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TrendingUp, Calendar, Ruler, Weight, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { createGrowthRecord } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

export default function AddGrowthRecordPage() {
  const { householdId } = useAuthStore();
  const params = useParams();
  const router = useRouter();
  const dependentId = params.dependent_id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [recordedDate, setRecordedDate] = useState(new Date().toISOString().split('T')[0]);
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [headCircumferenceCm, setHeadCircumferenceCm] = useState('');
  const [milestoneAchieved, setMilestoneAchieved] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await createGrowthRecord(dependentId, {
        recorded_date: recordedDate,
        household_id: householdId || '',
        weight_kg: weightKg ? parseFloat(weightKg) : undefined,
        height_cm: heightCm ? parseFloat(heightCm) : undefined,
        head_circumference_cm: headCircumferenceCm ? parseFloat(headCircumferenceCm) : undefined,
        milestone_achieved: milestoneAchieved || undefined,
        notes: notes || undefined,
      });

      router.push(`/growth/${dependentId}`);
      router.refresh();
    } catch (err: any) {
      console.error('Failed to create growth record:', err);
      setError(err.message || 'Failed to add growth record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-2">Add Growth Record</h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">Record new measurements</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 text-rose-700 dark:text-rose-400 font-bold rounded-r-2xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#f3f6fd] dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-[10px_10px_20px_rgba(0,0,0,0.05),-10px_-10px_20px_rgba(255,255,255,0.8)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(255,255,255,0.05)] space-y-6">

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-black ml-2">
            <Calendar size={20} className="text-blue-500 dark:text-blue-400" /> Measurement Date *
          </label>
          <input
            required
            type="date"
            value={recordedDate}
            onChange={(e) => setRecordedDate(e.target.value)}
            className="w-full bg-white dark:bg-slate-700 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold outline-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3)] transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-black ml-2">
              <Weight size={20} className="text-blue-500 dark:text-blue-400" /> Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="e.g. 12.5"
              className="w-full bg-white dark:bg-slate-700 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold placeholder:text-slate-400 outline-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3)] transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-black ml-2">
              <Ruler size={20} className="text-blue-500 dark:text-blue-400" /> Height (cm)
            </label>
            <input
              type="number"
              step="0.1"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="e.g. 85.5"
              className="w-full bg-white dark:bg-slate-700 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold placeholder:text-slate-400 outline-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3)] transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-black ml-2">
            <Ruler size={20} className="text-blue-500 dark:text-blue-400" /> Head Circumference (cm)
          </label>
          <input
            type="number"
            step="0.1"
            value={headCircumferenceCm}
            onChange={(e) => setHeadCircumferenceCm(e.target.value)}
            placeholder="e.g. 45.0 (for infants 0-2 years)"
            className="w-full bg-white dark:bg-slate-700 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold placeholder:text-slate-400 outline-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3)] transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-black ml-2">
            <TrendingUp size={20} className="text-blue-500 dark:text-blue-400" /> Milestone Achieved (Optional)
          </label>
          <input
            type="text"
            value={milestoneAchieved}
            onChange={(e) => setMilestoneAchieved(e.target.value)}
            placeholder="e.g. First steps, First words"
            className="w-full bg-white dark:bg-slate-700 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold placeholder:text-slate-400 outline-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3)] transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-black ml-2">
            <FileText size={20} className="text-blue-500 dark:text-blue-400" /> Notes (Optional)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any observations..."
            className="w-full bg-white dark:bg-slate-700 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold placeholder:text-slate-400 outline-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3)] transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-8 bg-blue-400 dark:bg-blue-500 text-white rounded-2xl py-5 font-black text-lg flex items-center justify-center gap-3 transition-all shadow-[6px_6px_12px_rgba(96,165,250,0.3)] hover:-translate-y-1 active:translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : 'Save Record'}
          {!isSubmitting && <ArrowRight size={24} strokeWidth={3} />}
        </button>
      </form>
    </div>
  );
}
