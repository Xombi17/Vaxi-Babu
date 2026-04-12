'use client';
import { useQuery } from '@tanstack/react-query';
import { Activity, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { getTimeline, getDependents, type HealthEvent } from '../lib/api';
import { getStoredHouseholdId } from '../hooks/use-household';

export function ActivitySummary() {
  const searchParams = useSearchParams();
  const householdId = getStoredHouseholdId();

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
      <section className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-8 animate-pulse h-[400px]" />
    );
  }

  return (
    <section className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-8">Health Summary</h2>

      <div className="space-y-8">
        <div className="flex items-center gap-5">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${stats.overdue > 0 ? 'bg-rose-400 dark:bg-rose-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
            <AlertCircle size={32} strokeWidth={3} />
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-800 dark:text-white leading-none mb-1">{stats.overdue}</p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase">Action Required</p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-xl bg-amber-400 dark:bg-amber-500 text-white flex items-center justify-center">
            <Clock size={32} strokeWidth={3} />
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-800 dark:text-white leading-none mb-1">{stats.upcoming}</p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase">Upcoming Soon</p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-xl bg-emerald-400 dark:bg-emerald-500 text-white flex items-center justify-center">
            <CheckCircle2 size={32} strokeWidth={3} />
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-800 dark:text-white leading-none mb-1">{stats.completed}</p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase">Completed</p>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-8 border-t border-slate-200/50 dark:border-slate-700/50">
        <div className="bg-white dark:bg-slate-700 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-blue-500 dark:text-blue-400" size={24} strokeWidth={3} />
            <h3 className="font-bold text-slate-800 dark:text-white">Health Adherence</h3>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-6 mb-4 p-1">
            <div 
              className="bg-blue-400 dark:bg-blue-500 h-full rounded-full transition-all duration-700" 
              style={{ width: `${stats.adherence}%` }}
            />
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-white text-right">
            {stats.adherence}% <span className="text-blue-500 dark:text-blue-400">{stats.adherence >= 80 ? 'Excellent' : stats.adherence >= 50 ? 'On Track' : 'Needs Focus'}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
