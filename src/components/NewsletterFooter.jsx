import { useState } from "react";
import BrandLogo from "./BrandLogo";
import Button from "./ui/Button";
import { Link } from "react-router-dom";
import { servicesCatalog } from "../data/services";
import logoCircular from "../assets/cta/logo-circular.png";

const enabledFooterRoutes = new Set(["/", "/book-demo", "/contact-us", "/case-studies", "/industries", "/about-us", "/services", "/brsr-reporting", "/carbon-os"]);

function isFooterLinkEnabled(href) {
  if (!href) return false;
  if (href.startsWith("/#")) return true;
  if (href.startsWith("/services/")) return true;
  return enabledFooterRoutes.has(href);
}

const links = {
  Platforms: [
    { label: "ESG Board", href: "/brsr-reporting" },
    { label: "CarbonOS", href: "/carbon-os" },
    { label: "WaterOS", href: "/#platform" },
    { label: "EnergyOS", href: "/#platform" },
    { label: "WasteOS", href: "/#platform" },
  ],
  Services: [],
  Resources: [
    { label: "Industries", href: "/industries" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "Our Customer", href: "/#testimonials" },
  ],
  Company: [
    { label: "About us", href: "/about-us" },
    { label: "Contact us", href: "/contact-us" },
  ],
};

export default function NewsletterFooter() {
  const [subEmail, setSubEmail] = useState("");
  const [subStatus, setSubStatus] = useState("idle"); // idle | loading | success | error
  const [subError, setSubError] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!subEmail) return;
    setSubStatus("loading");
    setSubError("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setSubStatus("success");
      setSubEmail("");
    } catch (err) {
      setSubError(err.message);
      setSubStatus("error");
    }
  };

  return (
    <footer id="company" className="bg-[#261E14] px-4 py-10 text-white sm:px-12 lg:px-16">
      <div className="mx-auto w-full max-w-[1920px] xl:max-w-[92%]">
        {/* Newsletter Signup Row */}
        <div className="flex flex-col gap-8 pb-10 border-b border-white/10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-[24px] font-bold sm:text-[28px]">Sign up to our newsletter</h2>
            <p className="mt-2 text-[14px] text-white/70">Get climate news, policy changes, and company updates . Subscribe Now!</p>
          </div>
          {subStatus === "success" ? (
            <div className="flex items-center gap-3 text-green-400 text-[15px] font-semibold">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
              Subscribed successfully!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row w-full max-w-xl gap-3">
              <div className="flex flex-col w-full gap-1">
                <input
                  type="email"
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  placeholder="Enter Your Email Address"
                  className="h-12 w-full rounded-lg bg-white/5 border border-white/10 px-5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#F27A18]"
                  required
                />
                {subStatus === "error" && <span className="text-red-400 text-[12px]">{subError}</span>}
              </div>
              <Button type="submit" showIcon={false} className="group self-start sm:w-auto h-12 bg-[#F27A18] hover:bg-[#D96B12] text-white pl-6 pr-2 py-2 rounded-full font-bold whitespace-nowrap flex items-center gap-4 shadow-lg transition-all duration-300 shrink-0" disabled={subStatus === "loading"}>
                <span className="text-[15px]">{subStatus === "loading" ? "Sending..." : "Subscribe Now"}</span>
                <span className="w-9 h-9 bg-white text-[#F27A18] rounded-full flex items-center justify-center transition-transform duration-300 group-hover:rotate-45 shrink-0 shadow-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </span>
              </Button>
            </form>
          )}
        </div>

        {/* Main Links Grid */}
        <div className="grid gap-10 sm:gap-12 py-12 sm:py-16 grid-cols-2 sm:grid-cols-3 lg:grid-cols-[1.2fr_1fr_1.5fr_1fr_1fr]">
          {/* Logo & Intro */}
          <div className="flex flex-col items-start gap-6">
            <img src={logoCircular} alt="Carbon Crunch Logo" className="h-[120px] w-auto object-contain" />
            <p className="max-w-[240px] text-[15px] leading-relaxed text-white/70">
              Built for accurate, audit-ready sustainability reporting.
            </p>
          </div>

          {/* Links Columns */}
          {Object.entries(links).map(([title, items]) => {
            const itemsToRender = title === "Services" ? servicesCatalog.map((s) => ({ label: s.title, href: `/services/${s.slug}` })) : items;
            return (
              <div key={title}>
                <h3 className="font-display text-[20px] font-bold mb-6">
                  {title === "Services" ? (
                    <Link to="/services" className="hover:text-[#ee7c16] transition-colors">{title}</Link>
                  ) : title}
                </h3>
                <ul className="space-y-4 text-[15px] text-white/70">
                  {itemsToRender.map((item) => (
                    <li key={`${title}-${item.label}`}>
                      {isFooterLinkEnabled(item.href) ? (
                        <Link to={item.href} className="hover:text-white transition-colors duration-200">
                          {item.label}
                        </Link>
                      ) : (
                        <span className="text-white/50">{item.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col gap-6 pt-10 border-t border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[14px] text-white/60">© 2026 Carbon Crunch | All rights reserved</p>
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center md:gap-10">
            <div className="flex items-center gap-4 text-[14px] text-white/60">
              <Link to="/" className="hover:text-white transition-colors">Terms & Conditions</Link>
              <span className="text-white/20">|</span>
              <Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link>
            </div>
            
            {/* Social Icons */}
            <div className="flex items-center gap-4">
              {[
                { name: 'linkedin', d: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' },
              ].map((icon) => (
                <a key={icon.name} href="https://www.linkedin.com/company/carbon-crunch/" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20">
                  <svg className="h-4.5 w-4.5 fill-current" viewBox={icon.name === 'x' ? "0 0 1200 1227" : "0 0 24 24"}>
                    <path d={icon.d} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
