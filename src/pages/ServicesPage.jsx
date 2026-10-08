import NewsletterFooter from "../components/NewsletterFooter";
import ServicesBottomCtaSection from "../components/pages/services/ServicesBottomCtaSection";
import ServicesCatalogSection from "../components/pages/services/ServicesCatalogSection";
import ServicesHeroSection from "../components/pages/services/ServicesHeroSection";

export default function ServicesPage() {
  return (
    <>
      <main>
        <ServicesHeroSection />
        <ServicesCatalogSection />
        <ServicesBottomCtaSection />
      </main>
      <NewsletterFooter />
    </>
  );
}
