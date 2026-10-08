import { Link } from "react-router-dom";
import brsrDash from "../../../assets/dash.png";
import landscapeImage from "../../../assets/landscape-bg.jpg";
import brsrInfo5 from "../../../assets/images_dir/brsr5.png";

export default function BrsrBottomCtaSection() {
  return (
    <section className="bg-white px-4 py-14 sm:py-20 md:py-32 flex justify-center overflow-hidden">
      <div className="relative w-full w-full max-w-[1920px] xl:max-w-[92%] rounded-[24px] sm:rounded-[32px] bg-[#FDF2E7] overflow-hidden px-5 sm:px-8 py-8 sm:py-10 md:px-16 md:py-16">
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-0">
          <div className="w-full lg:max-w-[480px] xl:max-w-[540px] shrink-0">
            <h2 className="text-[26px] sm:text-[32px] md:text-[44px] lg:text-[48px] leading-[1.05] font-bold text-[#261E14] tracking-tight drop-shadow-sm">
              Bring ESG Reporting Under Board-Level Control
            </h2>
            <p className="mt-5 text-[16px] md:text-[18px] text-[#261E14]/75 leading-relaxed max-w-[440px]">
              Get complete visibility, ensure compliance, and make confident decisions with unified BRSR and GRI reporting.
            </p>

            <div className="mt-8">
              <Link
                to="/book-demo"
                className="group inline-flex items-center gap-4 bg-[#F27A18] text-white rounded-full pl-6 pr-2 py-2 hover:bg-[#D96B12] shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <span className="text-[16px] font-semibold whitespace-nowrap">Book a Demo Today!</span>
                <div className="w-10 h-10 bg-white text-[#F27A18] rounded-full flex items-center justify-center transition-transform duration-300 group-hover:rotate-45 shrink-0 shadow-sm">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>

          <div className="relative w-full lg:w-[600px] xl:w-[680px] h-[220px] sm:h-[300px] md:h-[380px] lg:h-[440px] shrink-0 mt-4 sm:mt-6 lg:mt-0">
            <div className="absolute right-[-30px] sm:right-[-60px] md:right-[-120px] top-[-30px] sm:top-[-50px] bottom-[-30px] sm:bottom-[-50px] w-[350px] sm:w-[500px] md:w-[700px] rounded-l-[150px] sm:rounded-l-[200px] md:rounded-l-[300px] overflow-hidden shadow-2xl z-0">
              <img src={landscapeImage} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#8B5A2B]/40 to-[#4A2E00]/80" />
            </div>

            <div
              className="
                absolute top-[30px] md:top-[60px] right-[-60px] md:right-[-120px] lg:right-[-160px]
                w-[95%] md:w-[85%] lg:w-[720px] xl:w-[860px]
                z-10
                rounded-2xl md:rounded-l-[24px]
                overflow-hidden
                shadow-[0_40px_80px_rgba(0,0,0,0.35)]
                border border-white/20 bg-white
              "
            >
              <img src={brsrDash} alt="Board Admin Dashboard" className="w-full h-auto block" loading="lazy" />
            </div>

            <img
              src={brsrInfo5}
              alt="Report Accuracy"
              className="
                absolute
                left-[0%] md:left-[5%] lg:left-[-100px]
                bottom-[10px] md:bottom-[30px]
                w-[120px] sm:w-[160px] md:w-[220px] lg:w-[260px]
                z-20
                rounded-3xl
                drop-shadow-[0_30px_60px_rgba(0,0,0,0.4)]
              "
            />
          </div>
        </div>
      </div>
    </section>
  );
}
