'use client';
import { useQuery } from '@tanstack/react-query';
import { FamilyOverview } from '@/components/FamilyOverview';
import { TimelineFeed } from '@/components/TimelineFeed';
import { ActivitySummary } from '@/components/ActivitySummary';
import { getHouseholds, getHousehold } from '@/lib/api';

export default function DashboardPage() {
  const { data: household, isLoading, error } = useQuery({
    queryKey: ['household', typeof window !== 'undefined' ? localStorage.getItem('household_id') : 'active'],
    queryFn: async () => {
      const storedId = typeof window !== 'undefined' ? localStorage.getItem('household_id') : null;
      if (storedId) {
        return getHousehold(storedId);
      }
      const households = await getHouseholds();
      if (households.length > 0) {
        // Auto-select first household if none selected
        if (typeof window !== 'undefined') {
           localStorage.setItem('household_id', households[0].id);
        }
        return households[0];
      }
      throw new Error('No household found');
    },
    // Keep data fresh for 5 mins, but allow immediate reuse from cache
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="animate-pulse">
          <div className="h-12 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg mb-2" />
          <div className="h-6 w-96 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-2">
          {error ? 'Welcome!' : `Good morning, ${household?.name || 'Family'}!`}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">
          {error ? 'Unable to load data' : 'Here is your health overview for today.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <FamilyOverview />
          <TimelineFeed />
        </div>
        <div className="space-y-8">
          <ActivitySummary />
        </div>
      </div>
    </div>
  );
}
