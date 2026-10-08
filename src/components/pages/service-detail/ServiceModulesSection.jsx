import { Link } from "react-router-dom";

function ServiceModule({ module }) {
  return (
    <section className="rounded-[20px] sm:rounded-[32px] bg-[#FFF5EB] p-5 sm:p-6 md:p-8 lg:p-10 shadow-sm border border-[#261E14]/[0.02]">
      <div className="flex items-center gap-6">
        <h2 className="font-display text-[22px] font-bold leading-none text-[#261E14] sm:text-[34px] xl:text-[40px] tracking-tight">{module.title}</h2>
        <div className="h-[2px] flex-1 bg-[#E5D5C5] rounded-full" />
      </div>

      <p className="mt-5 text-[15px] sm:text-[16px] leading-relaxed text-[#261E14]/80">{module.description}</p>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <article className="rounded-[16px] bg-white p-6 shadow-sm border border-[#261E14]/[0.03] flex flex-col justify-start items-start">
          <span className="inline-flex rounded-full bg-[#FCF0E4] px-4 py-1.5 text-[11px] font-bold tracking-wide uppercase text-[#F27A18]">How We Approach</span>
          <p className="mt-5 text-[14.5px] leading-relaxed text-[#261E14]/85">{module.approach}</p>
        </article>

        <article className="rounded-[16px] bg-white p-6 shadow-sm border border-[#261E14]/[0.03] flex flex-col justify-start items-start">
          <span className="inline-flex rounded-full bg-[#FCF0E4] px-4 py-1.5 text-[11px] font-bold tracking-wide uppercase text-[#F27A18]">What We Do</span>
          <ul className="mt-5 space-y-2 text-[14.5px] leading-relaxed text-[#261E14]/85 w-full">
            {module.whatWeDo.map((point) => (
              <li key={point} className="flex gap-2.5 items-start">
                <span className="text-[#261E14]/40 mt-[-1px] scale-150">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-[16px] bg-white p-6 shadow-sm border border-[#261E14]/[0.03] flex flex-col justify-start items-start">
          <span className="inline-flex rounded-full bg-[#FCF0E4] px-4 py-1.5 text-[11px] font-bold tracking-wide uppercase text-[#F27A18]">Benefits</span>
          <ul className="mt-5 space-y-2 text-[14.5px] leading-relaxed text-[#261E14]/85 w-full">
            {module.benefits.map((point) => (
              <li key={point} className="flex gap-2.5 items-start">
                <span className="text-[#261E14]/40 mt-[-1px] scale-150">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="mt-6 sm:mt-8 flex flex-col items-center justify-between gap-4 rounded-[12px] sm:rounded-[16px] bg-[#261E14] px-4 sm:px-6 py-4 sm:px-8 sm:flex-row shadow-md border border-black/10">
        <p className="text-center text-[15px] font-semibold text-white/95 sm:text-left">Ready to implement this for your organization?</p>
        <Link
          to="/book-demo"
          className="group inline-flex items-center justify-center gap-3 rounded-full bg-white pl-6 pr-1.5 py-1.5 text-[15px] font-bold text-[#F27A18] transition-all hover:bg-[#FFF5EB] hover:-translate-y-0.5 w-full sm:w-auto shadow-sm"
        >
          <span>Schedule a Consultation</span>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#F27A18] text-white transition-transform duration-300 group-hover:rotate-45" aria-hidden="true">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </span>
        </Link>
      </div>
    </section>
  );
}

export default function ServiceModulesSection({ service }) {
  return (
    <section className="bg-[white] px-4 pb-6 pt-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1920px] xl:max-w-[92%] space-y-14">
        {service.modules.map((module) => (
          <ServiceModule key={module.title} module={module} />
        ))}
      </div>
    </section>
  );
}
