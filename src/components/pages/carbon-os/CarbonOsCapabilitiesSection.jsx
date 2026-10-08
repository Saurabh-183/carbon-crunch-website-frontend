import cosImage1 from "../../../assets/cos/1.png";
import cosImage2 from "../../../assets/cos/2.png";
import cosImage3 from "../../../assets/cos/3.png";
import cosImage4 from "../../../assets/cos/4.png";
import cosInfo1 from "../../../assets/images_dir/cos1.png";
import cosInfo2 from "../../../assets/images_dir/cos2.png";
import cosInfo3 from "../../../assets/images_dir/cos3.png";
import cosInfo4 from "../../../assets/images_dir/cos4.png";

const capabilities = [
  {
    title: "Infrastructure Canvas",
    points: [
      "Visual Mapping: Create a digital twin of your plant layout.",
      "Asset Customization: Define specifications, maintenance schedules, and operational parameters for each component.",
      "Real-Time Context: Visualize how interconnected systems interact, enabling faster troubleshooting and more efficient layout planning",
    ],
    image: cosImage1,
    dashboardClass:
      "absolute top-[10%] left-[8%] w-[115%] lg:w-[125%] bg-[#F4F6F8] rounded-tl-[16px] lg:rounded-tl-[24px] shadow-[0_30px_60px_rgba(0,0,0,0.4)] overflow-hidden border-t border-l border-white/40",
    decorations: [
      {
        src: cosInfo1,
        className:
          "absolute top-[-5%] right-[0%] lg:right-[-30px] lg:top-[-20px] w-[200px] md:w-[260px] lg:w-[320px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.2)] z-20 hover:-translate-y-2 transition-transform duration-500",
      },
    ],
  },
  {
    title: "AI +OCR - Zero-Touch Data Entry From Bills & Documents",
    points: [
      "Smart Uploads: Simply upload bills, invoices, or technical documents.",
      "Automated Data Entry: The system reads, interprets, and auto-fills the relevant fields within the software.",
      "Error Reduction: Minimize human error associated with manual transcription, ensuring your financial and operational data remains accurate.",
    ],
    image: cosImage2,
    dashboardClass:
      "absolute top-[15%] left-[8%] w-[115%] lg:w-[125%] bg-white rounded-tl-[16px] lg:rounded-tl-[24px] shadow-[0_30px_60px_rgba(0,0,0,0.4)] overflow-hidden border-t border-l border-white/40",
    decorations: [
      {
        src: cosInfo2,
        className:
          "absolute top-[-10%] lg:top-[-40px] right-[5%] lg:right-[15%] w-[240px] md:w-[300px] lg:w-[380px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.25)] z-20 hover:-translate-y-2 transition-transform duration-500",
      },
    ],
  },
  {
    title: "Orchestrate Your Workforce From A Single Platform",
    points: [
      "Role-Based Access: Assign permissions and control what team members can view or edit.",
      "Streamlined Communication: Assign tasks, track progress, and share updates within the context of specific projects or machinery.",
      "Performance Monitoring: Gain insights into team productivity and resource allocation across multiple shifts and departments.",
    ],
    image: cosImage3,
    dashboardClass:
      "absolute top-[15%] left-[8%] w-[115%] lg:w-[125%] bg-white rounded-tl-[16px] lg:rounded-tl-[24px] shadow-[0_30px_60px_rgba(0,0,0,0.4)] overflow-hidden border-t border-l border-white/40",
    decorations: [
      {
        src: cosInfo3,
        className:
          "absolute top-[5%] md:top-[10%] right-[-10%] lg:right-[-60px] w-[220px] md:w-[300px] lg:w-[360px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.25)] z-20 hover:-translate-y-2 transition-transform duration-500",
      },
    ],
  },
  {
    title: "Centralized Control For Distributed Operations",
    points: [
      "Unified Hierarchy: Create, organize, and manage multiple facilities from one dashboard.",
      "Independent Configurations: Maintain unique layouts, teams, and workflows for each facility while retaining centralized oversight.",
      "Cross-Site Benchmarking: Compare performance metrics across different locations to identify best practices and optimization opportunities.",
    ],
    image: cosImage4,
    dashboardClass:
      "absolute top-[15%] left-[8%] w-[115%] lg:w-[125%] bg-[#F4F6F8] rounded-tl-[16px] lg:rounded-tl-[24px] shadow-[0_30px_60px_rgba(0,0,0,0.4)] overflow-hidden border-t border-l border-white/40",
    decorations: [
      {
        src: cosInfo4,
        className:
          "absolute bottom-[-10%] left-[-5%] lg:left-[-40px] lg:bottom-[-20px] w-[200px] md:w-[280px] lg:w-[340px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.25)] z-20 hover:-translate-y-2 transition-transform duration-500",
      },
    ],
  },
];

export default function CarbonOsCapabilitiesSection() {
  return (
    <section className="bg-white px-4 pb-0 pt-20 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1920px] xl:max-w-[92%]">
        <h2 className="text-center font-display text-[36px] font-semibold text-[#261E14] sm:text-[44px] lg:text-[52px]">Our Key Capabilities</h2>

        <div className="mt-16 space-y-28 md:space-y-40">
          {capabilities.map((item, index) => {
            const isReversed = index % 2 !== 0;
            return (
              <article key={item.title} className={`flex flex-col gap-12 lg:gap-14 lg:flex-row items-center justify-between ${isReversed ? "lg:flex-row-reverse" : ""}`}>
                <div className="w-full lg:w-[45%] shrink-0 px-2 lg:px-0">
                  <h3 className="font-display text-[30px] font-semibold text-[#261E14] sm:text-[36px] lg:text-[42px] leading-[1.2]">{item.title}</h3>
                  <ul className="mt-6 space-y-4 text-[16px] text-[#261E14]/80">
                    {item.points.map((point) => {
                      const [boldPart, rest] = point.split(": ");
                      return (
                        <li key={point} className="flex items-start gap-4">
                          <span className="mt-2 h-2 w-2 rounded-full bg-[#F27A18] shrink-0" />
                          <span className="leading-relaxed">
                            {rest ? (
                              <>
                                <strong className="font-semibold text-[#261E14]">{boldPart}:</strong> {rest}
                              </>
                            ) : (
                              point
                            )}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="relative w-full lg:w-[50%] shrink-0 px-2 lg:px-0 mt-6 lg:mt-0">
                  <div className="relative w-full h-[320px] md:h-[400px] lg:h-[480px] rounded-[32px] bg-[#FDF2E7] overflow-hidden shadow-[inset_0_2px_20px_rgba(0,0,0,0.03)] border border-[#e3dacd]">
                    <div className={item.dashboardClass}>
                      <img src={item.image} alt={`${item.title} dashboard view`} className="block w-full h-auto" loading="lazy" />
                    </div>
                  </div>

                  {item.decorations.map((decor, dIdx) => (
                    <img key={dIdx} src={decor.src} alt="" className={decor.className} />
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
