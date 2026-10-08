import { useEffect } from 'react';
import NewsletterFooter from "../components/NewsletterFooter";
import CarbonOsBottomCtaSection from "../components/pages/carbon-os/CarbonOsBottomCtaSection";
import CarbonOsCapabilitiesSection from "../components/pages/carbon-os/CarbonOsCapabilitiesSection";
import CarbonOsHeroSection from "../components/pages/carbon-os/CarbonOsHeroSection";
import CarbonOsImpactSection from "../components/pages/carbon-os/CarbonOsImpactSection";
import CarbonOsTestimonialsSection from "../components/pages/carbon-os/CarbonOsTestimonialsSection";
import GHGCalculator from "../components/GHGCalculator";
import { useLocation } from 'react-router-dom';

export default function CarbonOsPage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const element = document.getElementById(location.hash.replace('#', ''));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300); // small delay to allow DOM/React to render first
    }
  }, [location]);
  return (
    <>
      <main>
        <CarbonOsHeroSection />
        <section id="calculator" className="bg-white dark:bg-slate-900 py-12 border-t border-gray-200 dark:border-slate-800">
          <GHGCalculator />
        </section>
        <CarbonOsCapabilitiesSection />
        <CarbonOsImpactSection />
        <CarbonOsTestimonialsSection />
        <CarbonOsBottomCtaSection />
      </main>
      <NewsletterFooter />
    </>
  );
}
