"use client";
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Mic,
  Volume2,
  ChevronRight,
  Heart,
  Shield,
  FileX,
  Brain,
  Bell,
  Smartphone,
  Calendar,
  WifiOff,
  Globe,
  Users,
  CalendarClock,
  Mic2,
  BookOpen,
  BellRing,
  UserPlus,
  CalendarCheck,
  ArrowRight,
} from "lucide-react";
import VoiceWaveform from "@/components/VoiceWaveform";

function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-950 text-white">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-surface-950/80 backdrop-blur-xl border-b border-white/[0.04]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <img
              src="/images/logo-icon.png"
              alt=""
              className="w-8 h-8 rounded-lg"
            />
            <span className="font-heading font-800 text-lg text-white">
              Vaxi<span className="text-teal-400">Babu</span>
              <span className="text-teal-300 text-xs ml-0.5"></span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {["Problem", "Solution", "Features", "How It Works"].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase().replace(/ /g, "-")}`}
                className="text-sm text-white/40 hover:text-teal-400 transition-colors"
              >
                {l}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <VoiceWaveform bars={3} size="sm" color="bg-teal-500" />
            <Link
              href="/login"
              className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-surface-950 font-heading font-700 text-sm rounded-xl transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-surface-900 via-surface-950 to-surface-900" />
          <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-teal-500/[0.06] rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-navy-600/[0.06] rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #20dfc8 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-xl"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full mb-6">
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-teal-300">
                  Voice-First Healthcare
                </span>
              </div>
              <h1 className="font-heading font-800 text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.1] mb-5">
                Your family's{" "}
                <span className="gradient-text">health memory</span>, always
                listening
              </h1>
              <p className="text-lg text-white/45 leading-relaxed mb-8">
                Vaxi Babu remembers every vaccination, every checkup, every
                milestone \u2014 so you don't have to. Just speak.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link
                  href="/login"
                  className="group inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-teal-500 hover:bg-teal-400 text-surface-950 font-heading font-700 rounded-2xl transition-all hover:shadow-xl hover:shadow-teal-500/20"
                >
                  <Mic size={18} /> Try Voice Demo{" "}
                  <ChevronRight
                    size={16}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-white/[0.06] hover:bg-white/[0.1] font-heading font-700 rounded-2xl border border-white/[0.1] transition-all"
                >
                  See How It Works
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/35">
                <div className="flex items-center gap-1.5">
                  <Shield size={14} className="text-teal-400" />
                  <span>No diagnosis</span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center gap-1.5">
                  <Heart size={14} className="text-coral-400" />
                  <span>Family-centered</span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center gap-1.5">
                  <Volume2 size={14} className="text-teal-400" />
                  <span>Works offline</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="relative flex justify-center"
            >
              <motion.div
                className="absolute -top-4 left-4 z-10"
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <div className="bg-surface-800/90 backdrop-blur-sm rounded-2xl border border-white/[0.08] px-4 py-3 flex items-center gap-3 shadow-lg">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/15 flex items-center justify-center">
                    <Volume2 size={16} className="text-teal-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white/80">
                      Reminder
                    </p>
                    <p className="text-[11px] text-white/35">
                      Aarav's polio vaccine in 3 days
                    </p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                className="absolute -bottom-2 right-4 z-10"
                animate={{ y: [5, -5, 5] }}
                transition={{ duration: 4.5, repeat: Infinity, delay: 1 }}
              >
                <div className="bg-surface-800/90 backdrop-blur-sm rounded-2xl border border-white/[0.08] px-4 py-3 flex items-center gap-3 shadow-lg">
                  <div className="w-9 h-9 rounded-xl bg-sage-500/15 flex items-center justify-center">
                    <Heart size={16} className="text-sage-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white/80">
                      All caught up!
                    </p>
                    <p className="text-[11px] text-white/35">
                      Vaccinations up to date \u2713
                    </p>
                  </div>
                </div>
              </motion.div>
              <div className="relative w-[280px]">
                <div className="absolute -inset-6 bg-teal-500/[0.05] rounded-full blur-3xl" />
                <div className="relative bg-surface-700 rounded-[2.5rem] p-3 shadow-2xl border border-white/[0.08]">
                  <div className="bg-surface-900 rounded-[2rem] overflow-hidden">
                    <div className="px-5 pt-5 pb-4">
                      <div className="flex items-center gap-2 mb-4">
                        <img
                          src="/images/logo-icon.png"
                          alt=""
                          className="w-6 h-6 rounded-lg"
                        />
                        <span className="font-heading font-700 text-xs text-white">
                          Vaxi Babu
                        </span>
                      </div>
                      <div className="bg-teal-500/10 border border-teal-500/15 rounded-xl p-3 mb-3">
                        <p className="text-xs font-medium text-white/80 mb-0.5">
                          Good morning, Priya \ud83d\udc4b
                        </p>
                        <p className="text-[11px] text-white/35">
                          Aarav has 1 upcoming vaccine.
                        </p>
                      </div>
                      <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 mb-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center">
                            <Volume2 size={8} className="text-white" />
                          </div>
                          <span className="text-[10px] text-teal-400">
                            Speaking...
                          </span>
                        </div>
                        <p className="text-[11px] text-white/40 leading-relaxed">
                          "OPV-3 polio vaccine due June 28th. Shall I remind
                          you?"
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                          <span className="text-[11px] text-white/50">
                            OPV-3 Polio
                          </span>
                          <span className="text-[10px] text-coral-400 ml-auto">
                            3 days
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-sage-400" />
                          <span className="text-[11px] text-white/50">
                            Measles-1
                          </span>
                          <span className="text-[10px] text-white/20 ml-auto">
                            2 months
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="px-5 pb-5">
                      <div className="flex items-center gap-2.5 bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-2.5">
                        <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
                          <Mic size={12} className="text-white" />
                        </div>
                        <VoiceWaveform bars={6} size="sm" color="bg-teal-400" />
                        <span className="text-[10px] text-white/25 ml-auto">
                          Listening...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section id="problem" className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-950 via-surface-900 to-surface-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section className="max-w-2xl mx-auto text-center mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-coral-500/10 border border-coral-500/20 rounded-full text-xs font-medium text-coral-400 mb-5">
              The Challenge
            </span>
            <h2 className="font-heading font-800 text-3xl sm:text-4xl leading-tight mb-4">
              Families shouldn't fight{" "}
              <span className="text-coral-400">to remember</span>
            </h2>
            <p className="text-lg text-white/35">
              Preventive healthcare fails not because families don't care \u2014
              but because systems aren't built for them.
            </p>
          </Section>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: FileX,
                title: "Lost Records",
                desc: "Health cards get lost or damaged",
                color: "coral",
              },
              {
                icon: Brain,
                title: "Literacy Barriers",
                desc: "Apps assume users can read & navigate",
                color: "warm",
              },
              {
                icon: Bell,
                title: "Missed Vaccines",
                desc: "No clear reminders for critical windows",
                color: "navy",
              },
              {
                icon: Smartphone,
                title: "No Connectivity",
                desc: "Cloud apps fail in rural areas",
                color: "sage",
              },
            ].map((p, i) => (
              <Section key={i}>
                <div
                  className={`p-5 rounded-2xl bg-surface-800/40 border border-white/[0.06] hover:bg-surface-800/60 transition-all`}
                >
                  <p.icon size={22} className={`text-${p.color}-400 mb-3`} />
                  <h3 className="font-heading font-700 text-sm text-white mb-1">
                    {p.title}
                  </h3>
                  <p className="text-xs text-white/35">{p.desc}</p>
                </div>
              </Section>
            ))}
          </div>
          <Section className="mt-10">
            <div className="bg-surface-800/50 border border-white/[0.06] rounded-2xl p-6 grid sm:grid-cols-3 gap-6 sm:divide-x divide-white/[0.06]">
              {[
                { s: "23M", l: "Children miss vaccines yearly" },
                { s: "60%", l: "Rural records are paper-based" },
                { s: "1 in 5", l: "Children under-vaccinated" },
              ].map((d, i) => (
                <div key={i} className="text-center">
                  <p className="font-heading font-800 text-2xl text-teal-400">
                    {d.s}
                  </p>
                  <p className="text-xs text-white/30 mt-1">{d.l}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* Solution */}
      <section id="solution" className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-950 via-surface-850 to-surface-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section className="max-w-2xl mx-auto text-center mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-full text-xs font-medium text-teal-400 mb-5">
              The Solution
            </span>
            <h2 className="font-heading font-800 text-3xl sm:text-4xl leading-tight mb-4">
              A health assistant that{" "}
              <span className="gradient-text">speaks your language</span>
            </h2>
            <p className="text-lg text-white/35">
              Just talk to it \u2014 no reading, no typing, no complicated
              menus.
            </p>
          </Section>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Mic,
                t: "Voice-First",
                d: "Ask & hear in natural language",
                c: "teal",
              },
              {
                icon: Calendar,
                t: "Auto Timeline",
                d: "DOB-based health schedules",
                c: "navy",
              },
              {
                icon: Globe,
                t: "Local Languages",
                d: "Hindi, Marathi, Tamil & more",
                c: "sage",
              },
              {
                icon: WifiOff,
                t: "Offline-First",
                d: "Works without internet",
                c: "warm",
              },
            ].map((s, i) => (
              <Section key={i}>
                <div className="p-5 rounded-2xl bg-surface-800/40 border border-white/[0.06] hover:border-teal-500/15 transition-all">
                  <div
                    className={`w-10 h-10 rounded-xl bg-${s.c}-500 flex items-center justify-center mb-3`}
                  >
                    <s.icon size={18} className="text-white" />
                  </div>
                  <h3 className="font-heading font-700 text-sm text-white mb-1">
                    {s.t}
                  </h3>
                  <p className="text-xs text-white/35">{s.d}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 relative">
        <div className="absolute inset-0 bg-surface-950" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #20dfc8 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section className="max-w-2xl mx-auto text-center mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-full text-xs font-medium text-teal-400 mb-5">
              Features
            </span>
            <h2 className="font-heading font-800 text-3xl sm:text-4xl leading-tight mb-4">
              Everything a family needs,{" "}
              <span className="text-teal-400">nothing they don't</span>
            </h2>
          </Section>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Users,
                t: "Household Onboarding",
                g: "from-teal-500 to-teal-600",
              },
              {
                icon: CalendarClock,
                t: "Auto Health Timeline",
                g: "from-navy-500 to-navy-600",
              },
              {
                icon: Mic2,
                t: "Voice Interaction",
                g: "from-sage-500 to-sage-600",
              },
              {
                icon: BookOpen,
                t: "Simple Explanations",
                g: "from-warm-500 to-warm-600",
              },
              {
                icon: BellRing,
                t: "Smart Reminders",
                g: "from-coral-500 to-coral-600",
              },
              {
                icon: WifiOff,
                t: "Offline Support",
                g: "from-teal-600 to-navy-600",
              },
            ].map((f, i) => (
              <Section key={i}>
                <div className="bg-surface-800/40 border border-white/[0.06] rounded-2xl p-5 hover:border-teal-500/15 transition-all">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.g} flex items-center justify-center mb-3`}
                  >
                    <f.icon size={20} className="text-white" />
                  </div>
                  <h3 className="font-heading font-700 text-sm text-white">
                    {f.t}
                  </h3>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-950 via-surface-900 to-surface-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section className="max-w-2xl mx-auto text-center mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-sage-500/10 border border-sage-500/20 rounded-full text-xs font-medium text-sage-400 mb-5">
              How It Works
            </span>
            <h2 className="font-heading font-800 text-3xl sm:text-4xl leading-tight mb-4">
              Four steps to <span className="text-sage-400">peace of mind</span>
            </h2>
          </Section>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: UserPlus, n: "01", t: "Set Up Family", c: "teal" },
              { icon: CalendarCheck, n: "02", t: "Get Timeline", c: "navy" },
              { icon: Mic, n: "03", t: "Ask by Voice", c: "sage" },
              { icon: Bell, n: "04", t: "Stay on Track", c: "warm" },
            ].map((s, i) => (
              <Section key={i} className="text-center">
                <div className="relative inline-flex mb-4">
                  <div
                    className={`w-20 h-20 rounded-2xl bg-${s.c}-500/10 border border-${s.c}-500/20 flex items-center justify-center`}
                  >
                    <s.icon size={28} className={`text-${s.c}-400`} />
                  </div>
                  <span
                    className={`absolute -top-2 -right-2 w-7 h-7 bg-${s.c}-500 rounded-lg flex items-center justify-center text-white text-xs font-heading font-700`}
                  >
                    {s.n}
                  </span>
                </div>
                <h3 className="font-heading font-700 text-white">{s.t}</h3>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-surface-950" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/[0.04] via-surface-950 to-surface-950" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <Section>
            <div className="relative inline-flex mb-6">
              <div className="w-16 h-16 rounded-full bg-teal-500/15 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
                  <Mic size={18} className="text-white" />
                </div>
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-teal-400/20 pulse-ring" />
            </div>
            <h2 className="font-heading font-800 text-3xl sm:text-4xl leading-tight mb-4">
              Ready for a <span className="text-teal-400">health memory</span>{" "}
              that never forgets?
            </h2>
            <p className="text-white/35 mb-8">
              Join families using Vaxi Babu to stay on top of their children's
              health.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-teal-500 hover:bg-teal-400 text-surface-950 font-heading font-700 rounded-2xl transition-all hover:shadow-xl hover:shadow-teal-500/20"
            >
              Get Started Free <ArrowRight size={18} />
            </Link>
            <p className="mt-6 text-xs text-white/20">
              Free \u00b7 No credit card \u00b7 Works on any phone
            </p>
          </Section>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/images/logo-icon.png"
              alt=""
              className="w-6 h-6 rounded-lg"
            />
            <span className="font-heading font-700 text-sm text-white">
              Vaxi Babu
            </span>
          </div>
          <p className="text-xs text-white/20">
            \u00a9 2025 Vaxi Babu. Made with{" "}
            <Heart size={10} className="inline text-coral-500 fill-coral-500" />{" "}
            for families everywhere.
          </p>
        </div>
      </footer>
    </div>
  );
}
