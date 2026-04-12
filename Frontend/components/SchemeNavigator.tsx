'use client';
import { useQuery } from '@tanstack/react-query';
import { Shield, Heart, Syringe, Award, ArrowRight, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { getRecommendedSchemes } from '../lib/api';

const iconMap = {
  Shield: Shield,
  Heart: Heart,
  Syringe: Syringe,
  Award: Award,
};

const categoryStyles = {
  maternal: 'bg-rose-100 dark:bg-rose-900/30 text-rose-500',
  child: 'bg-blue-100 dark:bg-blue-900/30 text-blue-500',
  general: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500',
  senior: 'bg-amber-100 dark:bg-amber-900/30 text-amber-500',
};

export function SchemeNavigator() {
  const householdId = typeof window !== 'undefined' ? localStorage.getItem('household_id') : null;

  const { data: schemes = [], isLoading } = useQuery({
    queryKey: ['schemes', householdId],
    queryFn: () => getRecommendedSchemes(householdId!),
    enabled: !!householdId,
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-black text-slate-800 dark:text-white px-2">Schemes For You</h2>
        {[1, 2].map(i => (
          <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (schemes.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Schemes For You</h2>
        <span className="text-[10px] font-black bg-blue-500 text-white px-2 py-1 rounded-lg uppercase tracking-wider">{schemes.length} Available</span>
      </div>

      <div className="space-y-4">
        {schemes.map((scheme, index) => {
          const Icon = iconMap[scheme.icon as keyof typeof iconMap] || Shield;
          return (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={scheme.id}
              className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] shadow-[4px_4px_10px_rgba(0,0,0,0.03)] dark:shadow-none border border-slate-100 dark:border-slate-700/50 hover:border-blue-200 dark:hover:border-blue-900 transition-all group cursor-pointer"
            >
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${categoryStyles[scheme.category as keyof typeof categoryStyles]}`}>
                  <Icon size={24} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-slate-800 dark:text-white leading-tight mb-1 group-hover:text-blue-500 transition-colors">
                    {scheme.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold line-clamp-2 mb-2">
                    {scheme.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-black px-2 py-1 rounded-md">
                      {scheme.eligibility_reason}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
                <span className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-1">
                  View Benefits <ArrowRight size={12} strokeWidth={3} />
                </span>
                <ExternalLink size={14} className="text-slate-300 dark:text-slate-600" />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-[2.5rem] border border-blue-100/50 dark:border-blue-800/20">
        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 leading-relaxed">
          Matches are based on your family profile. Contact your local ASHA worker to apply.
        </p>
      </div>
    </div>
  );
}
