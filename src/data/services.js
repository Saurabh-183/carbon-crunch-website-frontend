import serviceHero from "../assets/services/hero.png";
import serviceImage1 from "../assets/services/services1.png";
import serviceImage2 from "../assets/services/services2.png";
import serviceImage3 from "../assets/services/services3.png";
import serviceImage4 from "../assets/services/services4.png";
import serviceImage5 from "../assets/services/services5.png";
import serviceImage6 from "../assets/services/services6.png";
import serviceImage7 from "../assets/services/services7.png";

export const servicesHero = {
  image: serviceHero,
  title: "Services That Make ESG Execution Real",
  subtitle: "From carbon accounting to compliance reporting, Carbon Crunch helps you implement, manage, and scale sustainability across your organization.",
};

export const servicesCatalog = [
  {
    slug: "waste-management-circular-economy",
    title: "Waste Management & Circular Economy",
    image: serviceImage1,
    teaser: ["EPR Compliance (Plastic, E-waste, Battery, etc.)", "Waste Audits", "Waste Reduction Strategies", "Circular Economy Consulting"],
    modules: [
      {
        title: "EPR Compliance (Plastic, E-waste, Battery, etc.)",
        description: "We assist organizations in achieving compliance with Extended Producer Responsibility regulations across plastic, e-waste, batteries, and other waste streams.",
        approach: "We provide end-to-end support by combining regulatory expertise, structured documentation processes, and coordination with authorized recyclers.",
        whatWeDo: ["EPR registration and documentation support", "Waste channelization and recycler coordination", "Annual return filing and compliance tracking", "CPCB/SPCB liaison support"],
        benefits: ["Avoid penalties and legal risks", "Ensure full regulatory compliance", "Streamlined waste management processes"],
      },
      {
        title: "Waste Audits",
        description: "A Waste Audit provides a detailed analysis of waste generation, handling, and disposal practices to identify inefficiencies and opportunities for improvement.",
        approach: "We follow a structured methodology involving on-site assessments, waste characterization, and data-driven analysis to deliver actionable insights.",
        whatWeDo: ["Waste quantification and categorization", "Process-level waste analysis", "Identification of reduction opportunities", "Detailed audit reporting"],
        benefits: ["Reduced waste disposal costs", "Improved operational efficiency", "Better regulatory compliance"],
      },
      {
        title: "Waste Reduction Strategies",
        description: "We design customized strategies to minimize waste generation and enhance resource efficiency across your operations.",
        approach: "Our approach integrates process optimization, material efficiency, and reuse strategies to deliver sustainable and cost-effective solutions.",
        whatWeDo: ["Process optimization recommendations", "Material substitution strategies", "Recycling and reuse frameworks", "Zero-waste roadmap development"],
        benefits: ["Lower operational costs", "Reduced environmental impact", "Improved sustainability performance"],
      },
      {
        title: "Circular Economy Consulting",
        description: "We help organizations transition from linear to circular models by focusing on resource recovery, reuse, and sustainable design.",
        approach: "We combine lifecycle thinking, business model innovation, and technical expertise to embed circularity into your operations.",
        whatWeDo: ["Circular business model development", "Lifecycle assessment support", "Resource recovery strategies", "Circular integration planning"],
        benefits: ["Long-term cost savings", "Enhanced brand value", "Sustainable growth"],
      },
    ],
  },
  {
    slug: "water-sustainability-services",
    title: "Water Sustainability Services",
    image: serviceImage2,
    teaser: ["Water Audits", "Water Footprint Assessment", "NOC & Regulatory Approvals", "Water Efficiency & Recycling Solutions"],
    modules: [
      {
        title: "Water Audits",
        description: "A Water Audit evaluates water usage across your facility to identify inefficiencies, losses, and optimization opportunities.",
        approach: "We combine on-site inspections, water balance analysis, and benchmarking to deliver practical, implementable recommendations.",
        whatWeDo: ["Water balance and mapping", "Leakage and loss identification", "Benchmarking analysis", "Conservation recommendations"],
        benefits: ["Reduced water costs", "Improved efficiency", "Regulatory compliance"],
      },
      {
        title: "Water Footprint Assessment",
        description: "We assess the total water footprint of your organization or product, covering direct and indirect water usage impacts.",
        approach: "Our methodology integrates global standards with detailed data analysis to provide accurate and actionable footprint insights.",
        whatWeDo: ["Blue, green, and grey water analysis", "Organizational and product-level footprinting", "Data analysis and reporting", "Reduction strategy recommendations"],
        benefits: ["Enhanced ESG performance", "Better transparency", "Sustainable resource management"],
      },
      {
        title: "NOC & Regulatory Approvals",
        description: "We support organizations in obtaining necessary water-related approvals and regulatory clearances efficiently.",
        approach: "We streamline the approval process through accurate documentation, regulatory expertise, and proactive liaison with authorities.",
        whatWeDo: ["Documentation and application preparation", "Liaison with regulatory bodies", "Compliance tracking and follow-ups", "Renewal support"],
        benefits: ["Faster approvals", "Reduced compliance burden", "Minimized regulatory risks"],
      },
      {
        title: "Water Efficiency & Recycling Solutions",
        description: "We provide solutions to optimize water usage and promote recycling and reuse across operations.",
        approach: "We integrate engineering solutions, process optimization, and reuse strategies to maximize water efficiency.",
        whatWeDo: ["Efficiency improvement plans", "Recycling system design (STP/ETP reuse)", "Technology recommendations", "Implementation support"],
        benefits: ["Reduced freshwater consumption", "Cost savings", "Sustainable operations"],
      },
    ],
  },
  {
    slug: "energy-regulatory-compliance",
    title: "Energy & Regulatory Compliance",
    image: serviceImage3,
    teaser: ["Mandatory Energy Audits", "Perform, Achieve & Trade (PAT)", "Renewable Consumption Obligation (RPO/RCO)", "Energy Efficiency Consulting"],
    modules: [
      {
        title: "Mandatory Energy Audits",
        description: "We conduct detailed energy audits to identify inefficiencies and ensure compliance with regulatory requirements.",
        approach: "Our approach combines technical analysis, on-site measurements, and performance benchmarking to deliver actionable insights.",
        whatWeDo: ["Energy consumption analysis", "Equipment performance evaluation", "Identification of savings opportunities", "Audit reporting"],
        benefits: ["Compliance with regulations", "Reduced energy costs", "Improved efficiency"],
      },
      {
        title: "Perform, Achieve & Trade (PAT)",
        description: "We support industries in meeting PAT scheme requirements by improving energy performance and compliance.",
        approach: "We provide structured support from baseline assessment to target achievement and compliance reporting.",
        whatWeDo: ["Baseline assessment", "Target compliance planning", "Documentation and reporting", "ESCerts support"],
        benefits: ["Avoid penalties", "Improved performance", "Financial gains"],
      },
      {
        title: "Renewable Consumption Obligation (RPO/RCO)",
        description: "We assist organizations in meeting renewable energy obligations through strategic planning and compliance support.",
        approach: "We combine regulatory understanding with market insights to help you meet obligations efficiently.",
        whatWeDo: ["Obligation assessment", "Renewable sourcing strategy", "Compliance tracking", "Documentation support"],
        benefits: ["Regulatory compliance", "Reduced carbon footprint", "Optimized costs"],
      },
      {
        title: "Energy Efficiency Consulting",
        description: "We provide end-to-end consulting to enhance energy efficiency across operations.",
        approach: "We integrate data-driven analysis, technology upgrades, and process improvements for measurable efficiency gains.",
        whatWeDo: ["Energy optimization strategies", "Technology recommendations", "Process improvements", "Monitoring frameworks"],
        benefits: ["Lower energy costs", "Increased productivity", "Sustainability improvement"],
      },
    ],
  },
  {
    slug: "carbon-climate-finance",
    title: "Carbon & Climate Finance",
    image: serviceImage4,
    teaser: [
      "GHG Accounting (Scope 1, 2, 3)",
      "Carbon Footprinting (Org + Product level)",
      "Carbon Feasibility Studies",
      "Carbon Project Development",
      "Carbon Credit Trading Support",
      "Climate Finance Advisory",
    ],
    modules: [
      {
        title: "GHG Accounting (Scope 1, 2, 3)",
        description: "We help organizations measure and report greenhouse gas emissions across all scopes as per global standards.",
        approach: "We use globally accepted methodologies combined with accurate data collection and validation processes.",
        whatWeDo: ["Emissions data collection", "Scope-wise calculations", "Reporting as per GHG Protocol", "Audit-ready documentation"],
        benefits: ["Accurate carbon tracking", "ESG compliance", "Better decision-making"],
      },
      {
        title: "Carbon Footprinting (Org + Product)",
        description: "We assess carbon emissions at both organizational and product levels to support sustainability goals.",
        approach: "We apply lifecycle assessment techniques and robust data analysis for precise footprint calculations.",
        whatWeDo: ["Organizational footprinting", "Product lifecycle emissions", "Data analysis", "Reduction strategies"],
        benefits: ["Improved transparency", "Competitive advantage", "Strong sustainability positioning"],
      },
      {
        title: "Carbon Feasibility Studies",
        description: "We evaluate the feasibility of carbon reduction and offset projects for informed decision-making.",
        approach: "We combine technical, financial, and risk assessments to determine project viability.",
        whatWeDo: ["Technical analysis", "Financial modeling", "Risk evaluation", "ROI estimation"],
        benefits: ["Investment clarity", "Reduced risk", "Better planning"],
      },
      {
        title: "Carbon Project Development",
        description: "We support the development of carbon projects to generate verified carbon credits.",
        approach: "We provide end-to-end support from project identification to validation and registration.",
        whatWeDo: ["Project identification", "Documentation (PDD)", "Validation support", "Registration assistance"],
        benefits: ["Revenue generation", "Sustainability leadership", "Global recognition"],
      },
      {
        title: "Carbon Credit Trading Support",
        description: "We help organizations effectively participate in carbon markets.",
        approach: "We combine market insights with transaction support to maximize value from carbon credits.",
        whatWeDo: ["Market analysis", "Buyer/seller coordination", "Transaction support", "Pricing insights"],
        benefits: ["Revenue opportunities", "Market access", "Risk mitigation"],
      },
      {
        title: "Climate Finance Advisory",
        description: "We guide organizations in accessing climate-related funding and financial opportunities.",
        approach: "We integrate financial expertise with sustainability insights to unlock funding opportunities.",
        whatWeDo: ["Funding identification", "Proposal development", "Financial modeling", "Investor engagement"],
        benefits: ["Access to capital", "Project scalability", "Financial sustainability"],
      },
    ],
  },
  {
    slug: "sustainability-strategy-advisory",
    title: "Sustainability Strategy & Advisory",
    image: serviceImage5,
    teaser: ["Net Zero Roadmap", "Decarbonisation Strategy", "Sustainable Procurement Consulting", "ESG Strategy & Policy Design", "Climate Risk & Opportunity Assessment"],
    modules: [
      {
        title: "Net Zero Roadmap",
        description: "We design structured roadmaps to help organizations achieve net-zero emissions.",
        approach: "We combine baseline assessment, target setting, and phased implementation planning.",
        whatWeDo: ["Emissions baseline assessment", "Target setting", "Transition planning", "Implementation roadmap"],
        benefits: ["Clear direction", "Regulatory alignment", "Long-term impact"],
      },
      {
        title: "Decarbonisation Strategy",
        description: "We develop strategies to reduce emissions across operations and value chains.",
        approach: "We identify emission hotspots and design practical reduction pathways.",
        whatWeDo: ["Emission analysis", "Reduction pathways", "Technology recommendations", "Monitoring plans"],
        benefits: ["Reduced emissions", "Cost savings", "ESG leadership"],
      },
      {
        title: "Sustainable Procurement Consulting",
        description: "We help integrate sustainability into procurement practices.",
        approach: "We align procurement strategies with ESG goals through supplier evaluation and policy design.",
        whatWeDo: ["Supplier assessment", "Sustainable sourcing strategies", "Policy development", "Implementation support"],
        benefits: ["Responsible sourcing", "Risk reduction", "Improved brand image"],
      },
      {
        title: "ESG Strategy & Policy Design",
        description: "We develop customized ESG strategies aligned with global standards.",
        approach: "We combine strategic planning with compliance alignment and KPI development.",
        whatWeDo: ["ESG framework design", "Policy drafting", "KPI definition", "Reporting alignment"],
        benefits: ["Strong ESG positioning", "Investor confidence", "Compliance readiness"],
      },
      {
        title: "Climate Risk & Opportunity Assessment",
        description: "We assess climate-related risks and opportunities to strengthen resilience.",
        approach: "We use scenario analysis and risk mapping to identify actionable insights.",
        whatWeDo: ["Risk identification", "Scenario analysis", "Opportunity mapping", "Mitigation strategies"],
        benefits: ["Risk resilience", "Strategic advantage", "Long-term growth"],
      },
    ],
  },
  {
    slug: "training-capacity-building",
    title: "Training & Capacity Building",
    image: serviceImage6,
    teaser: ["ESG & Sustainability Training", "Compliance Workshops", "Internal Team Capacity Building"],
    modules: [
      {
        title: "ESG & Sustainability Training",
        description: "We provide structured training programs to build sustainability capabilities within organizations.",
        approach: "We design customized, practical training modules tailored to your industry and team.",
        whatWeDo: ["Customized training sessions", "Industry-specific modules", "Case studies", "Assessments"],
        benefits: ["Skilled workforce", "Better implementation", "Increased awareness"],
      },
      {
        title: "Compliance Workshops",
        description: "We conduct workshops to help teams understand and meet regulatory requirements.",
        approach: "We simplify complex regulations into practical and actionable guidance.",
        whatWeDo: ["Regulation overview", "Compliance checklists", "Practical guidance", "Q&A sessions"],
        benefits: ["Improved compliance", "Reduced errors", "Better preparedness"],
      },
      {
        title: "Internal Team Capacity Building",
        description: "We strengthen internal teams to independently manage sustainability initiatives.",
        approach: "We focus on long-term capability building through structured training and process development.",
        whatWeDo: ["Skill gap assessment", "Training programs", "Process development", "Ongoing support"],
        benefits: ["Self-reliant teams", "Long-term efficiency", "Reduced dependency"],
      },
    ],
  },
  {
    slug: "assurance-certification-validation",
    title: "Assurance, Certification & Validation",
    image: serviceImage7,
    teaser: ["GHG Verification (ISO 14064)", "ESG/BRSR Assurance", "Carbon Neutral / Net Zero Certification Support", "Third-party Validation Services"],
    modules: [
      {
        title: "GHG Verification (ISO 14064)",
        description: "We provide independent verification of greenhouse gas emissions in line with ISO standards.",
        approach: "We follow a structured verification process ensuring accuracy, transparency, and compliance.",
        whatWeDo: ["Data verification", "Compliance checks", "Audit support", "Certification readiness"],
        benefits: ["Increased credibility", "Regulatory compliance", "Stakeholder trust"],
      },
      {
        title: "ESG/BRSR Assurance",
        description: "We offer assurance services to enhance the reliability of ESG and BRSR disclosures.",
        approach: "We combine data validation, compliance checks, and reporting expertise.",
        whatWeDo: ["Data validation", "Report review", "Compliance checks", "Assurance statements"],
        benefits: ["Increased transparency", "Improved reporting quality", "Stakeholder confidence"],
      },
      {
        title: "Carbon Neutral / Net Zero Certification Support",
        description: "We support organizations in achieving recognized carbon neutrality and net-zero certifications.",
        approach: "We guide you through gap analysis, documentation, and certification processes.",
        whatWeDo: ["Gap assessment", "Documentation support", "Certification coordination", "Audit support"],
        benefits: ["Global recognition", "Strong brand value", "Competitive advantage"],
      },
      {
        title: "Third-party Validation Services",
        description: "We provide independent validation of sustainability and environmental claims.",
        approach: "We ensure credibility through rigorous data checks and verification methodologies.",
        whatWeDo: ["Data validation", "Process verification", "Documentation review", "Reporting"],
        benefits: ["Enhanced credibility", "Reduced risk", "Stakeholder trust"],
      },
    ],
  },
];

export function getServiceBySlug(slug) {
  return servicesCatalog.find((service) => service.slug === slug);
}
