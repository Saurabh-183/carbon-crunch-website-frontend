import { motion } from "framer-motion";
import { testimonials } from "../data/content";
import SectionHeading from "./ui/SectionHeading";

const logoFiles = [
  "Frame 36917.png",
  "Frame 36918.png",
  "Frame 36919.png",
  "Frame 36920.png",
  "Frame 36921.png",
  "Frame 36922.png",
  "Frame 36923.png",
  "Frame 36924.png",
  "Frame 36925.png",
  "Frame 36926.png",
  "Frame 36927.png",
  "Frame 36928.png",
  "Frame 36929.png",
  "Frame 36930.png",
  "Frame 36931.png",
  "Frame 36932.png",
  "Frame 36933.png",
  "Frame 36934.png",
  "Frame 36935.png",
  "Frame 36936.png",
  "Frame 36937.png",
  "Frame 36938.png",
  "Frame 36939.png",
  "Frame 36940.png",
  "Frame 36941.png",
  "Frame 36942.png",
];

function getAuthorInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function TestimonialsSection() {
  const cardWidth = 440;
  const cardGap = 24;
  const slideDistance = (cardWidth + cardGap) * testimonials.length;
  // Use a predictable "randomness" by mapping logo index to testimonial index
  const loopedTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="flex min-h-[100vh] md:min-h-[789px] md:h-[789px] items-center bg-[#ffffff] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1920px] xl:max-w-[92%]">
        <SectionHeading title="Trusted By Teams That Deliver Results" />

        <div className="mt-12 overflow-hidden rounded-[32px] md:rounded-2xl bg-[#FEF1E5] p-5 pb-12 md:p-8 relative">
          <motion.div className="flex w-max gap-4 md:gap-6" animate={{ x: [0, -slideDistance] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
            {loopedTestimonials.map((testimonial, index) => {
              // Extract original index for consistent logo
              const originalIndex = index % testimonials.length;
              const logoPath = `/clients/${encodeURIComponent(logoFiles[originalIndex % logoFiles.length])}`;

              return (
                <article key={`${testimonial.author}-${index}`} className="flex min-h-[440px] w-[85vw] md:w-[440px] shrink-0 flex-col rounded-3xl bg-white p-6 md:p-8 shadow-sm">
                  {/* Client Logo at the Top */}
                  <div className="h-12 w-auto flex items-center justify-start overflow-hidden">
                    <img src={logoPath} alt={`${testimonial.company} logo`} className="h-full w-auto object-contain object-left scale-110" />
                  </div>

                  <p className="mt-5 text-[17px] md:text-[20px] leading-relaxed text-black/85 font-medium italic">“{testimonial.quote}”</p>

                  <div className="mt-8 flex items-center gap-3 text-bark-900/85">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#98e35d] text-sm font-semibold" aria-hidden="true">
                      {getAuthorInitials(testimonial.author)}
                    </div>
                    <p className="text-[15px] md:text-[17px] leading-tight">
                      <span className="font-semibold">{testimonial.author}</span> - {testimonial.role}
                    </p>
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-4 md:gap-6 border-t border-bark-900/12 pt-6">
                    {testimonial.metrics.map((metric) => (
                      <div key={metric.label}>
                        <p className="font-display text-[26px] md:text-[34px] font-bold leading-none text-black">{metric.value}</p>
                        <p className="mt-2 text-[12px] md:text-[14px] leading-snug text-black/70 min-h-[2.5em]">{metric.label}</p>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </motion.div>

          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 md:hidden">
            <div className="w-2.5 h-2.5 rounded-full bg-[#f07e00]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#f07e00]/30"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#f07e00]/30"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#f07e00]/30"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
