"use client";

import React, { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import Image from "next/image";
import {
  Activity,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  Smartphone,
  Clock,
  Globe2,
  Star,
} from "lucide-react";
import Link from "next/link";

const MotionImage = motion.create(Image);

export default function LandingClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div
      className="relative z-10 w-full bg-[#0F172A] text-slate-50 selection:bg-secondary selection:text-[#0F172A]"
      ref={containerRef}
    >
      {/* 0. GRAIN & MESH OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.04] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* GLOBAL MESH GRADIENTS */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] bg-secondary/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 100, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[40%] -right-[15%] w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[100px]"
        />
      </div>

      {/* 1. HERO - THE CINEMATIC HOOK */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-secondary/20 bg-white/5 backdrop-blur-md text-secondary text-xs font-black uppercase tracking-widest mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              Sovereign Health Infrastructure
            </motion.div>

            <h1 className="text-6xl md:text-8xl lg:text-[6.5rem] font-lora font-black tracking-tighter leading-[0.95] mb-8 text-white">
              The Digital <br />
              <span className="italic text-transparent bg-clip-text bg-[linear-gradient(135deg,var(--color-secondary),var(--color-primary))]">
                Sanctuary
              </span>{" "}
              <br />
              for Families.
            </h1>

            <p className="text-xl md:text-2xl text-slate-300 font-medium leading-relaxed max-w-xl mb-12">
              Vaxi Babu is a health memory system designed for the resilience of
              rural life. Zero typing, offline-first, and clinical-grade
              intelligence.
            </p>

            <div className="flex flex-wrap gap-6">
              <Link
                href="/login"
                className="px-10 py-5 bg-white text-[#0F172A] rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl"
              >
                Get Started
              </Link>
              <div className="flex items-center gap-4 text-slate-400 font-bold group">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/5 transition-colors cursor-pointer">
                  <Activity size={20} className="text-secondary" />
                </div>
                <span>View Live Schedule</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Image Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-square lg:aspect-[4/5] rounded-[3rem] overflow-hidden group shadow-2xl"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_60%,rgba(15,23,42,0.9))] z-10" />
            <div className="absolute inset-0 border-[20px] border-[#0F172A] z-20 rounded-[3rem] pointer-events-none" />
            <MotionImage
              src="/images/landing/hero.png"
              alt="Rural Health"
              width={1200}
              height={1500}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[10s]"
              priority
            />
            <div className="absolute bottom-12 left-12 z-30 right-12">
              <div className="p-6 rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary">
                    <Activity size={20} />
                  </div>
                  <span className="font-black text-white">
                    Live Health Analytics
                  </span>
                </div>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "85%" }}
                    transition={{ duration: 2, delay: 1 }}
                    className="h-full bg-secondary"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. THE IDENTITY (High contrast Editorial) */}
      <section className="relative py-40 border-y border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
              <span className="text-secondary font-black tracking-widest uppercase text-xs mb-6 block">
                — Philosophy
              </span>
              <h2 className="text-5xl md:text-8xl font-lora font-black text-white leading-[1] tracking-tighter">
                Clinical precision <br /> meets{" "}
                <span className="italic font-serif text-secondary/80">
                  rural empathy.
                </span>
              </h2>
            </div>
            <div className="lg:col-span-4 flex flex-col justify-end">
              <p className="text-2xl text-slate-300 font-medium leading-[1.4]">
                We replace chaotic paper records with a deterministic,
                cryptographically secure digital sanctuary. Safe. Sovereign.
                Simple.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE ECOSYSTEM (Bento Overhaul) */}
      <section className="relative py-40 bg-black/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <h2 className="text-secondary font-black tracking-widest uppercase text-xs mb-4">
                The Ecosystem
              </h2>
              <h3 className="text-5xl md:text-7xl font-lora font-black text-white leading-tight">
                Everything, <br /> synchronized.
              </h3>
            </div>
            <p className="text-lg text-slate-400 font-medium md:max-w-xs leading-relaxed">
              A complete suite of medical automation models working in parallel
              to secure your family&apos;s future.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 min-h-[800px]">
            {/* Feature 1: Predictive */}
            <motion.div
              whileHover={{ y: -10 }}
              className="md:col-span-3 bg-white/5 border border-white/10 rounded-[3rem] p-12 overflow-hidden relative group"
            >
              <div className="absolute top-0 right-0 p-8">
                <Clock className="w-12 h-12 text-secondary/30 group-hover:text-secondary transition-colors" />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-end">
                <h4 className="text-4xl font-black mb-4 text-white">
                  Predictive <br /> NIS Engine
                </h4>
                <p className="text-slate-400 text-lg max-w-sm font-medium">
                  Deterministic vaccination mapping that lives offline and
                  alerts you via voice.
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/5 to-transparent pointer-events-none" />
            </motion.div>

            {/* Feature 2: High fidelity Image Feature */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="md:col-span-3 md:row-span-2 bg-[#2563EB] rounded-[3rem] overflow-hidden relative shadow-2xl"
            >
              <Image
                src="/images/landing/tech.png"
                alt="Tech"
                fill
                className="object-cover mix-blend-soft-light opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2563EB] via-transparent to-transparent opacity-80" />
              <div className="relative z-10 p-12 h-full flex flex-col justify-end">
                <Activity className="w-12 h-12 text-white mb-8" />
                <h4 className="text-5xl font-lora font-black text-white mb-6">
                  Real-time <br /> Governance.
                </h4>
                <p className="text-blue-50 font-medium text-xl max-w-sm leading-relaxed">
                  Your medical data never leaves the sovereign boundary of your
                  device unless explicitly synced.
                </p>
              </div>
            </motion.div>

            {/* Feature 3: OCR Interaction */}
            <motion.div
              whileHover={{ y: -10 }}
              className="md:col-span-3 bg-white/5 border border-white/10 rounded-[3rem] p-12 flex flex-col lg:flex-row items-center gap-12 group"
            >
              <div className="lg:w-1/2">
                <h4 className="text-4xl font-black mb-4 text-white">
                  GPT-4o OCR
                </h4>
                <p className="text-slate-400 text-lg font-medium">
                  Scan any prescription. Our vision pipeline extracts, verifies,
                  and logs interaction risks instantly.
                </p>
              </div>
              <div className="lg:w-1/2 aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
                <Image
                  src="/images/landing/ocr.png"
                  alt="Scanning"
                  width={800}
                  height={450}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-secondary/20 mix-blend-screen animate-pulse pointer-events-none" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. THE TECH STACK FLOW */}
      <section className="relative py-40 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-6">
                {[
                  {
                    icon: BrainCircuit,
                    title: "Gemini Live",
                    desc: "Native Dialects",
                  },
                  {
                    icon: ShieldCheck,
                    title: "PostgreSQL",
                    desc: "Native SSL",
                  },
                  {
                    icon: Smartphone,
                    title: "PWA 3.0",
                    desc: "Offline Memory",
                  },
                  {
                    icon: Activity,
                    title: "FastRT",
                    desc: "Deterministic Engine",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-secondary/50 transition-colors group"
                  >
                    <item.icon className="w-10 h-10 text-secondary mb-6 group-hover:scale-110 transition-transform" />
                    <h4 className="font-black text-xl mb-1 text-white">
                      {item.title}
                    </h4>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <span className="text-secondary font-black tracking-widest uppercase text-xs mb-6 block">
                — The Stack
              </span>
              <h3 className="text-5xl md:text-7xl font-lora font-black text-white leading-tight mb-10">
                Intelligence <br /> without{" "}
                <span className="italic text-secondary/80">compromise.</span>
              </h3>
              <div className="space-y-10">
                <div className="flex gap-8 group">
                  <div className="text-4xl font-black text-white/10 group-hover:text-secondary transition-colors duration-500">
                    01
                  </div>
                  <div>
                    <h4 className="text-2xl font-black mb-3 text-white">
                      Multimodal Intelligence
                    </h4>
                    <p className="text-lg text-slate-400 font-medium leading-relaxed">
                      Speak in your mother tongue. Our Gemini engine parses
                      local dialects with clinical precision.
                    </p>
                  </div>
                </div>
                <div className="w-full h-px bg-white/5" />
                <div className="flex gap-8 group">
                  <div className="text-4xl font-black text-white/10 group-hover:text-secondary transition-colors duration-500">
                    02
                  </div>
                  <div>
                    <h4 className="text-2xl font-black mb-3 text-white">
                      Execution Reliability
                    </h4>
                    <p className="text-lg text-slate-400 font-medium leading-relaxed">
                      Cold, hard code handles your children&apos;s medical
                      timing, ensuring zero hallucination.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CLIMAX CTA */}
      <section className="relative py-64 bg-[#0F172A] overflow-hidden text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <motion.h2
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="text-7xl md:text-[10rem] font-lora font-black text-white tracking-tighter leading-[0.85] mb-16"
          >
            The future <br /> <span className="text-secondary">is yours.</span>
          </motion.h2>

          <Link
            href="/login"
            className="inline-flex items-center gap-4 bg-white text-[#0F172A] px-16 py-8 rounded-full text-3xl font-black shadow-2xl hover:scale-105 transition-all group active:scale-95"
          >
            Join Vaxi Babu
            <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
          </Link>

          <div className="mt-20 flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center gap-2 font-black text-sm tracking-widest uppercase">
              <Star fill="currentColor" size={16} className="text-secondary" />
              Top Rated Medical PWA
            </div>
            <div className="flex items-center gap-2 font-black text-sm tracking-widest uppercase">
              <Star fill="currentColor" size={16} className="text-secondary" />
              Privacy Guaranteed
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative py-20 px-6 border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
              <Activity className="text-[#0F172A]" size={24} strokeWidth={3} />
            </div>
            <span className="text-3xl font-lora font-black text-white">
              Vaxi Babu
            </span>
          </div>

          <div className="flex gap-12 text-sm font-black uppercase tracking-widest text-slate-500">
            <Link
              href="/login"
              className="hover:text-secondary transition-colors"
            >
              Safety
            </Link>
            <Link
              href="/login"
              className="hover:text-secondary transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/login"
              className="hover:text-secondary transition-colors"
            >
              Terms
            </Link>
          </div>

          <div className="text-slate-500 font-bold text-xs uppercase tracking-tighter">
            Built for the multi-sovereign world.
          </div>
        </div>
      </footer>
    </div>
  );
}
