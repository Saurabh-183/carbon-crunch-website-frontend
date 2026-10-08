const normalizeText = (value = "") => String(value).trim().toLowerCase().replace(/&/g, "and").replace(/\s+/g, " ");

export const isServiceSectorIndustry = (industry = "") => {
  const normalized = normalizeText(industry);
  return normalized.includes("service sector") || normalized === "service" || normalized === "services" || normalized.includes("service industry");
};

export const getDisplayRoleLabel = (role, industry = "") => {
  const isServiceSector = isServiceSectorIndustry(industry);

  if (isServiceSector && role === "HEAD") return "Head";
  if (isServiceSector && role === "REGION_ADMIN") return "Regional Manager";
  if (isServiceSector && role === "ORG_ADMIN") return "Organization Admin";
  if (isServiceSector && role === "PLANT_ADMIN") return "Branch Admin";
  if (isServiceSector && role === "ENERGY_MANAGER") return "Office Admin";

  const defaultLabels = {
    GOD_MODE: "God Mode",
    PLATFORM_ADMIN: "Platform Admin",
    MAINTAINER: "Maintainer",
    HEAD: "Head",
    REGION_ADMIN: "Region Admin",
    ORG_ADMIN: "Organization Admin",
    PLANT_ADMIN: "Plant Admin",
    ENERGY_MANAGER: "Energy Manager",
    AUDITOR: "Auditor",
    COMPLIANCE_OFFICER: "Compliance Officer",
    FINANCE_CFO: "Finance / CFO",
  };

  return defaultLabels[role] || role;
};

const getNormalizedRole = (role = "") =>
  String(role || "")
    .trim()
    .toUpperCase();

export const getSiteUnitLabel = (industry = "", formOrRole = "singular", maybeRole = "") => {
  const normalizedRoleFromArg = getNormalizedRole(formOrRole);
  const normalizedRole = getNormalizedRole(maybeRole || (normalizedRoleFromArg === "HEAD" ? normalizedRoleFromArg : ""));
  const form = ["singular", "plural"].includes(formOrRole) ? formOrRole : "singular";

  if (!isServiceSectorIndustry(industry)) {
    return form === "plural" ? "Plants" : "Plant";
  }

  if (normalizedRole === "HEAD") {
    return form === "plural" ? "Regions" : "Region";
  }

  return form === "plural" ? "Branches" : "Branch";
};

export const toUiTerminology = (text, industry = "", role = "") => {
  if (!isServiceSectorIndustry(industry) || !text) {
    return text;
  }

  const normalizedRole = getNormalizedRole(role);

  if (normalizedRole === "HEAD") {
    return String(text)
      .replace(/\bRegional Managers\b/g, "Region Admins")
      .replace(/\bRegional Manager\b/g, "Region Admin")
      .replace(/\bRegional Heads\b/g, "Region Admins")
      .replace(/\bRegional Head\b/g, "Region Admin")
      .replace(/\bRegional Offices\b/g, "Organizations")
      .replace(/\bregional offices\b/g, "organizations")
      .replace(/\bRegional Office\b/g, "Organization")
      .replace(/\bregional office\b/g, "organization")
      .replace(/\bBranches\b/g, "Regions")
      .replace(/\bbranches\b/g, "regions")
      .replace(/\bBranch\b/g, "Region")
      .replace(/\bbranch\b/g, "region")
      .replace(/\bFacilities\b/g, "Regions")
      .replace(/\bfacilities\b/g, "regions")
      .replace(/\bFacility\b/g, "Region")
      .replace(/\bfacility\b/g, "region")
      .replace(/\bPlant\b/g, "Region")
      .replace(/\bplant\b/g, "region");
  }

  if (normalizedRole === "REGION_ADMIN") {
    return String(text)
      .replace(/\bPlant Admins\b/g, "Branch Admins")
      .replace(/\bPlant Admin\b/g, "Branch Admin")
      .replace(/\bFacilities\b/g, "Branches")
      .replace(/\bfacilities\b/g, "branches")
      .replace(/\bFacility\b/g, "Branch")
      .replace(/\bfacility\b/g, "branch")
      .replace(/\bPlant\b/g, "Branch")
      .replace(/\bplant\b/g, "branch");
  }

  return String(text)
    .replace(/\bOrganization Admins\b/g, "Regional Heads")
    .replace(/\bOrganization Admin\b/g, "Regional Head")
    .replace(/\bOrg Admins\b/g, "Regional Heads")
    .replace(/\bOrg Admin\b/g, "Regional Head")
    .replace(/\bOrganizations\b/g, "Regional Offices")
    .replace(/\borganizations\b/g, "regional offices")
    .replace(/\bOrganisation\b/g, "Regional Office")
    .replace(/\borganisation\b/g, "regional office")
    .replace(/\bOrganization\b/g, "Regional Office")
    .replace(/\borganization\b/g, "regional office")
    .replace(/\bPlant Admins\b/g, "Branch Managers")
    .replace(/\bPlant Admin\b/g, "Branch Manager")
    .replace(/\bEnergy Managers\b/g, "Office Admins")
    .replace(/\bEnergy Manager\b/g, "Office Admin")
    .replace(/\bFacilities\b/g, "Branches")
    .replace(/\bfacilities\b/g, "branches")
    .replace(/\bFacility\b/g, "Branch")
    .replace(/\bfacility\b/g, "branch")
    .replace(/\bPlant\b/g, "Branch")
    .replace(/\bplant\b/g, "branch");
};
