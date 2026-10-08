import { useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../Navbar";
import { navLinks } from "../../../data/content";
import aboutHeroSrc from "../../../assets/images_dir/about.png";
import aboutUsHeroBg from "../../../assets/images_dir/aboutushero.png";

export default function AboutHeroSection() {
  const heroSectionRef = useRef(null);

  return (
    <section ref={heroSectionRef} className="relative min-h-[500px] sm:min-h-[600px] overflow-hidden bg-[#0A0A0A] pb-16 sm:pb-20">
      <img src={aboutUsHeroBg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-screen" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/40" />
      <Navbar links={navLinks} whiteHeaderTriggerRef={heroSectionRef} />

      <div className="relative z-10 mx-auto grid w-full max-w-[1920px] xl:max-w-[92%] items-center gap-8 sm:gap-10 px-4 sm:px-6 pb-4 pt-24 sm:pt-28 lg:grid-cols-[1.1fr_1fr] lg:px-12">
        <div className="pb-12 text-white">
          <h1 className="font-display text-[36px] font-semibold leading-[1.05] sm:text-[60px] lg:text-[72px]">About Us</h1>
          <p className="mt-6 max-w-[500px] text-[16px] leading-relaxed text-white/90 sm:text-[18px]">
            Effective and AI-driven ESG Workflows for the enterprise.
            <br />
            Unify data, empower teams, and drive impact.
          </p>
          <div className="mt-8 sm:mt-10">
            <Link
              to="/book-demo"
              className="group inline-flex items-center gap-3 sm:gap-4 bg-[#F27A18] text-white rounded-full pl-6 sm:pl-8 pr-2 sm:pr-2.5 py-2 sm:py-2.5 hover:bg-[#D96B12] shadow-lg transition-all duration-300"
            >
              <span className="text-[15px] sm:text-[17px] font-semibold">Schedule a Demo</span>
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-white text-[#F27A18] rounded-full flex items-center justify-center transition-transform duration-300 group-hover:rotate-45 shrink-0 shadow-sm">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[560px] lg:max-w-full">
          <div className="overflow-hidden rounded-[20px] sm:rounded-[24px] bg-[#d3d3d3] shadow-2xl h-[260px] sm:h-[340px] md:h-[400px] lg:h-[420px] transition-transform duration-700 hover:-translate-y-2 group">
            <img src={aboutHeroSrc} alt="About Carbon Crunch" className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0" />
          </div>
        </div>
      </div>
    </section>
  );
}
