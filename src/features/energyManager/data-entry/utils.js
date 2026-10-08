import scope1EF from "../../../scope1EF.json";
import scope2EF from "../../../scope2EF.json";
import scope3EF from "../../../scope3EF.json";
import mapping from "../../../config/mapping.json";

export const getScopeFromActivityType = (activityType) => {
  if (!activityType) return "Scope 1";
  if (scope1EF?.[activityType]) return "Scope 1";
  if (scope2EF?.[activityType]) return "Scope 2";
  if (scope3EF?.Upstream?.[activityType]) return "Scope 3";
  if (scope3EF?.Downstream?.[activityType]) return "Scope 3";
  return "Scope 1";
};

export const getScope3ModuleByActivityType = (activityType) => {
  if (scope3EF?.Upstream?.[activityType]) return "Upstream";
  if (scope3EF?.Downstream?.[activityType]) return "Downstream";
  return null;
};

export const getEmissionDataByScope = (scope, scope3Module, activityType) => {
  if (scope === "Scope 1") return scope1EF;
  if (scope === "Scope 2") return scope2EF;
  if (scope === "Scope 3") {
    const resolvedModule = scope3Module || getScope3ModuleByActivityType(activityType) || "Upstream";
    return scope3EF?.[resolvedModule] || {};
  }
  return null;
};

export const getActivityTypeOptionsFromEf = (scope, scope3Module) => {
  if (!scope) return [];
  const buildOptions = (efData, scopeLabel) =>
    Object.keys(efData || {})
      .filter((key) => key !== "scope" && key.toLowerCase() !== "scope")
      .map((key) => ({ value: key, label: key, scope: scopeLabel }));

  if (scope === "Scope 1") return buildOptions(scope1EF, "Scope 1");
  if (scope === "Scope 2") return buildOptions(scope2EF, "Scope 2");
  if (scope === "Scope 3") {
    const scope3Data = getEmissionDataByScope("Scope 3", scope3Module);
    return buildOptions(scope3Data, "Scope 3");
  }
  return [];
};

export const getGroupOptions = (activityType, scope, scope3Module) => {
  if (!activityType || !scope) return [];
  const efData = getEmissionDataByScope(scope, scope3Module, activityType);
  const activityData = efData?.[activityType];
  if (!activityData || typeof activityData !== "object") return [];

  return Object.keys(activityData).map((groupKey) => ({
    value: groupKey,
    label: activityData[groupKey]?.label || groupKey,
  }));
};

export const getCategoryOptions = (activityType, scope, groupKey, scope3Module) => {
  if (!activityType || !scope || !groupKey) return [];
  const efData = getEmissionDataByScope(scope, scope3Module, activityType);
  const activityData = efData?.[activityType];
  const groupData = activityData?.[groupKey];
  if (!groupData || typeof groupData !== "object") return [];

  const categories = groupData.categories || groupData;
  if (!categories || typeof categories !== "object") return [];

  return Object.keys(categories).map((categoryKey) => ({
    value: categoryKey,
    label: categoryKey.replace(/_/g, " "),
  }));
};

export const getSourceOptions = (activityType, scope, groupKey, categoryKey, scope3Module) => {
  if (!activityType || !scope || !groupKey || !categoryKey) return [];
  const efData = getEmissionDataByScope(scope, scope3Module, activityType);
  const categoryData = efData?.[activityType]?.[groupKey]?.categories?.[categoryKey] || efData?.[activityType]?.[groupKey]?.[categoryKey];
  if (!categoryData || typeof categoryData !== "object") return [];

  return Object.keys(categoryData).map((sourceKey) => ({
    value: sourceKey,
    label: sourceKey,
  }));
};

export const getUnitOptions = (activityType, scope, groupKey, categoryKey, source, scope3Module) => {
  if (!activityType || !scope || !groupKey || !categoryKey || !source) return [];
  const efData = getEmissionDataByScope(scope, scope3Module, activityType);
  const sourceData = efData?.[activityType]?.[groupKey]?.categories?.[categoryKey]?.[source] || efData?.[activityType]?.[groupKey]?.[categoryKey]?.[source];
  if (!sourceData || typeof sourceData !== "object") return [];

  return Object.keys(sourceData).map((unitKey) => ({
    value: unitKey,
    label: unitKey,
  }));
};

export const normalizeSearchText = (value) => (value || "").toString().toLowerCase().replace(/_/g, " ").trim();

export const normalizeScopeValue = (value) => {
  if (!value) return "";
  const text = value.toString().toLowerCase().replace(/\s+/g, "");
  if (text === "scope1" || text === "1") return "Scope 1";
  if (text === "scope2" || text === "2") return "Scope 2";
  if (text === "scope3" || text === "3") return "Scope 3";
  if (text.includes("scope1")) return "Scope 1";
  if (text.includes("scope2")) return "Scope 2";
  if (text.includes("scope3")) return "Scope 3";
  return value;
};

export const buildSearchIndex = () => {
  const results = [];
  const seenSources = new Set();

  const addEntry = ({ scope, scope3Module, activityType, groupKey, groupLabel, categoryKey, sourceKey, unitKey }) => {
    const categoryLabel = (categoryKey || "").replace(/_/g, " ");
    const display = [activityType, groupLabel || groupKey, categoryLabel, sourceKey].filter(Boolean).join(" › ");

    const searchText = normalizeSearchText([activityType, groupKey, groupLabel, categoryKey, categoryLabel, sourceKey, scope, scope3Module].filter(Boolean).join(" "));

    results.push({
      id: `${scope}-${scope3Module || ""}-${activityType}-${groupKey}-${categoryKey}-${sourceKey}`,
      display,
      searchText,
      scope,
      scope3Module,
      activityType,
      groupKey,
      categoryKey,
      sourceKey,
      unitKey,
    });
  };

  const walkScopeData = (efData, scope, scope3Module) => {
    Object.entries(efData || {}).forEach(([activityType, activityData]) => {
      if (activityType.toLowerCase() === "scope") return;
      if (!activityData || typeof activityData !== "object") return;

      Object.entries(activityData).forEach(([groupKey, groupData]) => {
        if (!groupData || typeof groupData !== "object") return;
        const groupLabel = groupData.label || groupKey;
        const categories = groupData.categories || groupData;

        Object.entries(categories || {}).forEach(([categoryKey, categoryData]) => {
          if (!categoryData || typeof categoryData !== "object") return;

          Object.entries(categoryData).forEach(([sourceKey, sourceData]) => {
            if (!sourceData || typeof sourceData !== "object") return;
            const sourceId = `${scope}-${scope3Module || ""}-${activityType}-${groupKey}-${categoryKey}-${sourceKey}`;
            if (seenSources.has(sourceId)) return;
            seenSources.add(sourceId);
            addEntry({
              scope,
              scope3Module,
              activityType,
              groupKey,
              groupLabel,
              categoryKey,
              sourceKey,
            });
          });
        });
      });
    });
  };

  walkScopeData(scope1EF, "Scope 1", null);
  walkScopeData(scope2EF, "Scope 2", null);
  walkScopeData(scope3EF?.Upstream || {}, "Scope 3", "Upstream");
  walkScopeData(scope3EF?.Downstream || {}, "Scope 3", "Downstream");

  return results;
};

const containsAny = (haystack, values = []) => values.some((value) => haystack.includes(value));

export const detectScopeFromFileName = (fileName = "") => {
  const name = fileName.toLowerCase();
  if (containsAny(name, mapping.scopeKeywords?.scope3 || []) || name.includes("scope 3") || name.includes("scope3") || name.includes("scope_3")) {
    return "Scope 3";
  }
  if (containsAny(name, mapping.scopeKeywords?.scope2 || [])) {
    return "Scope 2";
  }
  if (containsAny(name, mapping.scopeKeywords?.scope1 || [])) {
    return "Scope 1";
  }
  return "Scope 1";
};

// Expand "Scope 1 and 2" into separate scopes for data entry
export const expandReportingScopes = (facilityScopes = []) => {
  const expanded = [];
  facilityScopes.forEach(scope => {
    if (scope === "Scope 1 and 2") {
      expanded.push("Scope 1", "Scope 2");
    } else {
      expanded.push(scope);
    }
  });
  return expanded;
};

export const detectSourceTerm = (fileName = "") => {
  const name = fileName.toLowerCase();
  const sourceKeywords = mapping.sourceKeywords || {};
  const match = Object.entries(sourceKeywords).find(([, keywords]) => containsAny(name, keywords));
  return match ? match[0] : "fuel";
};

export const extractEmissionFactor = (unitData) => {
  if (typeof unitData === "number") {
    return unitData;
  }
  if (typeof unitData === "object" && unitData !== null) {
    return unitData.emissionFactor || unitData.factor || unitData.value || null;
  }
  return null;
};

export const calculateEmissions = (consumption, unit, source, scope, activityType, scope3Module, storedEmissionFactor, carbonContent) => {
  const qty = parseFloat(consumption);
  if (!qty || Number.isNaN(qty) || qty <= 0) return "0.00";

  // Priority 1: Custom Emission Factor
  const storedEF = parseFloat(storedEmissionFactor);
  if (Number.isFinite(storedEF) && storedEF > 0) {
    return ((qty * storedEF) / 1000).toFixed(2);
  }

  // Priority 2: Carbon Content (assuming direct oxidation & conversion to CO2)
  // CO2 Emissions = Mass of fuel * Carbon Fraction * (44/12)
  // Since we assume consumption is some mass or volume, we'd ideally need a density factor for volumes, but standardly if provided as % it applies directly if unit is mass.
  // For simplicity: qty * (carbonContent/100) * (44/12)
  const cc = parseFloat(carbonContent);
  if (Number.isFinite(cc) && cc > 0) {
    return ((qty * (cc / 100) * (44 / 12)) / 1000).toFixed(2);
  }

  if (!source || !unit || !scope) return "0.00";

  try {
    const efData = getEmissionDataByScope(scope, scope3Module, activityType);
    if (!efData) {
      return "0.00";
    }

    const normalizedFuel = source.trim();
    const normalizedUnit = unit.trim();
    const activityKeys = Object.keys(efData).filter((key) => key !== "scope" && key.toLowerCase() !== "scope");

    for (const activityKey of activityKeys) {
      const activityData = efData[activityKey];
      if (typeof activityData !== "object" || activityData === null) continue;

      for (const groupKey of Object.keys(activityData)) {
        const groupData = activityData[groupKey];
        if (typeof groupData !== "object" || groupData === null) continue;

        let categories = groupData;
        if (groupData.categories && typeof groupData.categories === "object") {
          categories = groupData.categories;
        }

        if (typeof categories !== "object" || categories === null) continue;

        for (const categoryKey of Object.keys(categories)) {
          const categoryData = categories[categoryKey];
          if (typeof categoryData !== "object" || categoryData === null) continue;

          for (const fuelKey of Object.keys(categoryData)) {
            const fuelKeyLower = fuelKey.toLowerCase();
            const normalizedFuelLower = normalizedFuel.toLowerCase();
            const isExactMatch = fuelKeyLower === normalizedFuelLower;
            const isPartialMatch = fuelKeyLower.includes(normalizedFuelLower) || normalizedFuelLower.includes(fuelKeyLower);

            if (isExactMatch || isPartialMatch) {
              const fuelData = categoryData[fuelKey];
              if (typeof fuelData !== "object" || fuelData === null) continue;

              if (fuelData[normalizedUnit]) {
                const factor = extractEmissionFactor(fuelData[normalizedUnit]);
                if (factor !== null && factor > 0) {
                  return ((qty * factor) / 1000).toFixed(2);
                }
              }

              for (const unitKey of Object.keys(fuelData)) {
                const unitKeyLower = unitKey.toLowerCase();
                const normalizedUnitLower = normalizedUnit.toLowerCase();
                if (unitKeyLower === normalizedUnitLower) {
                  const factor = extractEmissionFactor(fuelData[unitKey]);
                  if (factor !== null && factor > 0) {
                    return ((qty * factor) / 1000).toFixed(2);
                  }
                }
              }

              if (isExactMatch) {
                for (const unitKey of Object.keys(fuelData)) {
                  const unitKeyLower = unitKey.toLowerCase();
                  const normalizedUnitLower = normalizedUnit.toLowerCase();
                  if (unitKeyLower.includes(normalizedUnitLower) || normalizedUnitLower.includes(unitKeyLower)) {
                    const factor = extractEmissionFactor(fuelData[unitKey]);
                    if (factor !== null && factor > 0) {
                      return ((qty * factor) / 1000).toFixed(2);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return "0.00";
  } catch (error) {
    console.error("Error calculating emissions:", error);
    return "0.00";
  }
};

export const isBulkData = (scopeData) => {
  if (!scopeData) return false;
  if (scopeData.importedFrom === "bulk" || scopeData.importedAt) return true;
  return scopeData.sections?.some((section) => (section.activities || []).some((activity) => (activity.sources || []).some((source) => source?.supportingDocument?.uploadKey?.includes("_bulk"))));
};

const BULK_SOURCE_RESERVED_KEYS = new Set([
  "id",
  "module",
  "scope",
  "scopeKey",
  "status",
  "rejectionReason",
  "submissionId",
  "sectionIndex",
  "activityIndex",
  "sourceIndex",
  "isBulk",
  "bulkKey",
  "importBatchId",
  "source",
  "consumption",
  "unit",
  "measurementMethod",
  "date",
  "supportingDocument",
  "gcv",
  "gcvUnit",
  "assetEfficiency",
  "assetId",
  "emissionFactor",
  "carbonContent",
  "operatingHours",
  "capacityUtilization",
  "refillAmount",
]);

export const buildBulkScopeData = (entriesForScope, scope, options = {}) => {
  const { selectedPeriod = "", scope3Module = null, reportingPeriod } = options;
  const grouped = new Map();
  entriesForScope.forEach((entry) => {
    const key = `${entry.activityType}||${entry.activityGroup}||${entry.activityCategory}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        activityType: entry.activityType,
        activityGroup: entry.activityGroup,
        activityCategory: entry.activityCategory,
        sources: [],
      });
    }

    const customSourceFields = Object.entries(entry || {}).reduce((acc, [key, value]) => {
      if (BULK_SOURCE_RESERVED_KEYS.has(key)) return acc;
      if (value === undefined || value === null || value === "") return acc;
      acc[key] = value;
      return acc;
    }, {});

    grouped.get(key).sources.push({
      source: entry.source,
      consumption: entry.consumption,
      unit: entry.unit,
      measurementMethod: entry.measurementMethod,
      date: entry.date,
      ...(entry.gcv !== undefined && entry.gcv !== "" ? { gcv: entry.gcv } : {}),
      ...(entry.gcvUnit ? { gcvUnit: entry.gcvUnit } : {}),
      ...(entry.assetEfficiency !== undefined && entry.assetEfficiency !== "" ? { assetEfficiency: entry.assetEfficiency } : {}),
      ...(entry.assetId ? { assetId: entry.assetId } : {}),
      ...(entry.emissionFactor !== undefined && entry.emissionFactor !== "" ? { emissionFactor: entry.emissionFactor } : {}),
      ...(entry.carbonContent !== undefined && entry.carbonContent !== "" ? { carbonContent: entry.carbonContent } : {}),
      ...(entry.operatingHours !== undefined && entry.operatingHours !== "" ? { operatingHours: entry.operatingHours } : {}),
      ...(entry.capacityUtilization !== undefined && entry.capacityUtilization !== "" ? { capacityUtilization: entry.capacityUtilization } : {}),
      ...(entry.refillAmount !== undefined && entry.refillAmount !== "" ? { refillAmount: entry.refillAmount } : {}),
      supportingDocument:
        entry.supportingDocument instanceof File && options.uploadKey
          ? {
            uploadKey: options.uploadKey,
            originalName: entry.supportingDocument.name,
          }
          : entry.supportingDocument,
      ...customSourceFields,
    });
  });

  return {
    reportingYear: new Date().getFullYear().toString(),
    reportingPeriod: reportingPeriod ?? selectedPeriod ?? "",
    importedFrom: "bulk",
    importedAt: new Date().toISOString(),
    scope3Module: scope === "Scope 3" ? scope3Module : null,
    sections: [
      {
        name: entriesForScope[0]?.activityType || "Imported Section",
        scope3Module: scope === "Scope 3" ? scope3Module : null,
        activities: Array.from(grouped.values()),
      },
    ],
  };
};

export const buildBulkDraftPayload = (entriesForScope, scope, submissionId, options = {}) => {
  const supportingFile = entriesForScope.find((entry) => entry.supportingDocument instanceof File)?.supportingDocument || null;
  const uploadKey = supportingFile ? `supportingDocument_${scope.toLowerCase().replace(" ", "")}_bulk` : null;
  const scopeData = buildBulkScopeData(entriesForScope, scope, { ...options, uploadKey });
  const payload = new FormData();
  if (submissionId) {
    payload.append("submissionId", submissionId);
  }
  payload.append("scope", scope);

  if (scope === "Scope 1") {
    payload.append("scope1Data", JSON.stringify(scopeData));
  } else if (scope === "Scope 2") {
    payload.append("scope2Data", JSON.stringify(scopeData));
  } else if (scope === "Scope 3") {
    payload.append("scope3Data", JSON.stringify(scopeData));
  }

  if (supportingFile && uploadKey) {
    payload.append(uploadKey, supportingFile);
  }

  return payload;
};
