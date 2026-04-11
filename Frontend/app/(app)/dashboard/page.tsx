'use client';
import { FamilyOverview } from '@/components/FamilyOverview';
import { TimelineFeed } from '@/components/TimelineFeed';
import { ActivitySummary } from '@/components/ActivitySummary';

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-2">Good morning, Sharma Family!</h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">Here is your health overview for today.</p>
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
