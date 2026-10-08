import Navbar from "../../Navbar";
import DemoLink from "../../ui/DemoLink";
import { navLinks } from "../../../data/content";
import industriesHero from "../../../assets/industry/hero.png";

export default function IndustriesHeroSection() {
  return (
    <section className="relative h-auto min-h-[500px] overflow-hidden bg-bark-900 md:min-h-[560px]">
      <img src={industriesHero} alt="Industries hero" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/68 via-black/34 to-black/26" />
      <Navbar links={navLinks} />

      <div className="relative z-10 mx-auto flex min-h-[500px] w-full max-w-[1920px] xl:max-w-[92%] items-center justify-center px-6 py-20 text-center md:min-h-[560px] lg:px-10">
        <div>
          <h1 className="font-display text-[30px] font-semibold leading-tight text-white sm:text-[48px] md:text-[56px] lg:text-[64px]">Built for Every Industry. Designed for ESG Complexity.</h1>
          <p className="mx-auto mt-6 max-w-5xl text-[16px] leading-relaxed text-white/90 sm:text-[18px]">
            Carbon Crunch supports diverse industries with structured workflows tailored for BRSR, GHG, and ESG reporting requirements.
          </p>
          <div className="mt-8">
            <DemoLink to="/book-demo">Schedule a Demo</DemoLink>
          </div>
        </div>
      </div>
    </section>
  );
}
