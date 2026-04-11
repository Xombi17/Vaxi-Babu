'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Calendar, FileText, ArrowRight, Activity, Loader2 } from 'lucide-react';
import { createDependent } from '@/lib/api';

export default function AddDependentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('child');
  const [sex, setSex] = useState('female');
  const [dob, setDob] = useState('');
  const [edd, setEdd] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const householdId = localStorage.getItem('household_id');
      if (!householdId) {
        throw new Error('No household found. Please sign in again.');
      }

      const payload = {
        household_id: householdId,
        name,
        type: type as any,
        sex: sex as any,
        date_of_birth: type === 'pregnant' ? new Date().toISOString().split('T')[0] : dob,
        expected_delivery_date: type === 'pregnant' ? edd || undefined : undefined,
        notes: notes || undefined
      };

      await createDependent(payload);
      
      // Force refresh data in components
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error('Failed to create dependent:', err);
      setError(err.message || 'Failed to add member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-2">Add Family Member</h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">Add a dependent to track their health timeline.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 text-rose-700 dark:text-rose-400 font-bold rounded-r-2xl animate-in shake duration-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#f3f6fd] dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-[10px_10px_20px_rgba(0,0,0,0.05),-10px_-10px_20px_rgba(255,255,255,0.8),inset_4px_4px_10px_rgba(255,255,255,0.9),inset_-4px_-4px_10px_rgba(0,0,0,0.02)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(255,255,255,0.05),inset_4px_4px_10px_rgba(255,255,255,0.1),inset_-4px_-4px_10px_rgba(0,0,0,0.5)] space-y-6">
        
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-black ml-2">
            <User size={20} className="text-blue-500 dark:text-blue-400" /> Full Name *
          </label>
          <input 
            required
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Aarav Sharma" 
            className="w-full bg-white dark:bg-slate-700 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] focus:shadow-[inset_4px_4px_8px_rgba(96,165,250,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:focus:shadow-[inset_4px_4px_8px_rgba(96,165,250,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-black ml-2">
              <Activity size={20} className="text-blue-500 dark:text-blue-400" /> Member Type *
            </label>
            <div className="relative">
              <select 
                required 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-slate-700 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold outline-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] focus:shadow-[inset_4px_4px_8px_rgba(96,165,250,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:focus:shadow-[inset_4px_4px_8px_rgba(96,165,250,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] transition-all"
              >
                <option value="child">Child</option>
                <option value="adult">Adult</option>
                <option value="elder">Elder</option>
                <option value="pregnant">Pregnant Mother</option>
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500">▼</div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-black ml-2">
              <User size={20} className="text-blue-500 dark:text-blue-400" /> Sex *
            </label>
            <div className="relative">
              <select 
                required 
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-slate-700 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold outline-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] focus:shadow-[inset_4px_4px_8px_rgba(96,165,250,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:focus:shadow-[inset_4px_4px_8px_rgba(96,165,250,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] transition-all"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500">▼</div>
            </div>
          </div>
        </div>

        {type !== 'pregnant' && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-black ml-2">
              <Calendar size={20} className="text-blue-500 dark:text-blue-400" /> Date of Birth *
            </label>
            <input 
              required
              type="date" 
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full bg-white dark:bg-slate-700 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold outline-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] focus:shadow-[inset_4px_4px_8px_rgba(96,165,250,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:focus:shadow-[inset_4px_4px_8px_rgba(96,165,250,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] transition-all"
            />
          </div>
        )}

        {type === 'pregnant' && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-black ml-2">
              <Calendar size={20} className="text-blue-500 dark:text-blue-400" /> Expected Delivery Date *
            </label>
            <input 
              required
              type="date" 
              value={edd}
              onChange={(e) => setEdd(e.target.value)}
              className="w-full bg-white dark:bg-slate-700 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold outline-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] focus:shadow-[inset_4px_4px_8px_rgba(96,165,250,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:focus:shadow-[inset_4px_4px_8px_rgba(96,165,250,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] transition-all"
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-black ml-2">
            <FileText size={20} className="text-blue-500 dark:text-blue-400" /> Medical Notes (Optional)
          </label>
          <textarea 
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any allergies or existing conditions..." 
            className="w-full bg-white dark:bg-slate-700 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] focus:shadow-[inset_4px_4px_8px_rgba(96,165,250,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:focus:shadow-[inset_4px_4px_8px_rgba(96,165,250,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] transition-all resize-none"
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full mt-8 bg-blue-400 dark:bg-blue-500 text-white rounded-2xl py-5 font-black text-lg flex items-center justify-center gap-3 transition-all shadow-[6px_6px_12px_rgba(96,165,250,0.3),inset_2px_2px_6px_rgba(255,255,255,0.5),inset_-2px_-2px_6px_rgba(0,0,0,0.1)] dark:shadow-[6px_6px_12px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.1),inset_-2px_-2px_6px_rgba(0,0,0,0.4)] hover:-translate-y-1 active:translate-y-0.5 active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1)] dark:active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4)] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : 'Save Member'}
          {!isSubmitting && <ArrowRight size={24} strokeWidth={3} />}
        </button>
      </form>
    </div>
  );
}
