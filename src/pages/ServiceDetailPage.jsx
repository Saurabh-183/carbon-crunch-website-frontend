import { Navigate, useParams } from "react-router-dom";
import NewsletterFooter from "../components/NewsletterFooter";
import ServiceDetailBottomCtaSection from "../components/pages/service-detail/ServiceDetailBottomCtaSection";
import ServiceDetailHeroSection from "../components/pages/service-detail/ServiceDetailHeroSection";
import ServiceModulesSection from "../components/pages/service-detail/ServiceModulesSection";
import { getServiceBySlug } from "../data/services";

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const service = getServiceBySlug(slug);

  if (!service) {
    return <Navigate to="/services" replace />;
  }

  return (
    <>
      <main>
        <ServiceDetailHeroSection service={service} />
        <ServiceModulesSection service={service} />
        <ServiceDetailBottomCtaSection />
      </main>
      <NewsletterFooter />
    </>
  );
}
