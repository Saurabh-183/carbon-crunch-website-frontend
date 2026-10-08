/**
 * Consolidated Application Constants
 * Centralized constants for all features
 * Import from this file instead of scattered constant files
 */

// ============================================
// ALLOCATION CONSTANTS
// ============================================
export const ALLOCATION_MESSAGES = {
  NO_FACILITY: "Facility not found.",
  NO_PRODUCT_BOUNDARY: "Product allocation is available only when the facility boundary includes Product level.",
  NO_PRODUCTS: "No products configured for this facility. Ask the Org Admin to add products in boundary settings.",
  DATES_REQUIRED: "Start and end dates are required.",
  INVALID_TOTAL: "Total allocation must be 100%.",
  SAVE_SUCCESS: "Product allocation saved.",
  SAVE_ERROR: "Failed to save allocation.",
  LOAD_ERROR: "Failed to load facility details.",
};

export const ALLOCATION_TOLERANCE = 0.01; // Allow 100% ± 0.01%

// ============================================
// APPROVALS & DATA CONSTANTS
// ============================================
export const SCOPE_CONFIGS = [
  { scope: "Scope 1", key: "scope1", dataKey: "scope1Data" },
  { scope: "Scope 2", key: "scope2", dataKey: "scope2Data" },
  { scope: "Scope 3", key: "scope3", dataKey: "scope3Data" },
];

export const TABLE_COLUMNS = [
  { key: "date", label: "DATE", minWidth: "140px" },
  { key: "entry", label: "ENTRY", minWidth: "220px" },
  { key: "unit", label: "UNIT OF MEASURE", minWidth: "170px" },
  { key: "consumption", label: "CONSUMPTION", minWidth: "160px" },
  { key: "emissions", label: "EMISSIONS (tCO₂e) ", minWidth: "140px" },
  { key: "actions", label: "ACTION", minWidth: "160px" },
  { key: "details", label: "MORE DETAILS", minWidth: "140px" },
];

// ============================================
// BOUNDARY SETTINGS CONSTANTS
// ============================================
export const BOUNDARY_METHODS = [
  "Operational Control",
  "Financial Control",
  "Equity Share",
];

export const DEFAULT_BOUNDARY_CONFIG = {
  boundaryMethod: "",
  equityShare: 0,
  reportingScopes: [],
  systemBoundaries: [],
  systemBoundaryProjects: [],
  systemBoundaryProducts: [],
  reportingPeriod: {
    startDate: "",
    endDate: "",
  },
};

export const VALID_MODULES = ["GHG", "RCO", "CCTS", "PAT"];

export const normalizeModules = (modules = []) =>
  modules.map((module) => (module === "GHG" ? "GHG" : module));

/**
 * Convert backend scopes to display scopes
 * @param {Array} backendScopes - Array of backend scope strings
 * @returns {Array} Display scopes for UI
 */
export const transformScopesForDisplay = (backendScopes = []) => {
  const allowed = new Set(["Scope 1", "Scope 2", "Scope 3"]);
  return (backendScopes || []).filter((scope) => allowed.has(scope));
};

/**
 * Convert display scopes back to backend scopes
 * @param {Array} displayScopes - Array of display scope strings
 * @returns {Array} Backend scopes for API
 */
export const transformScopesToBackend = (displayScopes = []) => {
  const allowed = new Set(["Scope 1", "Scope 2", "Scope 3"]);
  return [...new Set((displayScopes || []).filter((scope) => allowed.has(scope)))];
};

// ============================================
// FACILITY CONSTANTS
// ============================================
export const STATE_OPTIONS = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export const DEFAULT_FACILITY_FORM = {
  name: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  type: "",
  facilityArea: "",
  facilityHeads: [{ name: "", email: "" }],
};
