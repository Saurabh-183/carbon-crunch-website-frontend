import Navbar from "../../Navbar";
import { navLinks } from "../../../data/content";
import caseHero from "../../../assets/casestudy-hero.png";

export default function CaseStudiesHeroSection() {
  return (
    <section className="relative h-[460px] overflow-hidden bg-bark-900 md:h-[520px]">
      <img src={caseHero} alt="Case studies hero" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/48 to-black/25" />
      <Navbar links={navLinks} />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1920px] xl:max-w-[92%] items-center justify-center px-6 pt-20 text-center lg:px-10">
        <div>
          <h1 className="font-display text-[40px] font-semibold leading-tight text-white sm:text-[48px] lg:text-[58px]">Case Studies</h1>
          <p className="mx-auto mt-5 max-w-3xl text-[16px] leading-relaxed text-white/90 sm:text-[18px]">We are curating detailed implementation stories and measurable outcomes.</p>
        </div>
      </div>
    </section>
  );
}
