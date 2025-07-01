'use client';

import MainHeader from './components/MainHeader';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <MainHeader />
      <HeroSection />
      <FeaturesSection />
    </div>
  );
}
