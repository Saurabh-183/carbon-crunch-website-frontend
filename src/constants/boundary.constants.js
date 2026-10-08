export const BOUNDARY_METHODS = ["Operational Control", "Financial Control", "Equity Share"];

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

export const normalizeModules = (modules = []) => modules.map((module) => (module === "GHG" ? "GHG" : module));

// Scope display mapping: Convert backend scopes to display scopes
export const transformScopesForDisplay = (backendScopes = []) => {
  const allowed = new Set(["Scope 1", "Scope 2", "Scope 3"]);
  return (backendScopes || []).filter((scope) => allowed.has(scope));
};

// Convert display scopes back to backend scopes
export const transformScopesToBackend = (displayScopes = []) => {
  const allowed = new Set(["Scope 1", "Scope 2", "Scope 3"]);
  return [...new Set((displayScopes || []).filter((scope) => allowed.has(scope)))];
};
