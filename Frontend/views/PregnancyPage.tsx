'use client';
import { motion } from 'framer-motion';
import { usePregnancy } from '../lib/hooks';
import { PageSkeleton } from '../components/LoadingSkeleton';
import { Heart, AlertTriangle, Calendar, Baby, Clock, Stethoscope } from 'lucide-react';

export default function PregnancyPage() {
  const { data: pregnancy, isLoading } = usePregnancy();

  if (isLoading) return <PageSkeleton />;

  if (!pregnancy) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <h1 className="font-heading font-800 text-2xl text-white mb-4">Pregnancy Care</h1>
        <div className="text-center py-20">
          <Heart size={48} className="text-white/10 mx-auto mb-3" />
          <p className="text-white/30 mb-2">No pregnancy records found.</p>
          <p className="text-xs text-white/20">Pregnancy tracking will appear here when a family member&apos;s pregnancy is registered.</p>
        </div>
      </div>
    );
  }

  const week = pregnancy.pregnancy_week || 0;
  const trimester = pregnancy.trimester || 1;
  const progress = (week / 40) * 100;
  const daysLeft = Math.max(0, (40 - week) * 7);
  const eddDate = pregnancy.expected_due_date ? new Date(pregnancy.expected_due_date) : null;
  const milestones = (pregnancy as any).milestones || [];
  const riskFlags = typeof pregnancy.high_risk_flags === 'string' 
    ? pregnancy.high_risk_flags.split(',').map(f => f.trim()).filter(Boolean)
    : (pregnancy.high_risk_flags as any) || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading font-800 text-2xl text-white mb-1">Pregnancy Care</h1>
        <p className="text-sm text-white/35 mb-8">Tracking pregnancy journey</p>
      </motion.div>

      {/* Progress Dashboard */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-surface-800/40 border border-white/[0.06] rounded-2xl p-6 mb-6">
        <div className="grid sm:grid-cols-4 gap-6 mb-6">
          {[
            { label: 'Current Week', value: `Week ${week}`, icon: Calendar, color: 'teal' },
            { label: 'Trimester', value: `${trimester}${trimester === 1 ? 'st' : trimester === 2 ? 'nd' : 'rd'}`, icon: Heart, color: 'coral' },
            { label: 'Days to EDD', value: `${daysLeft} days`, icon: Clock, color: 'warm' },
            { label: 'EDD', value: eddDate ? eddDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A', icon: Baby, color: 'sage' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <s.icon size={20} className={`text-${s.color}-400 mx-auto mb-2`} />
              <p className="font-heading font-800 text-xl text-white">{s.value}</p>
              <p className="text-xs text-white/30">{s.label}</p>
            </div>
          ))}
        </div>
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-white/30">Pregnancy Progress</span>
            <span className="text-teal-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-white/[0.04] rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, delay: 0.3 }} className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full" />
          </div>
          <div className="flex justify-between text-[10px] text-white/20 mt-1">
            <span>Week 1</span><span>Week 13</span><span>Week 28</span><span>Week 40</span>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Risk Monitoring */}
        {riskFlags.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-coral-500/[0.06] border border-coral-500/15 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-coral-400" />
              <h2 className="font-heading font-700 text-sm text-coral-400">High Risk Flags</h2>
            </div>
            <div className="space-y-3">
              {riskFlags.map((flag: string, i: number) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-coral-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-white/70">{flag}</p>
                  </div>
                </div>
              ))}
              <div className="mt-3 p-3 bg-surface-900/60 rounded-xl flex items-start gap-2">
                <Stethoscope size={14} className="text-warm-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-white/40">Please consult your doctor about these flags at your next visit.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Milestones */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-surface-800/40 border border-white/[0.06] rounded-2xl p-5">
          <h2 className="font-heading font-700 text-sm text-white mb-4">Pregnancy Milestones</h2>
          <div className="space-y-3">
            {milestones.map((m: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${m.done ? 'bg-teal-500/15' : m.week === week || m.week === week + 1 ? 'bg-warm-500/15' : 'bg-white/[0.04]'}`}>
                  <span className={`text-[10px] font-heading font-700 ${m.done ? 'text-teal-400' : m.week === week || m.week === week + 1 ? 'text-warm-400' : 'text-white/20'}`}>{m.week}</span>
                </div>
                <p className={`text-sm ${m.done ? 'text-white/60' : 'text-white/30'}`}>{m.label}</p>
                {m.done && <span className="text-teal-400 ml-auto">✓</span>}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
