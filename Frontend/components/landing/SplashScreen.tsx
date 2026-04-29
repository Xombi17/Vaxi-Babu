"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"syringe" | "fluid" | "text" | "done">("syringe");
  const brandName = "VaxiBabu";

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("text"), 200);
    const t2 = setTimeout(() => setPhase("done"), 3200);
    const t3 = setTimeout(() => onComplete(), 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "done" ? null : null}
      <motion.div
        key="splash"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "radial-gradient(ellipse at center, #0a1628 0%, #020817 70%)" }}
      >
        {/* Background particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div key={i}
            className="absolute rounded-full"
            style={{
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 2 === 0 ? "rgba(6,182,212,0.3)" : "rgba(59,130,246,0.2)",
            }}
            animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.5, 0.5] }}
            transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}

        {/* Radial background glow */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* Brand name - typewriter effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={phase === "text" || phase === "done" ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="relative text-center"
        >
          <h1 className="text-8xl sm:text-[10rem] font-bold italic tracking-tighter"
            style={{ fontFamily: "'Dancing Script', cursive" }}>
            {brandName.split("").map((char, i) => (
              <motion.span key={i}
                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                animate={phase === "text" || phase === "done" ? { opacity: 1, scale: 1, rotate: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5, ease: "backOut" }}
                className={i < 4 ? "text-white" : ""}
                style={i >= 4 ? {
                  background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                } : {}}
              >
                {char}
              </motion.span>
            ))}
          </h1>

          {/* Typewriter cursor */}
          <motion.span
            className="inline-block w-[3px] h-10 bg-cyan-400 ml-1 align-middle"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            style={{ verticalAlign: "middle" }}
          />

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={phase === "text" || phase === "done" ? { opacity: 1 } : {}}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-center text-sm text-white/30 mt-3 font-medium tracking-widest uppercase"
          >
            Voice-First Healthcare
          </motion.p>
        </motion.div>

        {/* Loading bar at bottom */}
        <motion.div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #06b6d4, #3b82f6)" }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3.8, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
