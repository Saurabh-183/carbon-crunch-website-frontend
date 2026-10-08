import { Link } from "react-router-dom";
import dashImage from "../assets/cta/dash-screenshot.png";
import accuracyCard from "../assets/images_dir/brsr5.png";
import orangePetal from "../assets/cta/orange-petal.png";
import orangeCircle from "../assets/cta/orange-circle.png";

export default function CtaBanner() {
  return (
    <section className="bg-white px-4 pt-12 pb-8 md:pt-20 md:pb-12 flex justify-center">
      <div
        className="
          relative w-full max-w-[1280px] xl:max-w-none
          rounded-[24px] sm:rounded-[32px]
          bg-[#FDF2E7]
          overflow-hidden
          pl-5 py-8 sm:pl-8 sm:py-10 md:pl-20 md:py-16 pr-0
        "
      >
        {/* Content wrapper */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-0">
          
          {/* LEFT — text */}
          <div className="w-full lg:max-w-[480px] xl:max-w-[540px] shrink-0 px-4 md:px-0">
            <h2 className="text-[28px] sm:text-[36px] md:text-[52px] lg:text-[60px] leading-[1.05] font-bold text-[#261E14] tracking-tight drop-shadow-sm">
              Ready To Simplify Your ESG Reporting?
            </h2>

            <p className="mt-6 text-[18px] md:text-[20px] text-[#261E14]/75 leading-relaxed max-w-[440px]">
              See how Carbon Crunch helps you measure, validate, and report with audit-ready accuracy.
            </p>

            <div className="mt-10">
              <Link
                to="/book-demo"
                className="group inline-flex items-center gap-4 bg-[#F27A18] text-white rounded-full pl-6 pr-2 py-2 hover:bg-[#D96B12] shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <span className="text-[17px] font-semibold whitespace-nowrap">
                  Book a Demo Today!
                </span>
                <div className="w-10 h-10 md:w-11 md:h-11 bg-white text-[#F27A18] rounded-full flex items-center justify-center transition-transform duration-300 group-hover:rotate-45 shrink-0 shadow-sm">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>

          {/* RIGHT — visual stack directly touching the right edge */}
          <div className="relative w-full lg:w-[650px] xl:w-[750px] h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px] shrink-0 mt-6 sm:mt-8 lg:mt-0">
            
            {/* Background Circle */}
            <img
              src={orangeCircle}
              alt=""
              className="absolute right-0 top-[-40px] sm:top-[-60px] md:top-[-100px] w-[320px] sm:w-[450px] md:w-[600px] lg:w-[700px] translate-x-[15%] pointer-events-none select-none z-0"
            />

            {/* Petal */}
            <img
              src={orangePetal}
              alt=""
              className="absolute right-[10px] top-[10px] sm:right-[20px] sm:top-[20px] md:right-[40px] md:top-[0px] w-[140px] sm:w-[200px] md:w-[280px] lg:w-[350px] pointer-events-none select-none z-[5]"
            />

            {/* Dashboard screenshot */}
            <div
              className="
                absolute top-[15px] sm:top-[20px] md:top-[40px] right-[-40px] sm:right-[-60px] md:right-[-120px] lg:right-[-200px]
                w-[90%] md:w-[85%] lg:w-[800px] xl:w-[940px]
                z-10
                rounded-2xl md:rounded-l-[24px]
                overflow-hidden
                shadow-[0_40px_80px_rgba(0,0,0,0.35)] md:shadow-[0_50px_100px_rgba(0,0,0,0.45)]
                border border-white/20
              "
            >
              <img
                src={dashImage}
                alt="Plant Admin Dashboard"
                className="w-full h-auto block"
                loading="lazy"
              />
            </div>

            {/* Accuracy Card */}
            <img
              src={accuracyCard}
              alt="Report Accuracy"
              className="
                absolute
                left-[2%] md:left-[5%] lg:left-[-120px] xl:left-[-160px]
                bottom-[5px] sm:bottom-[10px] md:bottom-[30px] lg:bottom-[40px]
                w-[120px] sm:w-[180px] md:w-[220px] lg:w-[280px]
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