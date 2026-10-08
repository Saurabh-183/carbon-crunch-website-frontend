import { useEffect, useState } from "react";

const testimonials = [
  {
    logo: "/clients/Frame 36917.png",
    quote: "CarbonOS has been pivotal in our transition to sustainable manufacturing. The platform's ability to handle high-frequency data from our smelting units is unparalleled.",
    author: "Aravind Ramesh",
    role: "Corporate Sustainability Head",
  },
  {
    logo: "/clients/Frame 36918.png",
    quote: "The zero-touch data entry via AI-OCR is a lifesaver. We reduced our manual error rate by 90% within the first month of using the platform.",
    author: "Priya Sharma",
    role: "ESG Compliance Lead",
  },
  {
    logo: "/clients/Frame 36919.png",
    quote: "Exporting to the EU requires rigorous CBAM reporting. Carbon Crunch made this complex process absolute effortless and audit-ready.",
    author: "Sanjay Gupta",
    role: "Director of Operations",
  },
  {
    logo: "/clients/Frame 36920.png",
    quote: "The collaboration feature allows us to work directly with our consultants, speeding up the verification process for BRSR significantly.",
    author: "Ananya Iyer",
    role: "CSO",
  },
];

export default function CarbonOsTestimonialsSection() {
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [testimonialVisible, setTestimonialVisible] = useState(true);

  useEffect(() => {
    const testimonialInterval = setInterval(() => {
      setTestimonialVisible(false);
      setTimeout(() => {
        setTestimonialIndex((s) => (s + 1) % testimonials.length);
        setTestimonialVisible(true);
      }, 300);
    }, 5000);

    return () => clearInterval(testimonialInterval);
  }, []);

  return (
    <section className="bg-white px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1920px] xl:max-w-[92%]">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] items-start">
          <div className="max-w-[480px]">
            <h3 className="font-display text-[36px] font-semibold leading-tight text-[#261E14] sm:text-[44px] lg:text-[54px] drop-shadow-sm">Trusted For Carbon Accounting</h3>
            <p className="mt-6 text-[16px] leading-relaxed text-[#261E14]/75 sm:text-[18px]">
              See how organizations streamline Carbon Accounting, improve data accuracy, and deliver audit-ready disclosures with Carbon Crunch.
            </p>
          </div>

          <div className="relative min-h-[320px]">
            <div key={testimonialIndex} className={`transition-all duration-700 ${testimonialVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
              <article className="rounded-[28px] border border-[#261E14]/10 bg-white p-10 md:p-14 shadow-2xl hover:shadow-3xl transition-all flex flex-col md:flex-row items-center gap-10">
                <div className="w-full md:w-1/3 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#261E14]/10 pb-8 md:pb-0 md:pr-0">
                  <img src={testimonials[testimonialIndex].logo} alt="Client Logo" className="h-30 w-auto object-contain drop-shadow-sm " />
                </div>

                <div className="flex-1 text-center md:text-left">
                  <svg className="w-10 h-10 text-[#F27A18]/20 mb-4 mx-auto md:mx-0" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M10 8v8H6v-8h4zM10 20c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4 4 1.8 4 4zM26 8v8h-4v-8h4zM26 20c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4 4 1.8 4 4z" />
                  </svg>
                  <p className="text-[18px] md:text-[22px] font-medium leading-relaxed text-[#261E14] italic">"{testimonials[testimonialIndex].quote}"</p>
                  <div className="mt-8">
                    <p className="text-[18px] font-bold text-[#261E14]">{testimonials[testimonialIndex].author}</p>
                    <p className="text-[15px] text-[#261E14]/60 font-medium">{testimonials[testimonialIndex].role}</p>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setTestimonialVisible(false);
                  setTimeout(() => {
                    setTestimonialIndex(index);
                    setTestimonialVisible(true);
                  }, 300);
                }}
                className={`h-2.5 rounded-full transition-all duration-300 ${testimonialIndex === index ? "w-8 bg-[#F27A18]" : "w-2.5 bg-[#261E14]/15 hover:bg-[#261E14]/30"}`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
