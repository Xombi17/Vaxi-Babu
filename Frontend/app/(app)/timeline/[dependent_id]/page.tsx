'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Syringe, Stethoscope, Pill, Volume2, Calendar, CheckCircle2, User, MapPin, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getTimeline, getDependents, type HealthEvent, type Dependent } from '@/lib/api';

// Map API status to UI display
const statusMap: Record<string, 'red' | 'yellow' | 'blue' | 'green'> = {
  overdue: 'red',
  due: 'yellow',
  upcoming: 'blue',
  completed: 'green',
};

// Map category to icon
const iconMap = {
  vaccination: Syringe,
  checkup: Stethoscope,
  vitamin: Pill,
  reminder: Calendar,
};

// Convert API event to UI event shape
function toUiEvent(event: HealthEvent, dependent: Dependent | undefined) {
  const Icon = iconMap[event.category] || Calendar;
  const color = statusMap[event.status] || 'blue';
  const dateStr = event.completed_at 
    ? `Completed: ${new Date(event.completed_at).toLocaleDateString('en-IN')}`
    : `Due: ${new Date(event.due_date).toLocaleDateString('en-IN')}`;
  const windowStr = event.window_start && event.window_end
    ? `${new Date(event.window_start).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - ${new Date(event.window_end).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`
    : '';

  return {
    id: event.id,
    title: event.name,
    category: event.category,
    date: dateStr,
    window: windowStr,
    status: event.status.toUpperCase(),
    icon: Icon,
    color,
  };
}

const statusStyles = {
  red: 'bg-red-100 dark:bg-red-900/50 text-red-500 dark:text-red-400 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.5),inset_-2px_-2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.2)]',
  yellow: 'bg-amber-100 dark:bg-amber-900/50 text-amber-500 dark:text-amber-400 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.5),inset_-2px_-2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.2)]',
  blue: 'bg-blue-100 dark:bg-blue-900/50 text-blue-500 dark:text-blue-400 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.5),inset_-2px_-2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.2)]',
  green: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-500 dark:text-emerald-400 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.5),inset_-2px_-2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.2)]',
};

const iconStyles = {
  red: 'bg-red-400 dark:bg-red-500 text-white shadow-[4px_4px_8px_rgba(248,113,113,0.3),inset_2px_2px_4px_rgba(255,255,255,0.5),inset_-2px_-2px_4px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.4)]',
  yellow: 'bg-amber-400 dark:bg-amber-500 text-white shadow-[4px_4px_8px_rgba(251,191,36,0.3),inset_2px_2px_4px_rgba(255,255,255,0.5),inset_-2px_-2px_4px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.4)]',
  blue: 'bg-blue-400 dark:bg-blue-500 text-white shadow-[4px_4px_8px_rgba(96,165,250,0.3),inset_2px_2px_4px_rgba(255,255,255,0.5),inset_-2px_-2px_4px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.4)]',
  green: 'bg-emerald-400 dark:bg-emerald-500 text-white shadow-[4px_4px_8px_rgba(52,211,153,0.3),inset_2px_2px_4px_rgba(255,255,255,0.5),inset_-2px_-2px_4px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.4)]',
};

export default function TimelinePage() {
  const params = useParams();
  const dependentId = params.dependent_id as string;
  const [events, setEvents] = useState<ReturnType<typeof toUiEvent>[]>([]);
  const [dependent, setDependent] = useState<Dependent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  useEffect(() => {
    async function loadTimeline() {
      try {
        // Fetch dependent info and timeline
        const deps = await getDependents();
        const dep = deps.find(d => d.id === dependentId);
        if (dep) {
          setDependent(dep);
        }
        const healthEvents = await getTimeline(dependentId);
        setEvents(healthEvents.events.map((e) => toUiEvent(e, dep)));
      } catch (err) {
        setError('Unable to load timeline');
        console.error('Failed to load timeline:', err);
      } finally {
        setLoading(false);
      }
    }
    if (dependentId) {
      loadTimeline();
    }
  }, [dependentId]);

  // Calculate age for display
  function getAgeText(dob: string) {
    const birth = new Date(dob);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    if (years === 0) {
      return `${months} months old`;
    }
    return `${years} year${years > 1 ? 's' : ''} old`;
  }

  if (loading) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
        <div className="flex items-center gap-6 mb-8 bg-[#f3f6fd] dark:bg-slate-800 rounded-[2.5rem] p-6">
          <div className="w-24 h-24 rounded-[1.5rem] bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div>
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg mb-2 animate-pulse" />
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      {error ? (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl p-6 font-bold">
          {error}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-6 mb-8 bg-[#f3f6fd] dark:bg-slate-800 rounded-[2.5rem] p-6 shadow-[10px_10px_20px_rgba(0,0,0,0.05),-10px_-10px_20px_rgba(255,255,255,0.8)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(255,255,255,0.05)]">
            <div className="w-24 h-24 rounded-[1.5rem] bg-white dark:bg-slate-700 p-1 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)] overflow-hidden relative">
              <Image 
                src={`https://picsum.photos/seed/${dependentId}/100/100`} 
                alt={dependent?.name || 'Dependent'} 
                fill
                className="object-cover rounded-xl" 
              />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight mb-1">{dependent?.name || 'Dependent'}</h1>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-lg flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-black px-3 py-1 rounded-lg uppercase tracking-wider">{dependent?.type || 'Child'}</span>
                {dependent?.date_of_birth ? getAgeText(dependent.date_of_birth) : ''}
              </p>
            </div>
          </div>

          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-8 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-blue-400 before:to-emerald-400 before:rounded-full before:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] dark:before:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)]">
            {events.length === 0 && (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400 font-bold">
                No health events found
              </div>
            )}
            {events.map((event) => {
              const Icon = event.icon;
              const isExpanded = selectedEvent === event.id;

              return (
                <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full border-4 border-[#f3f6fd] dark:border-slate-900 bg-white dark:bg-slate-800 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(0,0,0,0.5)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconStyles[event.color as keyof typeof iconStyles]}`}>
                      <Icon size={20} strokeWidth={3} />
                    </div>
                  </div>

                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4">
                    <motion.div 
                      layout
                      onClick={() => setSelectedEvent(isExpanded ? null : event.id)}
                      className="bg-[#f3f6fd] dark:bg-slate-800 rounded-[2rem] p-6 shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(255,255,255,0.05)] hover:shadow-[10px_10px_20px_rgba(0,0,0,0.05),-10px_-10px_20px_rgba(255,255,255,0.8),inset_4px_4px_10px_rgba(255,255,255,0.9),inset_-4px_-4px_10px_rgba(0,0,0,0.02)] dark:hover:shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(255,255,255,0.05),inset_4px_4px_10px_rgba(255,255,255,0.1),inset_-4px_-4px_10px_rgba(0,0,0,0.5)] transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] font-black tracking-wider px-3 py-1.5 rounded-xl uppercase ${statusStyles[event.color as keyof typeof statusStyles]}`}>
                          {event.status}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">{event.title}</h3>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                          <Calendar size={16} className="text-blue-400" />
                          <span>{event.date}</span>
                        </div>
                        {event.window && (
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                            <Clock size={16} className="text-blue-400" />
                            <span>Window: {event.window}</span>
                          </div>
                        )}
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden pt-4 border-t border-white/50 dark:border-slate-700/50 space-y-3"
                          >
                            <button className="w-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl py-3 font-black text-sm flex items-center justify-center gap-2 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_4px_rgba(0,0,0,0.02)] dark:shadow-[inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.2)] hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                              <Sparkles size={18} /> Explain this Event
                            </button>
                            
                            {event.status !== 'COMPLETED' && (
                              <button className="w-full bg-emerald-400 dark:bg-emerald-500 text-white rounded-xl py-3 font-black text-sm flex items-center justify-center gap-2 shadow-[4px_4px_8px_rgba(52,211,153,0.3),inset_2px_2px_4px_rgba(255,255,255,0.5),inset_-2px_-2px_4px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all">
                                <CheckCircle2 size={18} strokeWidth={3} /> Mark as Done
                              </button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function Clock(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
