import NewsletterFooter from "../components/NewsletterFooter";
import BrsrBottomCtaSection from "../components/pages/brsr/BrsrBottomCtaSection";
import BrsrCapabilitiesSection from "../components/pages/brsr/BrsrCapabilitiesSection";
import BrsrHeroSection from "../components/pages/brsr/BrsrHeroSection";
import BrsrImpactSection from "../components/pages/brsr/BrsrImpactSection";
import BrsrTestimonialsSection from "../components/pages/brsr/BrsrTestimonialsSection";

export default function BrsrPage() {
  return (
    <>
      <main>
        <BrsrHeroSection />
        <BrsrCapabilitiesSection />
        <BrsrImpactSection />
        <BrsrTestimonialsSection />
        <BrsrBottomCtaSection />
      </main>
      <NewsletterFooter />
    </>
  );
}
