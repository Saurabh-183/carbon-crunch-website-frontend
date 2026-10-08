import { capabilities } from "./industriesData";

export default function IndustriesCapabilitiesSection() {
  return (
    <section className="bg-[white] px-4 pb-10 pt-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1920px] xl:max-w-[92%]">
        <h2 className="text-center font-display text-[26px] font-semibold leading-tight text-bark-900 sm:text-[44px] md:text-[48px]">Our Key Capabilities</h2>

        <div className="mt-12 space-y-10">
          {capabilities.map((item, index) => {
            const isReversed = index % 2 !== 0;
            return (
              <article key={item.title} className={`flex flex-col gap-12 lg:gap-14 lg:flex-row items-center justify-between ${isReversed ? "lg:flex-row-reverse" : ""}`}>
                <div className="w-full lg:w-[45%] shrink-0 px-2 lg:px-0">
                  <span className="inline-flex rounded-full bg-[#f6d5b5] px-3 py-1 text-[12px] font-medium text-[#cc7a29]">{item.label}</span>
                  <h3 className="font-display text-[30px] font-semibold text-bark-900 sm:text-[36px] md:text-[40px]">{item.title}</h3>
                  <ul className="mt-4 space-y-2 text-[15px] text-bark-900/80 sm:text-[16px]">
                    {item.points.map((point) => (
                      <li key={point}>• {point}</li>
                    ))}
                  </ul>
                </div>

                <div className="relative w-full lg:w-[50%] shrink-0 px-2 lg:px-0 mt-4 sm:mt-6 lg:mt-0">
                  <div className="relative w-full h-[240px] sm:h-[320px] md:h-[400px] lg:h-[480px] rounded-[24px] sm:rounded-[32px] bg-[#FDF2E7] overflow-hidden shadow-inner border border-black/5">
                    <div className={item.dashboardClass}>
                      <img src={item.image} alt={`${item.title} preview`} className="block w-full h-auto" loading="lazy" />
                    </div>
                  </div>

                  {item.decorations && item.decorations.map((decor, dIdx) => <img key={dIdx} src={decor.src} alt="" className={decor.className} />)}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
