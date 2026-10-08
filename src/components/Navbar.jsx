import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Button from "./ui/Button";
import DemoLink from "./ui/DemoLink";
import BrandLogo from "./BrandLogo";
import { servicesCatalog } from "../data/services";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ links, whiteHeaderTriggerRef }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [showPlatform, setShowPlatform] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [showCompany, setShowCompany] = useState(false);
  const [activePlatform, setActivePlatform] = useState("esg");
  const [expandedMobileMenu, setExpandedMobileMenu] = useState(null);
  const platformMenuRef = useRef(null);
  const servicesMenuRef = useRef(null);
  const resourcesMenuRef = useRef(null);
  const companyMenuRef = useRef(null);
  const autoHeroRef = useRef(null);
  const platformCloseTimeoutRef = useRef(null);
  const servicesCloseTimeoutRef = useRef(null);
  const resourcesCloseTimeoutRef = useRef(null);
  const companyCloseTimeoutRef = useRef(null);

  const serviceMenuItems = servicesCatalog.map((service) => ({
    label: service.title,
    to: `/services/${service.slug}`,
  }));

  const companyMenuItems = [
    { label: "About Us", to: "/about-us" },
    { label: "Contact Us", to: "/contact-us" },
  ];

  const platformTabs = [
    {
      key: "esg",
      label: "ESG Board",
      title: "ESG Board",
      description: "Designed for ESG boards and leadership teams to drive compliant, consistent, and decision-ready disclosures.",
      items: ["BRSR Reporting", "GRI Reporting"],
    },
    {
      key: "sustain",
      label: "SustainOS",
      title: "SustainOS",
      description: "A unified platform to manage ESG, compliance, and sustainability data from measurement to audit-ready reporting.",
      items: ["CarbonOS", "EnergyOS", "WaterOS", "WasteOS"],
    },
    {
      key: "method",
      label: "Methodology",
      title: "Methodology",
      description: "A standards-led implementation model with phased onboarding, validation checks, and reliable governance workflows.",
      items: ["Framework Mapping", "Data Validation", "Assurance Workflow"],
    },
  ];

  const platformItemLinks = {
    "BRSR Reporting": "/brsr-reporting",
    "GRI Reporting": "/brsr-reporting",
    "CarbonOS": "/carbon-os",
  };

  const activePlatformContent = platformTabs.find((tab) => tab.key === activePlatform) ?? platformTabs[0];

  useEffect(() => {
    const onScroll = () => {
      const navHeight = 76;
      let heroElement = whiteHeaderTriggerRef?.current;

      if (!heroElement) {
        if (!autoHeroRef.current) {
          autoHeroRef.current = document.querySelector("main > section:first-of-type");
        }
        heroElement = autoHeroRef.current;
      }

      if (heroElement) {
        const heroBottom = heroElement.getBoundingClientRect().bottom;
        setScrolledPastHero(heroBottom <= navHeight);
      } else {
        const triggerPoint = Math.max(window.innerHeight - 120, 240);
        setScrolledPastHero(window.scrollY > triggerPoint);
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [whiteHeaderTriggerRef]);

  useEffect(() => {
    return () => {
      if (platformCloseTimeoutRef.current) {
        clearTimeout(platformCloseTimeoutRef.current);
      }
      if (servicesCloseTimeoutRef.current) {
        clearTimeout(servicesCloseTimeoutRef.current);
      }
      if (resourcesCloseTimeoutRef.current) {
        clearTimeout(resourcesCloseTimeoutRef.current);
      }
      if (companyCloseTimeoutRef.current) {
        clearTimeout(companyCloseTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!platformMenuRef.current?.contains(event.target)) {
        setShowPlatform(false);
      }
      if (!servicesMenuRef.current?.contains(event.target)) {
        setShowServices(false);
      }
      if (!resourcesMenuRef.current?.contains(event.target)) {
        setShowResources(false);
      }
      if (!companyMenuRef.current?.contains(event.target)) {
        setShowCompany(false);
      }
    };

    const onEscape = (event) => {
      if (event.key === "Escape") {
        setShowPlatform(false);
        setShowServices(false);
        setShowResources(false);
        setShowCompany(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const showWhiteHeader = scrolledPastHero;

  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${showWhiteHeader ? "bg-white shadow-sm" : "bg-transparent"}`}>
      <div className="mx-auto flex w-full max-w-[1920px] xl:max-w-[92%] items-center justify-between py-0 pl-[30px] pr-6 lg:pl-[30px] lg:pr-10">
        <Link to="/" aria-label="Carbon Crunch home">
          <BrandLogo compact dark={showWhiteHeader} />
        </Link>

        <button
          type="button"
          className={`inline-flex items-center rounded-md border p-2 lg:hidden ${showWhiteHeader ? "border-bark-900/30 text-bark-900" : "border-white/30 text-white"}`}
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label="Toggle navigation"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        </button>

        <nav className="hidden flex-1 items-center lg:ml-12 lg:flex" aria-label="Primary navigation">
          <div className="flex items-center gap-10">
            <div
              className="relative"
              ref={platformMenuRef}
              onMouseEnter={() => {
                if (platformCloseTimeoutRef.current) {
                  clearTimeout(platformCloseTimeoutRef.current);
                }
                setShowPlatform(true);
                setShowServices(false);
                setShowResources(false);
                setShowCompany(false);
              }}
              onMouseLeave={() => {
                platformCloseTimeoutRef.current = setTimeout(() => {
                  setShowPlatform(false);
                }, 180);
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setShowPlatform((current) => !current);
                  setShowServices(false);
                  setShowResources(false);
                  setShowCompany(false);
                }}
                className={`inline-flex items-center gap-2 text-[18px] font-medium transition ${showWhiteHeader ? "text-bark-900 hover:text-bark-900/75" : "text-white hover:text-white/85"}`}
                aria-expanded={showPlatform}
                aria-haspopup="true"
              >
                Platform
                <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5">
                  <path d="M5.25 7.5L10 12.25L14.75 7.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {showPlatform ? (
                <div
                  className="absolute left-0 top-full w-[980px] rounded-3xl border border-bark-900/10 bg-[#ececec] p-6 shadow-xl"
                  onMouseEnter={() => {
                    if (platformCloseTimeoutRef.current) {
                      clearTimeout(platformCloseTimeoutRef.current);
                    }
                  }}
                  onMouseLeave={() => setShowPlatform(false)}
                >
                  <div className="grid grid-cols-[260px_1fr] gap-6">
                    <div className="space-y-4">
                      {platformTabs.map((tab) => (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setActivePlatform(tab.key)}
                          className={`flex w-full items-center justify-between rounded-2xl border px-6 py-5 text-left text-[22px] font-semibold transition ${activePlatform === tab.key ? "border-ember-300 bg-ember-300 text-white" : "border-bark-900/15 bg-[#f6f6f6] text-bark-900/55"
                            }`}
                        >
                          <span>{tab.label}</span>
                          <span aria-hidden="true">›</span>
                        </button>
                      ))}
                    </div>

                    <div className="rounded-2xl border border-bark-900/12 bg-[#ececec] p-2">
                      <h3 className="font-display text-4xl font-semibold text-bark-900">{activePlatformContent.title}</h3>
                      <p className="mt-4 text-[18px] leading-relaxed text-bark-900/55">{activePlatformContent.description}</p>
                      <div className="mt-6 h-px bg-bark-900/12" />

                      <div className="mt-8 flex flex-wrap gap-10">
                        {activePlatformContent.items.map((item) => {
                          let formattedName = item;
                          if (item === "CarbonOS") formattedName = <>Carbon<span className="text-[#34d399]">OS</span></>;
                          else if (item === "WaterOS") formattedName = <>Water<span className="text-[#38bdf8]">OS</span></>;
                          else if (item === "WasteOS") formattedName = <>Waste<span className="text-[#fbbf24]">OS</span></>;
                          else if (item === "EnergyOS") formattedName = <>Energy<span className="text-[#f97316]">OS</span></>;

                          return platformItemLinks[item] ? (
                            <Link
                              key={item}
                              to={platformItemLinks[item]}
                              onClick={() => setShowPlatform(false)}
                              className="flex items-center gap-4 text-[18px] font-semibold text-bark-900/85 hover:text-bark-900"
                            >
                              <span className="grid h-12 w-12 place-items-center rounded-full bg-[#cde5f2] text-[#23a1df]">⚡</span>
                              <span>{formattedName}</span>
                            </Link>
                          ) : (
                            <div key={item} className="flex items-center gap-4 text-[18px] font-semibold text-bark-900/85">
                              <span className="grid h-12 w-12 place-items-center rounded-full bg-[#cde5f2] text-[#23a1df]">⚡</span>
                              <span>{formattedName}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-16 h-px bg-bark-900/12" />
                      <div className="mt-7 flex items-center justify-end gap-10 text-[18px] text-bark-900/65">
                        <DemoLink to="/contact-us" className="inline-flex items-center text-[16px] font-medium">Contact Us</DemoLink>
                        <DemoLink to="/book-demo" className="inline-flex items-center text-[16px] font-medium">Book Demo</DemoLink>

                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {links.map((link) => {
              if (link.label === "Services") {
                return (
                  <div
                    key={link.href}
                    className="relative"
                    ref={servicesMenuRef}
                    onMouseEnter={() => {
                      if (servicesCloseTimeoutRef.current) {
                        clearTimeout(servicesCloseTimeoutRef.current);
                      }
                      setShowServices(true);
                      setShowPlatform(false);
                      setShowResources(false);
                      setShowCompany(false);
                    }}
                    onMouseLeave={() => {
                      servicesCloseTimeoutRef.current = setTimeout(() => {
                        setShowServices(false);
                      }, 180);
                    }}
                  >
                    <Link
                      to="/services"
                      onClick={() => setShowServices(false)}
                      className={`inline-flex items-center gap-2 text-[18px] font-medium transition ${showWhiteHeader ? "text-bark-900 hover:text-bark-900/75" : "text-white hover:text-white/85"}`}
                    >
                      {link.label}
                      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5">
                        <path d="M5.25 7.5L10 12.25L14.75 7.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>

                    {showServices ? (
                      <div
                        className="absolute left-0 top-full min-w-[360px] rounded-2xl border border-bark-900/10 bg-[#ececec] p-3 shadow-xl"
                        onMouseEnter={() => {
                          if (servicesCloseTimeoutRef.current) {
                            clearTimeout(servicesCloseTimeoutRef.current);
                          }
                        }}
                        onMouseLeave={() => setShowServices(false)}
                      >
                        {serviceMenuItems.map((item) => (
                          <Link key={item.to} to={item.to} className="block rounded-xl px-4 py-3 text-[16px] font-medium text-bark-900 hover:bg-white/70" onClick={() => setShowServices(false)}>
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              }

              if (link.label === "Resources") {
                return (
                  <div
                    key={link.href}
                    className="relative"
                    ref={resourcesMenuRef}
                    onMouseEnter={() => {
                      if (resourcesCloseTimeoutRef.current) {
                        clearTimeout(resourcesCloseTimeoutRef.current);
                      }
                      setShowResources(true);
                      setShowPlatform(false);
                      setShowServices(false);
                      setShowCompany(false);
                    }}
                    onMouseLeave={() => {
                      resourcesCloseTimeoutRef.current = setTimeout(() => {
                        setShowResources(false);
                      }, 180);
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setShowResources((current) => !current);
                        setShowPlatform(false);
                        setShowServices(false);
                        setShowCompany(false);
                      }}
                      className={`inline-flex items-center gap-2 text-[18px] font-medium transition ${showWhiteHeader ? "text-bark-900 hover:text-bark-900/75" : "text-white hover:text-white/85"}`}
                      aria-expanded={showResources}
                      aria-haspopup="true"
                    >
                      {link.label}
                      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5">
                        <path d="M5.25 7.5L10 12.25L14.75 7.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    {showResources ? (
                      <div
                        className="absolute left-0 top-full min-w-[280px] rounded-2xl border border-bark-900/10 bg-[#ececec] p-3 shadow-xl"
                        onMouseEnter={() => {
                          if (resourcesCloseTimeoutRef.current) {
                            clearTimeout(resourcesCloseTimeoutRef.current);
                          }
                        }}
                        onMouseLeave={() => setShowResources(false)}
                      >
                        <Link to="/case-studies" className="block rounded-xl px-4 py-3 text-[16px] font-medium text-bark-900 hover:bg-white/70" onClick={() => setShowResources(false)}>
                          Case Studies
                        </Link>
                        <Link to="/industries" className="mt-1 block rounded-xl px-4 py-3 text-[16px] font-medium text-bark-900 hover:bg-white/70" onClick={() => setShowResources(false)}>
                          Industry
                        </Link>
                      </div>
                    ) : null}
                  </div>
                );
              }

              if (link.label === "Company") {
                return (
                  <div
                    key={link.href}
                    className="relative"
                    ref={companyMenuRef}
                    onMouseEnter={() => {
                      if (companyCloseTimeoutRef.current) {
                        clearTimeout(companyCloseTimeoutRef.current);
                      }
                      setShowCompany(true);
                      setShowPlatform(false);
                      setShowServices(false);
                      setShowResources(false);
                    }}
                    onMouseLeave={() => {
                      companyCloseTimeoutRef.current = setTimeout(() => {
                        setShowCompany(false);
                      }, 180);
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setShowCompany((current) => !current);
                        setShowPlatform(false);
                        setShowServices(false);
                        setShowResources(false);
                      }}
                      className={`inline-flex items-center gap-2 text-[18px] font-medium transition ${showWhiteHeader ? "text-bark-900 hover:text-bark-900/75" : "text-white hover:text-white/85"}`}
                      aria-expanded={showCompany}
                      aria-haspopup="true"
                    >
                      {link.label}
                      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5">
                        <path d="M5.25 7.5L10 12.25L14.75 7.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    {showCompany ? (
                      <div
                        className="absolute left-0 top-full min-w-[240px] rounded-2xl border border-bark-900/10 bg-[#ececec] p-3 shadow-xl"
                        onMouseEnter={() => {
                          if (companyCloseTimeoutRef.current) {
                            clearTimeout(companyCloseTimeoutRef.current);
                          }
                        }}
                        onMouseLeave={() => setShowCompany(false)}
                      >
                        {companyMenuItems.map((item) => (
                          <Link key={item.to} to={item.to} className="block rounded-xl px-4 py-3 text-[16px] font-medium text-bark-900 hover:bg-white/70" onClick={() => setShowCompany(false)}>
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              }

              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-2 text-[18px] font-medium transition ${showWhiteHeader ? "text-bark-900 hover:text-bark-900/75" : "text-white hover:text-white/85"}`}
                >
                  {link.label}
                  <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5">
                    <path d="M5.25 7.5L10 12.25L14.75 7.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-6">
            {user && (
              <Link to="/dashboard" className={`text-[17px] font-semibold transition hover:opacity-80 flex items-center gap-1.5 ${showWhiteHeader ? "text-bark-900" : "text-white"}`}>
                Dashboard
                <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5">
                  <path d="M5.25 10H14.75M14.75 10L10 5.25M14.75 10L10 14.75" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            )}
            <DemoLink to="/book-demo" className="text-[17px] font-semibold">Book Demo</DemoLink>
          </div>
        </nav>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#36302A] lg:hidden">
          <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-6">
            <Link to="/" onClick={() => setOpen(false)}>
              <BrandLogo compact dark={false} className="h-10 w-auto" />
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-2 text-white hover:bg-white/10"
              aria-label="Close menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-5 py-6 space-y-3">
            {/* Platform */}
            <div className="rounded-xl overflow-hidden bg-[#42382D]">
              <button
                onClick={() => setExpandedMobileMenu(expandedMobileMenu === "Platform" ? null : "Platform")}
                className="flex w-full items-center justify-between px-5 py-4 text-[18px] font-medium text-white"
              >
                Platform
                <svg className={`h-5 w-5 transition-transform ${expandedMobileMenu === "Platform" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedMobileMenu === "Platform" && (
                <div className="px-5 pb-5">
                  <div className="mb-4">
                    <h4 className="mb-3 text-[14px] font-semibold tracking-wider text-[#958e85] uppercase">ESG Board</h4>
                    <div className="space-y-4">
                      <Link to="/brsr-reporting" onClick={() => setOpen(false)} className="flex items-center gap-4 text-white hover:opacity-80">
                        <MobileIconWrapper bg="bg-[#e5f3fa]">
                          <DocIconBlue />
                        </MobileIconWrapper>
                        <span className="text-[15px] font-medium tracking-wide uppercase">BRSR REPORTING</span>
                      </Link>
                      <Link to="/brsr-reporting" onClick={() => setOpen(false)} className="flex items-center gap-4 text-white hover:opacity-80">
                        <MobileIconWrapper bg="bg-[#e5f3fa]">
                          <DocIconBlue />
                        </MobileIconWrapper>
                        <span className="text-[15px] font-medium tracking-wide uppercase">GRI REPORTING</span>
                      </Link>
                    </div>
                  </div>
                  <div className="my-5 border-t border-[#544a40]" />
                  <div>
                    <h4 className="mb-4 text-[14px] font-semibold tracking-wider text-[#958e85] uppercase">SustainOS</h4>
                    <div className="space-y-4">
                      <Link to="/carbon-os" onClick={() => setOpen(false)} className="flex items-center gap-4 text-white hover:opacity-80">
                        <MobileIconWrapper bg="bg-white">
                          <LightningIconBlue />
                        </MobileIconWrapper>
                        <span className="text-[15px] font-medium tracking-wide">
                          CARBON<span className="text-[#34d399]">OS</span>
                        </span>
                      </Link>
                      <div className="flex items-center gap-4 text-white/50 cursor-not-allowed">
                        <MobileIconWrapper bg="bg-white">
                          <LightningIconBlue />
                        </MobileIconWrapper>
                        <span className="text-[15px] font-medium tracking-wide">
                          WATER<span className="text-[#38bdf8]">OS</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-white/50 cursor-not-allowed">
                        <MobileIconWrapper bg="bg-white">
                          <LightningIconBlue />
                        </MobileIconWrapper>
                        <span className="text-[15px] font-medium tracking-wide">
                          WASTE<span className="text-[#fbbf24]">OS</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-white/50 cursor-not-allowed">
                        <MobileIconWrapper bg="bg-white">
                          <LightningIconBlue />
                        </MobileIconWrapper>
                        <span className="text-[15px] font-medium tracking-wide">
                          ENERGY<span className="text-[#f97316]">OS</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Services */}
            <div className="rounded-xl overflow-hidden bg-[#42382D]">
              <button
                onClick={() => setExpandedMobileMenu(expandedMobileMenu === "Services" ? null : "Services")}
                className="flex w-full items-center justify-between px-5 py-4 text-[18px] font-medium text-white"
              >
                Services
                <svg className={`h-5 w-5 transition-transform ${expandedMobileMenu === "Services" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedMobileMenu === "Services" && (
                <div className="px-5 pb-5">
                  <div className="space-y-4">
                    {servicesCatalog.map((service) => (
                      <Link key={service.slug} to={`/services/${service.slug}`} onClick={() => setOpen(false)} className="flex items-center gap-4 text-white hover:opacity-80">
                        <MobileIconWrapper bg="bg-[#e5f3fa]">
                          <GridIconBlue />
                        </MobileIconWrapper>
                        <span className="text-[15px] font-medium">{service.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Resources */}
            <div className="rounded-xl overflow-hidden bg-[#42382D]">
              <button
                onClick={() => setExpandedMobileMenu(expandedMobileMenu === "Resources" ? null : "Resources")}
                className="flex w-full items-center justify-between px-5 py-4 text-[18px] font-medium text-white"
              >
                Resources
                <svg className={`h-5 w-5 transition-transform ${expandedMobileMenu === "Resources" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedMobileMenu === "Resources" && (
                <div className="px-5 pb-5">
                  <div className="space-y-4">
                    <Link to="/industries" onClick={() => setOpen(false)} className="flex items-center gap-4 text-white hover:opacity-80">
                      <MobileIconWrapper bg="bg-[#e5f3fa]">
                        <FactoryIconBlue />
                      </MobileIconWrapper>
                      <span className="text-[15px] font-medium">Industries</span>
                    </Link>
                    <Link to="/case-studies" onClick={() => setOpen(false)} className="flex items-center gap-4 text-white hover:opacity-80">
                      <MobileIconWrapper bg="bg-[#e5f3fa]">
                        <BookIconBlue />
                      </MobileIconWrapper>
                      <span className="text-[15px] font-medium">Case Studies</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Company */}
            <div className="rounded-xl overflow-hidden bg-[#42382D]">
              <button
                onClick={() => setExpandedMobileMenu(expandedMobileMenu === "Company" ? null : "Company")}
                className="flex w-full items-center justify-between px-5 py-4 text-[18px] font-medium text-white"
              >
                Company
                <svg className={`h-5 w-5 transition-transform ${expandedMobileMenu === "Company" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedMobileMenu === "Company" && (
                <div className="px-5 pb-5">
                  <div className="space-y-4">
                    <Link to="/about-us" onClick={() => setOpen(false)} className="flex items-center gap-4 text-white hover:opacity-80">
                      <MobileIconWrapper bg="bg-[#e5f3fa]">
                        <BuildingIconBlue />
                      </MobileIconWrapper>
                      <span className="text-[15px] font-medium">About Us</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

          </div>

          <div className="mt-6 px-6 pb-8 space-y-4">
            {user && (
              <Link to="/dashboard" onClick={() => setOpen(false)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#42382D] py-3.5 text-[17px] font-semibold text-white transition hover:bg-[#4f4336]">
                Go to Dashboard
                <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4">
                  <path d="M5.25 10H14.75M14.75 10L10 5.25M14.75 10L10 14.75" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            )}
            <Link to="/book-demo" onClick={() => setOpen(false)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FA8C28] py-3.5 text-[17px] font-semibold text-white transition hover:bg-[#e87d1e]">
              Book Demo
              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4">
                <path d="M5.25 10H14.75M14.75 10L10 5.25M14.75 10L10 14.75" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

// Mobile Menu Helpers & Icons
function MobileIconWrapper({ children, bg }) {
  return <div className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full ${bg}`}>{children}</div>;
}

function DocIconBlue() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#23a1df" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function LightningIconBlue() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#23a1df" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function GridIconBlue() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#23a1df" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <path d="M3 14h7v7H3z" />
      <path d="M3 14l7 7" />
    </svg>
  );
}

function FactoryIconBlue() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#23a1df" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M17 18h1" />
      <path d="M12 18h1" />
      <path d="M7 18h1" />
    </svg>
  );
}

function BookIconBlue() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#23a1df" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function BuildingIconBlue() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#23a1df" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}
