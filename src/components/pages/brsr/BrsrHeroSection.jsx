import { Link } from "react-router-dom";
import Navbar from "../../Navbar";
import { navLinks } from "../../../data/content";
import heroBg from "../../../assets/brsr/hero.jpg";
import brsrDash from "../../../assets/dash.png";
import dataCollectionImg from "../../../assets/brsr/data-collection.png";
import brsrInfo1 from "../../../assets/images_dir/brsr.png";

export default function BrsrHeroSection() {
  return (
    <section className="relative min-h-[660px] overflow-hidden bg-bark-900 pb-20">
      <img src={heroBg} alt="BRSR hero" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#17110C]/80 via-[#17110C]/60 to-transparent" />
      <Navbar links={navLinks} />

      <div className="relative z-10 mx-auto grid w-full max-w-[1920px] xl:max-w-[92%] gap-10 px-6 pb-4 pt-28 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:px-12">
        <div className="text-white mt-8 lg:mt-0">
          <h1 className="font-display text-[42px] font-semibold leading-[1.05] sm:text-[54px] lg:text-[64px] drop-shadow-md">
            BRSR + GRI Reporting <br className="hidden md:block" /> for ESG Leadership
          </h1>
          <p className="mt-6 max-w-[500px] text-[16px] leading-relaxed text-white/90 sm:text-[18px]">
            Designed for ESG boards and leadership teams to drive compliant, consistent, and decision-ready disclosures.
          </p>

          <div className="mt-10 flex flex-col items-start gap-8">
            <Link to="/book-demo" className="group inline-flex items-center gap-4 bg-[#F27A18] text-white rounded-full pl-6 pr-2 py-2 hover:bg-[#D96B12] shadow-lg transition-all duration-300">
              <span className="text-[17px] font-semibold">Schedule a Demo</span>
              <div className="w-11 h-11 bg-white text-[#F27A18] rounded-full flex items-center justify-center transition-transform duration-300 group-hover:rotate-45 shrink-0 shadow-sm">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>
            </Link>

            <img src={brsrInfo1} alt="100% Framework Alignment" className="w-[85%] max-w-[380px] drop-shadow-md lg:mt-4" />
          </div>
        </div>

        <div className="relative mx-auto w-full lg:w-[680px] lg:ml-auto">
          <div className="rounded-[20px] bg-white/10 p-2 md:p-3 shadow-2xl backdrop-blur-md border border-white/20">
            <div className="overflow-hidden rounded-2xl bg-[#F4F6F8]">
              <img src={brsrDash} alt="BRSR dashboard" className="block w-full" loading="lazy" />
            </div>
          </div>
          <img src={dataCollectionImg} alt="3× Faster Data Collection" className="absolute -top-10 -right-8 w-[220px] md:w-[280px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] hidden sm:block z-20" />
        </div>
      </div>
    </section>
  );
}
