import Navbar from "../../Navbar";
import { navLinks } from "../../../data/content";

export default function ServiceDetailHeroSection({ service }) {
  return (
    <section className="relative min-h-[420px] overflow-hidden bg-bark-900">
      <img src={service.image} alt={service.title} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/15" />
      <Navbar links={navLinks} />

      <div className="relative z-10 mx-auto flex min-h-[420px] w-full max-w-[1920px] xl:max-w-[92%] items-center justify-center px-6 py-24 text-center lg:px-10">
        <h1 className="font-display text-[40px] font-semibold leading-tight text-white sm:text-[48px] lg:text-[62px]">{service.title}</h1>
      </div>
    </section>
  );
}
