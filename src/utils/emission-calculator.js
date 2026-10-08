/**
 * Enhanced Emission Calculator with Centralized Service
 * Preserves complex fuzzy matching logic from original
 * Adds new centralized emission service functions
 */

// ===== NEW CENTRALIZED SERVICE =====
export {
  getEmissionFactor,
  getEmissionFactorSync,
  calculateEmissions as calculateEmissionsSimple,
  calculateTotalEmissions,
  calculateEmissionsByScope,
  getTopEmissionSource,
  formatEmissionValue,
  batchGetEmissionFactors,
} from './emissions/emissionFactorService';

export {
  getScope1Data,
  getScope2Data,
  getScope3Data,
  getScopeData,
  preloadAllScopeData,
  clearScopeDataCache,
} from './emissions/emissionDataLoader';

// ===== LEGACY IMPLEMENTATION =====
// Keep for backward compatibility with existing code
// that uses the complex fuzzy matching logic

import scope1EF from '../scope1EF.json';
import scope2EF from '../scope2EF.json';
import scope3EF from '../scope3EF.json';

export const getScope3ModuleByActivityType = (activityType) => {
  if (scope3EF?.Upstream?.[activityType]) return 'Upstream';
  if (scope3EF?.Downstream?.[activityType]) return 'Downstream';
  return null;
};

export const getEmissionDataByScope = (scope, scope3Module, activityType) => {
  if (scope === 'Scope 1') return scope1EF;
  if (scope === 'Scope 2') return scope2EF;
  if (scope === 'Scope 3') {
    const resolvedModule =
      scope3Module || getScope3ModuleByActivityType(activityType) || 'Upstream';
    return scope3EF?.[resolvedModule] || {};
  }
  return null;
};

const extractEmissionFactor = (unitData) => {
  if (typeof unitData === 'number') {
    return unitData;
  }
  if (typeof unitData === 'object' && unitData !== null) {
    return (
      unitData.emissionFactor || unitData.factor || unitData.value || null
    );
  }
  return null;
};

/**
 * Calculate emissions with fuzzy matching (legacy)
 * This uses complex fuzzy matching logic for source and unit names
 * Kept for backward compatibility
 * @deprecated Consider using getEmissionFactor + calculateEmissionsSimple instead
 */
export const calculateEmissions = (
  consumption,
  unit,
  source,
  scope,
  activityType,
  scope3Module,
  storedEmissionFactor
) => {
  const qty = parseFloat(consumption);
  if (!qty || isNaN(qty) || qty <= 0) return '0.00';

  // If we have a DB-stored emission factor, use it directly (no source name needed)
  const storedEF = parseFloat(storedEmissionFactor);
  if (Number.isFinite(storedEF) && storedEF > 0) {
    return ((qty * storedEF) / 1000).toFixed(2);
  }

  if (!source || !unit || !scope)
    return '0.00';

  try {
    const efData = getEmissionDataByScope(scope, scope3Module, activityType);
    if (!efData) return '0.00';

    const normalizedFuel = source.trim();
    const normalizedUnit = unit.trim();
    const activityKeys = Object.keys(efData).filter(
      (key) => key !== 'scope' && key.toLowerCase() !== 'scope'
    );

    // Direct lookup for flat structures (Scope 2: type → group → source → unit)
    for (const activityKey of activityKeys) {
      const activityData = efData[activityKey];
      if (typeof activityData !== 'object' || activityData === null) continue;

      for (const groupKey of Object.keys(activityData)) {
        const groupData = activityData[groupKey];
        if (typeof groupData !== 'object' || groupData === null) continue;

        // Check if source exists directly under group (no categories level)
        const directSourceData = groupData[normalizedFuel];
        if (typeof directSourceData === 'object' && directSourceData !== null) {
          if (directSourceData[normalizedUnit]) {
            const factor = extractEmissionFactor(directSourceData[normalizedUnit]);
            if (factor !== null && factor > 0) {
              return ((qty * factor) / 1000).toFixed(2);
            }
          }
          // Case-insensitive unit match
          for (const unitKey of Object.keys(directSourceData)) {
            if (unitKey.toLowerCase() === normalizedUnit.toLowerCase()) {
              const factor = extractEmissionFactor(directSourceData[unitKey]);
              if (factor !== null && factor > 0) {
                return ((qty * factor) / 1000).toFixed(2);
              }
            }
          }
        }

        // Fuzzy source match at group level (no categories)
        for (const sourceKey of Object.keys(groupData)) {
          if (sourceKey === 'label' || sourceKey === 'categories') continue;
          const sourceData = groupData[sourceKey];
          if (typeof sourceData !== 'object' || sourceData === null) continue;
          const sourceKeyLower = sourceKey.toLowerCase();
          const normalizedFuelLower = normalizedFuel.toLowerCase();
          if (sourceKeyLower === normalizedFuelLower ||
              sourceKeyLower.includes(normalizedFuelLower) ||
              normalizedFuelLower.includes(sourceKeyLower)) {
            if (sourceData[normalizedUnit]) {
              const factor = extractEmissionFactor(sourceData[normalizedUnit]);
              if (factor !== null && factor > 0) {
                return ((qty * factor) / 1000).toFixed(2);
              }
            }
            for (const unitKey of Object.keys(sourceData)) {
              if (unitKey.toLowerCase() === normalizedUnit.toLowerCase()) {
                const factor = extractEmissionFactor(sourceData[unitKey]);
                if (factor !== null && factor > 0) {
                  return ((qty * factor) / 1000).toFixed(2);
                }
              }
            }
          }
        }
      }
    }

    // Nested lookup for structures with categories (Scope 1/3: type → group → categories → category → source → unit)
    for (const activityKey of activityKeys) {
      const activityData = efData[activityKey];
      if (typeof activityData !== 'object' || activityData === null) continue;

      for (const groupKey of Object.keys(activityData)) {
        const groupData = activityData[groupKey];
        if (typeof groupData !== 'object' || groupData === null) continue;

        const categories = groupData.categories;
        if (typeof categories !== 'object' || categories === null) continue;

        for (const categoryKey of Object.keys(categories)) {
          const categoryData = categories[categoryKey];
          if (typeof categoryData !== 'object' || categoryData === null)
            continue;

          for (const fuelKey of Object.keys(categoryData)) {
            const fuelKeyLower = fuelKey.toLowerCase();
            const normalizedFuelLower = normalizedFuel.toLowerCase();
            const isExactMatch = fuelKeyLower === normalizedFuelLower;
            const isPartialMatch =
              fuelKeyLower.includes(normalizedFuelLower) ||
              normalizedFuelLower.includes(fuelKeyLower);

            if (isExactMatch || isPartialMatch) {
              const fuelData = categoryData[fuelKey];
              if (typeof fuelData !== 'object' || fuelData === null) continue;

              if (fuelData[normalizedUnit]) {
                const factor = extractEmissionFactor(fuelData[normalizedUnit]);
                if (factor !== null && factor > 0) {
                  return ((qty * factor) / 1000).toFixed(2);
                }
              }

              for (const unitKey of Object.keys(fuelData)) {
                if (unitKey.toLowerCase() === normalizedUnit.toLowerCase()) {
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
                  if (
                    unitKeyLower.includes(normalizedUnitLower) ||
                    normalizedUnitLower.includes(unitKeyLower)
                  ) {
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
  } catch (error) {
    console.error('Error calculating emissions:', error, {
      consumption,
      unit,
      source,
      scope,
      activityType,
    });
  }
  return '0.00';
};