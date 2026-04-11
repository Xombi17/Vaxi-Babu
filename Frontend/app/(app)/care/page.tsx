'use client';
import { MapPin, Phone, Clock, Star, Navigation, Home, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

const clinics = [
  {
    id: '1',
    name: 'Jeevan Health Center',
    type: 'Govt. PHC',
    distance: '0.8 km',
    status: 'Open Now',
    rating: 4.8,
    phone: '+91 98765 43210',
    services: ['Vaccination', 'Prenatal Care', 'Emergency']
  },
  {
    id: '2',
    name: 'Aditi Child Clinic',
    type: 'Specialist',
    distance: '2.4 km',
    status: 'Closing Soon',
    rating: 4.5,
    phone: '+91 98765 43211',
    services: ['Pediatrics', 'Vitamin Drops']
  },
];

const ashaWorkers = [
  {
    id: 'a1',
    name: 'Sunita Devi',
    role: 'Lead ASHA Worker',
    village: 'Vikas Nagar',
    phone: '+91 99887 76655',
    verified: true
  }
];

export default function NearbyCarePage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-2">Nearby Care</h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">Quick access to local health support.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Urgent Support */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-black text-slate-800 dark:text-white mb-6">Nearby Health Centers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {clinics.map((clinic) => (
                <div key={clinic.id} className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 shadow-[10px_10px_20px_rgba(0,0,0,0.05)] border border-white dark:border-slate-700/50">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
                      <Home size={24} strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full">
                      {clinic.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1">{clinic.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-4">{clinic.type} • {clinic.distance}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {clinic.services.map(s => (
                      <span key={s} className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded-lg">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 bg-blue-400 text-white rounded-xl py-3 font-black text-sm shadow-lg active:scale-95 transition-all">
                      <Phone size={16} strokeWidth={3} /> Call
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-white rounded-xl py-3 font-black text-sm border border-slate-100 dark:border-slate-600 shadow-sm active:scale-95 transition-all">
                      <Navigation size={16} strokeWidth={3} /> Directions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Community Care Side Panel */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200 dark:shadow-blue-900/40">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2 truncate">
              <Star size={24} className="fill-white" /> Emergency Help
            </h2>
            <p className="font-bold text-blue-50 mb-8 leading-tight">Quickly connect to local verified health workers.</p>
            <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 border border-white/20">
              {ashaWorkers.map(worker => (
                <div key={worker.id} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-white/30 mx-auto mb-4 relative flex items-center justify-center">
                    <ShieldCheck size={32} className="text-white" />
                  </div>
                  <h4 className="font-black text-lg">{worker.name}</h4>
                  <p className="text-xs font-bold text-blue-100 mb-6">{worker.role}</p>
                  <button className="w-full bg-white text-blue-600 rounded-2xl py-4 font-black text-lg shadow-xl active:scale-95 transition-all">
                    SOS Call
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-[#f3f6fd] dark:bg-slate-800 rounded-[2rem] p-6 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center">
             <MapPin size={32} className="text-slate-300 dark:text-slate-600 mb-4" />
             <p className="font-black text-slate-400 dark:text-slate-500">Add more local contacts</p>
          </div>
        </div>
      </div>
    </div>
  );
}
