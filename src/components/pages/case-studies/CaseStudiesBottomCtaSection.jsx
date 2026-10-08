import DemoLink from "../../ui/DemoLink";
import dashboardImage from "../../../assets/dash.png";
import landscapeImage from "../../../assets/landscape-bg.jpg";

export default function CaseStudiesBottomCtaSection() {
  return (
    <section className="bg-[#ffffff] px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <section className="relative mx-auto grid w-full w-full max-w-[1920px] xl:max-w-[92%] items-center gap-8 overflow-hidden rounded-[26px] bg-[#ece2d4] px-8 py-12 sm:px-12 lg:grid-cols-[1fr_auto] lg:gap-10 lg:px-14">
        <div className="relative z-10 max-w-[620px]">
          <h3 className="font-display text-[44px] leading-[1.12] text-bark-900 sm:text-[56px]">Bring ESG Reporting Under Board-Level Control</h3>
          <p className="mt-6 max-w-[620px] text-[18px] leading-relaxed text-bark-900/90 sm:text-[21px]">
            Get complete visibility, ensure compliance, and make confident decisions with unified BRSR and GRI reporting.
          </p>
          <DemoLink to="/book-demo" className="mt-9">
            Book a Demo Today!
          </DemoLink>
        </div>

        <div className="absolute -right-20 top-1/2 hidden h-[520px] w-[520px] -translate-y-1/2 pointer-events-none overflow-hidden rounded-[260px_0_0_260px] md:block">
          <img src={landscapeImage} alt="Landscape background" className="h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#ece2d4]/45" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[606px] rounded-[20px] border-[4px] border-[#2f271d] bg-[#f5f7fa] shadow-[0_20px_50px_rgba(26,18,12,0.24)] sm:rounded-[30px] sm:border-[7px] lg:mx-0">
          <img
            src={dashboardImage}
            alt="Board-level reporting dashboard"
            className="block h-auto w-full rounded-2xl border border-white/10 object-contain shadow-[0_8px_40px_rgba(0,0,0,0.2)] sm:rounded-3xl"
            loading="lazy"
          />
        </div>
      </section>
    </section>
  );
}
