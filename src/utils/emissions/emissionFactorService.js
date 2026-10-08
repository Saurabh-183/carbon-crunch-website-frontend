import { getScopeData } from './emissionDataLoader';

/**
 * Centralized Emission Factor Service
 * Single source of truth for emission factor calculations
 * Replaces duplicated logic across 12+ files
 */

/**
 * Extract emission factor value from various data structures
 * Handles different JSON formats in scope data
 * @param {*} entry - The emission factor entry
 * @returns {number|null} - Emission factor value or null
 */
const extractEmissionFactorValue = (entry) => {
    if (typeof entry === 'number') {
        return entry;
    }

    if (entry && typeof entry === 'object') {
        // Try different property names found in the data
        const value = entry.value ??
            entry.factor ??
            entry.emissionFactor ??
            entry.default ??
            entry.ef;

        return typeof value === 'number' ? value : null;
    }

    return null;
};

/**
 * Get emission factor from scope data
 * @param {string} scope - Emission scope ('Scope 1', 'Scope 2', 'Scope 3')
 * @param {string} type - Activity type
 * @param {string} group - Activity group
 * @param {string} category - Activity category
 * @param {string} source - Emission source
 * @param {string} unit - Unit of measurement
 * @returns {Promise<number|null>} - Emission factor or null if not found
 */
export const getEmissionFactor = async (scope, type, group, category, source, unit) => {
    // Validate inputs
    if (!scope || !type || !group || !source || !unit) {
        return null;
    }

    try {
        const scopeData = await getScopeData(scope);

        if (!scopeData || Object.keys(scopeData).length === 0) {
            return null;
        }

        // Path 1: with categories key (Scope 1 / Scope 3 structure)
        if (category) {
            const entry = scopeData?.[type]?.[group]?.categories?.[category]?.[source]?.[unit];
            const result = extractEmissionFactorValue(entry);
            if (result !== null) return result;
        }

        // Path 2: without categories key (Scope 2 structure: type → group → source → unit)
        const directEntry = scopeData?.[type]?.[group]?.[source]?.[unit];
        return extractEmissionFactorValue(directEntry);
    } catch (error) {
        console.error('Error getting emission factor:', error);
        return null;
    }
};

/**
 * Get emission factor synchronously (for already-loaded data)
 * Use this only when you're sure the data is preloaded
 * @param {Object} scopeData - Pre-loaded scope data
 * @param {string} type - Activity type
 * @param {string} group - Activity group
 * @param {string} category - Activity category
 * @param {string} source - Emission source
 * @param {string} unit - Unit of measurement
 * @returns {number|null} - Emission factor or null
 */
export const getEmissionFactorSync = (scopeData, type, group, category, source, unit) => {
    if (!scopeData || !type || !group || !source || !unit) {
        return null;
    }

    // Path 1: with categories key (Scope 1 / Scope 3 structure)
    if (category) {
        const entry = scopeData?.[type]?.[group]?.categories?.[category]?.[source]?.[unit];
        const result = extractEmissionFactorValue(entry);
        if (result !== null) return result;
    }

    // Path 2: without categories key (Scope 2 structure: type → group → source → unit)
    const directEntry = scopeData?.[type]?.[group]?.[source]?.[unit];
    return extractEmissionFactorValue(directEntry);
};

/**
 * Calculate emissions from consumption and emission factor
 * @param {number} consumption - Consumption value
 * @param {number|null} emissionFactor - Emission factor
 * @returns {number|null} - Calculated emissions or null
 */
export const calculateEmissions = (consumption, emissionFactor) => {
    const cons = parseFloat(consumption);
    const ef = parseFloat(emissionFactor);

    if (Number.isFinite(cons) && Number.isFinite(ef)) {
        return cons * ef;
    }

    return null;
};

/**
 * Calculate total emissions from an array of emission values
 * @param {Array<number|null>} emissions - Array of emission values
 * @returns {number} - Total emissions (ignores null values)
 */
export const calculateTotalEmissions = (emissions) => {
    return emissions.reduce((sum, emission) => {
        return Number.isFinite(emission) ? sum + emission : sum;
    }, 0);
};

/**
 * Calculate emissions by scope
 * @param {Array} emissionRows - Array of emission row objects with scope and emissions
 * @returns {Object} - Breakdown by scope {scope1, scope2, scope3}
 */
export const calculateEmissionsByScope = (emissionRows) => {
    return emissionRows.reduce(
        (acc, row) => {
            if (Number.isFinite(row.emissions)) {
                if (row.scope === 'Scope 1') acc.scope1 += row.emissions;
                if (row.scope === 'Scope 2') acc.scope2 += row.emissions;
                if (row.scope === 'Scope 3') acc.scope3 += row.emissions;
            }
            return acc;
        },
        { scope1: 0, scope2: 0, scope3: 0 }
    );
};

/**
 * Get top emission source from emission rows
 * @param {Array} emissionRows - Array of emission row objects
 * @returns {string} - Top emission source name
 */
export const getTopEmissionSource = (emissionRows) => {
    const ranked = emissionRows
        .filter((row) => Number.isFinite(row.emissions))
        .sort((a, b) => b.emissions - a.emissions);

    return ranked[0]?.source || '-';
};

/**
 * Format emission value for display
 * @param {number|null} value - Emission value
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - Formatted string
 */
export const formatEmissionValue = (value, decimals = 2) => {
    if (!Number.isFinite(value)) {
        return '-';
    }
    return value.toFixed(decimals);
};

/**
 * Batch get emission factors for multiple sources
 * More efficient than calling getEmissionFactor multiple times
 * @param {Array} sources - Array of source objects {scope, type, group, category, source, unit}
 * @returns {Promise<Array>} - Array of emission factors
 */
export const batchGetEmissionFactors = async (sources) => {
    // Group by scope to minimize data loading
    const byScope = sources.reduce((acc, source) => {
        if (!acc[source.scope]) acc[source.scope] = [];
        acc[source.scope].push(source);
        return acc;
    }, {});

    const results = [];

    for (const [scope, scopeSources] of Object.entries(byScope)) {
        const scopeData = await getScopeData(scope);

        for (const source of scopeSources) {
            const ef = getEmissionFactorSync(
                scopeData,
                source.type,
                source.group,
                source.category,
                source.source,
                source.unit
            );
            results.push(ef);
        }
    }

    return results;
};
