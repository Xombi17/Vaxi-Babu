import { useQuery } from '@tanstack/react-query';
import { getDependents } from '../lib/api';
import Link from 'next/link';
import { Plus, User as UserIcon } from 'lucide-react';

export function FamilyOverview() {
  const householdId = typeof window !== 'undefined' ? localStorage.getItem('household_id') : null;

  const { data: dependents = [], isLoading } = useQuery({
    queryKey: ['dependents', householdId],
    queryFn: () => getDependents(householdId || undefined),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Family Members</h2>
        <Link href="/dependents/new" className="text-blue-500 dark:text-blue-400 font-black text-sm flex items-center gap-1 bg-white dark:bg-slate-800 px-5 py-2.5 rounded-2xl shadow-[4px_4px_8px_rgba(0,0,0,0.05),inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_4px_rgba(0,0,0,0.02)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)] dark:active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4)] transition-all">
          <Plus size={20} strokeWidth={3} /> Add Member
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[#f3f6fd] dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm animate-pulse min-h-[180px]" />
          ))
        ) : (
          dependents.map((member) => (
            <Link href={`?dependent=${member.id}`} key={member.id} className="bg-[#f3f6fd] dark:bg-slate-800 p-6 rounded-[2rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(255,255,255,0.05)] hover:shadow-[10px_10px_20px_rgba(0,0,0,0.05),-10px_-10px_20px_rgba(255,255,255,0.8),inset_4px_4px_10px_rgba(255,255,255,0.9),inset_-4px_-4px_10px_rgba(0,0,0,0.02)] dark:hover:shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(255,255,255,0.05),inset_4px_4px_10px_rgba(255,255,255,0.1),inset_-4px_-4px_10px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-all cursor-pointer text-center block">
              <div className="w-20 h-20 rounded-[1.25rem] bg-white dark:bg-slate-700 flex items-center justify-center mx-auto mb-4 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)]">
                <UserIcon size={32} className="text-blue-400" />
              </div>
              <h3 className="font-black text-lg text-slate-800 dark:text-white truncate">{member.name}</h3>
              <p className="text-sm font-bold text-blue-400 uppercase">{member.type}</p>
            </Link>
          ))
        )}
        <Link href="/dependents/new" className="bg-[#f3f6fd] dark:bg-slate-800 rounded-[2rem] flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)] dark:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.4),inset_-4px_-4px_10px_rgba(255,255,255,0.05)] transition-all cursor-pointer min-h-[180px] group">
          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center mb-3 shadow-[4px_4px_8px_rgba(0,0,0,0.05),inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_4px_rgba(0,0,0,0.02)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.4)] group-hover:scale-110 transition-transform">
            <Plus size={28} strokeWidth={3} />
          </div>
          <span className="font-black text-sm">Add New</span>
        </Link>
      </div>
    </section>
  );
}
