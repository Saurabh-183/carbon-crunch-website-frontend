import NewsletterFooter from "../components/NewsletterFooter";
import BookDemoFormSection from "../components/pages/book-demo/BookDemoFormSection";
import BookDemoHeroSection from "../components/pages/book-demo/BookDemoHeroSection";
import SupportCardsSection from "../components/pages/shared/SupportCardsSection";

export default function BookDemoPage() {
  return (
    <>
      <main className="bg-[#ffffff]">
        <BookDemoHeroSection />
        <BookDemoFormSection />
        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <SupportCardsSection heading="Need Immediate Assistance?" subheading="Reach out to our team for quick support, product queries, or demo scheduling." maxWidthClass="max-w-[260px]" />
        </section>
      </main>
      <NewsletterFooter />
    </>
  );
}
