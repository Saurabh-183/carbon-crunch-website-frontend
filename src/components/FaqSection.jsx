import { useState } from "react";
import { faqs } from "../data/content";
import SectionHeading from "./ui/SectionHeading";
import FaqItem from "./ui/FaqItem";
import landscapeBg from "../assets/landscape-bg.jpg";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="resources" className="flex min-h-[auto] sm:min-h-[904px] items-center bg-[#ffffff] px-4 py-16 sm:pb-8 sm:pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1920px] xl:max-w-[92%] w-full">
        <SectionHeading title="FAQs On ESG & Reporting" />

        <div className="mt-8 sm:mt-10 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="relative overflow-hidden rounded-xl hidden sm:block">
            <img src={landscapeBg} alt="Wind turbines over green hills" className="h-full min-h-[420px] w-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 p-6">
              <h3 className="font-display text-4xl leading-tight text-white">Still Have Questions?</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/80">Explore how Carbon Crunch simplifies BRSR, GHG, and ESG reporting from data collection to audit-ready disclosures.</p>
            </div>
          </article>

          <div className="rounded-xl border border-bark-900/15 bg-[#f5f5f5] px-3 sm:px-6">
            {faqs.map((faq, index) => (
              <FaqItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                open={openIndex === index}
                onToggle={() => setOpenIndex((current) => (current === index ? -1 : index))}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
