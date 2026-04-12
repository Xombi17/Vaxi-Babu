import { useQuery } from '@tanstack/react-query';
import { getDependents } from '../lib/api';
import Link from 'next/link';
import { Plus, User as UserIcon } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { getStoredHouseholdId } from '../hooks/use-household';

export function FamilyOverview() {
  const householdId = getStoredHouseholdId();

  const { data: dependents = [], isLoading } = useQuery({
    queryKey: ['dependents', householdId],
    queryFn: () => getDependents(householdId || undefined),
    staleTime: 5 * 60 * 1000,
  });

  if (!isLoading && dependents.length === 0) {
    return (
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Family Members</h2>
        </div>
        <EmptyState type="dependent" />
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Family Members</h2>
        <Link href="/dependents/new" className="text-blue-500 dark:text-blue-400 font-bold text-sm flex items-center gap-1 bg-white dark:bg-slate-800 px-5 py-2.5 rounded-2xl hover:-translate-y-0.5 active:translate-y-0.5 transition-all">
          <Plus size={20} strokeWidth={3} /> Add Member
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl animate-pulse min-h-[180px]" />
          ))
        ) : (
          dependents.map((member) => (
            <Link href={`?dependent=${member.id}`} key={member.id} className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl hover:-translate-y-1 transition-all cursor-pointer text-center block">
              <div className="w-20 h-20 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                <UserIcon size={32} className="text-blue-400" />
              </div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-white truncate">{member.name}</h3>
              <p className="text-sm font-medium text-blue-400 uppercase">{member.type}</p>
            </Link>
          ))
        )}
        <Link href="/dependents/new" className="bg-slate-100 dark:bg-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-all cursor-pointer min-h-[180px] group">
          <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Plus size={28} strokeWidth={3} />
          </div>
          <span className="font-bold text-sm">Add New</span>
        </Link>
      </div>
    </section>
  );
}
