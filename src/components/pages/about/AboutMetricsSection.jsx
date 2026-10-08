import CountUp from "../../ui/CountUp";
import { metrics } from "./aboutData";

export default function AboutMetricsSection() {
  return (
    <section className="bg-[#111111] px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-[1920px] xl:max-w-[92%] gap-8 text-center grid-cols-2 md:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="py-4">
            <CountUp end={metric.target} suffix={metric.suffix} className="text-[40px] font-bold leading-none md:text-[54px]" />
            <p className="mt-4 text-[12px] md:text-[13px] font-semibold tracking-[0.1em] text-white/70 uppercase">
              {metric.label}
              <br />
              {metric.sub}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
