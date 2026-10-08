import aboutApproachSrc from "../../../assets/images_dir/about1.png";
import { values } from "./aboutData";
import ValueIcon from "./ValueIcon";

export default function AboutApproachSection() {
  return (
    <section className="bg-white px-4 py-14 sm:py-20 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] rounded-full border-[100px] border-[#f4f6f8] opacity-50 z-0 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full border-[120px] border-[#f4f6f8] opacity-50 z-0 pointer-events-none" />

      <div className="mx-auto w-full max-w-[1920px] xl:max-w-[92%] relative z-10">
        <div className="flex items-center gap-4 text-center lg:text-left">
          <h2 className="font-display text-[28px] font-semibold text-[#261E14] sm:text-[44px] lg:text-[48px] w-full lg:w-auto">Our Approach To Sustainability</h2>
          <div className="hidden h-[2px] w-[180px] bg-[#57c0ff] lg:block ml-auto" />
        </div>

        <div className="mt-10 sm:mt-16 grid gap-10 sm:gap-14 lg:gap-20 lg:grid-cols-[1.1fr_1fr] items-center">
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2">
            {values.map((value) => (
              <article key={value.title} className="group cursor-default">
                <div className={`grid h-14 w-14 place-items-center rounded-full ${value.iconBg} ${value.iconColor} shadow-sm group-hover:-translate-y-1 transition-transform`}>
                  <ValueIcon type={value.icon} />
                </div>
                <h3 className="mt-6 font-display text-[22px] font-semibold text-[#261E14]">{value.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[#261E14]/70 max-w-[260px]">{value.text}</p>
              </article>
            ))}
          </div>

          <div>
            <h3 className="font-display text-[26px] font-semibold leading-tight text-[#261E14] sm:text-[32px]">Turning Complexity Into Structured ESG Workflows</h3>
            <p className="mt-5 text-[16px] leading-relaxed text-[#261E14]/75">
              We combine deep sustainability expertise with cutting-edge technology. Carbon Crunch replaces fragmented systems and manual effort, guiding organizations reliably through data
              collection, calculation, and transparent reporting.
            </p>
            <div className="mt-8 sm:mt-10 overflow-hidden rounded-[20px] sm:rounded-[24px] h-[200px] sm:h-[280px] shadow-lg group">
              <img src={aboutApproachSrc} alt="Team collaboration" className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
