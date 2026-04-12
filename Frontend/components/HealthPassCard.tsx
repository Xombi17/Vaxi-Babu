'use client';

import { useQuery } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, AlertCircle, Clock, Download, Share2, Award } from 'lucide-react';
import { getHealthPass } from '../lib/api';
import { motion } from 'framer-motion';

export function HealthPassCard({ dependentId }: { dependentId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['health-pass', dependentId],
    queryFn: () => getHealthPass(dependentId),
  });

  if (isLoading || !data) {
    return (
      <div className="w-full h-[600px] bg-[#f3f6fd] dark:bg-slate-800 rounded-[3rem] p-8 flex flex-col items-center justify-center">
        <div className="w-32 h-32 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin mb-4" />
        <p className="text-slate-500 font-bold animate-pulse tracking-widest uppercase text-xs">Generating Encrypted ID</p>
      </div>
    );
  }

  const { stats, dependent, next_due } = data;

  const getStatusIcon = () => {
    switch (stats.status_color) {
      case 'green': return <ShieldCheck className="text-emerald-500" size={48} strokeWidth={2.5} />;
      case 'yellow': return <Clock className="text-amber-500" size={48} strokeWidth={2.5} />;
      case 'red': return <AlertCircle className="text-rose-500" size={48} strokeWidth={2.5} />;
      default: return <Award className="text-blue-500" size={48} strokeWidth={2.5} />;
    }
  };

  const getStatusBg = () => {
    switch (stats.status_color) {
      case 'green': return 'from-emerald-400 to-teal-500 shadow-emerald-200 dark:shadow-emerald-900/20';
      case 'yellow': return 'from-amber-400 to-orange-500 shadow-amber-200 dark:shadow-amber-900/20';
      case 'red': return 'from-rose-400 to-pink-500 shadow-rose-200 dark:shadow-rose-900/20';
      default: return 'from-blue-400 to-indigo-500 shadow-blue-200 dark:shadow-blue-900/20';
    }
  };

  const qrData = JSON.stringify({
    n: dependent.name,
    v: `${stats.completed_events}/${stats.total_events}`,
    s: stats.status_color,
    id: dependent.id
  });

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden bg-[#f3f6fd] dark:bg-slate-800/80 rounded-[3.5rem] p-1 shadow-[20px_20px_40px_rgba(0,0,0,0.06),-20px_-20px_40px_rgba(255,255,255,0.7)] dark:shadow-[20px_20px_40px_rgba(0,0,0,0.3),-10px_-10px_30px_rgba(255,255,255,0.03)] backdrop-blur-xl border border-white/50 dark:border-slate-700/50"
    >
      {/* Mesh Gradient Background */}
      <div className={`absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br ${getStatusBg()} opacity-10 dark:opacity-20 blur-[100px] rounded-full`} />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 opacity-5 dark:opacity-10 blur-[100px] rounded-full" />
      
      <div className="relative z-10 p-10">
        <div className="flex justify-between items-start mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Official Health Pass</h2>
            </div>
            <h3 className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter mb-1 leading-none">{dependent.name}</h3>
            <p className="text-slate-400 font-bold text-sm tracking-wide">Dependent ID: {dependent.id.slice(0, 8)}</p>
          </div>
          <div className="bg-white dark:bg-slate-700/50 p-6 rounded-[2.5rem] shadow-[8px_8px_16px_rgba(0,0,0,0.03),inset_2px_2px_4px_rgba(255,255,255,0.8)] dark:shadow-[inset_2px_2px_4px_rgba(255,255,255,0.05)]">
            {getStatusIcon()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
          <div className="bg-white dark:bg-slate-900/60 p-12 rounded-[3.5rem] flex flex-col items-center justify-center shadow-[inset_10px_10px_20px_rgba(0,0,0,0.02),inset_-10px_-10px_20px_rgba(255,255,255,0.8)] dark:shadow-[inset_4px_4px_12px_rgba(0,0,0,0.2)] group-hover:scale-[1.02] transition-transform">
            <div className="bg-white p-6 rounded-3xl shadow-xl">
              <QRCodeSVG 
                value={qrData}
                size={220}
                level="H"
                includeMargin={false}
                className="mix-blend-multiply"
              />
            </div>
            <div className="mt-8 flex items-center gap-2">
              <ShieldCheck size={14} className="text-blue-500" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Encrypted Token</p>
            </div>
          </div>

          <div className="flex flex-col justify-between py-2 space-y-6">
            <div className="bg-white/60 dark:bg-slate-700/60 p-8 rounded-[2.5rem] border border-white/50 dark:border-slate-600/30 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3">Protection Score</p>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-black text-slate-800 dark:text-white leading-none">{stats.health_score}%</span>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${stats.health_score >= 80 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                  {stats.health_score >= 80 ? 'Optimal' : 'Deficient'}
                </div>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-slate-700/60 p-8 rounded-[2.5rem] border border-white/50 dark:border-slate-600/30 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3">Health Milestones</p>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-black text-slate-800 dark:text-white leading-none">{stats.completed_events}</span>
                <span className="text-sm font-bold text-slate-400 pb-1 italic">/{stats.total_events} events</span>
              </div>
            </div>
          </div>
        </div>

        {next_due.name && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/40 dark:bg-slate-900/40 p-8 rounded-[2.5rem] mb-12 border border-white/50 dark:border-slate-700/50 flex items-center gap-6"
          >
            <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
              <Clock size={32} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-[0.2em] mb-1">Upcoming Priority</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                 {next_due.name}
              </p>
              <p className="font-bold text-slate-400 dark:text-slate-500">Scheduled for {new Date(next_due.date!).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row gap-5">
          <button className="flex-1 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 h-20 rounded-[1.5rem] font-black transition-all flex items-center justify-center gap-3 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-600 shadow-md active:scale-95 group">
            <Download size={24} className="group-hover:translate-y-1 transition-transform" />
            Download JPG
          </button>
          <button className={`flex-[1.5] bg-gradient-to-r ${getStatusBg()} h-20 rounded-[1.5rem] font-black text-white transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 group`}>
            <Share2 size={24} className="group-hover:rotate-12 transition-transform" />
            Share Health Identity
          </button>
        </div>
      </div>
      
      <p className="text-center pb-10 text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] opacity-50">
        WellSync Certified Health Record System
      </p>
    </motion.div>
  );
}
