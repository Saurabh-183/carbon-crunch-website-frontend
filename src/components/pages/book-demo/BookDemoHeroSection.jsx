import Navbar from "../../Navbar";
import { navLinks } from "../../../data/content";
import demoHeroImage from "../../../assets/demo-hero.png";

export default function BookDemoHeroSection() {
  return (
    <section className="relative h-[560px] overflow-hidden bg-bark-900">
      <img src={demoHeroImage} alt="Industrial landscape" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/20" />

      <Navbar links={navLinks} />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1920px] xl:max-w-[92%] items-center justify-center px-6 pt-20 text-center lg:px-10">
        <div>
          <h1 className="font-display text-[44px] font-semibold leading-[1.05] text-white sm:text-[52px] lg:text-[64px]">Schedule A Demo</h1>
          <p className="mx-auto mt-6 max-w-5xl text-[16px] leading-relaxed text-white/90 sm:text-[18px]">See how Carbon Crunch simplifies BRSR, GHG, and ESG reporting with audit-ready workflows.</p>
        </div>
      </div>
    </section>
  );
}
