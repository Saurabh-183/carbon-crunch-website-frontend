import NewsletterFooter from "../components/NewsletterFooter";
import CaseStudiesBottomCtaSection from "../components/pages/case-studies/CaseStudiesBottomCtaSection";
import CaseStudiesComingSoonSection from "../components/pages/case-studies/CaseStudiesComingSoonSection";
import CaseStudiesHeroSection from "../components/pages/case-studies/CaseStudiesHeroSection";

export default function CaseStudiesPage() {
  return (
    <>
      <main>
        <CaseStudiesHeroSection />
        <CaseStudiesComingSoonSection />
        <CaseStudiesBottomCtaSection />
      </main>
      <NewsletterFooter />
    </>
  );
}
