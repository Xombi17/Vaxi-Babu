"use client";

import { useState } from "react";
import LandingHero from "@/components/landing/LandingHero";
import LandingProblem from "@/components/landing/LandingProblem";
import LandingSolution from "@/components/landing/LandingSolution";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingGallery from "@/components/landing/LandingGallery";
import LandingCTA from "@/components/landing/LandingCTA";
import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";
import FloatingElements from "@/components/landing/FloatingElements";
import SplashScreen from "@/components/landing/SplashScreen";

export default function LandingPage() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <div className="min-h-screen bg-surface-950 text-white relative overflow-hidden bg-animate">
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      
      <div className={showSplash ? "opacity-0 invisible h-0 overflow-hidden" : "opacity-100 visible transition-opacity duration-1000"}>
        {/* Floating medical background elements */}
        <FloatingElements />
        {/* Navigation */}
        <LandingNav />
        {/* Hero Section */}
        <LandingHero />
        {/* Problem Section */}
        <LandingProblem />
        {/* Solution Section */}
        <LandingSolution />
        {/* Features Section */}
        <LandingFeatures />
        {/* Gallery Section */}
        <LandingGallery />
        {/* CTA Section */}
        <LandingCTA />
        {/* Footer */}
        <LandingFooter />
      </div>
    </div>
  );
}
