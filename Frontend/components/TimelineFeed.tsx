'use client';
import { Calendar, User, Syringe, Stethoscope, Pill, Volume2, CheckCircle2, Clock, MoreVertical, Circle } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getTimeline, HealthEvent } from '../lib/api';

const DEFAULT_DEPENDENT_ID = 'ece5d2ee-ea49-47cd-8e47-7448d0ea2b25'; // Rahul

const categoryIcons = {
  vaccination: Syringe,
  checkup: Stethoscope,
  vitamin: Pill,
  reminder: Calendar,
};

const statusColors = {
  completed: 'emerald',
  due: 'amber',
  overdue: 'red',
  upcoming: 'blue',
};

const statusStyles = {
  red: 'bg-red-100 dark:bg-red-900/50 text-red-500 dark:text-red-400 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.5),inset_-2px_-2px_4px_rgba(0,0,0,0.05)]',
  amber: 'bg-amber-100 dark:bg-amber-900/50 text-amber-500 dark:text-amber-400 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.5),inset_-2px_-2px_4px_rgba(0,0,0,0.05)]',
  emerald: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-500 dark:text-emerald-400 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.5),inset_-2px_-2px_4px_rgba(0,0,0,0.05)]',
  blue: 'bg-blue-100 dark:bg-blue-900/50 text-blue-500 dark:text-blue-400 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.5),inset_-2px_-2px_4px_rgba(0,0,0,0.05)]',
};

const iconStyles = {
  red: 'bg-red-400 dark:bg-red-500 text-white shadow-[4px_4px_8px_rgba(248,113,113,0.3)]',
  amber: 'bg-amber-400 dark:bg-amber-500 text-white shadow-[4px_4px_8px_rgba(251,191,36,0.3)]',
  emerald: 'bg-emerald-400 dark:bg-emerald-500 text-white shadow-[4px_4px_8px_rgba(52,211,153,0.3)]',
  blue: 'bg-blue-400 dark:bg-blue-500 text-white shadow-[4px_4px_8px_rgba(59,130,246,0.3)]',
};

export function TimelineFeed() {
  const searchParams = useSearchParams();
  const dependentId = searchParams.get('dependent') || DEFAULT_DEPENDENT_ID;
  const [events, setEvents] = useState<HealthEvent[]>([]);
  const [dependentName, setDependentName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getTimeline(dependentId);
        setEvents(data.events);
        setDependentName(data.dependent_name);
      } catch (error) {
        console.error('Failed to load timeline:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [dependentId]);

  if (loading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Health Timeline</h2>
        </div>
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[#f3f6fd] dark:bg-slate-800 rounded-[2rem] p-6 animate-pulse h-32" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          {dependentName ? `${dependentName}'s Timeline` : 'Health Timeline'}
        </h2>
        <Link href="/timeline" className="text-blue-500 dark:text-blue-400 font-black text-sm hover:text-blue-600 dark:hover:text-blue-300 transition-colors">View All</Link>
      </div>

      <div className="space-y-5">
        {events.length === 0 ? (
          <div className="bg-[#f3f6fd] dark:bg-slate-800 rounded-[2.5rem] p-10 text-center shadow-inner">
            <p className="text-slate-400 font-bold">No health events found for this member.</p>
          </div>
        ) : (
          events.map((event, index) => {
            const Icon = categoryIcons[event.category] || Calendar;
            const colorKey = statusColors[event.status] as keyof typeof statusStyles;
            
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={event.id}
                className="bg-[#f3f6fd] dark:bg-slate-800 rounded-[2rem] p-6 shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(255,255,255,0.05)] flex flex-col sm:flex-row sm:items-center gap-6 hover:-translate-y-1 hover:shadow-[10px_10px_20px_rgba(0,0,0,0.05),-10px_-10px_20px_rgba(255,255,255,0.8),inset_4px_4px_10px_rgba(255,255,255,0.9),inset_-4px_-4px_10px_rgba(0,0,0,0.02)] dark:hover:shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(255,255,255,0.05),inset_4px_4px_10px_rgba(255,255,255,0.1),inset_-4px_-4px_10px_rgba(0,0,0,0.5)] transition-all"
              >
                <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center shrink-0 ${iconStyles[colorKey]}`}>
                  <Icon size={32} strokeWidth={3} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-black text-slate-800 dark:text-white truncate">
                      {event.name}
                      {event.dose_number && <span className="ml-2 text-[10px] bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-lg">Dose {event.dose_number}</span>}
                    </h3>
                    <span className={`text-[10px] font-black tracking-wider px-3 py-1.5 rounded-xl uppercase ${statusStyles[colorKey]}`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-5 text-sm font-bold text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 bg-white dark:bg-slate-700 px-3 py-1.5 rounded-xl shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)]">
                      <User size={16} className="text-blue-400"/> {dependentName}
                    </span>
                    <span className="flex items-center gap-1.5 leading-none">
                      <Calendar size={16} className="text-blue-400"/> 
                      {new Date(event.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <button className="w-full sm:w-auto mt-4 sm:mt-0 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 rounded-2xl py-4 px-8 font-black flex items-center justify-center gap-2 transition-all shadow-[4px_4px_8px_rgba(0,0,0,0.05),inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_4px_rgba(0,0,0,0.02)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.4)] active:translate-y-0.5 active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)] dark:active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4)]">
                  <Volume2 size={20} strokeWidth={3} />
                  <span>Listen</span>
                </button>
              </motion.div>
            );
          })
        )}
      </div>
    </section>
  );
}
