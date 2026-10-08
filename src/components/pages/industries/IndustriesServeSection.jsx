import { useState } from "react";
import { industries } from "./industriesData";

export default function IndustriesServeSection() {
  const [activeIndustry, setActiveIndustry] = useState(industries[0]);

  return (
    <section className="bg-[white] px-4 pb-10 pt-14 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1920px] xl:max-w-[92%]">
        <h2 className="text-center font-display text-[26px] font-semibold leading-tight text-bark-900 sm:text-[44px] md:text-[48px] mb-10 sm:mb-14">Industries We Serve</h2>

        <div className="hidden md:grid md:grid-cols-[1fr_1.1fr] lg:grid-cols-[1fr_1.35fr] gap-6 xl:gap-8">
          <div className="grid grid-cols-2 gap-4">
            {industries.map((ind) => {
              const isActive = activeIndustry.title === ind.title;
              return (
                <button
                  key={ind.title}
                  onClick={() => setActiveIndustry(ind)}
                  className={`flex flex-col items-center justify-center p-4 sm:p-6 md:p-7 rounded-[12px] sm:rounded-[16px] transition-all duration-200 border ${
                    isActive ? "bg-[#332A1F] text-white border-[#332A1F] shadow-lg" : "bg-white text-[#949494] border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:border-gray-200"
                  }`}
                >
                  <div className={`mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full ${isActive ? "bg-white" : "bg-[#F9F9F9]"}`}>
                    <img src={ind.icon} alt={ind.title} className={`h-12 w-12 sm:h-16 sm:w-16 object-contain ${isActive ? "grayscale-0" : "grayscale"}`} />
                  </div>
                  <span className={`text-[13px] sm:text-[14px] font-semibold tracking-wide ${isActive ? "text-white" : "text-[#A0A0A0]"}`}>{ind.title}</span>
                </button>
              );
            })}
          </div>

          <div className="relative min-h-[300px] sm:min-h-[420px] lg:min-h-full overflow-hidden rounded-[20px] sm:rounded-[24px] flex flex-col justify-end group mt-6 lg:mt-0">
            <img src={activeIndustry.image} alt={activeIndustry.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2c2216]/95 via-[#2c2216]/60 to-transparent" />

            <div className="relative p-8 md:p-12 z-10 w-full">
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight">{activeIndustry.title}</h3>
              <p className="text-[17px] sm:text-[19px] text-white/80 mb-8 max-w-xl leading-[1.6]">{activeIndustry.text}</p>
              <a
                href="/book-demo"
                className="inline-flex items-center gap-2 sm:gap-3 rounded-full bg-[#EC7D17] pl-5 sm:pl-6 pr-1.5 sm:pr-2 py-1.5 sm:py-2 text-[14px] sm:text-[16px] font-semibold text-white transition hover:bg-[#d66f12]"
              >
                Schedule a Demo
                <span className="w-9 h-9 bg-white text-[#F27A18] rounded-full flex items-center justify-center transition-transform duration-300 group-hover:rotate-45 shrink-0 shadow-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </span>
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 md:hidden">
          {industries.map((ind) => (
            <div key={`mobile-${ind.title}`} className="relative min-h-[360px] overflow-hidden rounded-[20px] flex flex-col justify-end group shadow-md border border-bark-900/5">
              <img src={ind.image} alt={ind.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2c2216]/98 via-[#2c2216]/70 to-transparent" />

              <div className="relative p-7 z-10 w-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                    <img src={ind.icon} alt="" className="h-6 w-6 object-contain brightness-0 invert" />
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">{ind.title}</h3>
                </div>
                <p className="text-[15px] text-white/80 mb-6 leading-[1.6]">{ind.text}</p>
                <a
                  href="/book-demo"
                  className="inline-flex h-[40px] items-center gap-2 rounded-full bg-[#EC7D17] pl-5 pr-1.5 py-1 text-[13px] font-bold text-white transition-all hover:bg-[#d66f12] shadow-lg"
                >
                  Schedule a Demo
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#EC7D17]">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17l10-10M17 17V7H7" />
                    </svg>
                  </span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
