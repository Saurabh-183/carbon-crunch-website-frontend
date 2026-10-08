import NewsletterFooter from "../components/NewsletterFooter";
import ContactFormSection from "../components/pages/contact/ContactFormSection";
import ContactHeroSection from "../components/pages/contact/ContactHeroSection";
import SupportCardsSection from "../components/pages/shared/SupportCardsSection";

export default function ContactPage() {
  return (
    <>
      <main className="bg-[#ffffff]">
        <ContactHeroSection />
        <ContactFormSection />
        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <SupportCardsSection heading="Need Immediate Assistance?" subheading="Reach out to our team for quick support, product queries, or onboarding help." maxWidthClass="max-w-[280px]" />
        </section>
      </main>
      <NewsletterFooter />
    </>
  );
}
