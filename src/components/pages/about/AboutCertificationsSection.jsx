import { certifications } from "./aboutData";

export default function AboutCertificationsSection() {
  return (
    <div className="py-16 text-center bg-white">
      <h2 className="font-display text-[32px] font-semibold text-[#261E14] sm:text-[40px] lg:text-[48px]">Our Certifications</h2>
      <section aria-label="Certifications marquee" className="relative left-1/2 mt-10 flex h-[160px] w-screen -translate-x-1/2 items-center py-4">
        <div className="logo-marquee client-marquee mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="client-track">
            {[...certifications, ...certifications].map((cert, index) => (
              <img
                key={`${cert.alt}-${index}`}
                src={cert.src}
                alt={cert.alt}
                className="w-[180px] md:w-[220px] lg:w-[240px] shrink-0 h-[80px] md:h-[100px] object-contain hover:opacity-90 transition-opacity"
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
