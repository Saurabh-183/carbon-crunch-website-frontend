import { getScope3ModuleByActivityType } from "../../../organizationAdmin/reports/utils/emissionFactorUtils";
import { MODULES } from "../../../energyManager/data-entry/moduleConfig";

/**
 * Checks if scope data is from bulk import
 * @param {Object} scopeData - The scope data object
 * @returns {boolean} - True if bulk data
 */
const isBulkData = (scopeData) => {
  if (!scopeData) return false;
  if (scopeData.importedFrom === "bulk" || scopeData.importedAt) return true;
  if (scopeData.importBatchId) return true;
  return scopeData.sections?.some((section) => (section.activities || []).some((activity) => (activity.sources || []).some((source) => source?.supportingDocument?.uploadKey?.includes("_bulk"))));
};

/**
 * Processes approved data into scope rows with calculated emissions
 * @param {Array} approvedData - Array of approved submission data
 * @param {Function} calculateEmissions - Function to calculate emissions
 * @returns {Object} - Object with scope rows organized by scope
 */
export const processScopeRows = (approvedData, calculateEmissions) => {
  const rowsByScope = {
    "Scope 1": [],
    "Scope 2": [],
    "Scope 3": [],
  };

  approvedData.forEach((item) => {
    const submissionId = item.submissionId;
    const payloads = [
      { scope: "Scope 1", key: "scope1", data: item.scope1Data },
      { scope: "Scope 2", key: "scope2", data: item.scope2Data },
      { scope: "Scope 3", key: "scope3", data: item.scope3Data },
    ];

    payloads.forEach(({ scope, key, data }) => {
      if (!data?.sections) return;

      if (isBulkData(data)) {
        const bulkEntries = [];
        data.sections.forEach((section, sectionIndex) => {
          (section.activities || []).forEach((activity, activityIndex) => {
            (activity.sources || []).forEach((source, sourceIndex) => {
              const resolvedScope3Module = data.scope3Module || section.scope3Module || activity.scope3Module || getScope3ModuleByActivityType(activity.activityType || activity.activityCategory);
              const entryDate = source.date ? new Date(source.date).toISOString().split("T")[0] : new Date(item.approvedAt || item.createdAt || Date.now()).toISOString().split("T")[0];
              const emissions = calculateEmissions(source.consumption, source.unit, source.source, scope, activity.activityType, resolvedScope3Module, source.emissionFactor);
              bulkEntries.push({
                id: `${item._id || item.id}_${key}_${sectionIndex}_${activityIndex}_${sourceIndex}`,
                date: entryDate,
                activityType: activity.activityType || activity.activityCategory || "",
                activityGroup: activity.activityGroup || "",
                activityCategory: activity.activityCategory || "",
                source: source.source || "",
                unit: source.unit || "",
                consumption: source.consumption || "",
                measurementMethod: source.measurementMethod || "",
                emissions,
                supportingDocument: source.supportingDocument,
                submissionId,
                scopeKey: key,
                scope3Module: scope === "Scope 3" ? resolvedScope3Module : null,
                sectionIndex,
                activityIndex,
                sourceIndex,
              });
            });
          });
        });

        if (bulkEntries.length) {
          const dates = bulkEntries.map((entry) => new Date(entry.date)).filter((d) => !Number.isNaN(d.getTime()));
          const minDate = dates.length ? new Date(Math.min(...dates.map((d) => d.getTime()))) : null;
          const maxDate = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null;
          const totalEmissions = bulkEntries.reduce((sum, entry) => sum + Number(entry.emissions || 0), 0);
          const totalConsumption = bulkEntries.reduce((sum, entry) => sum + Number(entry.consumption || 0), 0);
          const unitSet = new Set(bulkEntries.map((entry) => entry.unit).filter(Boolean));
          const unitSummary = unitSet.size === 1 ? Array.from(unitSet)[0] : unitSet.size > 1 ? "Mixed" : "-";

          rowsByScope[scope].push({
            id: `${item._id || item.id}_${key}_bulk`,
            approvedDataId: item._id || item.id,
            dateRange: {
              start: minDate,
              end: maxDate,
            },
            scope,
            entries: bulkEntries,
            emissions: totalEmissions.toFixed(2),
            totalEmissions: totalEmissions.toFixed(2),
            totalConsumption: totalConsumption.toFixed(2),
            unitSummary,
            submissionId,
            isBulk: true,
          });
        }
        return;
      }

      data.sections.forEach((section, sectionIndex) => {
        (section.activities || []).forEach((activity, activityIndex) => {
          (activity.sources || []).forEach((source, sourceIndex) => {
            const resolvedScope3Module = data.scope3Module || section.scope3Module || activity.scope3Module || getScope3ModuleByActivityType(activity.activityType || activity.activityCategory);
            rowsByScope[scope].push({
              id: `${item._id || item.id}_${key}_${sectionIndex}_${activityIndex}_${sourceIndex}`,
              approvedDataId: item._id || item.id,
              date: source.date ? new Date(source.date).toISOString().split("T")[0] : new Date(item.approvedAt || item.createdAt || Date.now()).toISOString().split("T")[0],
              scope,
              activityType: activity.activityType || activity.activityCategory || "",
              activityGroup: activity.activityGroup || "",
              activityCategory: activity.activityCategory || "",
              source: source.source || "",
              unit: source.unit || "",
              consumption: source.consumption || "",
              measurementMethod: source.measurementMethod || "",
              emissions: calculateEmissions(source.consumption, source.unit, source.source, scope, activity.activityType, resolvedScope3Module, source.emissionFactor),
              supportingDocument: source.supportingDocument,
              submissionId,
              scopeKey: key,
              scope3Module: scope === "Scope 3" ? resolvedScope3Module : null,
              sectionIndex,
              activityIndex,
              sourceIndex,
            });
          });
        });
      });
    });
  });

  return rowsByScope;
};

const findModuleForSection = (sectionName = "", scopeLabel = "") => {
  const matched = MODULES.find((mod) => mod.section === sectionName);
  if (matched) return matched;

  const lower = sectionName.toLowerCase();
  if (lower.includes("stationary") || lower.includes("combustion")) {
    return MODULES.find((mod) => mod.key === "stationary_combustion");
  }
  if (lower.includes("electric") || lower.includes("power")) {
    return MODULES.find((mod) => mod.key === "electrical_power");
  }
  if (lower.includes("production")) {
    return MODULES.find((mod) => mod.key === "production_activity");
  }
  if (lower.includes("logistics") || lower.includes("transport")) {
    return MODULES.find((mod) => mod.key === "logistics_transportation");
  }
  if (lower.includes("value chain") || lower.includes("scope 3")) {
    return MODULES.find((mod) => mod.key === "scope3_value_chain");
  }
  if (lower.includes("process") || lower.includes("fugitive") || lower.includes("fugutive")) {
    return MODULES.find((mod) => mod.key === "process_fugitive");
  }

  if (scopeLabel === "Scope 2") {
    return MODULES.find((mod) => mod.key === "electrical_power");
  }
  if (scopeLabel === "Scope 3") {
    return MODULES.find((mod) => mod.key === "scope3_value_chain");
  }
  return MODULES.find((mod) => mod.key === "stationary_combustion");
};

export const processModuleRows = (approvedData, calculateEmissions) => {
  const rowsByModule = {};
  MODULES.forEach((mod) => {
    rowsByModule[mod.key] = [];
  });

  approvedData.forEach((item) => {
    const submissionId = item.submissionId;
    const payloads = [
      { scope: "Scope 1", key: "scope1", data: item.scope1Data },
      { scope: "Scope 2", key: "scope2", data: item.scope2Data },
      { scope: "Scope 3", key: "scope3", data: item.scope3Data },
    ];

    payloads.forEach(({ scope, key, data }) => {
      if (!data?.sections) return;
      const bulkFlag = isBulkData(data);

      data.sections.forEach((section, sectionIndex) => {
        const module = findModuleForSection(section?.name || "", scope);
        const moduleKey = module?.key || "stationary_combustion";
        const moduleLabel = module?.label || "Stationary Combustion";

        if (bulkFlag) {
          const bulkEntries = [];
          (section.activities || []).forEach((activity, activityIndex) => {
            (activity.sources || []).forEach((source, sourceIndex) => {
              const resolvedScope3Module = data.scope3Module || section.scope3Module || activity.scope3Module || getScope3ModuleByActivityType(activity.activityType || activity.activityCategory);
              const entryDate = source.date ? new Date(source.date).toISOString().split("T")[0] : new Date(item.approvedAt || item.createdAt || Date.now()).toISOString().split("T")[0];
              const emissions = calculateEmissions(source.consumption, source.unit, source.source, scope, activity.activityType, resolvedScope3Module, source.emissionFactor);
              bulkEntries.push({
                id: `${item._id || item.id}_${key}_${sectionIndex}_${activityIndex}_${sourceIndex}`,
                date: entryDate,
                module: moduleKey,
                moduleLabel,
                scope,
                activityType: activity.activityType || activity.activityCategory || "",
                activityGroup: activity.activityGroup || "",
                activityCategory: activity.activityCategory || "",
                source: source.source || "",
                unit: source.unit || "",
                consumption: source.consumption || "",
                measurementMethod: source.measurementMethod || "",
                emissions,
                supportingDocument: source.supportingDocument,
                submissionId,
                scopeKey: key,
                scope3Module: scope === "Scope 3" ? resolvedScope3Module : null,
                sectionIndex,
                activityIndex,
                sourceIndex,
              });
            });
          });

          if (bulkEntries.length) {
            const dates = bulkEntries.map((entry) => new Date(entry.date)).filter((d) => !Number.isNaN(d.getTime()));
            const minDate = dates.length ? new Date(Math.min(...dates.map((d) => d.getTime()))) : null;
            const maxDate = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null;
            const totalEmissions = bulkEntries.reduce((sum, entry) => sum + Number(entry.emissions || 0), 0);
            const totalConsumption = bulkEntries.reduce((sum, entry) => sum + Number(entry.consumption || 0), 0);
            const unitSet = new Set(bulkEntries.map((entry) => entry.unit).filter(Boolean));
            const unitSummary = unitSet.size === 1 ? Array.from(unitSet)[0] : unitSet.size > 1 ? "Mixed" : "-";

            rowsByModule[moduleKey].push({
              id: `${item._id || item.id}_${key}_${moduleKey}_bulk`,
              approvedDataId: item._id || item.id,
              dateRange: {
                start: minDate,
                end: maxDate,
              },
              module: moduleKey,
              moduleLabel,
              scope,
              entries: bulkEntries,
              emissions: totalEmissions.toFixed(2),
              totalEmissions: totalEmissions.toFixed(2),
              totalConsumption: totalConsumption.toFixed(2),
              unitSummary,
              submissionId,
              isBulk: true,
            });
          }
          return;
        }

        (section.activities || []).forEach((activity, activityIndex) => {
          (activity.sources || []).forEach((source, sourceIndex) => {
            const resolvedScope3Module = data.scope3Module || section.scope3Module || activity.scope3Module || getScope3ModuleByActivityType(activity.activityType || activity.activityCategory);
            rowsByModule[moduleKey].push({
              id: `${item._id || item.id}_${key}_${sectionIndex}_${activityIndex}_${sourceIndex}`,
              approvedDataId: item._id || item.id,
              date: source.date ? new Date(source.date).toISOString().split("T")[0] : new Date(item.approvedAt || item.createdAt || Date.now()).toISOString().split("T")[0],
              module: moduleKey,
              moduleLabel,
              scope,
              activityType: activity.activityType || activity.activityCategory || "",
              activityGroup: activity.activityGroup || "",
              activityCategory: activity.activityCategory || "",
              source: source.source || "",
              unit: source.unit || "",
              consumption: source.consumption || "",
              measurementMethod: source.measurementMethod || "",
              emissions: calculateEmissions(source.consumption, source.unit, source.source, scope, activity.activityType, resolvedScope3Module, source.emissionFactor),
              supportingDocument: source.supportingDocument,
              submissionId,
              scopeKey: key,
              scope3Module: scope === "Scope 3" ? resolvedScope3Module : null,
              sectionIndex,
              activityIndex,
              sourceIndex,
            });
          });
        });
      });
    });
  });

  return rowsByModule;
};

export const calculateModuleTotals = (moduleRows) => {
  const totals = {};
  Object.keys(moduleRows).forEach((moduleKey) => {
    totals[moduleKey] = moduleRows[moduleKey].reduce(
      (sum, row) => sum + (parseFloat(row.emissions) || 0),
      0
    );
  });
  return totals;
};

/**
 * Calculates total emissions by scope
 * @param {Object} scopeRows - Scope rows organized by scope
 * @returns {Object} - Object with totals for each scope and overall total
 */
export const calculateScopeTotals = (scopeRows) => {
  const totals = {
    "Scope 1": 0,
    "Scope 2": 0,
    "Scope 3": 0,
    Total: 0,
  };

  Object.keys(scopeRows).forEach((scope) => {
    totals[scope] = scopeRows[scope].reduce((sum, row) => sum + (parseFloat(row.emissions) || 0), 0);
  });

  totals.Total = totals["Scope 1"] + totals["Scope 2"] + totals["Scope 3"];

  return totals;
};
