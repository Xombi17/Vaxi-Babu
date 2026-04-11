'use client';
import { Bell, CheckCircle2, Clock, Volume2 } from 'lucide-react';

const reminders = [
  { id: '1', title: 'Give Aarav Paracetamol', time: 'Today, 2:00 PM', status: 'pending', person: 'Aarav' },
  { id: '2', title: 'Call Dr. Gupta for appointment', time: 'Tomorrow, 10:00 AM', status: 'pending', person: 'Mother' },
  { id: '3', title: 'Buy Vitamin D drops', time: 'Yesterday', status: 'completed', person: 'Aarav' },
];

export default function RemindersPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-[1.5rem] bg-blue-400 dark:bg-blue-500 text-white flex items-center justify-center shadow-[4px_4px_10px_rgba(96,165,250,0.4),inset_2px_2px_6px_rgba(255,255,255,0.6),inset_-2px_-2px_6px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.1),inset_-2px_-2px_6px_rgba(0,0,0,0.4)]">
          <Bell size={32} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-1">Reminders</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">Don&apos;t miss important health tasks.</p>
        </div>
      </div>

      <div className="space-y-6">
        {reminders.map((reminder) => (
          <div 
            key={reminder.id}
            className={`bg-[#f3f6fd] dark:bg-slate-800 rounded-[2.5rem] p-6 shadow-[10px_10px_20px_rgba(0,0,0,0.05),-10px_-10px_20px_rgba(255,255,255,0.8)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(255,255,255,0.05)] flex flex-col sm:flex-row sm:items-center gap-6 transition-all ${reminder.status === 'completed' ? 'opacity-60' : ''}`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className={`text-xl font-black ${reminder.status === 'completed' ? 'text-slate-500 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-white'}`}>
                  {reminder.title}
                </h3>
              </div>
              <div className="flex items-center gap-4 text-sm font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 bg-white dark:bg-slate-700 px-3 py-1.5 rounded-xl shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3)]">
                  {reminder.person}
                </span>
                <span className="flex items-center gap-1.5 text-blue-500 dark:text-blue-400">
                  <Clock size={16} /> {reminder.time}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4 sm:mt-0">
              {reminder.status !== 'completed' && (
                <>
                  <button className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 flex items-center justify-center shadow-[4px_4px_8px_rgba(0,0,0,0.05),inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_4px_rgba(0,0,0,0.02)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.4)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05)] dark:active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4)] transition-all">
                    <Volume2 size={24} strokeWidth={2.5} />
                  </button>
                  <button className="w-14 h-14 rounded-2xl bg-emerald-400 dark:bg-emerald-500 text-white flex items-center justify-center shadow-[4px_4px_8px_rgba(52,211,153,0.3),inset_2px_2px_4px_rgba(255,255,255,0.5),inset_-2px_-2px_4px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all">
                    <CheckCircle2 size={24} strokeWidth={3} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
