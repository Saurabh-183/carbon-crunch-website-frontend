/**
 * Context Detection Service
 * Automatically detects the current dashboard, page, and user context
 */

export const detectContext = (location, user) => {
  const path = location.pathname;
  const params = new URLSearchParams(location.search);

  // Detect dashboard type
  const detectDashboard = () => {
    if (path.startsWith("/god")) return "god_mode";
    if (path.startsWith("/energy")) return "energy_manager";
    if (path.startsWith("/plant")) return "plant_admin";
    if (path.startsWith("/org")) return "org_admin";
    if (path.startsWith("/admin") || path === "/dashboard") return "platform_admin";
    if (path.startsWith("/auditor")) return "auditor";
    return "common";
  };

  // Detect specific page within dashboard
  const detectPage = () => {
    // Energy Manager pages
    if (path.includes("/data-entry")) {
      const scope = params.get("scope") || "scope1";
      const scope3Type = params.get("scope3");
      return scope3Type ? `data_entry_${scope}_${scope3Type}` : `data_entry_${scope}`;
    }
    if (path.includes("/bulk-import")) return "bulk_import";
    if (path.includes("/ai-ocr")) return "ai_ocr";
    if (path.includes("/rejected-entries")) return "rejected_entries";

    // Plant Admin pages
    if (path.includes("/pending-approvals")) return "pending_approvals";
    if (path.includes("/approved-entries")) return "approved_entries";

    // Org Admin pages
    if (path.includes("/facilities")) return "facilities";
    if (path.includes("/reports")) return "reports";
    if (path.includes("/users")) return "users";

    // Default
    return "dashboard";
  };

  const dashboard = detectDashboard();
  const page = detectPage();

  return {
    dashboard,
    page,
    fullContext: `${dashboard}/${page}`,
    role: user?.role,
    userId: user?.id,
    organizationId: user?.organizationId,
    facilityId: user?.facilities?.[0]?.facilityId || user?.facilities?.[0],
  };
};

// Human-readable dashboard names
export const getDashboardName = (dashboard) => {
  const names = {
    god_mode: "God Mode",
    energy_manager: "Energy Manager",
    plant_admin: "Plant Admin",
    org_admin: "Organization Admin",
    platform_admin: "Platform Admin",
    auditor: "Auditor",
    common: "Platform",
  };
  return names[dashboard] || "Platform";
};

// Human-readable page names
export const getPageName = (page) => {
  const names = {
    dashboard: "Dashboard",
    data_entry_scope1: "Data Entry - Scope 1",
    data_entry_scope2: "Data Entry - Scope 2",
    data_entry_scope3_upstream: "Data Entry - Scope 3 Upstream",
    data_entry_scope3_downstream: "Data Entry - Scope 3 Downstream",
    bulk_import: "Bulk Import",
    ai_ocr: "AI-OCR",
    rejected_entries: "Rejected Entries",
    pending_approvals: "Pending Approvals",
    approved_entries: "Approved Entries",
    facilities: "Facilities",
    reports: "Reports",
    users: "Users",
  };
  return names[page] || page;
};
