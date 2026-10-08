import aboutImpact1Src from "../../../assets/images_dir/about5.png";
import aboutImpact2Src from "../../../assets/images_dir/about6.png";

export default function AboutRealImpactSection() {
  return (
    <section className="bg-white px-4 py-14 sm:py-20 pb-16 sm:pb-24 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full border-[120px] border-[#f4f6f8] opacity-50 z-0 pointer-events-none" />

      <div className="mx-auto w-full max-w-[1920px] xl:max-w-[92%] relative z-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] items-center lg:gap-20">
          <div className="max-w-[500px]">
            <span className="inline-flex rounded-full bg-[#E5F5FC] px-5 py-2 text-[12px] font-semibold text-[#2ea5de]">WHY CARBON CRUNCH</span>
            <h2 className="mt-5 font-display text-[30px] font-semibold leading-[1.05] text-[#261E14] sm:text-[48px] lg:text-[54px]">
              Real Impact, <br className="hidden md:block" />
              Measurable Results
            </h2>

            <div className="mt-12 rounded-[24px] bg-[#FAF3EC] p-8 sm:p-10 shadow-sm relative">
              <svg className="w-12 h-12 text-[#261E14]/10 absolute top-8 left-8" fill="currentColor" viewBox="0 0 32 32">
                <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2h2V8h-2zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2h2V8h-2z" />
              </svg>

              <div className="float-right text-[22px] font-display font-bold text-[#261E14]/70 mr-2 opacity-80 pt-1">
                GM <span className="text-[12px] font-normal uppercase tracking-widest block -mt-1 text-[#261E14]/50">MOTORS</span>
              </div>

              <div className="pt-16">
                <p className="text-[17px] sm:text-[18px] leading-relaxed text-[#261E14]/90 font-medium italic">
                  "The value we got out of Carbon Crunch was immediate. We streamlined our ESG reporting across multiple plants, completely eliminating manual consolidation."
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-[#d3d3d3] border-2 border-white shadow-sm flex items-center justify-center text-[#261E14]/20 text-[24px] font-bold">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-[#261E14] text-[15px]">Anil Sharma</p>
                    <p className="text-[13px] text-[#261E14]/60">Sustainability Head</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 h-[300px] sm:h-[400px] lg:h-[500px]">
            <div className="overflow-hidden rounded-[24px] bg-[#d3d3d3] group">
              <img src={aboutImpact1Src} alt="Team meeting" className="w-full h-full object-cover grayscale group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700" />
            </div>
            <div className="overflow-hidden rounded-[24px] bg-[#D3F9DE] flex flex-col items-center justify-center text-center p-6 shadow-[-10px_0_30px_rgba(46,139,87,0.05)]">
              <p className="font-display text-[32px] sm:text-[44px] md:text-[54px] font-bold text-[#261E14]">100%</p>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-[#2E8B57] mt-3">Framework Alignment</p>
            </div>
            <div className="overflow-hidden rounded-[24px] bg-[#E8F8CE] flex flex-col items-center justify-center text-center p-6 shadow-[10px_0_30px_rgba(60,140,26,0.05)]">
              <p className="font-display text-[32px] sm:text-[44px] md:text-[54px] font-bold text-[#261E14]">250K+</p>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-[#3C8C1A] mt-3">Data Nodes Processed</p>
            </div>
            <div className="overflow-hidden rounded-[24px] bg-[#d3d3d3] group">
              <img src={aboutImpact2Src} alt="Working on laptops" className="w-full h-full object-cover grayscale group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
