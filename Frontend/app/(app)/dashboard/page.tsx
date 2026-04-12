'use client';
import { useQuery } from '@tanstack/react-query';
import { FamilyOverview } from '@/components/FamilyOverview';
import { TimelineFeed } from '@/components/TimelineFeed';
import { ActivitySummary } from '@/components/ActivitySummary';
import { SchemeNavigator } from '@/components/SchemeNavigator';
import { EmptyState } from '@/components/EmptyState';
import { useHousehold } from '@/hooks/use-household';

export default function DashboardPage() {
  const { household, households, isLoading, error } = useHousehold();

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

  if (!household || households.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <EmptyState type="household" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-2">
          {`Good morning, ${household.name}!`}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Here is your health overview for today.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <FamilyOverview />
          <TimelineFeed />
        </div>
        <div className="space-y-8">
          <ActivitySummary />
          <SchemeNavigator />
        </div>
      </div>
    </div>
  );
}
