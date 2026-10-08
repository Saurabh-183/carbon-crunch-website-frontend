import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import StatsStrip from "../components/StatsStrip";
import LogoStrip from "../components/LogoStrip";
import ProcessSection from "../components/ProcessSection";
import SolutionsSection from "../components/SolutionsSection";
import TestimonialsSection from "../components/TestimonialsSection";
import CtaBanner from "../components/CtaBanner";
import FaqSection from "../components/FaqSection";
import NewsletterFooter from "../components/NewsletterFooter";
import { navLinks } from "../data/content";

export default function HomePage() {
  return (
    <>
      <main>
        <div className="relative">
          <Navbar links={navLinks} />
          <HeroSection />
        </div>
        <StatsStrip />
        <LogoStrip />
        <ProcessSection />
        <SolutionsSection />
        <TestimonialsSection />
        <CtaBanner />
        <FaqSection />
      </main>
      <NewsletterFooter />
    </>
  );
}
