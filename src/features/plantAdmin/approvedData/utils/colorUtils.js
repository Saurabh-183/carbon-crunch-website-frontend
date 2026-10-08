/**
 * Returns CSS classes for unit badges based on unit type
 * @param {string} unit - The measurement unit
 * @returns {string} - Tailwind CSS classes for styling
 */
export const getUnitColorClass = (unit) => {
    if (!unit) return "bg-gray-100 text-gray-600 border-gray-200";

    const unitLower = unit.toLowerCase();

    // Energy units (yellow/orange)
    if (
        unitLower.includes("kwh") ||
        unitLower.includes("mwh") ||
        unitLower.includes("kj") ||
        unitLower.includes("mj") ||
        unitLower.includes("gj")
    ) {
        return "bg-amber-100 text-amber-700 border-amber-200";
    }

    // Volume units (blue)
    if (
        unitLower.includes("liter") ||
        unitLower.includes("litre") ||
        unitLower.includes("gallon") ||
        unitLower.includes("m3") ||
        unitLower.includes("m³")
    ) {
        return "bg-blue-100 text-blue-700 border-blue-200";
    }

    // Mass/Weight units (purple)
    if (
        unitLower.includes("kg") ||
        unitLower.includes("ton") ||
        unitLower.includes("tonne") ||
        unitLower.includes("lb") ||
        unitLower.includes("gram")
    ) {
        return "bg-purple-100 text-purple-700 border-purple-200";
    }

    // Distance units (green)
    if (
        unitLower.includes("km") ||
        unitLower.includes("mile") ||
        unitLower.includes("meter") ||
        unitLower.includes("metre")
    ) {
        return "bg-green-100 text-green-700 border-green-200";
    }

    // Default
    return "bg-gray-100 text-gray-600 border-gray-200";
};

/**
 * Returns CSS classes for emission badges based on emission value
 * @param {string|number} emissions - The emission value
 * @returns {string} - Tailwind CSS classes for styling
 */
export const getEmissionsColorClass = (emissions) => {
    const value = parseFloat(emissions);
    if (isNaN(value)) return "bg-gray-50 text-gray-700 border-gray-100";

    // Thresholds for emissions in tCO₂e (adjust these based on your needs)
    if (value <= 1) return "bg-green-50 text-green-700 border-green-100";
    if (value <= 5) return "bg-yellow-50 text-yellow-700 border-yellow-100";
    return "bg-red-50 text-red-700 border-red-100";
};
