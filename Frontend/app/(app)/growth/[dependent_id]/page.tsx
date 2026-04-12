'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TrendingUp, Calendar, Ruler, Weight, Plus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getGrowthRecords, getDependents, type GrowthRecord, type Dependent } from '@/lib/api';

export default function GrowthPage() {
  const params = useParams();
  const router = useRouter();
  const dependentId = params.dependent_id as string;
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [dependent, setDependent] = useState<Dependent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGrowth() {
      try {
        const deps = await getDependents();
        const dep = deps.find(d => d.id === dependentId);
        if (dep) {
          setDependent(dep);
        }

        const growthData = await getGrowthRecords(dependentId);
        setRecords(growthData.sort((a, b) =>
          new Date(b.recorded_date).getTime() - new Date(a.recorded_date).getTime()
        ));
      } catch (err) {
        console.error('Failed to load growth records:', err);
      } finally {
        setLoading(false);
      }
    }
    if (dependentId) {
      loadGrowth();
    }
  }, [dependentId]);

  const latestRecord = records[0];

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
          <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-2">
            {dependent?.name}&apos;s Growth
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">Track height, weight, and milestones</p>
        </div>
        <button
          onClick={() => router.push(`/growth/${dependentId}/add`)}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-2xl px-6 py-3 font-bold flex items-center gap-2 transition-all shadow-lg"
        >
          <Plus size={20} strokeWidth={3} />
          Add Record
        </button>
      </div>

      {/* Latest Measurements Card */}
      {latestRecord && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-teal-400 to-blue-500 rounded-[2.5rem] p-8 mb-6 text-white shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <TrendingUp size={32} strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-3xl font-black mb-1">Latest Measurements</h2>
              <p className="text-white/80 font-bold text-lg">
                {new Date(latestRecord.recorded_date).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {latestRecord.weight_kg && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Weight size={20} />
                  <p className="text-white/70 text-sm font-bold">Weight</p>
                </div>
                <p className="text-2xl font-black">{latestRecord.weight_kg} kg</p>
              </div>
            )}
            {latestRecord.height_cm && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Ruler size={20} />
                  <p className="text-white/70 text-sm font-bold">Height</p>
                </div>
                <p className="text-2xl font-black">{latestRecord.height_cm} cm</p>
              </div>
            )}
            {latestRecord.head_circumference_cm && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Ruler size={20} />
                  <p className="text-white/70 text-sm font-bold">Head Circ.</p>
                </div>
                <p className="text-2xl font-black">{latestRecord.head_circumference_cm} cm</p>
              </div>
            )}
          </div>

          {latestRecord.milestone_achieved && (
            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-white/70 text-sm font-bold mb-1">Latest Milestone</p>
              <p className="text-lg font-black">{latestRecord.milestone_achieved}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Growth History */}
      <div className="bg-[#f3f6fd] dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-[10px_10px_20px_rgba(0,0,0,0.05),-10px_-10px_20px_rgba(255,255,255,0.8)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(255,255,255,0.05)]">
        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-3">
          <Calendar size={24} className="text-blue-500" />
          Growth History
        </h3>

        {records.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="mx-auto mb-4 text-slate-400" size={48} strokeWidth={2} />
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">No Growth Records</h3>
            <p className="text-slate-500 dark:text-slate-400 font-bold mb-6">Start tracking growth measurements</p>
            <button
              onClick={() => router.push(`/growth/${dependentId}/add`)}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-2xl px-6 py-3 font-bold inline-flex items-center gap-2 transition-all"
            >
              <Plus size={20} strokeWidth={3} />
              Add First Record
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-700 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-400 dark:bg-teal-500 text-white flex items-center justify-center">
                      <TrendingUp size={20} strokeWidth={3} />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 dark:text-white">
                        {new Date(record.recorded_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  {record.weight_kg && (
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mb-1">Weight</p>
                      <p className="text-slate-800 dark:text-white font-black">{record.weight_kg} kg</p>
                    </div>
                  )}
                  {record.height_cm && (
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mb-1">Height</p>
                      <p className="text-slate-800 dark:text-white font-black">{record.height_cm} cm</p>
                    </div>
                  )}
                  {record.head_circumference_cm && (
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mb-1">Head</p>
                      <p className="text-slate-800 dark:text-white font-black">{record.head_circumference_cm} cm</p>
                    </div>
                  )}
                </div>

                {record.milestone_achieved && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 mb-2">
                    <p className="text-blue-800 dark:text-blue-200 text-sm font-bold">
                      Milestone: {record.milestone_achieved}
                    </p>
                  </div>
                )}

                {record.notes && (
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-bold">{record.notes}</p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
