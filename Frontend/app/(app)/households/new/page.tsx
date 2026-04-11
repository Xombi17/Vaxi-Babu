'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, MapPin, Globe, ArrowRight } from 'lucide-react';

export default function CreateHouseholdPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mock API call
    setTimeout(() => {
      router.push('/dependents/new');
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-2">Create Household</h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">Set up your family unit to get started.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#f3f6fd] dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-[10px_10px_20px_rgba(0,0,0,0.05),-10px_-10px_20px_rgba(255,255,255,0.8),inset_4px_4px_10px_rgba(255,255,255,0.9),inset_-4px_-4px_10px_rgba(0,0,0,0.02)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(255,255,255,0.05),inset_4px_4px_10px_rgba(255,255,255,0.1),inset_-4px_-4px_10px_rgba(0,0,0,0.5)] space-y-6">
        
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-black ml-2">
            <Users size={20} className="text-blue-500 dark:text-blue-400" /> Household Name *
          </label>
          <input 
            required
            type="text" 
            placeholder="e.g. Sharma Family" 
            className="w-full bg-white dark:bg-slate-700 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] focus:shadow-[inset_4px_4px_8px_rgba(96,165,250,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:focus:shadow-[inset_4px_4px_8px_rgba(96,165,250,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-black ml-2">
            <Globe size={20} className="text-blue-500 dark:text-blue-400" /> Primary Language *
          </label>
          <div className="relative">
            <select required className="w-full appearance-none bg-white dark:bg-slate-700 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold outline-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] focus:shadow-[inset_4px_4px_8px_rgba(96,165,250,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:focus:shadow-[inset_4px_4px_8px_rgba(96,165,250,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] transition-all">
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500">
              ▼
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-black ml-2">
            <MapPin size={20} className="text-blue-500 dark:text-blue-400" /> Location Details
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Village / Town" 
              className="w-full bg-white dark:bg-slate-700 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] focus:shadow-[inset_4px_4px_8px_rgba(96,165,250,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:focus:shadow-[inset_4px_4px_8px_rgba(96,165,250,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] transition-all"
            />
            <input 
              type="text" 
              placeholder="District" 
              className="w-full bg-white dark:bg-slate-700 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] focus:shadow-[inset_4px_4px_8px_rgba(96,165,250,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:focus:shadow-[inset_4px_4px_8px_rgba(96,165,250,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] transition-all"
            />
            <input 
              type="text" 
              placeholder="State" 
              className="w-full md:col-span-2 bg-white dark:bg-slate-700 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] focus:shadow-[inset_4px_4px_8px_rgba(96,165,250,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:focus:shadow-[inset_4px_4px_8px_rgba(96,165,250,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] transition-all"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full mt-8 bg-blue-400 dark:bg-blue-500 text-white rounded-2xl py-5 font-black text-lg flex items-center justify-center gap-3 transition-all shadow-[6px_6px_12px_rgba(96,165,250,0.3),inset_2px_2px_6px_rgba(255,255,255,0.5),inset_-2px_-2px_6px_rgba(0,0,0,0.1)] dark:shadow-[6px_6px_12px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.1),inset_-2px_-2px_6px_rgba(0,0,0,0.4)] hover:-translate-y-1 active:translate-y-0.5 active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1)] dark:active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4)] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Continue to Add Members'}
          {!isSubmitting && <ArrowRight size={24} strokeWidth={3} />}
        </button>
      </form>
    </div>
  );
}
