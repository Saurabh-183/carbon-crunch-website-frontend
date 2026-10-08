import { motion } from "framer-motion";
import { platformCards } from "../data/content";
import SectionHeading from "./ui/SectionHeading";
import flowerShape from "../assets/home-section-5/1.png";
import starShape from "../assets/home-section-5/3.png";
import waterDropShape from "../assets/home-section-5/4.png";
import wasteShape from "../assets/home-section-5/5.png";

const cardStyles = {
  "ESG Board": {
    wrapper: "bg-[#E9E2AA] text-[#2f2620]",
    title: "text-[#2f2620]",
    accent: "text-[#f07e00]",
    description: "text-[#2f2620]/75",
    chip: "bg-white/85 text-[#f07e00]",
  },
  "CarbonOS": {
    wrapper: "bg-gradient-to-r from-[#0f4d26] to-[#0a3e26] text-white",
    title: "text-white",
    accent: "text-[#1bb56b]",
    description: "text-white/85",
    chip: "bg-white/12 text-white/90 border border-white/10",
  },
  "EnergyOS": {
    wrapper: "bg-[#e8dbcf] text-[#2f2620]",
    title: "text-[#2f2620]",
    accent: "text-[#f07e00]",
    description: "text-[#2f2620]/75",
    chip: "bg-white/90 text-[#f07e00]",
  },
  "WaterOS": {
    wrapper: "bg-[#1f5a99] text-white",
    title: "text-white",
    accent: "text-[#59afea]",
    description: "text-white/90",
    chip: "bg-white/12 text-white/90 border border-white/10",
  },
  "WasteOS": {
    wrapper: "bg-[#e8dbcf] text-[#2f2620]",
    title: "text-[#2f2620]",
    accent: "text-[#f07e00]",
    description: "text-[#2f2620]/75",
    chip: "bg-white/90 text-[#f07e00]",
  },
};

const chipMap = {
  "ESG Board": ["BRSR Reporting", "GRI Reporting"],
  "CarbonOS": ["GHG Reporting", "CCTS Reporting", "CBAM Reporting"],
  "EnergyOS": ["RCO Reporting"],
  "WaterOS": ["Water Consumption Report"],
  "WasteOS": ["Waste Generation Report"],
};

export default function SolutionsSection() {
  const topCards = platformCards.slice(0, 2);
  const bottomCards = platformCards.slice(2);

  const renderTitle = (title, styles) => {
    if (title.endsWith("OS")) {
      const base = title.slice(0, -2);
      return (
        <h3 className={`font-display text-[30px] sm:text-[34px] lg:text-[44px] leading-[1.1] ${styles.title}`}>
          <span>{base}</span>
          <span className={styles.accent}>OS</span>
        </h3>
      );
    }

    const [firstWord, ...rest] = title.split(" ");
    const restText = rest.join(" ");

    return (
      <h3 className={`font-display text-[30px] sm:text-[34px] lg:text-[44px] leading-[1.1] ${styles.title}`}>
        <span>{firstWord} </span>
        <span className={styles.accent}>{restText}</span>
      </h3>
    );
  };

  return (
    <section id="services" className="bg-[#ffffff] px-4 pb-12 pt-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1920px] xl:max-w-[92%]">
        <SectionHeading
          title="Built For Every Layer Of Sustainability & Compliance"
          description="Carbon Crunch brings all your sustainability workflows into one platform - from regulatory reporting to resource-level accounting - structured, connected, and audit-ready."
        />

        <div className="mt-10 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {topCards.map((card, index) => (
              <motion.article
                key={card.title}
                className={`relative min-h-[220px] sm:min-h-[280px] overflow-hidden rounded-2xl px-4 pb-5 pt-5 sm:min-h-[360px] sm:px-7 sm:pt-8 sm:pb-6 ${cardStyles[card.title].wrapper}`}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
              >
                <div className="relative z-10">
                  {renderTitle(card.title, cardStyles[card.title])}
                  <p className={`mt-3 sm:mt-4 max-w-[520px] text-[17px] sm:text-[22px] leading-[1.5] ${cardStyles[card.title].description}`}>{card.description}</p>
                  <a href="#company" className={`mt-5 sm:mt-6 inline-flex items-center gap-2 text-[17px] sm:text-[22px] font-semibold ${cardStyles[card.title].title}`}>
                    Learn more <span aria-hidden="true">→</span>
                  </a>

                  <div className="mt-5 flex flex-wrap gap-2 sm:gap-3">
                    {(chipMap[card.title] ?? []).map((chip) => (
                      <span key={chip} className={`rounded-full px-4 py-1.5 text-[14px] sm:text-[16px] font-medium leading-none ${cardStyles[card.title].chip}`}>
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                {card.title === "ESG Board" ? <img src={flowerShape} alt="" aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 h-36 w-auto object-contain" /> : null}
                {card.title === "CarbonOS" ? (
                  <div className="pointer-events-none absolute bottom-4 right-5 h-28 w-44">
                    <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-[#2b7a49]/90" />
                    <div className="absolute bottom-3 right-14 h-20 w-20 rounded-full bg-[#1d6a3f]/90" />
                  </div>
                ) : null}
              </motion.article>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bottomCards.map((card, index) => (
              <motion.article
                key={card.title}
                className={`relative min-h-[200px] sm:min-h-[270px] overflow-hidden rounded-2xl px-4 pb-5 pt-5 sm:min-h-[350px] sm:px-7 sm:pt-8 sm:pb-6 ${cardStyles[card.title].wrapper}`}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
              >
                <div className="relative z-10">
                  {renderTitle(card.title, cardStyles[card.title])}
                  <p className={`mt-3 sm:mt-4 max-w-[320px] text-[17px] sm:text-[22px] leading-[1.5] ${cardStyles[card.title].description}`}>{card.description}</p>
                  <a href="#company" className={`mt-5 sm:mt-6 inline-flex items-center gap-2 text-[17px] sm:text-[22px] font-semibold ${cardStyles[card.title].title}`}>
                    Learn more <span aria-hidden="true">→</span>
                  </a>

                  <div className="mt-5 flex flex-wrap gap-2 sm:gap-3">
                    {(chipMap[card.title] ?? []).map((chip) => (
                      <span key={chip} className={`rounded-full px-4 py-1.5 text-[14px] sm:text-[16px] font-medium leading-none ${cardStyles[card.title].chip}`}>
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                {card.title === "EnergyOS" ? <img src={starShape} alt="" aria-hidden="true" className="pointer-events-none absolute bottom-2 right-4 h-16 w-auto object-contain" /> : null}
                {card.title === "WaterOS" ? (
                  <div className="pointer-events-none absolute bottom-0 right-0 h-28 w-28">
                    <div className="absolute -bottom-4 -right-4 h-24 w-24 rotate-[34deg] rounded-[22px] bg-[#76a5d6]/55" />
                    <img src={waterDropShape} alt="" aria-hidden="true" className="absolute bottom-5 right-5 h-12 w-auto object-contain" />
                  </div>
                ) : null}
                {card.title === "WasteOS" ? <img src={wasteShape} alt="" aria-hidden="true" className="pointer-events-none absolute bottom-4 right-6 h-16 w-auto object-contain" /> : null}
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
