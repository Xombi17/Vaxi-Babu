'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useDependents, useCreateDependent, useHousehold, useGenerateTimeline } from '../lib/hooks';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { Users, Plus, X, CalendarClock, ChevronRight, Baby, Heart, User, Sparkles, Loader2 } from 'lucide-react';

export default function DependentsPage() {
  const { data: household } = useHousehold();
  const { data: dependents, isLoading } = useDependents();
  const createMutation = useCreateDependent();
  const generateMutation = useGenerateTimeline();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState<'child' | 'spouse' | 'parent'>('child');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [addedDependentId, setAddedDependentId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const deps = dependents ?? [];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dob) return;
    createMutation.mutate({ name, relation, dob, gender }, {
      onSuccess: (data: any) => {
        setAddedDependentId(data.id);
        // We don't close the form yet, we show the generation button
      },
    });
  };

  const handleGenerate = async () => {
    if (!addedDependentId) return;
    setIsGenerating(true);
    generateMutation.mutate(addedDependentId, {
      onSuccess: () => {
        setTimeout(() => {
          setShowForm(false);
          setAddedDependentId(null);
          setIsGenerating(false);
          setName(''); setDob('');
        }, 1500);
      },
      onError: () => {
        setIsGenerating(false);
      }
    });
  };

  const relationIcon = (r: string) => {
    if (r === 'child') return Baby;
    if (r === 'spouse') return Heart;
    return User;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading font-800 text-2xl text-white mb-1">Family Members</h1>
          <p className="text-sm text-white/35">{household?.family_name ?? ''} Family · {deps.length} members</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-surface-950 font-heading font-700 text-sm rounded-xl transition-all">
          <Plus size={16} /> Add Member
        </button>
      </motion.div>

      {/* Members List */}
      {isLoading ? <CardSkeleton count={3} /> : (
      <div className="space-y-4">
        {deps.map((dep: any, i: number) => {
          const Icon = relationIcon(dep.relation);
          const overdueCount = 0; // Counts come from timeline queries
          const dueCount = 0;
          return (
            <motion.div key={dep.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link href={`/timeline/${dep.id}`} className="block bg-surface-800/40 border border-white/[0.06] rounded-2xl p-5 hover:bg-surface-800/60 hover:border-white/[0.1] transition-all group">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{dep.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-700 text-white">{dep.name}</p>
                    <p className="text-xs text-white/30 capitalize mt-0.5">{dep.relation} · {dep.gender} · DOB: {new Date(dep.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    {dep.pregnancy_week && <p className="text-xs text-warm-400 mt-0.5">Pregnant · Week {dep.pregnancy_week}</p>}
                  </div>
                  <ChevronRight size={18} className="text-white/10 group-hover:text-white/30 transition-colors" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
      )}

      {/* Add Member Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50" onClick={() => setShowForm(false)} />
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
              className="fixed inset-x-4 bottom-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md z-50 bg-surface-900 border border-white/[0.08] rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading font-700 text-lg text-white">Add Family Member</h2>
                <button onClick={() => setShowForm(false)} className="p-1 text-white/30 hover:text-white/60"><X size={18} /></button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                {addedDependentId ? (
                  <div className="py-6 text-center space-y-6">
                    {!isGenerating ? (
                      <>
                        <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center text-teal-500 mx-auto">
                          <Plus size={32} />
                        </div>
                        <div>
                          <h3 className="font-heading font-700 text-white text-lg">Member Added!</h3>
                          <p className="text-white/40 text-sm mt-1">Shall we generate the health schedule for {name}?</p>
                        </div>
                        <button 
                          type="button"
                          onClick={handleGenerate}
                          className="w-full py-4 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-surface-950 font-heading font-700 rounded-xl transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
                        >
                          Generate Schedule <Sparkles size={18} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => { setShowForm(false); setAddedDependentId(null); setName(''); setDob(''); }}
                          className="w-full py-3 text-white/40 hover:text-white/60 text-sm transition-colors"
                        >
                          Skip for now
                        </button>
                      </>
                    ) : (
                      <div className="space-y-6">
                        <div className="relative w-20 h-20 mx-auto">
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-2 border-dashed border-teal-500/30 rounded-full"
                          />
                          <div className="absolute inset-0 flex items-center justify-center text-teal-400">
                            <Loader2 size={24} className="animate-spin" />
                          </div>
                        </div>
                        <p className="text-teal-400 font-heading font-700 animate-pulse">Generating Schedule...</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-xs text-white/40 mb-1.5 block">Full Name</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} required
                        className="w-full px-4 py-3 bg-surface-800/40 border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-teal-500/30 text-sm" placeholder="e.g. Aarav Sharma" />
                    </div>
                    <div>
                      <label className="text-xs text-white/40 mb-1.5 block">Relation</label>
                      <div className="flex gap-2">
                        {(['child', 'spouse', 'parent'] as const).map(r => (
                          <button key={r} type="button" onClick={() => setRelation(r)}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-medium capitalize transition-all ${relation === r ? 'bg-teal-500/15 text-teal-400 border border-teal-500/20' : 'bg-surface-800/40 text-white/35 border border-white/[0.06]'}`}>{r}</button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-white/40 mb-1.5 block">Date of Birth</label>
                        <input type="date" value={dob} onChange={e => setDob(e.target.value)} required
                          className="w-full px-4 py-3 bg-surface-800/40 border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-teal-500/30 text-sm [color-scheme:dark]" />
                      </div>
                      <div>
                        <label className="text-xs text-white/40 mb-1.5 block">Gender</label>
                        <div className="flex gap-2">
                          {(['male', 'female'] as const).map(g => (
                            <button key={g} type="button" onClick={() => setGender(g)}
                              className={`flex-1 py-3 rounded-xl text-xs font-medium capitalize transition-all ${gender === g ? 'bg-teal-500/15 text-teal-400 border border-teal-500/20' : 'bg-surface-800/40 text-white/35 border border-white/[0.06]'}`}>{g}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                    {relation === 'child' && (
                      <div className="p-3 bg-teal-500/[0.06] border border-teal-500/15 rounded-xl">
                        <p className="text-xs text-teal-400">✨ Add this child and generate their India NIS vaccination schedule.</p>
                      </div>
                    )}
                    <button type="submit" disabled={createMutation.isPending} className="w-full py-3.5 bg-teal-500 hover:bg-teal-400 text-surface-950 font-heading font-700 rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                      {createMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} Add Member
                    </button>
                  </>
                )}
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
