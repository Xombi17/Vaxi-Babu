'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function PwaInstallNotice() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstall(false);
    }
  };

  if (!showInstall) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-96 z-50 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 flex flex-col gap-3">
      <button 
        onClick={() => setShowInstall(false)}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        aria-label="Close install prompt"
      >
        <X size={18} />
      </button>
      
      <div className="flex gap-4 items-center mt-2">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shrink-0">
          <Download className="text-white" size={24} />
        </div>
        <div>
          <h3 className="font-lora font-bold text-gray-900 dark:text-white">Install WellSync AI</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Add to home screen for offline access</p>
        </div>
      </div>
      
      <button 
        onClick={handleInstallClick}
        className="w-full bg-cta hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors cursor-pointer"
        aria-label="Install app"
      >
        Install App
      </button>
    </div>
  );
}
