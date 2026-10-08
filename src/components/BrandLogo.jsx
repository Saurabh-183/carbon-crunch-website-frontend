import logo from "../assets/logo.png";
import heroLogo from "../assets/Main_Logo-removebg-preview.png";

export default function BrandLogo({ dark = false, compact = false }) {
  const logoSrc = dark ? logo : heroLogo;

  return (
    <div className="flex items-center gap-2">
      <img src={logoSrc} alt="Carbon Crunch logo" className="h-20 w-20 object-contain" loading="lazy" />
      {/* {compact ? null : (
        <div className="leading-none">
          <p className={`font-display text-sm font-semibold ${dark ? "text-bark-900" : "text-white"}`}>Carbon Crunch</p>
          <p className={`text-[10px] ${dark ? "text-bark-900/70" : "text-white/70"}`}>Audit-ready reporting</p>
        </div>
      )} */}
    </div>
  );
}
