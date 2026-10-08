/**
 * Emission Factor Utilities for Organization Reports
 * Now uses centralized emission service - simplified from 170+ lines
 */

// Re-export from centralized service
export {
    getEmissionFactor,
    calculateEmissions,
    calculateTotalEmissions,
    calculateEmissionsByScope,
    getTopEmissionSource,
} from '../../../../utils/emission-calculator';

// Legacy imports for synchronous access (if needed)
import scope1EF from '../../../../scope1EF.json';
import scope2EF from '../../../../scope2EF.json';
import scope3EF from '../../../../scope3EF.json';

/**
 * Get Scope 3 module by activity type
 * @param {string} activityType - Activity type
 * @returns {string|null} - Module name or null
 */
export const getScope3ModuleByActivityType = (activityType) => {
    if (scope3EF?.Upstream?.[activityType]) return 'Upstream';
    if (scope3EF?.Downstream?.[activityType]) return 'Downstream';
    return null;
};

/**
 * Get emission data by scope
 * @param {string} scope - Emission scope
 * @param {string} scope3Module - Scope 3 module (optional)
 * @param {string} activityType - Activity type (optional)
 * @returns {Object} - Emission data
 */
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

/**
 * Extract emission factor value from entry
 * @param {*} entry - Emission factor entry
 * @returns {number|null} - Emission factor value
 */
export const extractEmissionFactor = (entry) => {
    if (typeof entry === 'number') return entry;
    if (entry && typeof entry === 'object') {
        const value = entry.value ?? entry.factor ?? entry.emissionFactor ?? entry.default;
        return typeof value === 'number' ? value : null;
    }
    return null;
};
