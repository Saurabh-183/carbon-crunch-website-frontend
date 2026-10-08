import { useEffect, useState } from "react";

const impactSlides = [
  [
    { value: "70%", text: "Reduction in emissions data collection time", color: "text-[#ff6f6f]", trend: "↓" },
    { value: "98%", text: "Accuracy in carbon calculations", color: "text-[#9de06e]", trend: "↑" },
    { value: "85%", text: "Reduction in manual emissions tracking", color: "text-[#ff6f6f]", trend: "↓" },
  ],
  [
    { value: "56%", text: "Faster data collection across teams", color: "text-[#ff6f6f]", trend: "↓" },
    { value: "95%", text: "Improvement in reporting consistency", color: "text-[#9de06e]", trend: "↑" },
    { value: "2X", text: "Faster report generation", color: "text-[#9de06e]", trend: "↑" },
  ],
  [
    { value: "50%", text: "Reduction in compliance overhead", color: "text-[#ff6f6f]", trend: "↓" },
    { value: "90%", text: "Visibility across plants and locations", color: "text-[#9de06e]", trend: "↑" },
    { value: "100%", text: "Audit-ready disclosures", color: "text-[#9de06e]", trend: "" },
  ],
];

export default function CarbonOsImpactSection() {
  const [impactSlide, setImpactSlide] = useState(0);
  const [slideVisible, setSlideVisible] = useState(true);

  useEffect(() => {
    const impactInterval = setInterval(() => {
      setSlideVisible(false);
      setTimeout(() => {
        setImpactSlide((s) => (s + 1) % impactSlides.length);
        setSlideVisible(true);
      }, 300);
    }, 4000);

    return () => clearInterval(impactInterval);
  }, []);

  return (
    <section className="bg-white px-4 pt-40 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1920px] xl:max-w-[92%]">
        <div className="text-center">
          <h2 className="font-display text-[36px] font-semibold text-[#261E14] sm:text-[44px] lg:text-[54px] leading-tight">Measurable Impact In Carbon Accounting</h2>
          <p className="mt-5 text-[16px] text-[#261E14]/70 sm:text-[18px]">Turn emissions data into accurate, compliant carbon reporting.</p>
        </div>

        <section className="mt-12 rounded-[32px] bg-[#2E2419] p-8 sm:p-14 overflow-hidden drop-shadow-xl">
          <h3 className="text-center font-display text-[26px] font-semibold text-white sm:text-[34px] lg:text-[38px] drop-shadow-md">Increase ESG Clarity. Reduce Compliance Risk.</h3>
          <div key={impactSlide} className={`mt-10 grid gap-6 md:grid-cols-3 transition-opacity duration-700 ${slideVisible ? "opacity-100" : "opacity-0"}`}>
            {impactSlides[impactSlide].map((stat, i) => (
              <div key={i} className="rounded-2xl bg-[#3D3225] px-6 py-10 text-center shadow-[0_20px_40px_rgba(0,0,0,0.25)] border border-white/10 transition-transform hover:-translate-y-1">
                <p className="text-[44px] font-bold leading-none md:text-[56px] text-white flex justify-center items-center gap-2 drop-shadow-sm">
                  <span className={stat.color}>{stat.value}</span>
                  {stat.trend && <span className={`text-[32px] md:text-[40px] ${stat.color}`}>{stat.trend}</span>}
                </p>
                <p className="mt-4 text-[15px] leading-relaxed text-white/85 max-w-[200px] mx-auto">{stat.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex items-center justify-center gap-3">
            {impactSlides.map((_, index) => (
              <button
                type="button"
                key={`dot-${index}`}
                onClick={() => setImpactSlide(index)}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${impactSlide === index ? "bg-white" : "bg-white/30"}`}
                aria-label={`Show impact slide ${index + 1}`}
              />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
