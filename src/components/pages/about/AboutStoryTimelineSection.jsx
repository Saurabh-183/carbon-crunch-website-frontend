import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import aboutStory1Src from "../../../assets/images_dir/about2.png";
import aboutStory2Src from "../../../assets/images_dir/about3.png";
import aboutStory3Src from "../../../assets/images_dir/about4.png";
import { timeline } from "./aboutData";

export default function AboutStoryTimelineSection() {
  const storySectionRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);

  const { scrollYProgress } = useScroll({
    target: storySectionRef,
    offset: ["start center", "end center"],
  });

  const progressBarHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const stepObj = Math.min(timeline.length - 1, Math.floor(latest * (timeline.length + 0.2)));
    if (stepObj !== activeStep) {
      setActiveStep(stepObj);
    }
  });

  return (
    <section ref={storySectionRef} className="bg-white px-4 pb-16 sm:pb-20 pt-16 sm:pt-20 sm:px-6 lg:px-8 lg:pt-32">
      <div className="mx-auto w-full max-w-[1920px] xl:max-w-[92%]">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] items-start lg:gap-24">
          <div className="pb-16 sm:pb-24 lg:pb-0">
            <span className="inline-flex rounded-full bg-[#E5F5FC] px-5 py-2 text-[12px] font-semibold text-[#2ea5de]">OUR STORY</span>
            <h2 className="mt-5 font-display text-[30px] font-semibold leading-[1.05] text-[#261E14] sm:text-[48px] lg:text-[54px]">
              How We Built <br className="hidden md:block" />
              Carbon Crunch
            </h2>

            <div className="mt-8 sm:mt-10 grid grid-cols-[1.3fr_0.9fr] gap-3 sm:gap-4 h-[240px] sm:h-[320px] md:h-[400px]">
              <div className="overflow-hidden rounded-[24px] bg-[#d3d3d3] shadow-md group min-h-0 h-full">
                <img src={aboutStory1Src} alt="Early days" className="h-full w-full object-cover grayscale group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700" />
              </div>
              <div className="grid grid-rows-2 gap-3 sm:gap-4 min-h-0 h-full">
                <div className="overflow-hidden rounded-[20px] bg-[#d3d3d3] shadow-md group min-h-0 h-full">
                  <img src={aboutStory2Src} alt="Planning" className="h-full w-full object-cover grayscale group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700" />
                </div>
                <div className="overflow-hidden rounded-[20px] bg-[#d3d3d3] shadow-md group min-h-0 h-full">
                  <img src={aboutStory3Src} alt="Developing" className="h-full w-full object-cover grayscale group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative pt-0 self-center mt-1 sm:mt-0 md:mt-0 lg:mt-0">
            <div className="flex flex-col justify-between gap-12 sm:gap-16 relative">
              <div className="absolute left-[27px] top-[28px] bottom-[28px] w-[2px] bg-[#E5F5FC] z-0" />
              <motion.div className="absolute left-[27px] top-[28px] w-[2px] bg-[#2ea5de] z-10 origin-top" style={{ height: progressBarHeight, maxHeight: "calc(100% - 56px)" }} />

              {timeline.map((item, index) => {
                const isActive = index <= activeStep;
                return (
                  <article key={item.title} className="relative flex items-start gap-6 sm:gap-8 z-20">
                    <motion.div
                      initial={false}
                      animate={{
                        backgroundColor: isActive ? "#ffffff" : "#f4f6f8",
                        borderColor: isActive ? "#2ea5de" : "transparent",
                        color: isActive ? "#2ea5de" : "rgba(38, 30, 20, 0.3)",
                        scale: isActive ? 1 : 0.95,
                      }}
                      transition={{ duration: 0.3 }}
                      className="shrink-0 flex h-14 w-14 items-center justify-center rounded-full text-[20px] font-bold border-[3px] shadow-sm"
                    >
                      {index + 1}
                    </motion.div>

                    <div className="pt-2 sm:pt-2.5">
                      <h3 className={`font-display text-[22px] font-bold leading-none transition-colors duration-500 sm:text-[26px] ${isActive ? "text-[#261E14]" : "text-[#261E14]/40"}`}>
                        {item.title}
                      </h3>
                      <p className={`mt-3 sm:mt-4 text-[15px] sm:text-[16px] leading-relaxed transition-colors duration-300 ${isActive ? "text-[#261E14]/80" : "text-[#261E14]/40"}`}>{item.text}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
