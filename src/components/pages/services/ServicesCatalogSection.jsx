import { useState } from "react";
import { Link } from "react-router-dom";
import { servicesCatalog } from "../../../data/services";

import services1_1 from "../../../assets/services/services1.1.png";
import services1_3 from "../../../assets/services/services1.3.png";
import services2_1 from "../../../assets/services/services2.1.png";
import services2_2 from "../../../assets/services/services2.2.png";
import services3_1 from "../../../assets/services/services3.1.png";
import services3_2 from "../../../assets/services/services3.2.png";
import services3_3 from "../../../assets/services/services3.3.png";
import services3_4 from "../../../assets/services/services3.4.png";
import services4_1 from "../../../assets/services/services4.1.png";
import services4_2 from "../../../assets/services/services4.2.png";
import services5_1 from "../../../assets/services/services5.1.png";
import services5_2 from "../../../assets/services/services5.2.png";
import services6_1 from "../../../assets/services/services6.1.png";
import services6_2 from "../../../assets/services/services6.2.png";
import services7_1 from "../../../assets/services/services7.1.png";
import services7_2 from "../../../assets/services/services7.2.png";
import services7_3 from "../../../assets/services/services7.3.png";

export default function ServicesCatalogSection() {
  const [activeServiceSlug, setActiveServiceSlug] = useState(servicesCatalog[0].slug);

  return (
    <section className="bg-[#ffffff] px-4 pb-20 pt-10 sm:pt-14 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1920px] xl:max-w-[92%]">
        <h2 className="text-center font-display text-[28px] font-semibold text-bark-900 sm:text-[40px] lg:text-[44px]">Consulting & Execution Services</h2>

        <div className="mt-12 grid gap-10 md:grid-cols-[1fr_1.1fr] lg:grid-cols-[1fr_1.8fr] items-start w-full max-w-[1920px] xl:max-w-[92%] mx-auto">
          <div className="w-full lg:pr-4">
            <div className="flex flex-col gap-10 md:hidden">
              {servicesCatalog.map((service) => (
                <div key={`mobile-${service.slug}`} className="relative border-b border-bark-900/10 pb-10 last:border-0 last:pb-0">
                  <h3 className="font-display text-[22px] font-bold text-bark-900 mb-5 max-w-[90%] leading-tight">{service.title}</h3>
                  <div className="overflow-hidden rounded-[16px] bg-[#f4f0eb] mb-6 shadow-sm">
                    <img src={service.image} alt={service.title} className="w-full h-[220px] object-cover" />
                  </div>
                  <ul className="space-y-3 text-[14px] text-bark-900/80 font-medium leading-relaxed pl-1 mb-6">
                    {service.teaser.map((point) => (
                      <li key={point} className="flex items-start gap-2">
                        <span className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#ee7c16]" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={`/services/${service.slug}`}
                    className="inline-flex h-[40px] items-center justify-center gap-2 rounded-full bg-[#2E251B] px-6 text-[14px] font-semibold text-white transition-all hover:bg-black shadow-md"
                  >
                    Learn more
                    <span aria-hidden="true" className="text-[14px]">
                      →
                    </span>
                  </Link>
                </div>
              ))}
            </div>

            <div className="hidden md:flex flex-col w-full">
              {servicesCatalog.map((service) => {
                const isActive = activeServiceSlug === service.slug;
                return (
                  <div key={service.slug} className="border-b border-bark-900/10 last:border-0 relative">
                    {isActive && <div className="absolute left-[-24px] top-6 bottom-6 w-[4px] bg-bark-900"></div>}
                    <button
                      onClick={() => setActiveServiceSlug(service.slug)}
                      className={`flex w-full items-center justify-between py-5 text-left font-display text-[16px] sm:text-[18px] lg:text-[19px] font-bold ${
                        isActive ? "text-bark-900" : "text-bark-900/70 hover:text-bark-900 pt-6"
                      }`}
                    >
                      <span className="max-w-[85%]">{service.title}</span>
                      <span className={`transform transition-transform duration-300 ${isActive ? "rotate-180" : "rotate-0"}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          {isActive ? <polyline points="18 15 12 9 6 15"></polyline> : <polyline points="6 9 12 15 18 9"></polyline>}
                        </svg>
                      </span>
                    </button>

                    <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                      <div className="overflow-hidden">
                        <div className="pb-6">
                          <ul className="space-y-2 text-[13px] text-bark-900/70 sm:text-[14px] font-medium leading-relaxed pl-2">
                            {service.teaser.map((point) => (
                              <li key={point} className="flex items-start gap-2">
                                <span className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-bark-900/40" />
                                {point}
                              </li>
                            ))}
                          </ul>
                          <Link
                            to={`/services/${service.slug}`}
                            className="mt-5 ml-2 inline-flex h-[36px] items-center justify-center gap-2 rounded-full bg-[#2E251B] px-5 text-[13px] font-semibold text-white transition-all hover:bg-black"
                          >
                            Learn more
                            <span aria-hidden="true" className="text-[14px]">
                              →
                            </span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative w-full rounded-[16px] md:min-h-[460px] lg:min-h-[500px] overflow-visible hidden md:block">
            {servicesCatalog.map((service, idx) => {
              const isActive = activeServiceSlug === service.slug;
              return (
                <div
                  key={`img-${service.slug}`}
                  className={`absolute inset-0 transition-opacity duration-500 rounded-[16px] overflow-visible ${isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}
                >
                  <div className="absolute inset-0 rounded-[16px] overflow-hidden -z-10 flex">
                    <div
                      className={`w-[35%] h-full transition-colors duration-500 ${
                        idx === 2 ? "bg-[#FAD994]" : idx === 3 ? "bg-[#5D7B1C]" : idx === 5 ? "bg-[#262626]" : idx === 6 ? "bg-[#D2C4A2]" : "bg-[#E5D875]"
                      }`}
                    ></div>
                    <div
                      className={`w-[65%] h-full transition-colors duration-500 ${
                        idx === 1
                          ? "bg-[#51DEED]"
                          : idx === 2
                            ? "bg-[#91B1AD]"
                            : idx === 3
                              ? "bg-[#AAD200]"
                              : idx === 4
                                ? "bg-[#9DA9C3]"
                                : idx === 5
                                  ? "bg-[#AEB0B2]"
                                  : idx === 6
                                    ? "bg-[#918063]"
                                    : "bg-[#085D48]"
                      }`}
                    ></div>
                  </div>

                  <div className="absolute top-[16%] right-0 bottom-0 left-[10%] rounded-tl-[32px] overflow-visible drop-shadow-[0_20px_20px_rgba(0,0,0,0.15)] h-[84%] bg-white rounded-br-[16px]">
                    <img src={service.image} alt={service.title} className="h-full w-full object-cover rounded-tl-[32px] rounded-br-[16px]" />
                  </div>

                  <div className="absolute top-[16%] right-0 bottom-0 left-[10%] h-[84%] pointer-events-none z-20 overflow-visible">
                    {idx === 0 && (
                      <div className="relative w-full h-full overflow-visible">
                        <div
                          className={`absolute top-[38%] -translate-y-1/2 left-[-8%] w-[68%] max-w-[300px] rounded-[16px] bg-gradient-to-br from-black/55 to-black/35 backdrop-blur-[10px] border border-white/10 p-5 shadow-2xl pointer-events-auto transform transition-all duration-700 delay-100 ${
                            isActive ? "opacity-100 translate-y-[-50%]" : "opacity-0 translate-y-[-40%]"
                          }`}
                        >
                          <div className="w-[44px] h-[44px] mb-3 flex items-center justify-center rounded-[10px] bg-[#FF6B35] transition-transform duration-500 hover:-translate-y-1.5 pointer-events-auto">
                            <img src={services1_1} alt="Rocket" className="w-[24px] h-[24px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]" />
                          </div>
                          <h4 className="text-[15px] font-bold text-white leading-snug">Track and optimize your waste footprint</h4>
                          <p className="mt-1.5 text-[11px] text-white/75 leading-relaxed font-medium">Get real-time insights across plastic, e-waste, and hazardous waste streams.</p>
                        </div>

                        <img
                          src={services1_3}
                          alt="Arrow"
                          className={`absolute bottom-[6%] right-[28%] w-[28px] h-auto z-20 transform transition-all duration-500 hover:-translate-y-1 pointer-events-auto delay-200 drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)] ${
                            isActive ? "scale-100 opacity-100" : "scale-50 opacity-0"
                          }`}
                          style={{ transform: isActive ? "scale(1) rotate(-15deg)" : "scale(0.5) rotate(-15deg)" }}
                        />

                        <div className={`absolute bottom-[10%] right-[4%] z-10 transform transition-all duration-700 delay-300 ${isActive ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0"}`}>
                          <div className="flex items-center gap-2 bg-gradient-to-r from-[#ef5122] to-[#f47b2c] py-2.5 px-5 rounded-full shadow-lg border border-white/20">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                            <span className="text-white font-bold text-[13px]">Generate EPR report</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {idx === 1 && (
                      <div className="relative w-full h-full overflow-visible">
                        <div
                          className={`absolute top-[32%] right-[-6%] w-[55%] max-w-[260px] rounded-[16px] bg-gradient-to-br from-black/55 to-black/30 backdrop-blur-[10px] border border-white/10 p-5 shadow-2xl pointer-events-auto transform transition-all duration-700 delay-100 ${
                            isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                          }`}
                        >
                          <div className="w-[42px] h-[42px] mb-3 flex items-center justify-center rounded-[10px] bg-[#51DEED]">
                            <img
                              src={services2_1}
                              alt="Drop"
                              className="w-[24px] h-[24px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-transform duration-500 hover:-translate-y-1 pointer-events-auto"
                            />
                          </div>
                          <h4 className="text-[14.5px] font-bold text-white leading-snug">Optimize water usage and ensure compliance</h4>
                          <p className="mt-1.5 text-[11px] text-white/75 leading-relaxed font-medium">From audits to recycling, manage your entire water lifecycle</p>
                        </div>

                        <div
                          className={`absolute bottom-[0%] left-[-6%] z-10 transform transition-all duration-700 delay-200 pointer-events-auto group ${
                            isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                          }`}
                        >
                          <img src={services2_2} alt="Water Metrics" className="w-[210px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-transform duration-500 group-hover:-translate-y-2" />
                        </div>
                      </div>
                    )}

                    {idx === 2 && (
                      <div className="relative w-full h-full overflow-visible">
                        <div
                          className={`absolute top-[8%] left-[-2%] w-[55%] max-w-[320px] rounded-[20px] bg-gradient-to-br from-black/60 to-black/35 backdrop-blur-[12px] border border-white/10 p-5 shadow-2xl pointer-events-auto transform transition-all duration-700 delay-100 ${
                            isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                          }`}
                        >
                          <div className="flex gap-4 items-center">
                            <div className="w-[80px] h-[80px] shrink-0 transition-transform duration-500 hover:-translate-y-1.5 pointer-events-auto">
                              <img src={services3_1} alt="85% Efficiency" className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]" />
                            </div>
                            <div>
                              <p className="text-[22px] font-bold text-yellow-400 leading-none mb-1">85 %</p>
                              <p className="text-[11px] text-white/60 mb-2">energy efficiency</p>
                              <h4 className="text-[12px] font-medium text-white leading-snug">Optimized consumption and ensured regulatory compliance</h4>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`absolute bottom-[22%] right-[1%] z-10 transform transition-all duration-700 delay-200 pointer-events-auto group ${
                            isActive ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
                          }`}
                        >
                          <img
                            src={services3_2}
                            alt="Energy insights"
                            className="w-[155px] h-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-transform duration-500 group-hover:-translate-y-2"
                          />
                        </div>

                        <div
                          className={`absolute bottom-[9%] right-[-1%] z-20 transform transition-all duration-700 delay-300 pointer-events-auto group ${
                            isActive ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0"
                          }`}
                        >
                          <div className="relative transition-transform duration-500 group-hover:-translate-y-2">
                            <img src={services3_3} alt="Energy Audit" className="w-[200px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]" />
                            <div className="absolute bottom-[-10px] left-[10px] w-[22px] h-[22px]">
                              <img src={services3_4} alt="Energy indicator" className="drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {idx === 3 && (
                      <div className="relative w-full h-full overflow-visible">
                        <div
                          className={`absolute top-[16%] left-[10%] z-20 transform transition-all duration-700 delay-100 pointer-events-auto group ${
                            isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                          }`}
                        >
                          <img
                            src={services4_1}
                            alt="Generate GHG report"
                            className="max-w-[240px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-transform duration-500 group-hover:-translate-y-2"
                          />
                        </div>

                        <img
                          src={services4_2}
                          alt="Arrow pointer"
                          className={`absolute top-[26%] left-[28%] w-[26px] h-auto z-30 transform transition-all duration-500 hover:-translate-y-1 pointer-events-auto delay-200 drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)] ${
                            isActive ? "scale-100 opacity-100 rotate-[-15deg]" : "scale-50 opacity-0 rotate-0"
                          }`}
                        />

                        <div
                          className={`absolute top-1/2 -translate-y-1/2 right-[0%] flex flex-col gap-3.5 z-20 transition-all duration-700 delay-[400ms] pointer-events-auto group ${
                            isActive ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
                          }`}
                        >
                          {[
                            { label: "Total Scope 1 Emissions", value: "520,555.28" },
                            { label: "Total Scope 2 Emissions", value: "26,746.55" },
                            { label: "Total Scope 3 Emissions", value: "15,693.25" },
                          ].map((stat, i) => (
                            <div
                              key={i}
                              className="flex bg-white/95 backdrop-blur-sm rounded-l-[12px] shadow-2xl overflow-hidden w-[160px] h-[72px] transition-transform duration-500 group-hover:-translate-x-2"
                            >
                              <div className="flex-1 p-3 flex flex-col justify-center">
                                <div className="text-[10px] font-bold text-[#007A33] leading-none mb-1.5">{stat.label}</div>
                                <div className="flex items-baseline gap-1">
                                  <span className="text-[18px] font-display font-medium text-black leading-none">{stat.value}</span>
                                </div>
                                <div className="text-[9px] text-gray-500 font-medium mt-1">tCO₂e</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {idx === 4 && (
                      <div className="relative w-full h-full overflow-visible">
                        <div
                          className={`absolute top-[6%] left-[3%] w-[62%] max-w-[300px] rounded-[16px] bg-gradient-to-br from-black/50 to-black/25 backdrop-blur-[10px] border border-white/10 p-5 shadow-2xl pointer-events-auto transform transition-all duration-700 delay-100 ${
                            isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                          }`}
                        >
                          <div className="w-[42px] h-[42px] mb-3 flex items-center justify-center rounded-[10px] bg-[#BC7B1A] transition-transform duration-500 hover:-translate-y-1.5 pointer-events-auto">
                            <img src={services5_1} alt="Net Zero" className="w-[24px] h-[24px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]" />
                          </div>
                          <h4 className="text-[15px] font-bold text-white leading-tight">Build a clear path to net zero</h4>
                          <p className="mt-1.5 text-[11px] text-white/80 leading-relaxed font-medium">Define strategy, assess risks, and drive sustainable transformation</p>
                        </div>

                        <div
                          className={`absolute bottom-[4%] left-[2%] right-[2%] z-10 transform transition-all duration-700 delay-300 pointer-events-auto group ${
                            isActive ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                          }`}
                        >
                          <img
                            src={services5_2}
                            alt="Strategy Flow"
                            className="w-full max-w-[480px] mx-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-transform duration-500 group-hover:-translate-y-2"
                          />
                        </div>
                      </div>
                    )}

                    {idx === 5 && (
                      <div className="relative w-full h-full overflow-visible">
                        <div
                          className={`absolute top-[5%] right-[4%] w-[50%] max-w-[260px] rounded-[16px] bg-black/45 backdrop-blur-[12px] border border-white/10 p-4 shadow-2xl pointer-events-auto transform transition-all duration-700 delay-100 ${
                            isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                          }`}
                        >
                          <div className="w-[42px] h-[42px] mb-2.5 flex items-center justify-center rounded-[10px] bg-[#3B82F6] transition-transform duration-500 hover:-translate-y-1.5 pointer-events-auto">
                            <img src={services6_1} alt="Training" className="w-[22px] h-[22px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]" />
                          </div>
                          <h4 className="text-[13.5px] font-bold text-white leading-snug">Build ESG expertise across your organization</h4>
                          <p className="mt-1.5 text-[10.5px] text-white/75 leading-relaxed">Upskill teams with structured training and hands-on workshops</p>
                        </div>

                        <div
                          className={`absolute bottom-[8%] left-[5%] z-20 transform transition-all duration-700 delay-300 pointer-events-auto group ${
                            isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                          }`}
                        >
                          <img
                            src={services6_2}
                            alt="Schedule training session"
                            className="max-w-[260px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-transform duration-500 group-hover:-translate-y-2"
                          />
                        </div>
                      </div>
                    )}

                    {idx === 6 && (
                      <div className="relative w-full h-full overflow-visible">
                        <div
                          className={`absolute top-[8%] left-[3%] w-[52%] max-w-[240px] rounded-[16px] bg-black/45 backdrop-blur-[10px] border border-white/10 p-4 shadow-2xl pointer-events-auto transform transition-all duration-700 delay-100 ${
                            isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                          }`}
                        >
                          <div className="w-[40px] h-[40px] mb-2.5 flex items-center justify-center rounded-full bg-[#1E40AF] transition-transform duration-500 hover:-translate-y-1.5 pointer-events-auto">
                            <img src={services7_1} alt="Verified" className="w-[20px] h-[20px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]" />
                          </div>
                          <h4 className="text-[13px] font-bold text-white leading-tight">Ensure credibility with verified sustainability data</h4>
                          <p className="mt-1.5 text-[10px] text-white/75 leading-relaxed">Get audit-ready, certified, and compliant across ESG and GHG standards</p>
                        </div>

                        <div
                          className={`absolute bottom-[0%] translate-y-[35%] left-1/2 -translate-x-1/2 z-10 flex gap-4 md:gap-6 transform transition-all duration-700 delay-300 pointer-events-auto group ${
                            isActive ? "translate-y-[35%] opacity-100" : "translate-y-[50%] opacity-0"
                          }`}
                        >
                          <img
                            src={services7_2}
                            alt="Verified"
                            className="h-[90px] md:h-[110px] w-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)] rounded-b-[12px] transition-transform duration-500 group-hover:-translate-y-3"
                          />
                          <img
                            src={services7_3}
                            alt="Certified"
                            className="h-[90px] md:h-[110px] w-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)] rounded-b-[12px] transition-transform duration-500 group-hover:-translate-y-3"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
