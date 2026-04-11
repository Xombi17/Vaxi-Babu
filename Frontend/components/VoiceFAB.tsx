'use client';
import { motion } from 'motion/react';
import { Mic } from 'lucide-react';

export function VoiceFAB() {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        boxShadow: [
          "10px 10px 20px rgba(96, 165, 250, 0.3), inset 4px 4px 10px rgba(255, 255, 255, 0.5), inset -4px -4px 10px rgba(0, 0, 0, 0.1)",
          "0px 0px 0px 20px rgba(96, 165, 250, 0), inset 4px 4px 10px rgba(255, 255, 255, 0.5), inset -4px -4px 10px rgba(0, 0, 0, 0.1)",
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="bg-blue-400 text-white w-16 h-16 md:w-20 md:h-20 rounded-[2rem] flex items-center justify-center relative overflow-hidden"
    >
      <Mic className="w-8 h-8 md:w-10 md:h-10 relative z-10" strokeWidth={3} />
    </motion.button>
  );
}
