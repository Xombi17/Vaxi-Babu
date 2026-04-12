'use client';
import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, ArrowRight, Check, Volume2 } from 'lucide-react';
import { updateHousehold, Household } from '@/lib/api';

interface OnboardingWizardProps {
  household: Household;
  onComplete: () => void;
}

type PreferenceKey = 'ai_tone' | 'voice_preference' | 'health_focus';

interface Step {
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  options: { id: string; label: string; desc: string }[];
  field: PreferenceKey;
}

export function OnboardingWizard({ household, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    ai_tone: 'gentle',
    voice_preference: 'female',
    health_focus: 'family_wellness',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps: Step[] = useMemo(() => [
    {
      title: "Welcome to WellSync AI",
      description: "Let's personalize your health journey. How should your AI assistant sound?",
      icon: Sparkles,
      options: [
        { id: 'gentle', label: 'Gentle & Caring', desc: 'Focuses on empathy and support' },
        { id: 'professional', label: 'Professional', desc: 'Direct and detailed clinical info' },
        { id: 'concise', label: 'Concise', desc: 'Quick answers and fast summaries' },
      ],
      field: 'ai_tone'
    },
    {
      title: "Voice Assistant",
      description: "Choose a voice that you find clear and easy to understand.",
      icon: Volume2,
      options: [
        { id: 'female', label: 'Soft Female Voice', desc: 'Premium regional voice mode' },
        { id: 'male', label: 'Clear Male Voice', desc: 'Standard high-fidelity voice' },
        { id: 'premium', label: 'Premium Mode', desc: 'Enhanced natural inflection' },
      ],
      field: 'voice_preference'
    },
    {
      title: "Health Focus",
      description: "What areas of health are most important to your family right now?",
      icon: Heart,
      options: [
        { id: 'maternal', label: 'Maternal Care', desc: 'Pregnancy and newborn health' },
        { id: 'pediatric', label: 'Child Growth', desc: 'Vaccinations and milestones' },
        { id: 'family_wellness', label: 'Family Wellness', desc: 'General health for everyone' },
      ],
      field: 'health_focus'
    }
  ], []);

  const currentStepData = steps[step - 1];
  const currentValue = preferences[currentStepData.field];

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await updateHousehold(household.id, {
        preferences,
        last_onboarded_at: new Date().toISOString(),
      });
      onComplete();
    } catch (error) {
      console.error('Onboarding update failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [household.id, preferences, onComplete]);

  const handleNext = useCallback(() => {
    if (step < steps.length) {
      setStep(s => s + 1);
    } else {
      handleSubmit();
    }
  }, [step, steps.length, handleSubmit]);

  const handlePrev = useCallback(() => {
    if (step > 1) {
      setStep(s => s - 1);
    }
  }, [step]);

  const handleSelect = useCallback((value: string) => {
    setPreferences(prev => ({ ...prev, [currentStepData.field]: value }));
  }, [currentStepData.field]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const options = currentStepData.options;
    const currentIndex = options.findIndex(o => o.id === currentValue);

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % options.length;
      handleSelect(options[nextIndex].id);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + options.length) % options.length;
      handleSelect(options[prevIndex].id);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNext();
    }
  }, [currentStepData.options, currentValue, handleSelect, handleNext]);

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl relative"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100 dark:bg-slate-700 flex">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`flex-1 transition-all duration-500 ${i < step ? 'bg-blue-500' : ''}`}
            />
          ))}
        </div>

        <div className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-500">
                  <currentStepData.icon size={40} strokeWidth={2.5} />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                  {currentStepData.title}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                  {currentStepData.description}
                </p>
              </div>

              <div className="space-y-4">
                {currentStepData.options.map((option, idx) => (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(option.id)}
                    className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center justify-between ${
                      currentValue === option.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                    aria-pressed={currentValue === option.id}
                  >
                    <div className="text-left">
                      <p className={`font-bold text-lg ${
                        currentValue === option.id
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-700 dark:text-slate-200'
                      }`}>
                        {option.label}
                      </p>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                        {option.desc}
                      </p>
                    </div>
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      currentValue === option.id
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'border-slate-200 dark:border-slate-600'
                    }`}>
                      {currentValue === option.id && <Check size={16} strokeWidth={4} />}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 flex items-center justify-between">
            <button 
              onClick={handlePrev}
              className={`font-bold text-slate-400 hover:text-slate-600 transition-colors ${step === 1 ? 'invisible' : ''}`}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-10 rounded-2xl transition-all flex items-center gap-3 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : step === steps.length ? 'Finish' : 'Next'}
              <ArrowRight size={20} strokeWidth={3} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}