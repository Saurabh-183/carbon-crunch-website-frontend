import NewsletterFooter from "../components/NewsletterFooter";
import AboutApproachSection from "../components/pages/about/AboutApproachSection";
import AboutBottomCtaSection from "../components/pages/about/AboutBottomCtaSection";
import AboutCertificationsSection from "../components/pages/about/AboutCertificationsSection";
import AboutHeroSection from "../components/pages/about/AboutHeroSection";
import AboutJoinTeamSection from "../components/pages/about/AboutJoinTeamSection";
import AboutMetricsSection from "../components/pages/about/AboutMetricsSection";
import AboutRealImpactSection from "../components/pages/about/AboutRealImpactSection";
import AboutStoryTimelineSection from "../components/pages/about/AboutStoryTimelineSection";

export default function AboutPage() {
  return (
    <>
      <main>
        <AboutHeroSection />
        <AboutApproachSection />
        <AboutMetricsSection />
        <AboutStoryTimelineSection />
        <AboutCertificationsSection />
        <AboutRealImpactSection />
        <AboutJoinTeamSection />
        <AboutBottomCtaSection />
      </main>
      <NewsletterFooter />
    </>
  );
}
