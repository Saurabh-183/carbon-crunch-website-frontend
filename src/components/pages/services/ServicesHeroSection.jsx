import Navbar from "../../Navbar";
import { navLinks } from "../../../data/content";
import { servicesHero } from "../../../data/services";

export default function ServicesHeroSection() {
  return (
    <section className="relative min-h-[420px] sm:min-h-[520px] overflow-hidden bg-bark-900">
      <img src={servicesHero.image} alt="Services hero" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-[#E97406]/25 to-black/75" />
      <Navbar links={navLinks} />
      <div className="relative z-10 mx-auto flex min-h-[420px] sm:min-h-[520px] w-full max-w-[1920px] xl:max-w-[92%] items-center justify-center px-4 sm:px-6 py-20 sm:py-24 text-center lg:px-10">
        <div>
          <h1 className="font-display text-[32px] font-semibold leading-tight text-white sm:text-[48px] lg:text-[58px]">{servicesHero.title}</h1>
          <p className="mx-auto mt-5 max-w-4xl text-[15px] leading-relaxed text-white/90 sm:text-[18px] lg:text-[20px]">{servicesHero.subtitle}</p>
        </div>
      </div>
    </section>
  );
}
