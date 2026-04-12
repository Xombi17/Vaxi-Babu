'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Pill, Plus, Calendar, Clock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getMedicineRegimens, getDependents, deactivateMedicineRegimen, type MedicineRegimen, type Dependent } from '@/lib/api';
import { getStoredHouseholdId } from '@/hooks/use-household';

export default function MedicinesPage() {
  const router = useRouter();
  const [regimens, setRegimens] = useState<MedicineRegimen[]>([]);
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDependent, setSelectedDependent] = useState<string>('all');
  const householdId = getStoredHouseholdId();

  useEffect(() => {
    async function loadData() {
      try {
        const deps = await getDependents(householdId || undefined);
        setDependents(deps);

        if (deps.length > 0) {
          // Load regimens for all dependents
          const allRegimens = await Promise.all(
            deps.map(dep => getMedicineRegimens(dep.id))
          );
          setRegimens(allRegimens.flat());
        }
      } catch (err) {
        console.error('Failed to load medicines:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [householdId]);

  const filteredRegimens = selectedDependent === 'all'
    ? regimens
    : regimens.filter(r => r.dependent_id === selectedDependent);

  const activeRegimens = filteredRegimens.filter(r => r.active);

  const frequencyLabels: Record<string, string> = {
    daily: 'Once daily',
    twice_daily: 'Twice daily',
    three_daily: 'Three times daily',
    weekly: 'Weekly',
    as_needed: 'As needed',
  };

  const handleDeactivate = async (regimenId: string) => {
    if (!confirm('Stop this medicine regimen?')) return;
    try {
      await deactivateMedicineRegimen(regimenId);
      setRegimens(regimens.filter(r => r.id !== regimenId));
    } catch (err) {
      console.error('Failed to deactivate regimen:', err);
      alert('Failed to stop medicine. Please try again.');
    }
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

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-2">Medicine Regimens</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">Track daily medicines and adherence</p>
        </div>
        <button
          onClick={() => router.push('/medicines/add')}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-2xl px-6 py-3 font-bold flex items-center gap-2 transition-all shadow-lg"
        >
          <Plus size={20} strokeWidth={3} />
          Add Medicine
        </button>
      </div>

      {/* Dependent Filter */}
      {dependents.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedDependent('all')}
            className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
              selectedDependent === 'all'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Members
          </button>
          {dependents.map(dep => (
            <button
              key={dep.id}
              onClick={() => setSelectedDependent(dep.id)}
              className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                selectedDependent === dep.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {dep.name}
            </button>
          ))}
        </div>
      )}

      {/* Regimen List */}
      <div className="space-y-4">
        {activeRegimens.length === 0 ? (
          <div className="bg-[#f3f6fd] dark:bg-slate-800 rounded-[2.5rem] p-12 text-center">
            <Pill className="mx-auto mb-4 text-slate-400" size={48} strokeWidth={2} />
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">No Active Medicines</h3>
            <p className="text-slate-500 dark:text-slate-400 font-bold mb-6">Add a medicine regimen to start tracking adherence</p>
            <button
              onClick={() => router.push('/medicines/add')}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-2xl px-6 py-3 font-bold inline-flex items-center gap-2 transition-all"
            >
              <Plus size={20} strokeWidth={3} />
              Add First Medicine
            </button>
          </div>
        ) : (
          activeRegimens.map((regimen, index) => {
            const dependent = dependents.find(d => d.id === regimen.dependent_id);
            const isOngoing = !regimen.end_date;
            const safetyColor = regimen.safety_bucket === 'consult_doctor_urgently' ? 'red' :
                               regimen.safety_bucket === 'use_with_caution' ? 'amber' : 'emerald';

            return (
              <motion.div
                key={regimen.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#f3f6fd] dark:bg-slate-800 rounded-[2rem] p-6 shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(255,255,255,0.05)]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-purple-400 dark:bg-purple-500 text-white`}>
                      <Pill size={24} strokeWidth={3} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1">{regimen.medicine_name}</h3>
                      <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">{regimen.dosage}</p>
                      {dependent && (
                        <p className="text-slate-400 dark:text-slate-500 font-bold text-xs mt-1">For {dependent.name}</p>
                      )}
                    </div>
                  </div>
                  {regimen.safety_bucket && (
                    <span className={`text-xs font-black px-3 py-1.5 rounded-xl uppercase ${
                      safetyColor === 'red' ? 'bg-red-100 dark:bg-red-900/50 text-red-500 dark:text-red-400' :
                      safetyColor === 'amber' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-500 dark:text-amber-400' :
                      'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-500 dark:text-emerald-400'
                    }`}>
                      {safetyColor === 'emerald' ? 'Safe' : 'Caution'}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                    <Clock size={16} className="text-blue-400" />
                    {frequencyLabels[regimen.frequency] || regimen.frequency}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                    <Calendar size={16} className="text-blue-400" />
                    {isOngoing ? 'Ongoing' : `Until ${new Date(regimen.end_date!).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`}
                  </div>
                </div>

                {regimen.prescribing_note && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 mb-4">
                    <p className="text-blue-800 dark:text-blue-200 text-sm font-bold">{regimen.prescribing_note}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeactivate(regimen.id)}
                    className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl py-2 font-bold text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                  >
                    Stop Medicine
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
