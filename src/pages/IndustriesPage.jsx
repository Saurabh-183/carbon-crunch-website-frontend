import NewsletterFooter from "../components/NewsletterFooter";
import IndustriesBottomCtaSection from "../components/pages/industries/IndustriesBottomCtaSection";
import IndustriesCapabilitiesSection from "../components/pages/industries/IndustriesCapabilitiesSection";
import IndustriesHeroSection from "../components/pages/industries/IndustriesHeroSection";
import IndustriesServeSection from "../components/pages/industries/IndustriesServeSection";

export default function IndustriesPage() {
  return (
    <>
      <main>
        <IndustriesHeroSection />
        <IndustriesServeSection />
        <IndustriesCapabilitiesSection />
        <IndustriesBottomCtaSection />
      </main>
      <NewsletterFooter />
    </>
  );
}
