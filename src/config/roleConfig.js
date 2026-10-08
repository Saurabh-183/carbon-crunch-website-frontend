/**
 * CarbonOS Frontend Role Configuration
 *
 * GOD_MODE is intentionally EXCLUDED from normal frontend routing.
 * God Mode users access the system via /god/* routes only, backed by /api/god/* APIs.
 *
 * PLATFORM_ADMIN is the top-level admin role (below GOD_MODE).
 */

export const ROLE_CODES = {
  GOD_MODE: ["GOD_MODE"],
  PLATFORM_ADMIN: ["PLATFORM_ADMIN"],
  MAINTAINER: ["MAINTAINER"],
  HEAD: ["HEAD"],
  REGION_ADMIN: ["REGION_ADMIN"],
  ORG_ADMIN: ["ORG_ADMIN"],
  PLANT_ADMIN: ["PLANT_ADMIN"],
  ENERGY_MANAGER: ["ENERGY_MANAGER"],
  // Keep VERIFIER as a legacy alias so old users still land on auditor routes.
  AUDITOR: ["AUDITOR", "VERIFIER"],
};

export const ROLE_REDIRECTS = {
  GOD_MODE: "/god/dashboard",
  PLATFORM_ADMIN: "/dashboard",
  MAINTAINER: "/maintainer/emission-factors",
  HEAD: "/head/dashboard",
  REGION_ADMIN: "/org/dashboard",
  ORG_ADMIN: "/org/dashboard",
  PLANT_ADMIN: "/plant/dashboard",
  ENERGY_MANAGER: "/dashboard",
  AUDITOR: "/auditor/dashboard",
};

export const ROUTE_ROLE_MAP = {
  // God Mode (separate URL space)
  "/god/dashboard": ["GOD_MODE"],
  "/god/users": ["GOD_MODE"],
  "/god/stats": ["GOD_MODE"],
  "/god/emission-factors": ["GOD_MODE"],
  "/god/logs": ["GOD_MODE"],

  // Platform Admin
  "/dashboard": ["PLATFORM_ADMIN", "ENERGY_MANAGER"],
  "/admin/organizations": ["PLATFORM_ADMIN"],
  "/admin/facilities": ["PLATFORM_ADMIN"],
  "/admin/users": ["PLATFORM_ADMIN"],
  "/admin/emission-factors": ["PLATFORM_ADMIN"],
  "/admin/logs": ["PLATFORM_ADMIN"],

  // Maintainer
  "/maintainer/emission-factors": ["MAINTAINER"],

  // Head
  "/head/dashboard": ["HEAD"],
  "/head/facilities": ["HEAD"],
  "/head/organization-details": ["HEAD"],
  "/head/boundary-settings": ["HEAD"],
  "/head/boundary-settings/:module": ["HEAD"],
  "/head/boundary-settings/GHG": ["HEAD"],
  "/head/boundary-settings/rco": ["HEAD"],
  "/head/boundary-settings/ccts": ["HEAD"],
  "/head/boundary-settings/pat": ["HEAD"],
  "/head/users": ["HEAD"],
  "/head/reports": ["HEAD"],
  "/head/cbam-dashboard": ["HEAD"],
  "/head/logs": ["HEAD"],

  // Org Admin
  "/org/dashboard": ["REGION_ADMIN", "ORG_ADMIN"],
  "/org/facilities": ["REGION_ADMIN", "ORG_ADMIN"],
  "/org/organization-details": ["ORG_ADMIN"],
  "/org/region-details": ["REGION_ADMIN"],
  "/org/boundary-settings": ["REGION_ADMIN", "ORG_ADMIN"],
  "/org/boundary-settings/:module": ["REGION_ADMIN", "ORG_ADMIN"],
  "/org/boundary-settings/GHG": ["REGION_ADMIN", "ORG_ADMIN"],
  "/org/boundary-settings/rco": ["REGION_ADMIN", "ORG_ADMIN"],
  "/org/boundary-settings/ccts": ["REGION_ADMIN", "ORG_ADMIN"],
  "/org/boundary-settings/pat": ["REGION_ADMIN", "ORG_ADMIN"],
  "/org/users": ["REGION_ADMIN", "ORG_ADMIN"],
  "/org/reports": ["REGION_ADMIN", "ORG_ADMIN"],
  "/org/cbam-dashboard": ["REGION_ADMIN", "ORG_ADMIN"],
  "/org/logs": ["REGION_ADMIN", "ORG_ADMIN"],

  // Plant Admin
  "/plant/dashboard": ["PLANT_ADMIN"],
  "/plant/approvals": ["PLANT_ADMIN"],
  "/plant/approvals/:id": ["PLANT_ADMIN"],
  "/plant/approved-reports": ["PLANT_ADMIN"],
  "/plant/approved-reports/:id": ["PLANT_ADMIN"],
  "/plant/logs": ["PLANT_ADMIN"],
  "/plant/information": ["PLANT_ADMIN"],
  "/plant/reports": ["PLANT_ADMIN"],
  "/plant/product-allocation": ["PLANT_ADMIN"],
  "/plant/users": ["PLANT_ADMIN"],
  "/plant/assets": ["PLANT_ADMIN"],
  "/plant/infrastructure": ["PLANT_ADMIN"],
  "/plant/cbam-dashboard": ["PLANT_ADMIN"],
  "/plant/cbam-data-entry": ["PLANT_ADMIN"],

  // Energy Manager
  "/data-entry": ["ENERGY_MANAGER"],
  "/energy/office-information": ["ENERGY_MANAGER"],
  "/energy/reports": ["ENERGY_MANAGER"],
  "/energy/rejected-entries": ["ENERGY_MANAGER"],
  "/energy/bulk-import": ["ENERGY_MANAGER"],
  "/energy/ai-ocr": ["ENERGY_MANAGER"],
  
  "/emission-factors": ["HEAD", "REGION_ADMIN", "ORG_ADMIN", "PLANT_ADMIN", "ENERGY_MANAGER"],

  // Helpdesk
  "/helpdesk/dashboard": ["ENERGY_MANAGER", "PLANT_ADMIN", "REGION_ADMIN", "ORG_ADMIN", "HEAD"],
  "/helpdesk/submit": ["ENERGY_MANAGER", "PLANT_ADMIN", "REGION_ADMIN", "ORG_ADMIN", "HEAD"],
  "/helpdesk/:id": ["ENERGY_MANAGER", "PLANT_ADMIN", "REGION_ADMIN", "ORG_ADMIN", "HEAD"],

  // Auditor
  "/auditor/dashboard": ["AUDITOR"],
  "/auditor/clients": ["AUDITOR"],
  "/auditor/verify-reports": ["AUDITOR"],
  "/auditor/submissions": ["AUDITOR"],
  "/auditor/reports": ["AUDITOR"],
  "/auditor/reports/:id": ["AUDITOR"],
  "/auditor/logs": ["AUDITOR"],

  // Maintainer
  "/maintainer/logs": ["MAINTAINER"],
};

export const MENU_ITEMS_BY_ROLE = {
  GOD_MODE: [
    { path: "/god/dashboard", label: "God Mode Dashboard", icon: "Home" },
    { path: "/god/users", label: "All Users", icon: "Users" },
    { path: "/god/stats", label: "System Stats", icon: "PieChart" },
    { path: "/god/emission-factors", label: "Emission Factors", icon: "Database" },
    { path: "/god/logs", label: "Activity Logs", icon: "Activity" },
  ],
  PLATFORM_ADMIN: [
    { path: "/dashboard", label: "Dashboard", icon: "Home" },
    { path: "/admin/organizations", label: "Organizations", icon: "Building2" },
    { path: "/admin/facilities", label: "Facilities", icon: "Factory" },
    { path: "/admin/users", label: "Users", icon: "Users" },
    { path: "/admin/emission-factors", label: "Emission Factors", icon: "Database" },
    { path: "/admin/logs", label: "Activity Logs", icon: "Activity" },
  ],
  MAINTAINER: [
    { path: "/maintainer/emission-factors", label: "Emission Factors", icon: "Database" },
    { path: "/maintainer/logs", label: "Activity Logs", icon: "Activity" },
  ],
  HEAD: [
    { path: "/head/dashboard", label: "Dashboard", icon: "Home" },
    { path: "/head/organization-details", label: "Organization Details", icon: "Building2" },
    { path: "/head/facilities", label: "My Facilities", icon: "Factory" },
    { path: "/head/boundary-settings", label: "Boundary Settings", icon: "Globe" },
    { path: "/head/users", label: "Manage Users", icon: "Users" },
    { path: "/emission-factors", label: "Emission Factors", icon: "Database" },
    { path: "/head/reports", label: "Download Reports", icon: "FileText" },
    { path: "/head/cbam-dashboard", label: "CBAM Dashboard", icon: "Globe", moduleKey: "CBAM" },
    { path: "/head/logs", label: "Activity Logs", icon: "Activity" },
    { path: "/helpdesk/dashboard", label: "Helpdesk", icon: "LifeBuoy" },
  ],
  REGION_ADMIN: [
    { path: "/org/dashboard", label: "Dashboard", icon: "Home" },
    { path: "/org/region-details", label: "Region Details", icon: "Building2" },
    { path: "/org/facilities", label: "My Facilities", icon: "Factory" },
    { path: "/org/boundary-settings", label: "Boundary Settings", icon: "Globe" },
    { path: "/org/users", label: "Manage Users", icon: "Users" },
    { path: "/emission-factors", label: "Emission Factors", icon: "Database" },
    { path: "/org/reports", label: "Download Reports", icon: "FileText" },
    { path: "/org/cbam-dashboard", label: "CBAM Dashboard", icon: "Globe", moduleKey: "CBAM" },
    { path: "/org/logs", label: "Activity Logs", icon: "Activity" },
    { path: "/helpdesk/dashboard", label: "Helpdesk", icon: "LifeBuoy" },
  ],
  ORG_ADMIN: [
    { path: "/org/dashboard", label: "Dashboard", icon: "Home" },
    { path: "/org/organization-details", label: "Organization Details", icon: "Building2" },
    { path: "/org/facilities", label: "My Facilities", icon: "Factory" },
    { path: "/org/boundary-settings", label: "Boundary Settings", icon: "Globe" },
    { path: "/org/users", label: "Manage Users", icon: "Users" },
    { path: "/emission-factors", label: "Emission Factors", icon: "Database" },
    { path: "/org/reports", label: "Download Reports", icon: "FileText" },
    { path: "/org/cbam-dashboard", label: "CBAM Dashboard", icon: "Globe", moduleKey: "CBAM" },
    { path: "/org/logs", label: "Activity Logs", icon: "Activity" },
    { path: "/helpdesk/dashboard", label: "Helpdesk", icon: "LifeBuoy" },
  ],
  PLANT_ADMIN: [
    { path: "/plant/dashboard", label: "Dashboard", icon: "Home" },
    { path: "/plant/approvals", label: "Pending Approvals", icon: "CheckSquare", hideForServiceSector: true },
    { path: "/plant/approved-reports", label: "Approved Reports", icon: "ClipboardList", hideForServiceSector: true },
    { path: "/plant/information", label: "Plant Information", icon: "Factory" },
    { path: "/plant/infrastructure", label: "Plant Infrastructure", icon: "Package", hideForServiceSector: true },
    { path: "/emission-factors", label: "Emission Factors", icon: "Database" },
    { path: "/plant/reports", label: "Download Reports", icon: "Download", moduleKey: "RCO" },
    { path: "/plant/cbam-data-entry", label: "CBAM", icon: "Database", moduleKey: "CBAM" },
    { path: "/plant/users", label: "Energy Managers", icon: "Users" },
    { path: "/plant/logs", label: "Activity Logs", icon: "Activity" },
    { path: "/helpdesk/dashboard", label: "Helpdesk", icon: "LifeBuoy" },
  ],
  ENERGY_MANAGER: [
    { path: "/dashboard", label: "Dashboard", icon: "Home" },
    { path: "/data-entry", label: "Data Entry", icon: "FileText" },
    { path: "/energy/office-information", label: "Office Information", icon: "Building2", serviceSectorOnly: true },
    { path: "/emission-factors", label: "Emission Factors", icon: "Database" },
    { path: "/energy/reports", label: "Download Reports", icon: "FileText", serviceSectorOnly: true },
    { path: "/helpdesk/dashboard", label: "Helpdesk", icon: "LifeBuoy" },
  ],
  AUDITOR: [
    { path: "/auditor/dashboard", label: "Dashboard", icon: "Home" },
    { path: "/auditor/clients", label: "Manage Clients", icon: "Building2" },
    { path: "/auditor/verify-reports", label: "Verify Reports", icon: "CheckSquare" },
    { path: "/auditor/submissions", label: "Submissions", icon: "ClipboardList" },
    { path: "/auditor/reports", label: "Reports", icon: "FileText" },
    { path: "/auditor/logs", label: "Activity Logs", icon: "Activity" },
  ],
};

export const getAllowedRolesForPath = (path) => ROUTE_ROLE_MAP[path] || [];

export const isRoleAllowed = (userRole, allowedRoles = []) => {
  if (!userRole) return false;
  return allowedRoles.some((role) => ROLE_CODES[role]?.includes(userRole) || role === userRole);
};

export const getDashboardRouteForRole = (role) => {
  if (!role) return "/dashboard";
  if (ROLE_CODES.GOD_MODE.includes(role)) return ROLE_REDIRECTS.GOD_MODE;
  if (ROLE_CODES.PLATFORM_ADMIN.includes(role)) return ROLE_REDIRECTS.PLATFORM_ADMIN;
  if (ROLE_CODES.MAINTAINER.includes(role)) return ROLE_REDIRECTS.MAINTAINER;
  if (ROLE_CODES.HEAD.includes(role)) return ROLE_REDIRECTS.HEAD;
  if (ROLE_CODES.REGION_ADMIN.includes(role)) return ROLE_REDIRECTS.REGION_ADMIN;
  if (ROLE_CODES.ORG_ADMIN.includes(role)) return ROLE_REDIRECTS.ORG_ADMIN;
  if (ROLE_CODES.PLANT_ADMIN.includes(role)) return ROLE_REDIRECTS.PLANT_ADMIN;
  if (ROLE_CODES.ENERGY_MANAGER.includes(role)) return ROLE_REDIRECTS.ENERGY_MANAGER;
  if (ROLE_CODES.AUDITOR.includes(role)) return ROLE_REDIRECTS.AUDITOR;
  return "/dashboard";
};

/**
 * Check if a role is God Mode.
 * Used to redirect God Mode users to /god/* routes exclusively.
 */
export const isGodMode = (role) => ROLE_CODES.GOD_MODE.includes(role);
export const isPlatformAdmin = (role) => ROLE_CODES.PLATFORM_ADMIN.includes(role);
export const isAuditor = (role) => ROLE_CODES.AUDITOR.includes(role);
