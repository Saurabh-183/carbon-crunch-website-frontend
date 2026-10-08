import { metrics } from "../data/content";
import CountUp from "./ui/CountUp";

export default function StatsStrip() {
  return (
    <section className="flex min-h-[158px] items-center bg-ember-300 py-16 md:py-4">
      <div className="mx-auto grid w-full w-full max-w-[1920px] xl:max-w-[92%] grid-cols-1 gap-y-16 px-5 text-center sm:grid-cols-4 sm:gap-x-4 sm:gap-y-4 sm:px-8 lg:px-10">
        {metrics.map((metric) => (
          <article key={metric.label}>
            <CountUp end={metric.target} suffix={metric.suffix} className="font-display text-[54px] min-[375px]:text-[64px] sm:text-[48px] font-bold sm:font-semibold leading-none text-white tracking-tight" />
            <p className="mt-4 sm:mt-2 text-[16px] min-[375px]:text-[20px] sm:text-[24px] uppercase leading-none tracking-wide text-white/95">{metric.label}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
