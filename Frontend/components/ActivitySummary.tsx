'use client';
import { useQuery } from '@tanstack/react-query';
import { Activity, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { getTimeline, getDependents } from '../lib/api';

export function ActivitySummary() {
  const searchParams = useSearchParams();
  const householdId = typeof window !== 'undefined' ? localStorage.getItem('household_id') : null;

  const { data: timelineData, isLoading } = useQuery({
    queryKey: ['timeline', searchParams.get('dependent'), householdId],
    queryFn: async () => {
      let actualId = searchParams.get('dependent');
      if (!actualId) {
        const dependents = await getDependents(householdId || undefined);
        if (dependents.length > 0) {
          actualId = dependents[0].id;
        } else {
          return { events: [], dependent_name: '' };
        }
      }
      return getTimeline(actualId);
    },
    staleTime: 5 * 60 * 1000,
  });

  const events = timelineData?.events || [];
  
  const stats = {
    overdue: events.filter(e => e.status === 'overdue').length,
    upcoming: events.filter(e => e.status === 'due' || e.status === 'upcoming').length,
    completed: events.filter(e => e.status === 'completed').length,
    adherence: 0
  };
  
  const total = stats.overdue + stats.upcoming + stats.completed;
  stats.adherence = total > 0 ? Math.round((stats.completed / total) * 100) : 0;

  if (isLoading) {
    return (
      <section className="bg-[#f3f6fd] dark:bg-slate-800 rounded-[2.5rem] p-8 animate-pulse h-[400px]" />
    );
  }

  return (
    <section className="bg-[#f3f6fd] dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-[10px_10px_20px_rgba(0,0,0,0.05),-10px_-10px_20px_rgba(255,255,255,0.8),inset_4px_4px_10px_rgba(255,255,255,0.9),inset_-4px_-4px_10px_rgba(0,0,0,0.02)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(255,255,255,0.05),inset_4px_4px_10px_rgba(255,255,255,0.1),inset_-4px_-4px_10px_rgba(0,0,0,0.5)]">
      <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-8 tracking-tight">Health Summary</h2>

      <div className="space-y-8">
        <div className="flex items-center gap-5">
          <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center shadow-lg ${stats.overdue > 0 ? 'bg-rose-400 dark:bg-rose-500 text-white shadow-rose-200 dark:shadow-rose-900/30' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
            <AlertCircle size={32} strokeWidth={3} />
          </div>
          <div>
            <p className="text-3xl font-black text-slate-800 dark:text-white leading-none mb-1">{stats.overdue}</p>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action Required</p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-[1.25rem] bg-amber-400 dark:bg-amber-500 text-white flex items-center justify-center shadow-[4px_4px_8px_rgba(251,191,36,0.3),inset_2px_2px_4px_rgba(255,255,255,0.5),inset_-2px_-2px_4px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.4)]">
            <Clock size={32} strokeWidth={3} />
          </div>
          <div>
            <p className="text-3xl font-black text-slate-800 dark:text-white leading-none mb-1">{stats.upcoming}</p>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Upcoming Soon</p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-[1.25rem] bg-emerald-400 dark:bg-emerald-500 text-white flex items-center justify-center shadow-[4px_4px_8px_rgba(52,211,153,0.3),inset_2px_2px_4px_rgba(255,255,255,0.5),inset_-2px_-2px_4px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.4)]">
            <CheckCircle2 size={32} strokeWidth={3} />
          </div>
          <div>
            <p className="text-3xl font-black text-slate-800 dark:text-white leading-none mb-1">{stats.completed}</p>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Completed</p>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-8 border-t border-white/50 dark:border-slate-700/50">
        <div className="bg-white dark:bg-slate-700 rounded-[2rem] p-6 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.02),inset_-4px_-4px_10px_rgba(255,255,255,0.8)] dark:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.2),inset_-4px_-4px_10px_rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-blue-500 dark:text-blue-400" size={24} strokeWidth={3} />
            <h3 className="font-black text-slate-800 dark:text-white">Health Adherence</h3>
          </div>
          <div className="w-full bg-[#f3f6fd] dark:bg-slate-800 rounded-full h-6 mb-4 shadow-[inset_2px_2px_6px_rgba(0,0,0,0.05),inset_-2px_-2px_6px_rgba(255,255,255,0.8)] dark:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.4),inset_-2px_-2px_6px_rgba(255,255,255,0.05)] p-1">
            <div 
              className="bg-blue-400 dark:bg-blue-500 h-full rounded-full relative shadow-[2px_2px_4px_rgba(96,165,250,0.4),inset_2px_2px_4px_rgba(255,255,255,0.5),inset_-2px_-2px_4px_rgba(0,0,0,0.1)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.3),inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.4)] transition-all duration-700" 
              style={{ width: `${stats.adherence}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full h-full rounded-full" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }}></div>
            </div>
          </div>
          <p className="text-sm font-black text-slate-800 dark:text-white text-right">
            {stats.adherence}% <span className="text-blue-500 dark:text-blue-400">{stats.adherence >= 80 ? 'Excellent' : stats.adherence >= 50 ? 'On Track' : 'Needs Focus'}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
