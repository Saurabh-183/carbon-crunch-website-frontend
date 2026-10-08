import { Link } from "react-router-dom";
import Navbar from "../../Navbar";
import { navLinks } from "../../../data/content";
import cosHero from "../../../assets/cos/hero.png";
import dashCosImage from "../../../assets/cos/dash.png";
import cosInfoMain from "../../../assets/images_dir/cos.png";

export default function CarbonOsHeroSection() {
  return (
    <section className="relative min-h-[660px] overflow-hidden bg-bark-900 pb-20">
      <img src={cosHero} alt="CarbonOS hero" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#17110C]/80 via-[#17110C]/60 to-transparent" />
      <Navbar links={navLinks} />

      <div className="relative z-10 mx-auto grid w-full max-w-[1920px] xl:max-w-[92%] gap-10 px-6 pb-4 pt-28 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:px-12">
        <div className="text-white mt-8 lg:mt-0">
          <h1 className="font-display text-[42px] font-semibold leading-[1.05] sm:text-[54px] lg:text-[64px] drop-shadow-md">
            Carbon Accounting, <br className="hidden md:block" /> Simplified
          </h1>
          <p className="mt-6 max-w-[500px] text-[16px] leading-relaxed text-white/90 sm:text-[18px]">
            Track, calculate, and report emissions with accuracy - with automated GHG, CCTS, and CBAM workflows.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link 
              to="#calculator" 
              className="inline-flex items-center justify-center gap-2 px-8 py-[14px] rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold backdrop-blur-md transition-all duration-300"
            >
              Try GHG Calculator
            </Link>
            <Link to="/book-demo" className="group inline-flex items-center gap-4 bg-[#F27A18] text-white rounded-full pl-6 pr-2 py-2 hover:bg-[#D96B12] shadow-lg transition-all duration-300">
              <span className="text-[17px] font-semibold">Schedule a Demo</span>
              <div className="w-11 h-11 bg-white text-[#F27A18] rounded-full flex items-center justify-center transition-transform duration-300 group-hover:rotate-45 shrink-0 shadow-sm">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full lg:w-[680px] lg:ml-auto mt-6 lg:mt-0">
          <div className="relative group">
            <img
              src={dashCosImage}
              alt="CarbonOS dashboard"
              className="block w-full h-auto drop-shadow-2xl transition-transform duration-700 ease-out hover:-translate-y-2 hover:rotate-1"
              loading="lazy"
            />
            <img
              src={cosInfoMain}
              alt="Power Factors Widget"
              className="absolute bottom-[-10%] left-[8%] lg:left-[-10%] w-[180px] md:w-[240px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] z-20 hover:-translate-y-2 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
