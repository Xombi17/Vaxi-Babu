'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useHousehold, useDependents, useAllTimelines, useMedicines, useReminders, useSchemes } from '../lib/hooks';
import { StatSkeleton, CardSkeleton } from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import {
  CalendarClock, AlertTriangle, CheckCircle2, Clock, ChevronRight,
  Pill, Heart, Baby, Bell, MapPin, Sparkles, ArrowUpRight
} from 'lucide-react';

export default function DashboardPage() {
  const { data: household } = useHousehold();
  const { data: dependents, isLoading: depsLoading, error: depsError, refetch: refetchDeps } = useDependents();
  const { data: allEvents, isLoading: eventsLoading } = useAllTimelines();
  const { data: medicines } = useMedicines();
  const { data: reminders } = useReminders();
  const { data: schemes } = useSchemes();

  if (depsError) return <div className="p-8"><ErrorState message="Failed to load family data" onRetry={() => refetchDeps()} /></div>;

  const deps = Array.isArray(dependents) ? dependents : [];
  const events = Array.isArray(allEvents) ? allEvents : [];
  const meds = Array.isArray(medicines) ? medicines : [];
  const rems = Array.isArray(reminders) ? reminders : [];
  const validSchemes = Array.isArray(schemes) ? schemes : [];

  const overdueCount = events.filter((e: any) => e.status === 'overdue').length;
  const dueCount = events.filter((e: any) => e.status === 'due').length;
  const completedCount = events.filter((e: any) => e.status === 'completed').length;
  const urgentEvents = events.filter((e: any) => e.status === 'overdue' || e.status === 'due').slice(0, 5);
  const activeMeds = meds.filter((m: any) => m.active).length;
  const pendingReminders = rems.filter((r: any) => !r.done).length;

  const statusColor = (s: string) => {
    if (s === 'overdue') return 'text-coral-400 bg-coral-500/10 border-coral-500/20';
    if (s === 'due') return 'text-warm-400 bg-warm-500/10 border-warm-500/20';
    if (s === 'completed') return 'text-teal-400 bg-teal-500/10 border-teal-500/20';
    return 'text-navy-300 bg-navy-500/10 border-navy-500/20';
  };

  const anim = (i: number) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

  const firstName = deps[0]?.name?.split(' ')[0] ?? '...';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <motion.div {...anim(0)} className="mb-8">
        <h1 className="font-heading font-800 text-2xl sm:text-3xl text-white mb-1">Welcome, {firstName} 👋</h1>
        <p className="text-white/35">{household?.family_name ?? ''} Family Dashboard · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </motion.div>

      {depsLoading || eventsLoading ? <StatSkeleton /> : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Overdue', value: overdueCount, icon: AlertTriangle, color: 'coral', link: '/timeline' },
            { label: 'Due Soon', value: dueCount, icon: Clock, color: 'warm', link: '/timeline' },
            { label: 'Completed', value: completedCount, icon: CheckCircle2, color: 'teal', link: '/timeline' },
            { label: 'Reminders', value: pendingReminders, icon: Bell, color: 'navy', link: '/reminders' },
          ].map((s, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Link href={s.link} className={`block p-4 sm:p-5 rounded-2xl bg-${s.color}-500/[0.06] border border-${s.color}-500/15 hover:border-${s.color}-500/30 transition-all group`}>
                <div className="flex items-center justify-between mb-3">
                  <s.icon size={18} className={`text-${s.color}-400`} />
                  <ArrowUpRight size={14} className="text-white/10 group-hover:text-white/30 transition-colors" />
                </div>
                <p className={`font-heading font-800 text-2xl text-${s.color}-400`}>{s.value}</p>
                <p className="text-xs text-white/30 mt-0.5">{s.label}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Family Members */}
        <motion.div {...anim(5)} className="lg:col-span-1">
          <div className="bg-surface-800/40 border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-700 text-sm text-white">Family Members</h2>
              <Link href="/dependents" className="text-xs text-teal-400 hover:text-teal-300">Manage</Link>
            </div>
            {depsLoading ? <CardSkeleton count={2} /> : (
              <div className="space-y-3">
                {deps.map((d: any) => (
                  <Link key={d.id} href={`/timeline/${d.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group">
                    <div className="text-2xl">{d.avatar ?? '👤'}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{d.name}</p>
                      <p className="text-xs text-white/30 capitalize">{d.relation}{d.pregnancy_week ? ` · ${d.pregnancy_week}w pregnant` : ''}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Timeline Feed */}
        <motion.div {...anim(6)} className="lg:col-span-2">
          <div className="bg-surface-800/40 border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-700 text-sm text-white">Urgent Health Actions</h2>
              <Link href="/timeline" className="text-xs text-teal-400 hover:text-teal-300">View All</Link>
            </div>
            {eventsLoading ? <CardSkeleton count={3} /> : urgentEvents.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 size={32} className="text-teal-500/30 mx-auto mb-2" />
                <p className="text-sm text-white/30">All caught up! No urgent actions.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {urgentEvents.map((e: any) => (
                  <Link key={e.id} href={`/timeline/${e.dep_id}`} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${statusColor(e.status).split(' ').slice(1).join(' ')}`}>
                      {e.category === 'vaccine' && <CalendarClock size={14} className={statusColor(e.status).split(' ')[0]} />}
                      {e.category === 'medicine' && <Pill size={14} className={statusColor(e.status).split(' ')[0]} />}
                      {e.category === 'checkup' && <Heart size={14} className={statusColor(e.status).split(' ')[0]} />}
                      {e.category === 'growth' && <Baby size={14} className={statusColor(e.status).split(' ')[0]} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white truncate">{e.title}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusColor(e.status)}`}>{e.status}</span>
                      </div>
                      <p className="text-xs text-white/30 mt-0.5">{e.dep_name} · {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <ChevronRight size={14} className="text-white/10 group-hover:text-white/30 mt-1 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <motion.div {...anim(7)} className="bg-surface-800/40 border border-white/[0.06] rounded-2xl p-5">
          <h2 className="font-heading font-700 text-sm text-white mb-4">Activity Summary</h2>
          <div className="space-y-3">
            {[
              { label: 'Vaccines Completed', val: events.filter((e: any) => e.category === 'vaccine' && e.status === 'completed').length, total: events.filter((e: any) => e.category === 'vaccine').length, color: 'teal' },
              { label: 'Active Medicines', val: activeMeds, total: meds.length, color: 'navy' },
              { label: 'Reminders Done', val: rems.filter((r: any) => r.done).length, total: rems.length, color: 'warm' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-white/40">{item.label}</span>
                  <span className="text-white/60">{item.val}/{item.total}</span>
                </div>
                <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                  <div className={`h-full bg-${item.color}-500 rounded-full transition-all`} style={{ width: `${item.total ? (item.val / item.total) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div {...anim(8)} className="bg-surface-800/40 border border-white/[0.06] rounded-2xl p-5">
          <h2 className="font-heading font-700 text-sm text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Medicines', icon: Pill, path: '/medicines', color: 'teal' },
              { label: 'Nearby Care', icon: MapPin, path: '/care', color: 'coral' },
              { label: 'Growth', icon: Baby, path: '/growth', color: 'sage' },
              { label: 'Pregnancy', icon: Heart, path: '/pregnancy', color: 'warm' },
            ].map((q, i) => (
              <Link key={i} href={q.path} className={`flex flex-col items-center gap-2 p-3 rounded-xl bg-${q.color}-500/[0.06] border border-${q.color}-500/10 hover:border-${q.color}-500/25 transition-all`}>
                <q.icon size={18} className={`text-${q.color}-400`} />
                <span className="text-xs text-white/50">{q.label}</span>
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div {...anim(9)} className="bg-surface-800/40 border border-white/[0.06] rounded-2xl p-5">
          <h2 className="font-heading font-700 text-sm text-white mb-4">Eligible Schemes</h2>
          <div className="space-y-2.5">
            {validSchemes.slice(0, 4).map((s: any, i: number) => (
              <div key={i} className="flex items-start gap-2.5">
                <Sparkles size={14} className="text-warm-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-white">{s.name}</p>
                  <p className="text-[11px] text-white/30">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
