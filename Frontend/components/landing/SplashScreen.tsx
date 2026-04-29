"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"syringe" | "fluid" | "text" | "done">("syringe");
  const brandName = "VaxiBabu";

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("fluid"), 800);
    const t2 = setTimeout(() => setPhase("text"), 2200);
    const t3 = setTimeout(() => setPhase("done"), 4200);
    const t4 = setTimeout(() => onComplete(), 4800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
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

        {/* Radial glow behind syringe */}
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* SYRINGE + HAND SILHOUETTE SVG */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative mb-12"
        >
          <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Silhouetted Hand */}
            <motion.path
              d="M40 200 C60 180, 80 160, 100 150 C120 140, 140 140, 150 160 C160 180, 150 200, 140 220 L130 240 L40 240 Z"
              fill="rgba(255,255,255,0.05)"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.path
              d="M100 150 C110 130, 130 120, 145 135 L120 160 Z"
              fill="rgba(255,255,255,0.08)"
            />
            
            {/* Syringe (positioned as if held) */}
            <g transform="rotate(-35, 120, 120) translate(20, -40)">
              {/* Syringe body */}
              <motion.rect x="45" y="20" width="30" height="70" rx="4"
                stroke="url(#syringeGrad)" strokeWidth="2" fill="rgba(6,182,212,0.03)" />
              {/* Plunger */}
              <motion.rect x="52" y="5" width="16" height="8" rx="2"
                fill="rgba(6,182,212,0.2)" stroke="url(#syringeGrad)" strokeWidth="1"
                animate={phase === "fluid" || phase === "text" ? { y: 25 } : { y: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }} />
              {/* Needle */}
              <line x1="60" y1="90" x2="60" y2="130" stroke="#94a3b8" strokeWidth="1.5" />
              {/* Fluid */}
              <motion.rect x="48" y="40" width="24" height="46" rx="2"
                fill="url(#fluidGrad)"
                animate={phase === "fluid" || phase === "text" ? { height: 5, y: 81 } : { height: 46, y: 40 }}
                transition={{ duration: 1.5, ease: "easeInOut" }} />
            </g>
            
            <defs>
              <linearGradient id="syringeGrad" x1="45" y1="20" x2="75" y2="90">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <linearGradient id="fluidGrad" x1="48" y1="40" x2="72" y2="86">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Shooting fluid spray */}
          <AnimatePresence>
            {(phase === "fluid" || phase === "text") && (
              <div className="absolute top-[160px] left-[160px]">
                {[...Array(12)].map((_, i) => (
                  <motion.div key={i}
                    className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                    initial={{ opacity: 1, x: 0, y: 0 }}
                    animate={{
                      opacity: 0,
                      x: 40 + Math.random() * 80,
                      y: 40 + Math.random() * 80,
                      scale: 0.5
                    }}
                    transition={{ duration: 1, delay: i * 0.05 }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </motion.div>

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
