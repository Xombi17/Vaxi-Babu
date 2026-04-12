'use client';
import { useQuery } from '@tanstack/react-query';
import { Calendar, User, Syringe, Stethoscope, Pill, Volume2, ShieldCheck, X, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { getTimeline, getDependents, type HealthEvent } from '../lib/api';
import { HealthPassCard } from './HealthPassCard';

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
  const [showPass, setShowPass] = useState(false);
  const householdId = typeof window !== 'undefined' ? localStorage.getItem('household_id') : null;
  const currentDependentId = searchParams.get('dependent');
  
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
  const dependentName = timelineData?.dependent_name || '';

  const speak = (event: HealthEvent) => {
    if (typeof window === 'undefined') return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();

    const lang = localStorage.getItem('primary_language') || 'en';
    const dateStr = new Date(event.due_date).toLocaleDateString(lang === 'en' ? 'en-IN' : lang === 'hi' ? 'hi-IN' : 'mr-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    
    // Multi-lingual structure
    let text = '';
    if (lang === 'hi') {
      text = `${event.name}. यह ${event.status === 'completed' ? 'पूरा हो गया है' : 'होने वाला है'} ${dateStr} को. ${event.notes || ''}`;
    } else if (lang === 'mr') {
      text = `${event.name}. हे ${event.status === 'completed' ? 'पूर्ण झाले आहे' : 'येणार आहे'} ${dateStr} ला. ${event.notes || ''}`;
    } else if (lang === 'gu') {
      text = `${event.name}. આ ${event.status === 'completed' ? 'પૂર્ણ થઈ ગયું છે' : 'બાકી છે'} ${dateStr} ના રોજ. ${event.notes || ''}`;
    } else if (lang === 'bn') {
      text = `${event.name}. এটি ${event.status === 'completed' ? 'সম্পন্ন হয়েছে' : 'বাকি আছে'} ${dateStr} তারিখে. ${event.notes || ''}`;
    } else if (lang === 'ta') {
      text = `${event.name}. இது ${event.status === 'completed' ? 'முடிந்தது' : 'வரப்போகிறது'} ${dateStr} அன்று. ${event.notes || ''}`;
    } else if (lang === 'te') {
      text = `${event.name}. ఇది ${event.status === 'completed' ? 'పూర్తయింది' : 'రాబోతోంది'} ${dateStr} నాడు. ${event.notes || ''}`;
    } else {
      text = `${event.name}. ${event.status === 'completed' ? 'Completed' : 'Due on'} ${dateStr}. ${event.notes || ''}`;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    // Find best voice for language
    let voice;
    if (lang === 'hi') {
      voice = voices.find(v => v.lang.startsWith('hi'));
    } else if (lang === 'mr') {
      voice = voices.find(v => v.lang.startsWith('mr'));
    } else if (lang === 'gu') {
      voice = voices.find(v => v.lang.startsWith('gu'));
    } else if (lang === 'bn') {
      voice = voices.find(v => v.lang.startsWith('bn'));
    } else if (lang === 'ta') {
      voice = voices.find(v => v.lang.startsWith('ta'));
    } else if (lang === 'te') {
      voice = voices.find(v => v.lang.startsWith('te'));
    } else {
      voice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) || 
              voices.find(v => v.lang.startsWith('en'));
    }
    
    if (voice) utterance.voice = voice;
    utterance.lang = lang === 'hi' ? 'hi-IN' : 
                     lang === 'mr' ? 'mr-IN' : 
                     lang === 'gu' ? 'gu-IN' :
                     lang === 'bn' ? 'bn-IN' :
                     lang === 'ta' ? 'ta-IN' : 
                     lang === 'te' ? 'te-IN' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    
    window.speechSynthesis.speak(utterance);
  };

  if (isLoading) {
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
    <section className="relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            {dependentName ? `${dependentName}'s Timeline` : 'Health Timeline'}
          </h2>
          {dependentName && (
            <button 
              onClick={() => setShowPass(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-xl shadow-lg transition-all active:scale-90 flex items-center gap-2 px-4 shadow-blue-500/20"
            >
              <Award size={18} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Health Pass</span>
            </button>
          )}
        </div>
        <Link href="/timeline" className="text-blue-500 dark:text-blue-400 font-black text-sm hover:text-blue-600 dark:hover:text-blue-300 transition-colors">View All</Link>
      </div>

      <AnimatePresence>
        {showPass && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl"
            >
              <button 
                onClick={() => setShowPass(false)}
                className="absolute -top-4 -right-4 z-[110] bg-white dark:bg-slate-800 p-4 rounded-[1.5rem] shadow-2xl text-slate-500 hover:text-rose-500 transition-all border border-slate-100 dark:border-slate-700 active:scale-90"
              >
                <X size={24} strokeWidth={3} />
              </button>
              <HealthPassCard dependentId={currentDependentId!} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

                <button 
                  onClick={() => speak(event)}
                  className="w-full sm:w-auto mt-4 sm:mt-0 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 rounded-2xl py-4 px-8 font-black flex items-center justify-center gap-2 transition-all shadow-[4px_4px_8px_rgba(0,0,0,0.05),inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_4px_rgba(0,0,0,0.02)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.4)] active:translate-y-0.5 active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)] dark:active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4)]"
                >
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
