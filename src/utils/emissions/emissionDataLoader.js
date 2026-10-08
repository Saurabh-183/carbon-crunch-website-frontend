/**
 * Lazy-loaded emission factor data loader
 * Prevents loading large JSON files multiple times
 * Total size: 241KB (scope1: 57KB, scope2: 6KB, scope3: 178KB)
 */

// Cached data - loaded only once per session
let scope1Data = null;
let scope2Data = null;
let scope3Data = null;

/**
 * Get Scope 1 emission factors (lazy loaded)
 * @returns {Promise<Object>} Scope 1 emission factor data
 */
export const getScope1Data = async () => {
    if (!scope1Data) {
        const module = await import('../../scope1EF.json');
        scope1Data = module.default || module;
    }
    return scope1Data;
};

/**
 * Get Scope 2 emission factors (lazy loaded)
 * @returns {Promise<Object>} Scope 2 emission factor data
 */
export const getScope2Data = async () => {
    if (!scope2Data) {
        const module = await import('../../scope2EF.json');
        scope2Data = module.default || module;
    }
    return scope2Data;
};

/**
 * Get Scope 3 emission factors (lazy loaded)
 * @returns {Promise<Object>} Scope 3 emission factor data
 */
export const getScope3Data = async () => {
    if (!scope3Data) {
        const module = await import('../../scope3EF.json');
        scope3Data = module.default || module;
    }
    return scope3Data;
};

/**
 * Get emission factor data by scope name
 * @param {string} scope - Scope name ('Scope 1', 'Scope 2', or 'Scope 3')
 * @returns {Promise<Object>} Emission factor data for the specified scope
 */
export const getScopeData = async (scope) => {
    switch (scope) {
        case 'Scope 1':
            return await getScope1Data();
        case 'Scope 2':
            return await getScope2Data();
        case 'Scope 3':
            return await getScope3Data();
        default:
            return {};
    }
};

/**
 * Preload all scope data (optional, for performance)
 * Call this on app initialization if you want to prefetch
 */
export const preloadAllScopeData = async () => {
    await Promise.all([
        getScope1Data(),
        getScope2Data(),
        getScope3Data(),
    ]);
};

/**
 * Clear cached data (useful for testing or memory management)
 */
export const clearScopeDataCache = () => {
    scope1Data = null;
    scope2Data = null;
    scope3Data = null;
};
