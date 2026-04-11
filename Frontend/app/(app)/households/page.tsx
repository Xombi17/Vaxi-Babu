'use client';
import Link from 'next/link';
import { Plus, Users, MapPin, Globe, ChevronRight } from 'lucide-react';

const households = [
  { id: '1', name: 'Sharma Family', language: 'English', location: 'Mumbai, Maharashtra', members: 3 },
  { id: '2', name: 'Patel Family', language: 'हिंदी (Hindi)', location: 'Ahmedabad, Gujarat', members: 5 },
];

export default function HouseholdsPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-2">Households</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">Manage your family units.</p>
        </div>
        <Link 
          href="/households/new"
          className="bg-blue-400 dark:bg-blue-500 text-white rounded-2xl py-4 px-6 font-black flex items-center justify-center gap-2 transition-all shadow-[6px_6px_12px_rgba(96,165,250,0.3),inset_2px_2px_6px_rgba(255,255,255,0.5),inset_-2px_-2px_6px_rgba(0,0,0,0.1)] dark:shadow-[6px_6px_12px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.1),inset_-2px_-2px_6px_rgba(0,0,0,0.4)] hover:-translate-y-1 active:translate-y-0.5 active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1)] dark:active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4)] w-full md:w-auto"
        >
          <Plus size={24} strokeWidth={3} /> Create Household
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {households.map((household) => (
          <div 
            key={household.id} 
            className="bg-[#f3f6fd] dark:bg-slate-800 rounded-[2.5rem] p-6 md:p-8 shadow-[10px_10px_20px_rgba(0,0,0,0.05),-10px_-10px_20px_rgba(255,255,255,0.8)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(255,255,255,0.05)] hover:shadow-[12px_12px_24px_rgba(0,0,0,0.08),-12px_-12px_24px_rgba(255,255,255,0.9),inset_4px_4px_10px_rgba(255,255,255,0.9),inset_-4px_-4px_10px_rgba(0,0,0,0.02)] dark:hover:shadow-[12px_12px_24px_rgba(0,0,0,0.5),-12px_-12px_24px_rgba(255,255,255,0.05),inset_4px_4px_10px_rgba(255,255,255,0.1),inset_-4px_-4px_10px_rgba(0,0,0,0.5)] transition-all group flex flex-col sm:flex-row gap-6"
          >
            <div className="w-20 h-20 rounded-[1.5rem] bg-blue-400 dark:bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-[4px_4px_10px_rgba(96,165,250,0.4),inset_2px_2px_6px_rgba(255,255,255,0.6),inset_-2px_-2px_6px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.1),inset_-2px_-2px_6px_rgba(0,0,0,0.4)]">
              <Users size={32} strokeWidth={2.5} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-black text-2xl text-slate-800 dark:text-white">{household.name}</h3>
                <button className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-600 transition-colors shadow-[4px_4px_8px_rgba(0,0,0,0.05),inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_4px_rgba(0,0,0,0.02)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.4)]">
                  <ChevronRight size={20} strokeWidth={3} />
                </button>
              </div>
              
              <div className="space-y-3 mt-4 bg-white dark:bg-slate-700 rounded-2xl p-4 shadow-[inset_2px_2px_6px_rgba(0,0,0,0.02),inset_-2px_-2px_6px_rgba(255,255,255,0.8)] dark:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.2),inset_-2px_-2px_6px_rgba(255,255,255,0.05)]">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                  <Users size={16} className="text-blue-400" />
                  <span>{household.members} Members</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                  <Globe size={16} className="text-blue-400" />
                  <span>{household.language}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                  <MapPin size={16} className="text-blue-400" />
                  <span>{household.location}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
