import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  Building2,
  Factory,
  Users,
  Settings,
  LogOut,
  Globe,
  FileText,
  ClipboardList,
  CheckSquare,
  PenTool,
  PieChart,
  FileUp,
  AlertCircle,
  Box,
  Database,
  Activity,
  Package,
  MapPin,
  ChevronDown,
  ChevronRight,
  Plane,
  Trash2,
  Zap,
  Flame,
  LifeBuoy,
  Lock,
} from "lucide-react";
import { MENU_ITEMS_BY_ROLE, ROLE_CODES, isGodMode, isPlatformAdmin } from "../config/roleConfig";
import api from "../utils/api";
import ChatBot from "../components/ChatBot/ChatBot";
import ChatBotToggle from "../components/ChatBot/ChatBotToggle";
import { getDisplayRoleLabel, toUiTerminology } from "../utils/uiTerminology";
import { isServiceSectorIndustry } from "../utils/uiTerminology";

const ENERGY_DATA_ENTRY_CATEGORIES = [
  { key: "electricity", label: "Electricity", icon: "Zap" },
  { key: "travel", label: "Travel", icon: "Plane" },
  { key: "utility-losses", label: "Utility Losses", icon: "Zap" },
  { key: "professional-services", label: "Professional Services", icon: "Link" },
  { key: "gas-and-fuel", label: "Gas & Fuel", icon: "Flame" },
  { key: "waste", label: "Waste", icon: "Trash2" },
];

const isPlatformAdminRole = (role) => ROLE_CODES.PLATFORM_ADMIN.includes(role);
const isOrgAdmin = (role) => ROLE_CODES.ORG_ADMIN.includes(role) || ROLE_CODES.REGION_ADMIN?.includes(role) || ROLE_CODES.HEAD?.includes(role);
const isPlantAdmin = (role) => ROLE_CODES.PLANT_ADMIN.includes(role);
const isEnergyManager = (role) => ROLE_CODES.ENERGY_MANAGER.includes(role);
const isMaintainerRole = (role) => ROLE_CODES.MAINTAINER.includes(role);
const isAuditorRole = (role) => ROLE_CODES.AUDITOR.includes(role);

const ICON_MAP = {
  Home,
  Building2,
  Factory,
  Users,
  Globe,
  FileText,
  ClipboardList,
  CheckSquare,
  PenTool,
  PieChart,
  FileUp,
  AlertCircle,
  Box,
  Database,
  Activity,
  Package,
  MapPin,
  Plane,
  Trash2,
  Zap,
  Flame,
  LifeBuoy,
};

const ORG_ADMIN_TOUR_LINKS = {
  "/org/organization-details": "tour-org-details-link",
  "/org/facilities": "tour-org-facilities-link",
  "/org/boundary-settings": "tour-org-boundary-link",
};

const getOrgTourClass = (path) => ORG_ADMIN_TOUR_LINKS[path] || "";

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const organizationId = user?.organizationId?._id || user?.organizationId || "";
  const location = useLocation();
  const navigate = useNavigate();
  const [orgModules, setOrgModules] = useState(null);
  const [orgIndustry, setOrgIndustry] = useState("");
  const [orgModulesLoading, setOrgModulesLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEnergyDataEntryExpanded, setIsEnergyDataEntryExpanded] = useState(false);

  const normalizeModules = (modules = []) => modules.map((module) => (module === "GHG" ? "GHG" : module));

  useEffect(() => {
    const loadOrgModules = async () => {
      if ((!isOrgAdmin(user?.role) && !isPlantAdmin(user?.role) && !isEnergyManager(user?.role)) || !organizationId) {
        setOrgModules(null);
        setOrgIndustry("");
        setOrgModulesLoading(false);
        return;
      }
      setOrgModulesLoading(true);
      try {
        const res = await api.get(`/api/organizations/${organizationId}`);
        const org = res.data?.data || res.data;
        setOrgModules(normalizeModules(org?.complianceSettings?.enabledModules || []));
        setOrgIndustry(org?.industry || "");
      } catch (error) {
        console.error("Error fetching organization modules:", error);
        setOrgModules([]);
        setOrgIndustry(user?.organizationId?.industry || user?.organizationIndustry || "");
      } finally {
        setOrgModulesLoading(false);
      }
    };

    loadOrgModules();
  }, [user?.role, organizationId, user?.organizationIndustry]);

  const handleLogout = async () => {
    navigate("/");
    await logout();
  };

  const getMenuItems = () => {
    const role = user?.role;

    if (isGodMode(role)) return MENU_ITEMS_BY_ROLE.GOD_MODE;
    if (isPlatformAdminRole(role)) return MENU_ITEMS_BY_ROLE.PLATFORM_ADMIN;
    if (isMaintainerRole(role)) return MENU_ITEMS_BY_ROLE.MAINTAINER;
    if (isAuditorRole(role)) return MENU_ITEMS_BY_ROLE.AUDITOR || [];
    if (isOrgAdmin(role)) {
      const baseItems = ROLE_CODES.HEAD?.includes(role) ? MENU_ITEMS_BY_ROLE.HEAD : ROLE_CODES.REGION_ADMIN?.includes(role) ? MENU_ITEMS_BY_ROLE.REGION_ADMIN : MENU_ITEMS_BY_ROLE.ORG_ADMIN;
      if (!Array.isArray(orgModules)) return baseItems;
      const filtered = baseItems.filter((item) => !item.moduleKey || orgModules.includes(item.moduleKey));
      if (isServiceSectorIndustry(orgIndustry)) {
        return filtered.filter((item) => item.path !== "/org/boundary-settings" && item.path !== "/head/boundary-settings");
      }
      return filtered;
    }
    if (isPlantAdmin(role)) {
      const baseItems = MENU_ITEMS_BY_ROLE.PLANT_ADMIN;
      if (!Array.isArray(orgModules)) return baseItems;
      const serviceSector = isServiceSectorIndustry(orgIndustry);
      return baseItems.filter((item) => {
        // Service-sector branches should always see reports even when RCO is not enabled.
        if (serviceSector && item.path === "/plant/reports") return true;
        if (serviceSector && item.hideForServiceSector) return false;
        if (item.serviceSectorOnly && !serviceSector) return false;
        return !item.moduleKey || orgModules.includes(item.moduleKey);
      });
    }
    if (isEnergyManager(role)) {
      const baseItems = MENU_ITEMS_BY_ROLE.ENERGY_MANAGER;
      if (!Array.isArray(orgModules)) return baseItems;
      const serviceSector = isServiceSectorIndustry(orgIndustry);
      return baseItems.filter((item) => {
        if (item.serviceSectorOnly && !serviceSector) return false;
        return !item.moduleKey || orgModules.includes(item.moduleKey);
      });
    }

    return MENU_ITEMS_BY_ROLE.PLATFORM_ADMIN;
  };

  const menuItems = getMenuItems().map((item) => ({
    ...item,
    label: toUiTerminology(item.label, orgIndustry, user?.role),
  }));
  const isServiceSector = isServiceSectorIndustry(orgIndustry);

  useEffect(() => {
    if (!(isEnergyManager(user?.role) && isServiceSector)) {
      setIsEnergyDataEntryExpanded(false);
      return;
    }

    if (location.pathname !== "/data-entry") {
      setIsEnergyDataEntryExpanded(false);
    }
  }, [user?.role, isServiceSector, location.pathname]);

  const renderSidebarSkeleton = () => (
    <ul className="space-y-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <li key={`nav-skeleton-${index}`}>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800 animate-pulse">
            <div className="h-5 w-5 rounded bg-gray-700"></div>
            <div className="h-4 w-24 rounded bg-gray-700"></div>
          </div>
        </li>
      ))}
    </ul>
  );

  const getRoleBadge = () => {
    const role = user?.role;
    if (isGodMode(role)) return { text: "God Mode", bgColor: "#991b1b" };
    if (isPlatformAdminRole(role)) return { text: "Platform Admin", bgColor: "#ef4444" };
    if (ROLE_CODES.HEAD?.includes(role)) return { text: getDisplayRoleLabel("HEAD", orgIndustry), bgColor: "#1d4ed8" };
    if (ROLE_CODES.REGION_ADMIN?.includes(role)) return { text: getDisplayRoleLabel("REGION_ADMIN", orgIndustry), bgColor: "#2563eb" };
    if (isOrgAdmin(role)) return { text: getDisplayRoleLabel("ORG_ADMIN", orgIndustry), bgColor: "#3b82f6" };
    if (isPlantAdmin(role)) return { text: getDisplayRoleLabel("PLANT_ADMIN", orgIndustry), bgColor: "#22c55e" };
    if (isEnergyManager(role)) return { text: getDisplayRoleLabel("ENERGY_MANAGER", orgIndustry), bgColor: "#f97316" };
    if (isMaintainerRole(role)) return { text: "Maintainer", bgColor: "#06b6d4" };
    if (isAuditorRole(role)) return { text: "Auditor", bgColor: "#6b7280" };
    return { text: role, bgColor: "#6b7280" };
  };

  const badge = getRoleBadge();

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`${isCollapsed ? "w-20" : "w-72"} bg-zinc-950 border-r border-white/5 text-zinc-300 flex flex-col transition-all duration-300 ease-in-out h-screen shadow-2xl`}>
        {/* Logo/Brand */}
        <div className={`h-20 flex items-center flex-shrink-0 border-b border-white/5 ${isCollapsed ? "justify-center px-2" : "px-6"}`}>
          {!isCollapsed ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-green-600 bg-clip-text text-transparent">CarbonOS</h1>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mt-0.5">GHG Management</p>
              </div>
              <button
                onClick={() => setIsCollapsed((prev) => !prev)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-emerald-400 hover:bg-white/5 transition-colors"
                aria-label="Collapse sidebar"
              >
                <span className="text-xl leading-none">«</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all font-bold text-xl"
              aria-label="Expand sidebar"
            >
              »
            </button>
          )}
        </div>

        {/* User Info */}
        <div className={`py-6 border-b border-white/5 ${isCollapsed ? "flex justify-center px-2" : "px-6"}`}>
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-4"}`}>
            {/* Profile Circle */}
            <div
              className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full border-2 text-sm font-bold shadow-lg ring-2 ring-black/50"
              style={{
                backgroundColor: "rgba(0,0,0,0.2)",
                color: badge.bgColor,
                borderColor: badge.bgColor,
              }}
            >
              {(user?.username || "User").slice(0, 2).toUpperCase()}
            </div>

            {!isCollapsed && (
              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <p className="font-semibold text-zinc-100 truncate text-sm">{user?.username || "User"}</p>
                {user?.companyName && <p className="text-xs text-zinc-500 truncate font-medium">{user.companyName}</p>}
                {/* Badge */}
                <div className="mt-1.5 flex">
                  <span
                    className="px-2.5 py-0.5 rounded-md border text-[10px] font-bold tracking-wide uppercase shadow-sm"
                    style={{
                      backgroundColor: `${badge.bgColor}10`, // 10% opacity of the badge color
                      color: badge.bgColor,
                      borderColor: `${badge.bgColor}30`, // 30% opacity border
                    }}
                  >
                    {badge?.text || "U"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto custom-scrollbar ${isCollapsed ? "px-3 py-6" : "px-4 py-6"}`}>
          {orgModulesLoading && (isOrgAdmin(user?.role) || isPlantAdmin(user?.role) || isEnergyManager(user?.role)) ? (
            renderSidebarSkeleton()
          ) : (
            <ul className="space-y-1.5">
              {menuItems.map((item) => {
                const Icon = ICON_MAP[item.icon] || Home;
                const isActive = location.pathname === item.path;
                const tourClass = getOrgTourClass(item.path);
                const isEnergyDataEntryParent = isEnergyManager(user?.role) && isServiceSector && item.path === "/data-entry";
                
                // Removed sidebar lock since the lock is now handled in the main content area
                const isLocked = false;

                return (
                  <li key={item.path} className="relative">
                    {isEnergyDataEntryParent ? (
                      <button
                        type="button"
                        title={item.label}
                        onClick={() => {
                          setIsEnergyDataEntryExpanded((prev) => !prev);
                          if (location.pathname !== "/data-entry") {
                            navigate("/data-entry");
                          }
                        }}
                        className={`group w-full flex items-center ${isCollapsed ? "justify-center" : "gap-3.5"} px-3 py-2.5 rounded-xl transition-all duration-300 border ${
                          isActive
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_-3px_rgba(52,211,153,0.15)]"
                            : "border-transparent text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                        } ${tourClass || ""}`}
                      >
                        <Icon size={20} className={`transition-transform duration-300 ${!isCollapsed && "group-hover:scale-110"}`} />
                        {!isCollapsed && (
                          <>
                            <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
                            {isEnergyDataEntryExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </>
                        )}
                      </button>
                    ) : (
                      <Link
                        to={item.path}
                        title={item.label}
                        onClick={() => {
                          if (isEnergyDataEntryExpanded) {
                            setIsEnergyDataEntryExpanded(false);
                          }
                        }}
                        className={`group flex items-center ${isCollapsed ? "justify-center" : "gap-3.5"} px-3 py-2.5 rounded-xl transition-all duration-300 border ${
                          isActive
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_-3px_rgba(52,211,153,0.15)]"
                            : "border-transparent text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                        } ${tourClass || ""}`}>
                        <Icon size={20} className={`transition-transform duration-300 ${!isCollapsed && "group-hover:scale-110"}`} />
                        {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                      </Link>
                    )}

                    {isEnergyDataEntryParent && !isCollapsed && isEnergyDataEntryExpanded && (
                      <ul className="mt-1 ml-6 space-y-1">
                        {user?.dataEntryStyle === "scope" ? (
                          ["Scope 1", "Scope 2", "Scope 3"].map((scopeLevel) => {
                            const scopeParam = new URLSearchParams(location.search).get("scope");
                            const isScopeActive = location.pathname === "/data-entry" && (scopeParam === scopeLevel || (!scopeParam && scopeLevel === "Scope 1"));
                            return (
                              <li key={scopeLevel}>
                                <Link
                                  to={`/energy/data-entry?scope=${scopeLevel}`}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${
                                    isScopeActive ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "border-transparent text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
                                  }`}
                                >
                                  <Box size={15} />
                                  {scopeLevel}
                                </Link>
                              </li>
                            );
                          })
                        ) : (
                          (isServiceSector
                            ? ENERGY_DATA_ENTRY_CATEGORIES
                            : ENERGY_DATA_ENTRY_CATEGORIES.filter((category) => !["office-supplies", "utility-losses", "professional-services"].includes(category.key))
                          ).map((category) => {
                            const isCategoryActive = location.pathname === "/data-entry" && new URLSearchParams(location.search).get("category") === category.key;
                            const CategoryIcon = ICON_MAP[category.icon] || FileText;
                            return (
                              <li key={category.key}>
                                <Link
                                  to={`/energy/data-entry?category=${category.key}`}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${
                                    isCategoryActive ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "border-transparent text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
                                  }`}
                                >
                                  <CategoryIcon size={15} />
                                  {category.label}
                                </Link>
                              </li>
                            );
                          })
                        )}
                      </ul>
                    )}
                  </li>
                );
              })}

              {isEnergyManager(user?.role) && (
                <li className="pt-6 relative">
                  {!isCollapsed && <p className="text-[11px] uppercase tracking-wider text-zinc-600 font-bold px-3 mb-3">Tools</p>}
                  <ul className="space-y-1.5">
                    <li>
                      <Link
                        to="/energy/bulk-import"
                        title="Bulk Import"
                        className={`group flex items-center ${isCollapsed ? "justify-center" : "gap-3.5"} px-3 py-2 rounded-xl text-sm transition-all duration-200 border ${
                          location.pathname === "/energy/bulk-import"
                            ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                            : "border-transparent text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                        }`}
                      >
                        <FileUp size={18} />
                        {!isCollapsed && <span>Bulk Import</span>}
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/energy/ai-ocr"
                        title="AI-OCR"
                        className={`group flex items-center ${isCollapsed ? "justify-center" : "gap-3.5"} px-3 py-2 rounded-xl text-sm transition-all duration-200 border ${
                          location.pathname === "/energy/ai-ocr" ? "bg-purple-500/10 border-purple-500/20 text-purple-400" : "border-transparent text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                        }`}
                      >
                        <FileText size={18} />
                        {!isCollapsed && <span>AI-OCR</span>}
                      </Link>
                    </li>
                  </ul>
                </li>
              )}
            </ul>
          )}
        </nav>

        {/* Bottom Actions */}
        <div className={`p-4 border-t border-white/5 space-y-2 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
          {/* <Link
            to="/settings"
            title="Settings"
            className={`flex items-center ${isCollapsed ? "justify-center w-10 h-10" : "gap-3 px-3 py-2.5"} rounded-xl transition-all duration-200 border ${
              location.pathname === "/settings" ? "bg-zinc-800 border-zinc-700 text-white" : "border-transparent text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <Settings size={20} />
            {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
          </Link> */}
          <button
            onClick={handleLogout}
            title="Logout"
            className={`flex items-center ${
              isCollapsed ? "justify-center w-10 h-10" : "gap-3 px-3 py-2.5 w-full"
            } rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 border border-transparent transition-all duration-200`}
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {(() => {
          // Blur lock for unassigned Energy Managers on restricted routes
          const isEnergyManagerRole = isEnergyManager(user?.role);
          const isUnassigned = !user?.organizationId || !user?.facilities?.length;
          // Only Dashboard, Data Entry, and Helpdesk are allowed for unassigned users
          const allowedPaths = ["/dashboard", "/data-entry", "/helpdesk/dashboard", "/settings"];
          const isRouteLocked = isEnergyManagerRole && isUnassigned && !allowedPaths.some(p => location.pathname.startsWith(p));
          
          return (
            <>
              <div className={`p-6 ${isRouteLocked ? 'pointer-events-none select-none overflow-hidden h-screen' : ''}`}>{children}</div>
              {isRouteLocked && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-white/40 backdrop-blur-sm m-4 rounded-2xl" style={{ minHeight: 'calc(100vh - 32px)' }}>
                  <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md text-center border border-slate-100 flex flex-col items-center mx-4 relative top-[-10%] pointer-events-auto">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-5">
                      <Lock className="w-10 h-10 text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-3">Unlock This Module</h2>
                    <p className="text-slate-500 mb-6 leading-relaxed text-sm">
                      You’re viewing a premium module. Upgrade your access to unlock its full capabilities.
                    </p>
                    <div className="w-full space-y-3">
                      <button className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors w-full flex flex-col items-center" onClick={() => { /* Handle upgrade action */ }}>
                        <span className="text-base">Unlock Premium</span>
                        <span className="text-xs font-normal text-emerald-100">Get access to this module</span>
                      </button>
                      <button className="px-6 py-3 bg-slate-50 text-slate-800 font-medium rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors w-full flex flex-col items-center" onClick={() => { /* Handle schedule demo */ }}>
                        <span className="text-base">Schedule a Demo</span>
                        <span className="text-xs font-normal text-slate-500">Talk to our team about your requirements</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </main>

      {/* Chatbot */}
      {!isChatOpen && <ChatBotToggle onClick={() => setIsChatOpen(true)} />}
      <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default DashboardLayout;
