import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import DemoLink from "./ui/DemoLink";
import heroBg from "../assets/hero-bg.jpg";
import herosub from "../assets/hero-sub.png";

/* ================================================================== */
/*  REUSABLE GLOW FILTER                                              */
/* ================================================================== */
const SVGFilters = () => (
  <svg width="0" height="0" className="absolute">
    <defs>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="glow-intense" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="8" result="blur1" />
        <feGaussianBlur stdDeviation="3" result="blur2" />
        <feMerge>
          <feMergeNode in="blur1" />
          <feMergeNode in="blur2" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <linearGradient id="lineShine" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
        <stop offset="50%" stopColor="rgba(255,255,255,1)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
      </linearGradient>
    </defs>
  </svg>
);
/* ================================================================== */
/*  STAT CARD ILLUSTRATIONS                                           */
/* ================================================================== */
/* Card 1: 99%+ Accuracy — Line chart with grid */
function AccuracyChart() {
  return (
    <div className="relative w-full h-48 mt-4 overflow-hidden">
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 180" fill="none">
        {/* Horizontal grid lines */}
        {[36, 72, 108, 144].map((y, i) => (
          <motion.line
            key={`h-${i}`}
            x1="0"
            y1={y}
            x2="300"
            y2={y}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
          />
        ))}
        {/* Vertical grid lines */}
        {[50, 100, 150, 200, 250].map((x, i) => (
          <motion.line
            key={`v-${i}`}
            x1={x}
            y1="0"
            x2={x}
            y2="180"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
          />
        ))}
        {/* Glowing Base Line */}
        <motion.polyline
          points="20,150 70,130 120,110 170,80 220,50 270,30"
          stroke="rgba(200,220,100,0.6)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.0, duration: 1.2, ease: "easeOut" }}
        />
        {/* Animated Shine Trace Line */}
        <motion.polyline
          points="20,150 70,130 120,110 170,80 220,50 270,30"
          stroke="url(#lineShine)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, pathOffset: 1 }}
          animate={{ pathLength: 0.3, pathOffset: -0.3 }}
          transition={{ delay: 2.2, duration: 2.5, ease: "linear", repeat: Infinity }}
        />
        {/* Data points */}
        {[
          [20, 150],
          [70, 130],
          [120, 110],
          [170, 80],
          [220, 50],
          [270, 30],
        ].map(([cx, cy], i) => (
          <motion.circle
            key={`dot-${i}`}
            cx={cx}
            cy={cy}
            r="4"
            fill="white"
            filter="url(#glow)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.2 + i * 0.15, duration: 0.3 }}
          />
        ))}
      </svg>
      {/* Logo icon */}
      <motion.div
        className="absolute bottom-6 left-8 w-11 h-11 rounded-xl bg-[#7a8c3c] flex items-center justify-center shadow-[0_0_20px_rgba(122,140,60,0.6)] border border-[#c5d654]/40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
      >
        <svg width="20" height="20" viewBox="0 0 18 18" fill="white">
          <rect x="2" y="2" width="6" height="6" rx="1.5" />
          <rect x="10" y="10" width="6" height="6" rx="1.5" />
          <rect x="10" y="2" width="6" height="6" rx="1.5" opacity="0.5" />
        </svg>
      </motion.div>
      {/* High Accuracy badge */}
      <motion.div
        className="absolute right-4 bottom-16 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-[0_4px_15px_rgba(0,0,0,0.3)]"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.8, duration: 0.5 }}
      >
        High Accuracy
      </motion.div>
    </div>
  );
}
/* Card 2: 90% Validation — App grid matching new design */
function ValidationGrid() {
  const gridItems = Array.from({ length: 10 }); // 2 rows, 5 cols
  return (
    <div className="relative w-full h-48 flex items-center justify-center overflow-visible mt-2">
      {/* Connector line from "90%" text area down to the box */}
      <svg className="absolute -top-14 right-8 w-[240px] h-[130px]" viewBox="0 0 240 130" fill="none">
        {/* Glow path */}
        <motion.path
          d="M 230 0 L 230 70 Q 230 95 190 95 L 120 95 Q 100 95 100 115 L 100 130"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.5"
          fill="none"
          filter="url(#glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.8, duration: 1.2, ease: "easeInOut" }}
        />
        {/* Shine running along path */}
        <motion.path
          d="M 230 0 L 230 70 Q 230 95 190 95 L 120 95 Q 100 95 100 115 L 100 130"
          stroke="white"
          strokeWidth="2.5"
          fill="none"
          initial={{ pathLength: 0, pathOffset: 1, opacity: 1 }}
          animate={{ pathLength: 0.2, pathOffset: -0.2, opacity: [0, 1, 0] }}
          transition={{ delay: 2.0, duration: 2.5, ease: "linear", repeat: Infinity, repeatDelay: 1 }}
        />
        {/* Connection node dot */}
        <motion.circle cx="100" cy="130" r="3" fill="white" filter="url(#glow)" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2.0, duration: 0.3 }} />
      </svg>
      {/* 2x5 grid layout */}
      <div className="grid grid-cols-5 gap-3 relative z-10 w-full px-2" style={{ transform: "translateY(15px)" }}>
        {gridItems.map((_, i) => {
          const isMainHighlight = i === 2; // 3rd box in top row (center)
          const isSubHighlight = i === 1 || i === 3 || i === 7; // User requested indices 1, 3, 7
          const isTopRow = i < 5;
          return (
            <motion.div
              key={i}
              className={`w-full aspect-square rounded-[18px] border flex items-center justify-center backdrop-blur-md ${
                isMainHighlight
                  ? "bg-gradient-to-br from-[#8ba140] to-[#6d7e2e] border-[#c5d654]/60 shadow-[0_0_25px_rgba(122,140,60,0.7)]"
                  : isSubHighlight
                    ? "bg-[#7a8c3c]/40 border-[#7a8c3c]/60 shadow-[0_0_15px_rgba(122,140,60,0.3)]"
                    : isTopRow
                      ? "bg-white/[0.04] border-white/10"
                      : "bg-white/[0.02] border-white/[0.05]"
              }`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.6 + (i % 5) * 0.1 + (isTopRow ? 0 : 0.2),
                type: "spring",
                stiffness: 150,
                damping: 15,
              }}
            >
              {isMainHighlight && (
                <svg width="24" height="24" viewBox="0 0 18 18" fill="white">
                  <rect x="2" y="2" width="6" height="6" rx="1.5" />
                  <rect x="10" y="10" width="6" height="6" rx="1.5" />
                  <rect x="10" y="2" width="6" height="6" rx="1.5" opacity="0.5" />
                </svg>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
/* Card 3: 3x Multi-location — Perfect mathematical semi-circle network */
function MultiLocationNetwork() {
  const cx = 150;
  const cy = 150; // Raised to keep nodes fully inside card and properly aligned
  const r = 110;
  // Angles for 5 nodes: 180, 225, 270, 315, 360 degrees (in radians)
  const nodeAngles = [Math.PI, 1.25 * Math.PI, 1.5 * Math.PI, 1.75 * Math.PI, 2 * Math.PI];

  const nodes = nodeAngles.map((angle, i) => {
    // Sizes and styles vary to match design
    const sizes = [50, 60, 76, 60, 50];
    const size = sizes[i];
    const styles = [
      { bg: "bg-white/10", border: "border-white/20", color: "text-white/80" },
      { bg: "bg-white/20", border: "border-white/30", color: "text-white/95" },
      { bg: "bg-[#2b2722]", border: "border-[#c8a46e]/60 shadow-[0_0_25px_rgba(200,164,110,0.4)]", color: "text-white" },
      { bg: "bg-white/10", border: "border-white/20", color: "text-white/80" },
      { bg: "bg-white/10", border: "border-white/20", color: "text-white/80" },
    ];

    return {
      x: cx + r * Math.cos(angle) - size / 2, // Centered X
      y: cy + r * Math.sin(angle) - size / 2, // Centered Y
      size,
      label: (i + 1).toString(),
      ...styles[i],
    };
  });
  // Angles for the little dots between the nodes
  const dotAngles = [1.125 * Math.PI, 1.375 * Math.PI, 1.625 * Math.PI, 1.875 * Math.PI];
  const dots = dotAngles.map((angle) => ({
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  }));
  return (
    <div className="relative w-full max-w-[300px] mx-auto h-[210px] mt-2 overflow-visible max-[360px]:scale-[0.85] max-[360px]:origin-top">
      {/* Connector lines behind everything */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 180" fill="none">
        <motion.path
          d={`M ${nodes[2].x + 38} ${nodes[2].y + 38} C ${nodes[2].x + 105} ${nodes[2].y + 38}, 230 30, 250 40`}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.0, duration: 1.0 }}
        />
        {/* Line shine animation */}
        <motion.path
          d={`M ${nodes[2].x + 38} ${nodes[2].y + 38} C ${nodes[2].x + 105} ${nodes[2].y + 38}, 230 30, 250 40`}
          stroke="white"
          strokeWidth="2"
          fill="none"
          filter="url(#glow)"
          initial={{ pathLength: 0, pathOffset: 1, opacity: 1 }}
          animate={{ pathLength: 0.3, pathOffset: -0.3, opacity: [0, 1, 0] }}
          transition={{ delay: 2.0, duration: 2.0, ease: "linear", repeat: Infinity, repeatDelay: 1.5 }}
        />
      </svg>
      {/* Report card placeholders top right */}
      <motion.div
        className="absolute -top-14 right-2 w-32 h-[72px] rounded-[14px] bg-white/10 backdrop-blur-md border border-white/20 p-2.5 shadow-xl"
        initial={{ opacity: 0, y: -10, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ delay: 1.2, duration: 0.6, type: "spring" }}
      >
        <div className="w-14 h-1.5 rounded bg-white mt-1 mb-2.5 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
        <div className="w-24 h-1 rounded bg-white/20 mb-1.5" />
        <div className="w-20 h-1 rounded bg-white/20 mb-1.5" />
      </motion.div>
      {/* Report card placeholders slightly lower */}
      <motion.div
        className="absolute top-0 right-0 w-28 h-16 rounded-[14px] bg-white/5 backdrop-blur-lg border border-white/15 p-2.5 shadow-xl"
        initial={{ opacity: 0, y: 20, rotate: 2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ delay: 1.4, duration: 0.6, type: "spring" }}
      >
        <div className="w-12 h-1.5 rounded bg-white/40 mb-2.5" />
        <div className="w-20 h-1 rounded bg-white/15 mb-1.5" />
        <div className="w-16 h-1 rounded bg-white/15" />
      </motion.div>
      {/* Connection dots along the arch */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 180" fill="none">
        {dots.map((dot, i) => (
          <motion.circle
            key={`dot-${i}`}
            cx={dot.x}
            cy={dot.y}
            r="3"
            fill="white"
            opacity="0.9"
            filter="url(#glow)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8 + i * 0.15, type: "spring" }}
          />
        ))}
      </svg>
      {/* Numbered circular nodes */}
      {nodes.map((node, i) => (
        <motion.div
          key={`node-${i}`}
          className={`absolute rounded-full ${node.bg} ${node.color} ${node.border} border-[1.5px] flex items-center justify-center font-bold backdrop-blur-sm shadow-2xl`}
          style={{
            left: node.x,
            top: node.y,
            width: node.size,
            height: node.size,
            fontSize: node.size > 70 ? 36 : node.size > 55 ? 26 : 20,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.6 + i * 0.18,
            type: "spring",
            stiffness: 160,
            damping: 12,
          }}
        >
          {node.label}
        </motion.div>
      ))}
      {/* Green platform icon at bottom center — Robust centering with Flexbox container and Framer Motion scale */}
      <div className="absolute bottom-4 left-0 w-full flex justify-center pointer-events-none">
        <motion.div
          className="w-16 h-16 rounded-[20px] bg-[#7a8c3c] flex items-center justify-center shadow-[0_0_35px_rgba(122,140,60,0.8)] border border-[#c5d654]/60 pointer-events-auto"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.6, type: "spring", stiffness: 200 }}
        >
          <svg width="30" height="30" viewBox="0 0 18 18" fill="white">
            <rect x="2" y="2" width="6" height="6" rx="1.5" />
            <rect x="10" y="10" width="6" height="6" rx="1.5" />
            <rect x="10" y="2" width="6" height="6" rx="1.5" opacity="0.5" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}
/* ================================================================== */
/*  STAT CARD WRAPPER                                                 */
/* ================================================================== */
const statCards = [
  {
    stat: "99%+",
    description: "Validated through automated checks & audit trails",
    Illustration: AccuracyChart,
  },
  {
    stat: "90%",
    description: "Reduce time spent on validation & reconciliation",
    Illustration: ValidationGrid,
  },
  {
    stat: "3x",
    description: "Faster Multi-location Reporting. Centralised data collection across plants & teams",
    Illustration: MultiLocationNetwork,
  },
];
/* ================================================================== */
/*  MAIN HERO COMPONENT                                               */
/* ================================================================== */
export default function HeroSection() {
  return (
    <section id="top" className="relative min-h-[130vh] sm:min-h-screen overflow-hidden bg-bark-900">
      <SVGFilters />
      <img src={heroBg} alt="Wind turbine at sunset over mountain landscape" className="absolute inset-0 h-full w-full object-cover object-right" fetchPriority="high" />
      <div className="hero-overlay absolute inset-0" />
      <div className="mountain-shape absolute inset-x-0 bottom-0 h-44" />
      {/* Hero text container - Centered and shifted upward */}
      <div className="relative z-10 mx-auto flex min-h-[135vh] max-h-none flex-col items-center justify-start px-4 pb-48 pt-[150px] text-center sm:min-h-screen sm:justify-center sm:pb-48 sm:pt-28 md:min-h-[85vh] md:pb-72 md:pt-20 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: "easeOut" }} className="w-full max-w-none mx-auto">
          <h1 className="font-display text-4xl max-[360px]:text-[32px] font-semibold leading-[1.15] text-white sm:text-5xl lg:text-6xl">Audit-Ready BRSR, GHG & ESG Reporting</h1>
          <p className="mt-6 max-w-2xl mx-auto text-[17px] max-[360px]:text-[15px] leading-relaxed text-white/80 sm:text-lg lg:text-xl">
            Measure, validate and report sustainability data with precision — built for teams, trusted by auditors.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4 w-full mx-auto md:max-w-none">
            <Link 
              to="/carbon-os#calculator" 
              className="inline-flex items-center justify-center gap-2 px-8 py-[13px] rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold backdrop-blur-md transition-all duration-300"
            >
              Try GHG Calculator
            </Link>
            <DemoLink to="/book-demo" className="w-auto inline-block">
              Schedule a Demo
            </DemoLink>
          </div>
        </motion.div>
      </div>
      {/* Final Stat cards container - Wider and pinned to the very bottom */}
      <div className="absolute bottom-0 left-0 w-full z-20 pb-0 md:px-4 sm:px-6 lg:px-12">
        <div className="mx-auto w-full max-w-[1920px] xl:max-w-[92%]">
          <div
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-4 pb-0 lg:grid lg:grid-cols-3 lg:gap-6 lg:px-0 xl:gap-8 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {statCards.map((card, index) => (
              <motion.div
                key={card.stat}
                className="w-[85vw] shrink-0 snap-center lg:w-auto lg:shrink rounded-t-[32px] border border-white/15 border-b-0 bg-gradient-to-br from-white/10 to-transparent p-6 pb-2 backdrop-blur-md shadow-2xl relative"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.15, duration: 0.6, ease: "easeOut" }}
              >
                <h3
                  className="relative z-20 font-display text-[42px] max-[360px]:text-[36px] font-bold text-white tracking-tight"
                  style={{ textShadow: "0 0 25px rgba(220, 240, 100, 0.8), 0 0 10px rgba(180, 210, 50, 0.5)" }}
                >
                  {card.stat}
                </h3>
                <p className="relative z-20 mt-2 text-[15px] leading-relaxed text-white/80">{card.description}</p>
                <card.Illustration />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
