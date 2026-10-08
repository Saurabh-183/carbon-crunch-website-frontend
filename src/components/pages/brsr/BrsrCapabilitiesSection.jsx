import brsrImage1 from "../../../assets/brsr/1.png";
import brsrImage2 from "../../../assets/brsr/2.png";
import brsrImage3 from "../../../assets/brsr/3.png";
import brsrImage4 from "../../../assets/brsr/4.png";
import dataCollectionImg from "../../../assets/brsr/data-collection.png";
import aiGenerateImg from "../../../assets/brsr/ai-generate.png";
import pdfCustomizeImg from "../../../assets/brsr/pdf-customize.png";
import brsrInfo2 from "../../../assets/images_dir/brsr2.png";
import brsrInfo3 from "../../../assets/images_dir/brsr3.png";
import brsrInfo4 from "../../../assets/images_dir/brsr4.png";

const capabilities = [
  {
    title: "Invite & Collaborate",
    points: ["Invite CA/CS professionals, consultants, and agencies", "Assign role-based access and responsibilities", "Enable structured collaboration across stakeholders"],
    image: brsrImage1,
    dashboardClass:
      "absolute top-[8%] left-[8%] w-[115%] lg:w-[125%] bg-white rounded-l-[16px] lg:rounded-l-[24px] rounded-r-none border-t-[6px] border-l-[6px] border-[#261E14] shadow-2xl overflow-hidden",
    decorations: [
      { src: brsrInfo3, className: "absolute top-[5%] right-[5%] lg:right-[-20px] w-[140px] md:w-[180px] lg:w-[220px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)] z-20" },
      { src: brsrInfo2, className: "absolute bottom-[10%] left-[-5%] lg:left-[-30px] w-[80%] max-w-[340px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)] z-20" },
    ],
  },
  {
    title: "Sustain AI",
    points: ["Auto-fill responses with AI assistance", "Get smart suggestions for faster completion", "Reduce manual effort and errors"],
    image: brsrImage2,
    dashboardClass:
      "absolute top-[8%] right-[8%] w-[115%] lg:w-[125%] bg-white rounded-r-[16px] lg:rounded-r-[24px] rounded-l-none border-t-[6px] border-r-[6px] border-[#261E14] shadow-2xl overflow-hidden",
    decorations: [{ src: aiGenerateImg, className: "absolute top-[10%] lg:top-[12%] left-[-5%] lg:left-[-40px] w-[85%] md:w-[320px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)] z-20" }],
  },
  {
    title: "Multi-Format Reporting",
    points: ["Generate reports in XBRL format", "Export professional PDF reports", "Ensure compliance-ready outputs"],
    image: brsrImage3,
    dashboardClass:
      "absolute top-[8%] left-[8%] w-[115%] lg:w-[125%] bg-white rounded-l-[16px] lg:rounded-l-[24px] rounded-r-none border-t-[6px] border-l-[6px] border-[#261E14] shadow-2xl overflow-hidden",
    decorations: [{ src: brsrInfo4, className: "absolute bottom-[10%] lg:bottom-[15%] right-[5%] lg:right-[-20px] w-[80%] max-w-[340px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)] z-20" }],
  },
  {
    title: "PDF Customisation",
    points: ["Add company logo and branding", "Customize colors and fonts", "Generate presentation-ready reports"],
    image: brsrImage4,
    dashboardClass:
      "absolute top-[8%] right-[8%] w-[115%] lg:w-[125%] bg-white rounded-r-[16px] lg:rounded-r-[24px] rounded-l-none border-t-[6px] border-r-[6px] border-[#261E14] shadow-2xl overflow-hidden",
    decorations: [{ src: pdfCustomizeImg, className: "absolute bottom-[10%] lg:bottom-[15%] left-[5%] lg:left-[-20px] w-[180px] md:w-[220px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)] z-20" }],
  },
];

export default function BrsrCapabilitiesSection() {
  return (
    <section className="bg-white px-4 pb-0 pt-20 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1920px] xl:max-w-[92%]">
        <h2 className="text-center font-display text-[36px] font-semibold text-[#261E14] sm:text-[44px] lg:text-[52px]">Our Key Capabilities</h2>

        <div className="mt-16 space-y-24 md:space-y-32">
          {capabilities.map((item, index) => {
            const isReversed = index % 2 !== 0;
            return (
              <article key={item.title} className={`flex flex-col gap-12 lg:gap-14 lg:flex-row items-center justify-between ${isReversed ? "lg:flex-row-reverse" : ""}`}>
                <div className="w-full lg:w-[45%] shrink-0 px-2 lg:px-0">
                  <h3 className="font-display text-[30px] font-semibold text-[#261E14] sm:text-[36px] lg:text-[42px]">{item.title}</h3>
                  <ul className="mt-5 space-y-4 text-[16px] text-[#261E14]/80">
                    {item.points.map((point) => (
                      <li key={point} className="flex items-start gap-4">
                        <span className="mt-2 h-2 w-2 rounded-full bg-[#F27A18] shrink-0" />
                        <span className="leading-snug">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="relative w-full lg:w-[50%] shrink-0 px-2 lg:px-0 mt-6 lg:mt-0">
                  <div className="relative w-full h-[320px] md:h-[400px] lg:h-[480px] rounded-[32px] bg-[#FDF2E7] overflow-hidden shadow-inner border border-black/5">
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
