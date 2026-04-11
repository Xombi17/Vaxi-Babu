'use client';
import { Settings, Globe, Bell, Mic, Download, LogOut } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-[1.5rem] bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center shadow-[4px_4px_10px_rgba(0,0,0,0.2),inset_2px_2px_6px_rgba(255,255,255,0.2),inset_-2px_-2px_6px_rgba(0,0,0,0.4)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.5),inset_2px_2px_6px_rgba(255,255,255,0.1),inset_-2px_-2px_6px_rgba(0,0,0,0.6)]">
          <Settings size={32} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-1">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">Manage your app preferences.</p>
        </div>
      </div>

      <div className="space-y-6">
        
        <div className="bg-[#f3f6fd] dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-[10px_10px_20px_rgba(0,0,0,0.05),-10px_-10px_20px_rgba(255,255,255,0.8)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(255,255,255,0.05)]">
          <h2 className="text-xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <Globe className="text-blue-500 dark:text-blue-400" /> Language
          </h2>
          <div className="flex gap-4">
            <button className="flex-1 bg-white dark:bg-slate-700 border-2 border-blue-400 dark:border-blue-500 text-blue-500 dark:text-blue-400 rounded-2xl py-4 font-black shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3)]">
              English
            </button>
            <button className="flex-1 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-2xl py-4 font-black shadow-[4px_4px_8px_rgba(0,0,0,0.05),inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_4px_rgba(0,0,0,0.02)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.4)] hover:text-slate-800 dark:hover:text-white transition-colors">
              हिंदी (Hindi)
            </button>
          </div>
        </div>

        <div className="bg-[#f3f6fd] dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-[10px_10px_20px_rgba(0,0,0,0.05),-10px_-10px_20px_rgba(255,255,255,0.8)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(255,255,255,0.05)] space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-blue-500 dark:text-blue-400 shadow-[4px_4px_8px_rgba(0,0,0,0.05),inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_4px_rgba(0,0,0,0.02)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.4)]">
                <Bell size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-800 dark:text-white">Notifications</h3>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Reminders and alerts</p>
              </div>
            </div>
            <div className="w-14 h-8 bg-blue-400 dark:bg-blue-500 rounded-full p-1 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4)] cursor-pointer">
              <div className="w-6 h-6 bg-white rounded-full shadow-sm translate-x-6 transition-transform"></div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-blue-500 dark:text-blue-400 shadow-[4px_4px_8px_rgba(0,0,0,0.05),inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_4px_rgba(0,0,0,0.02)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.4)]">
                <Mic size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-800 dark:text-white">Voice Assistant</h3>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Voice feedback and prompts</p>
              </div>
            </div>
            <div className="w-14 h-8 bg-blue-400 dark:bg-blue-500 rounded-full p-1 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4)] cursor-pointer">
              <div className="w-6 h-6 bg-white rounded-full shadow-sm translate-x-6 transition-transform"></div>
            </div>
          </div>
        </div>

        <div className="bg-[#f3f6fd] dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-[10px_10px_20px_rgba(0,0,0,0.05),-10px_-10px_20px_rgba(255,255,255,0.8)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(255,255,255,0.05)] space-y-4">
          <button className="w-full bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl py-4 px-6 font-black flex items-center justify-between shadow-[4px_4px_8px_rgba(0,0,0,0.05),inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_4px_rgba(0,0,0,0.02)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.4)] hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
            <span className="flex items-center gap-3"><Download size={20} /> Export Health Data</span>
          </button>
          <button className="w-full bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-2xl py-4 px-6 font-black flex items-center justify-between shadow-[inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_4px_rgba(0,0,0,0.02)] dark:shadow-[inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.2)] hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
            <span className="flex items-center gap-3"><LogOut size={20} /> Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
}
