import industryImage1 from "../../../assets/industry/1.png";
import industryImage2 from "../../../assets/industry/2.png";
import industryImage3 from "../../../assets/industry/3.png";

import iconCement from "../../../assets/industriesIcons/cementIcon.png";
import iconChemicals from "../../../assets/industriesIcons/chemicalsIcon.png";
import iconEnergy from "../../../assets/industriesIcons/energyIcon.png";
import iconFmcg from "../../../assets/industriesIcons/fmcgIcon.png";
import iconManufacturing from "../../../assets/industriesIcons/manufacturingIcon.png";
import iconMetals from "../../../assets/industriesIcons/metalsIcon.png";
import iconService from "../../../assets/industriesIcons/serviceicon.png";
import iconTextiles from "../../../assets/industriesIcons/textilesIcon.png";

import imgCement from "../../../assets/industriesImages/cement.png";
import imgChemicals from "../../../assets/industriesImages/chemicals.png";
import imgEnergy from "../../../assets/industriesImages/energypower.png";
import imgFmcg from "../../../assets/industriesImages/fmcg.png";
import imgManufacturing from "../../../assets/industriesImages/manufacturing.png";
import imgMetals from "../../../assets/industriesImages/metalmining.png";
import imgService from "../../../assets/industriesImages/servicesenterprises.png";
import imgTextiles from "../../../assets/industriesImages/textiles.png";

import chipCircularity from "../../../assets/industryChipImages/circularityImage.png";
import chipGenerate from "../../../assets/industryChipImages/generateImage.png";
import chipGrid from "../../../assets/industryChipImages/gridComplianceImage.png";

export const industries = [
  {
    title: "Manufacturing",
    text: "Manage multi-plant ESG reporting with structured data and compliance workflows.",
    icon: iconManufacturing,
    image: imgManufacturing,
  },
  {
    title: "Energy & Power",
    text: "Track emissions, energy data, and regulatory reporting across operations.",
    icon: iconEnergy,
    image: imgEnergy,
  },
  {
    title: "Metals & Mining",
    text: "Handle complex supply chain and high impact ESG disclosures with accuracy.",
    icon: iconMetals,
    image: imgMetals,
  },
  {
    title: "Cement",
    text: "Streamline carbon-intensive reporting with standardized and audit-ready data systems.",
    icon: iconCement,
    image: imgCement,
  },
  {
    title: "Chemicals",
    text: "Ensure compliance with structured tracking of emissions, waste, and resource usage.",
    icon: iconChemicals,
    image: imgChemicals,
  },
  {
    title: "FMCG",
    text: "Manage ESG reporting across distributed operations and supply chains.",
    icon: iconFmcg,
    image: imgFmcg,
  },
  {
    title: "Services & Enterprises",
    text: "Simplify ESG reporting with centralized data and structured disclosures.",
    icon: iconService,
    image: imgService,
  },
  {
    title: "Textiles",
    text: "Monitor resource usage, emissions, and supply chain reporting with ease.",
    icon: iconTextiles,
    image: imgTextiles,
  },
];

export const capabilities = [
  {
    label: "Manufacturing & Cement",
    title: "Multi-Plant Carbon & Compliance",
    points: [
      "Plant-Level Carbon Accounting: Track Scope 1, 2, 3 emissions across facilities with visual mapping of sources",
      "CCTS & BRSR Readiness: Generate audit-ready plant-level data for compliance",
      "Consolidated Reporting: Get facility-level and organization-wide insights in Excel/PDF",
    ],
    image: industryImage1,
    dashboardClass:
      "absolute top-[8%] left-[8%] w-[115%] lg:w-[125%] bg-white rounded-l-[16px] lg:rounded-l-[24px] rounded-r-none border-t-[6px] border-l-[6px] border-[#261E14] shadow-2xl overflow-hidden",
    decorations: [
      {
        src: chipGenerate,
        className: "absolute top-[-10px] sm:top-[2%] left-[-10px] sm:left-[-3%] w-[260px] sm:w-[350px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] z-20 transition-transform hover:-translate-y-1",
      },
    ],
  },
  {
    label: "Energy, Power & Metals",
    title: "Grid Compliance & Carbon Reporting",
    points: [
      "RCO Compliance: Monitor energy intensity and ensure regulatory adherence",
      "CBAM Readiness: Maintain export compliance with accurate carbon data",
      "AI + OCR Automation: Auto-extract data from bills and reports to reduce manual effort",
    ],
    image: industryImage2,
    dashboardClass:
      "absolute top-[8%] right-[8%] w-[115%] lg:w-[125%] bg-white rounded-r-[16px] lg:rounded-r-[24px] rounded-l-none border-t-[6px] border-r-[6px] border-[#261E14] shadow-2xl overflow-hidden",
    decorations: [
      { src: chipGrid, className: "absolute top-[2%] right-[-10px] sm:right-[15%] w-[180px] sm:w-[240px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] z-20 transition-transform hover:-translate-y-1" },
    ],
  },
  {
    label: "Textiles",
    title: "Circularity & Supply Chain Visibility",
    points: [
      "Waste & Water Compliance: Track waste, discharge, and water usage with audit trails",
      "Scope 3 Tracking: Capture supply chain emissions and material flows",
      "Unified Collaboration: Manage teams and workflows across multiple locations",
    ],
    image: industryImage3,
    dashboardClass:
      "absolute top-[8%] left-[8%] w-[115%] lg:w-[125%] bg-white rounded-l-[16px] lg:rounded-l-[24px] rounded-r-none border-t-[6px] border-l-[6px] border-[#261E14] shadow-2xl overflow-hidden",
    decorations: [
      {
        src: chipCircularity,
        className: "absolute top-[5%] right-[-10px] sm:right-[5%] w-[200px] sm:w-[260px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] z-20 transition-transform hover:-translate-y-1",
      },
    ],
  },
];
