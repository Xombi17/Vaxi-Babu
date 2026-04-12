'use client';

import { Home, Users, Calendar, Plus } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  type: 'household' | 'dependent' | 'events' | 'reminders';
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

const emptyConfig = {
  household: {
    icon: Home,
    title: 'No Household Found',
    description: 'Create a household to start tracking your family\'s health journey.',
    actionLabel: 'Create Household',
    actionHref: '/households/new',
  },
  dependent: {
    icon: Users,
    title: 'No Family Members',
    description: 'Add your first family member to start tracking their health timeline.',
    actionLabel: 'Add Family Member',
    actionHref: '/dependents/new',
  },
  events: {
    icon: Calendar,
    title: 'No Health Events',
    description: 'Add a family member to see their vaccination and health timeline.',
    actionLabel: 'Add Family Member',
    actionHref: '/dependents/new',
  },
  reminders: {
    icon: Calendar,
    title: 'No Upcoming Reminders',
    description: 'Your health reminders will appear here when events are due.',
  },
};

export function EmptyState({ type, title, description, actionLabel, actionHref }: EmptyStateProps) {
  const config = emptyConfig[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
        <Icon size={40} className="text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
        {title || config.title}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">
        {description || config.description}
      </p>
      {(actionLabel || config.actionLabel) && actionHref && (
        <Link
          href={actionHref || config.actionHref!}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-2xl transition-all flex items-center gap-2"
        >
          <Plus size={20} strokeWidth={2.5} />
          {actionLabel || config.actionLabel}
        </Link>
      )}
    </div>
  );
}