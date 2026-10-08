import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useSpring, useTransform, useMotionValueEvent } from "framer-motion";
/* ------------------------------------------------------------------ */
/*  Step meta — consistent heading from new reference design          */
/* ------------------------------------------------------------------ */
const steps = [
  {
    label: "Measure",
    title: "Measure",
    heading: "From Data Collection To Audit-Ready Reports",
    description: "Measure accurately, analyze confidently, and report with complete compliance — all in one workflow.",
  },
  {
    label: "Analyse",
    title: "Analyse",
    heading: "From Data Collection To Audit-Ready Reports",
    description: "Measure accurately, analyze confidently, and report with complete compliance — all in one workflow.",
  },
  {
    label: "Report",
    title: "Report",
    heading: "From Data Collection To Audit-Ready Reports",
    description: "Measure accurately, analyze confidently, and report with complete compliance — all in one workflow.",
  },
];
/* ================================================================== */
/*  REUSABLE ICONS & SVGS                                             */
/* ================================================================== */
const RobotIcon = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16.01" />
    <line x1="16" y1="16" x2="16" y2="16.01" />
    {/* Frame corners */}
    <path d="M4 6h3" />
    <path d="M4 6v3" />
    <path d="M20 6h-3" />
    <path d="M20 6v3" />
    <path d="M4 18v-3" />
    <path d="M20 18v-3" />
  </svg>
);
const DocIcon = ({ className, type }) => {
  switch (type) {
    case "xls":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-2 16H8v-2h4v2zm2-4H8v-2h6v2zm-2-4H8V8h4v2zm3-5V3.5L18.5 9H15z" />
          <text x="12" y="15" fontSize="6" fontWeight="bold" fill="white" textAnchor="middle">
            XLS
          </text>
        </svg>
      );
    case "pdf":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z" />
        </svg>
      );
    case "word":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-2 14.5l-2.5-4-2.5 4H5l3.5-5.5L5 9h2l2.5 4 2.5-4h2l-3.5 5.5L14 20h-2zm1-9V3.5L18.5 9H13z" />
        </svg>
      );
    case "db":
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 3.79 2 6s4.48 4 10 4 10-1.79 10-4-4.48-4-10-4zm0 6c-4.41 0-8-1.12-8-2.5S7.59 3.5 12 3.5 20 4.62 20 6 16.41 8 12 8zm0 2c-4.41 0-8-1.12-8-2.5V10c0 1.38 3.59 2.5 8 2.5s8-1.12 8-2.5V7.5C20 8.88 16.41 10 12 10zm0 4c-4.41 0-8-1.12-8-2.5V14c0 1.38 3.59 2.5 8 2.5s8-1.12 8-2.5v-2.5c0 1.38-3.59 2.5-8 2.5zm0 4c-4.41 0-8-1.12-8-2.5V18c0 1.38 3.59 2.5 8 2.5s8-1.12 8-2.5v-2.5c0 1.38-3.59 2.5-8 2.5z" />
        </svg>
      );
  }
};
/* ================================================================== */
/*  CONTENT PANELS                                                    */
/* ================================================================== */
/* ---------- Step 1: Measure ---------- */
function MeasurePanel() {
  return (
    <div className="flex flex-col md:flex-row items-stretch justify-center gap-4 md:gap-6 lg:gap-12 w-full max-w-4xl mx-auto rounded-3xl bg-white/80 backdrop-blur-sm border border-gray-100 shadow-xl p-4 sm:p-8 h-full">
      {/* Left Column: Data Collection Card */}
      <div className="flex-1 w-full max-w-sm rounded-2xl bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden flex flex-col">
        <div className="bg-[#ee7c16] px-4 sm:px-6 py-3 sm:py-4">
          <h3 className="text-white font-semibold text-base sm:text-lg">Data Collection</h3>
        </div>
        <div className="px-4 sm:px-6 py-2">
          {["Total Scope 1 Emissions", "Total Scope 2 Emissions", "Total Energy Consumption", "Total Water Consumption", "Total Water Discharge"].map((item, i) => (
            <div key={i} className="py-2 sm:py-3 border-b border-gray-100 last:border-0 text-gray-600 text-xs sm:text-sm font-medium">
              {item}
            </div>
          ))}
        </div>
      </div>
      {/* Center Column: Orange Arrows */}
      <div className="flex flex-row md:flex-col gap-3 sm:gap-4 justify-center items-center py-2 md:py-0">
        {[1, 2, 3].map((_, i) => (
          <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#fdf2e8] flex items-center justify-center text-[#ee7c16]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-90 sm:h-5 sm:w-5 md:rotate-0">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        ))}
      </div>
      {/* Right Column: Plant Admin Table */}
      <div className="flex-[1.5] w-full max-w-md rounded-2xl bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden flex flex-col">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase">S.No</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase">Plant Name</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase">Verified by</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: 1, name: "Plant 1", verifier: "Plants Admin" },
              { id: 2, name: "Plant 2", verifier: "Plants Admin" },
              { id: 3, name: "Plant 3", verifier: "Plants Admin" },
            ].map((row, i) => (
              <tr key={row.id} className={i % 2 === 0 ? "bg-gray-50/80" : "bg-white"}>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-800">{row.id}.</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-800">{row.name}</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-800">{row.verifier}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
/* ---------- Step 2: Analyse ---------- */
function AnalysePanel() {
  return (
    <div className="flex flex-col md:flex-row items-stretch justify-center gap-4 lg:gap-8 w-full max-w-4xl mx-auto rounded-3xl bg-white/80 backdrop-blur-sm border border-gray-100 shadow-xl p-4 sm:p-8 min-h-[300px] sm:min-h-[360px] h-full">
      {/* Left Column: Surface Water Table */}
      <div className="flex-1 w-full max-w-xs rounded-2xl bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden flex flex-col px-3 sm:px-4 py-4 sm:py-6">
        <h4 className="text-gray-500 text-xs sm:text-sm text-center mb-4 sm:mb-6">Surface water</h4>
        <div className="space-y-2 sm:space-y-3">
          {[
            { raw: "69,346", unit: "69,346 Million Litres" },
            { raw: "12,377", unit: "69,346 Million Litres" },
            { raw: "10,304", unit: "69,346 Million Litres" },
          ].map((row, i) => (
            <div key={i} className="flex justify-between items-center bg-gray-50/80 rounded-full px-3 sm:px-5 py-2 sm:py-3">
              <span className="text-xs sm:text-sm font-medium text-gray-800">{row.raw}</span>
              <span className="text-xs sm:text-sm font-medium text-gray-800 truncate ml-2">{row.unit}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Center Column: Dotted Arrows with Validators */}
      <div className="flex flex-row md:flex-col gap-4 sm:gap-6 w-auto md:w-32 relative justify-center items-center py-2 md:py-0">
        {/* Top 2: Valid */}
        {[0, 1].map((i) => (
          <div key={`valid-${i}`} className="flex items-center w-16 md:w-full relative h-8 md:h-10">
            <div className="w-full h-[2px] border-b-2 border-dotted border-green-400 opacity-60"></div>
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-100 flex items-center justify-center text-green-500 z-10 bounce-subtle"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
          </div>
        ))}
        {/* Bottom 1: Invalid */}
        <div className="flex items-center w-16 md:w-full relative h-8 md:h-10">
          <div className="w-full h-[2px] border-b-2 border-dotted border-red-400 opacity-60"></div>
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 z-10 bounce-subtle"
            style={{ animationDelay: "0.4s" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </div>
        </div>
      </div>
      {/* Right Column: AI Analysing Card */}
      <div className="flex-[1.2] w-full max-w-[260px] mx-auto rounded-3xl bg-[#fef5ec] flex flex-col items-center justify-center gap-3 sm:gap-4 shadow-sm border border-[#ffe0c4] h-full py-8 md:py-0">
        <RobotIcon className="w-14 h-14 sm:w-20 sm:h-20 text-[#ee7c16]" />
        <span className="text-[#ee7c16] font-semibold text-base sm:text-lg pulse-opacity">AI Analysing ...</span>
      </div>
    </div>
  );
}
/* ---------- Step 3: Report ---------- */
function ReportPanel() {
  return (
    <div className="flex flex-col md:flex-row items-stretch justify-center gap-4 lg:gap-8 w-full max-w-4xl mx-auto rounded-3xl bg-white/80 backdrop-blur-sm border border-gray-100 shadow-xl p-4 sm:p-8 min-h-[300px] sm:min-h-[360px] h-full">
      {/* Left Column: AI Analysing Card */}
      <div className="flex-[1.2] w-full max-w-[260px] mx-auto rounded-3xl bg-[#fef5ec] flex flex-col items-center justify-center gap-3 sm:gap-4 shadow-sm border border-[#ffe0c4] h-full py-8 md:py-0">
        <RobotIcon className="w-14 h-14 sm:w-20 sm:h-20 text-[#ee7c16]" />
        <span className="text-[#ee7c16] font-semibold text-base sm:text-lg pulse-opacity">AI Analysing ...</span>
      </div>
      {/* Center Column: Dotted Arrows with Document Icons */}
      <div className="flex flex-row md:flex-col gap-3 sm:gap-5 w-auto md:w-32 relative justify-center items-center py-2 md:py-0">
        {[
          { type: "db", color: "text-orange-500" },
          { type: "xls", color: "text-green-500" },
          { type: "pdf", color: "text-red-500" },
          { type: "word", color: "text-blue-500" },
        ].map((doc, i) => (
          <div key={`doc-${i}`} className="flex items-center w-12 md:w-full relative h-8 md:h-10">
            <div className="w-full h-[2px] border-b-2 border-dotted border-blue-400 opacity-60"></div>
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-md flex items-center justify-center z-10 bounce-subtle"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <DocIcon type={doc.type} className={`w-6 h-6 sm:w-8 sm:h-8 ${doc.color}`} />
            </div>
          </div>
        ))}
      </div>
      {/* Right Column: Report Export Table */}
      <div className="flex-[1.5] w-full max-w-md rounded-2xl bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden flex flex-col">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500">S.No</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500">Report Name</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500">Generated by</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: 1, name: "Report 1", generator: "Niranjan S" },
              { id: 2, name: "Report 2", generator: "Raj Gupta" },
              { id: 3, name: "Report 3", generator: "Manoj K" },
            ].map((row, i) => (
              <tr key={row.id} className={i % 2 === 0 ? "bg-gray-50/80" : "bg-white"}>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-800">{row.id}.</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-800">{row.name}</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-800">{row.generator}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
const PANELS = [MeasurePanel, AnalysePanel, ReportPanel];
/* ================================================================== */
/*  MAIN COMPONENT                                                    */
/* ================================================================== */
export default function ProcessSection() {
  const sectionRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [mobileActiveStep, setMobileActiveStep] = useState(0);
  const measureRef = useRef(null);
  const [measuredHeight, setMeasuredHeight] = useState(null);
  // Use framer-motion useScroll on the section container
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  // Use a spring for smoothness (dampening)
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  // Transform scroll progress to widths and steps
  const barWidth = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);
  const steppedValue = useTransform(smoothProgress, [0, 1], [0, steps.length - 1]);
  // Sync the active step index for UI headings/dots
  useMotionValueEvent(steppedValue, "change", (latest) => {
    setActiveStep(Math.round(latest));
  });

  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const update = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      setMeasuredHeight(h);
    };

    update();

    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(update);
      ro.observe(el);
    }
    window.addEventListener("resize", update);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);
  return (
    <section ref={sectionRef} id="platform" className="relative bg-white px-4 py-8 sm:px-6 lg:px-8">
      {/* ---- Desktop: sticky scroll-driven ---- */}
      <div className="hidden lg:block relative" style={{ height: "300vh" }}>
        <div className="sticky top-0 h-screen flex items-center py-16">
          <div className="mx-auto w-full w-full max-w-[1920px] xl:max-w-[92%] px-3 md:px-8">
            <div className="py-10 px-8 md:px-12 w-full max-w-[1920px] xl:max-w-[92%] mx-auto">
              {/* Static Heading */}
              <div className="text-center max-w-2xl mx-auto mb-10">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-bark-900 mb-4">{steps[0].heading}</h2>
                <p className="text-sm font-medium text-bark-900/80">{steps[0].description}</p>
              </div>
              {/* Progress bar with dots */}
              <div className="flex justify-center py-4 mb-4">
                <div className="relative" style={{ width: 400 }}>
                  <div className="absolute left-6 right-6 top-[5px]">
                    <div className="h-[2px] bg-gray-200 rounded-full" />
                    {/* Orange Progress Bar using motion.div for smoothness */}
                    <motion.div className="absolute top-0 left-0 h-[2px] rounded-full bg-[#ee7c16]" style={{ width: barWidth }} />
                  </div>
                  <div className="relative flex justify-between">
                    {steps.map((step, index) => {
                      const isActive = activeStep === index;
                      return (
                        <div key={step.label} className="flex flex-col items-center" style={{ width: 48 }}>
                          <div className="flex items-center justify-center" style={{ height: 12 }}>
                            <motion.div
                              className="rounded-full relative z-10"
                              initial={false}
                              animate={{
                                width: isActive ? 12 : 8,
                                height: isActive ? 12 : 8,
                                backgroundColor: isActive ? "#ee7c16" : "#e2e8f0",
                                boxShadow: isActive ? "0 0 0 4px rgba(238, 124, 22, 0.2)" : "0 0 0 0 transparent",
                              }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                            />
                          </div>
                          <motion.span className="text-sm mt-3 font-semibold whitespace-nowrap" animate={{ color: isActive ? "#22180f" : "#64748b" }} transition={{ duration: 0.3 }}>
                            {step.label}
                          </motion.span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              {/* Crossfading content panels using motion.div for smoother transitions */}
              <div className="grid mt-8 min-h-[360px]" style={{ margin: "2rem auto 0" }}>
                {PANELS.map((Panel, index) => {
                  const isActive = activeStep === index;
                  const wrapperStyle = {
                    pointerEvents: isActive ? "auto" : "none",
                    height: measuredHeight ? `${measuredHeight}px` : "auto",
                  };
                  return (
                    <motion.div
                      key={index}
                      className="col-start-1 row-start-1 h-full"
                      animate={{
                        opacity: isActive ? 1 : 0,
                        scale: isActive ? 1 : 0.98,
                        y: isActive ? 0 : 10,
                      }}
                      transition={{
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1], // Custom quintic ease-out for extra smoothness
                      }}
                      style={wrapperStyle}
                    >
                      <div ref={index === 0 ? measureRef : null} className="h-full">
                        <Panel />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ---- Mobile: tabs ---- */}
      <div className="lg:hidden py-16 px-4">
        <div className="text-center mb-10 px-2">
          <h2 className="text-[28px] min-[375px]:text-[32px] min-[480px]:text-[36px] leading-[1.15] font-display font-bold text-bark-900 mb-5">{steps[0].heading}</h2>
          <p className="text-[15px] min-[375px]:text-[17px] leading-relaxed font-medium text-bark-900/80">{steps[0].description}</p>
        </div>

        {/* Mobile/Tablet Tabs */}
        <div className="relative mb-10 px-4 w-full max-w-sm md:max-w-md mx-auto">
          <div className="absolute top-[10px] left-[15%] right-[15%] h-[2px] bg-gray-200" />
          <div className="relative flex justify-between z-10 w-full">
            {steps.map((step, index) => {
              const isActive = mobileActiveStep === index;
              return (
                <button
                  key={step.label}
                  onClick={() => setMobileActiveStep(index)}
                  className="flex flex-col items-center gap-3 relative focus:outline-none bg-white px-2"
                >
                  <div className="w-5 h-5 flex items-center justify-center bg-white rounded-full">
                    <div
                      className={`rounded-full transition-all duration-300 ${
                        isActive ? "w-4 h-4 bg-[#ee7c16] ring-[6px] ring-[#ee7c16]/20" : "w-[14px] h-[14px] bg-gray-300"
                      }`}
                    />
                  </div>
                  <span className={`text-[13px] min-[375px]:text-[16px] tracking-wide transition-colors ${isActive ? "text-bark-900 font-semibold" : "text-bark-900/70 font-medium"}`}>
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="transition-all duration-300 w-full max-w-sm md:max-w-2xl mx-auto overflow-hidden rounded-[20px] border border-gray-200 shadow-sm bg-white p-4">
          <div className="transform scale-[0.75] min-[375px]:scale-[0.85] md:scale-100 origin-top h-[600px] md:h-auto">
            {(() => {
              const Panel = PANELS[mobileActiveStep];
              return <Panel />;
            })()}
          </div>
        </div>
      </div>
    </section>
  );
}
