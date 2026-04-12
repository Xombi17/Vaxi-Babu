'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Pill, Calendar, Clock, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { createMedicineRegimen, getDependents, type Dependent, type FrequencyType } from '@/lib/api';
import { getStoredHouseholdId } from '@/hooks/use-household';

export default function AddMedicinePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const householdId = getStoredHouseholdId();

  // Form State
  const [dependentId, setDependentId] = useState('');
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState<FrequencyType>('daily');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [prescribingNote, setPrescribingNote] = useState('');

  useEffect(() => {
    async function loadDependents() {
      try {
        const deps = await getDependents(householdId || undefined);
        setDependents(deps);
        if (deps.length > 0) {
          setDependentId(deps[0].id);
        }
      } catch (err) {
        console.error('Failed to load dependents:', err);
      }
    }
    loadDependents();
  }, [householdId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!householdId) {
        throw new Error('No household found. Please sign in again.');
      }

      await createMedicineRegimen({
        dependent_id: dependentId,
        household_id: householdId,
        medicine_name: medicineName,
        dosage,
        frequency,
        start_date: startDate,
        end_date: endDate || undefined,
        prescribing_note: prescribingNote || undefined,
      });

      router.push('/medicines');
      router.refresh();
    } catch (err: any) {
      console.error('Failed to create medicine regimen:', err);
      setError(err.message || 'Failed to add medicine. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-2">Add Medicine</h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">Track a new medicine regimen</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 text-rose-700 dark:text-rose-400 font-bold rounded-r-2xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#f3f6fd] dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-[10px_10px_20px_rgba(0,0,0,0.05),-10px_-10px_20px_rgba(255,255,255,0.8)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(255,255,255,0.05)] space-y-6">

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-black ml-2">
            <Pill size={20} className="text-blue-500 dark:text-blue-400" /> For Family Member *
          </label>
          <div className="relative">
            <select
              required
              value={dependentId}
              onChange={(e) => setDependentId(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-slate-700 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold outline-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3)] transition-all"
            >
              {dependents.map(dep => (
                <option key={dep.id} value={dep.id}>{dep.name}</option>
              ))}
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-black ml-2">
            <Pill size={20} className="text-blue-500 dark:text-blue-400" /> Medicine Name *
          </label>
          <input
            required
            type="text"
            value={medicineName}
            onChange={(e) => setMedicineName(e.target.value)}
            placeholder="e.g. Paracetamol"
            className="w-full bg-white dark:bg-slate-700 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold placeholder:text-slate-400 outline-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3)] transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-black ml-2">
            <Pill size={20} className="text-blue-500 dark:text-blue-400" /> Dosage *
          </label>
          <input
            required
            type="text"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            placeholder="e.g. 500mg or 1 tablet"
            className="w-full bg-white dark:bg-slate-700 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold placeholder:text-slate-400 outline-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3)] transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-black ml-2">
            <Clock size={20} className="text-blue-500 dark:text-blue-400" /> Frequency *
          </label>
          <div className="relative">
            <select
              required
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as FrequencyType)}
              className="w-full appearance-none bg-white dark:bg-slate-700 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold outline-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3)] transition-all"
            >
              <option value="daily">Once daily</option>
              <option value="twice_daily">Twice daily</option>
              <option value="three_daily">Three times daily</option>
              <option value="weekly">Weekly</option>
              <option value="as_needed">As needed</option>
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-black ml-2">
              <Calendar size={20} className="text-blue-500 dark:text-blue-400" /> Start Date *
            </label>
            <input
              required
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-white dark:bg-slate-700 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold outline-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3)] transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-black ml-2">
              <Calendar size={20} className="text-blue-500 dark:text-blue-400" /> End Date (Optional)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-white dark:bg-slate-700 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold outline-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3)] transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-black ml-2">
            <FileText size={20} className="text-blue-500 dark:text-blue-400" /> Doctor&apos;s Note (Optional)
          </label>
          <textarea
            rows={3}
            value={prescribingNote}
            onChange={(e) => setPrescribingNote(e.target.value)}
            placeholder="Any special instructions..."
            className="w-full bg-white dark:bg-slate-700 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold placeholder:text-slate-400 outline-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3)] transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-8 bg-blue-400 dark:bg-blue-500 text-white rounded-2xl py-5 font-black text-lg flex items-center justify-center gap-3 transition-all shadow-[6px_6px_12px_rgba(96,165,250,0.3)] hover:-translate-y-1 active:translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : 'Save Medicine'}
          {!isSubmitting && <ArrowRight size={24} strokeWidth={3} />}
        </button>
      </form>
    </div>
  );
}
