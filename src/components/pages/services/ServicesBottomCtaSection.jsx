import { Link } from "react-router-dom";
import dashboardImage from "../../../assets/dash.png";
import landscapeImage from "../../../assets/landscape-bg.jpg";
import aboutImpact3Src from "../../../assets/images_dir/about8.png";

export default function ServicesBottomCtaSection() {
  return (
    <section className="bg-[#ffffff] px-4 pb-20 pt-10 sm:pt-16 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1920px] xl:max-w-[92%]">
        <div className="relative w-full rounded-[24px] sm:rounded-[32px] bg-[#FFF5EB] overflow-hidden px-5 sm:px-8 py-10 sm:py-14 md:px-16 lg:py-20 shadow-sm border border-[#261E14]/[0.02]">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-0">
            <div className="w-full lg:max-w-[480px] xl:max-w-[500px] shrink-0 py-2 sm:py-4 lg:py-8">
              <h2 className="text-[28px] sm:text-[36px] md:text-[42px] leading-[1.1] font-bold text-[#261E14] drop-shadow-sm font-display tracking-tight">
                Bring ESG Reporting Under Board-Level Control
              </h2>
              <p className="mt-5 text-[16px] md:text-[17px] text-[#261E14]/80 leading-relaxed font-medium font-sans mr-3">
                Get complete visibility, ensure compliance, and make confident decisions with unified BRSR and GRI reporting.
              </p>
              <div className="mt-8">
                <Link
                  to="/book-demo"
                  className="group inline-flex items-center gap-4 bg-[#EF7C16] text-white rounded-full pl-6 pr-2 py-2 hover:bg-[#D96B12] shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  <span className="text-[16px] font-bold tracking-wide">Book a Demo Today!</span>
                  <div className="w-10 h-10 bg-white text-[#EF7C16] rounded-full flex items-center justify-center transition-transform duration-300 group-hover:rotate-45 shrink-0 shadow-sm">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </div>
                </Link>
              </div>
            </div>

            <div className="relative w-full lg:w-[580px] xl:w-[620px] h-[240px] sm:h-[320px] md:h-[400px] shrink-0 mt-4 sm:mt-6 lg:mt-0">
              <div className="absolute right-[-30px] sm:right-[-60px] md:right-[-120px] lg:right-[-200px] top-[-60px] sm:top-[-100px] bottom-[-60px] sm:bottom-[-100px] w-[350px] sm:w-[500px] md:w-[600px] lg:w-[800px] rounded-l-[150px] sm:rounded-l-[200px] md:rounded-l-[350px] overflow-hidden shadow-[-20px_0_40px_rgba(0,0,0,0.1)] z-0">
                <img src={landscapeImage} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#6E3A0B]/95 via-[#91501A]/80 to-[#BF7231]/60 mix-blend-multiply" />
              </div>

              <div className="relative z-10 mx-auto w-[95%] lg:absolute lg:top-1/2 lg:-translate-y-1/2 lg:left-[-20px] xl:left-[-40px] lg:w-[640px] xl:w-[760px]">
                <div className="rounded-[16px] md:rounded-[24px] border-[6px] md:border-[10px] border-[#261E14] bg-white shadow-[0_30px_60px_rgba(0,0,0,0.4)] overflow-hidden">
                  <img src={dashboardImage} alt="CarbonOS Platform" className="w-full h-auto block" loading="lazy" />
                </div>

                <img
                  src={aboutImpact3Src}
                  alt="Accuracy Gauge"
                  className="
                    absolute
                    right-[-2%] md:right-[-5%] lg:right-[-10px]
                    bottom-[-6%] md:bottom-[-20px] lg:bottom-[-30px]
                    w-[100px] sm:w-[140px] md:w-[180px] lg:w-[240px]
                    z-20
                    drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]
                    hover:-translate-y-2 transition-transform duration-500
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
