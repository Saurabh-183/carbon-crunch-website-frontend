import DemoLink from "../../ui/DemoLink";

export default function CaseStudiesComingSoonSection() {
  return (
    <section className="bg-[#ffffff] px-4 pb-8 pt-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[980px] rounded-2xl border border-bark-900/10 bg-white p-6 text-center shadow-[0_10px_24px_rgba(0,0,0,0.08)] sm:rounded-3xl sm:p-8 md:p-12">
        <h2 className="mt-2 font-display text-[40px] font-semibold leading-tight text-bark-900 sm:mt-6 sm:text-[52px] md:text-[60px]">COMING SOON</h2>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-bark-900/75 sm:mt-5 sm:text-[16px]">
          Explore soon how organizations are using Carbon Crunch to reduce reporting time, improve ESG data accuracy, and deliver audit-ready disclosures at scale.
        </p>
        <div className="mt-8 flex justify-center">
          <DemoLink to="/book-demo">Book a Demo</DemoLink>
        </div>
      </div>
    </section>
  );
}
