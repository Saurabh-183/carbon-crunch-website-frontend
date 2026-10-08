import { useState, useEffect, useMemo } from "react";
import api from "../../../../utils/api";
import { calculateEmissions, getScope3ModuleByActivityType } from "../../../../utils/emission-calculator";
import {
    processScopeRows,
    calculateScopeTotals,
    processModuleRows,
    calculateModuleTotals,
} from "../utils/dataProcessor";

/**
 * Extracts emission factor from unit data
 * @param {number|Object} unitData - Unit data that may contain emission factor
 * @returns {number|null} - Extracted emission factor or null
 */
const extractEmissionFactor = (unitData) => {
    if (typeof unitData === "number") {
        return unitData;
    }
    if (typeof unitData === "object" && unitData !== null) {
        return (
            unitData.emissionFactor || unitData.factor || unitData.value || null
        );
    }
    return null;
};

/**
 * Custom hook to fetch and process approved emissions data
 * @returns {Object} - Approved data, scope rows, totals, and loading state
 */
export const useApprovedData = () => {
    const [approvedData, setApprovedData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchApproved = async () => {
        try {
            const res = await api.get("/api/submissions/approved-data");
            setApprovedData(res.data?.data || []);
        } catch (error) {
            console.error("Error fetching approved data:", error);
            setApprovedData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApproved();
    }, []);

    // Process scope rows using the standardized calculateEmissions utility
    const scopeRows = useMemo(() => {
        return processScopeRows(approvedData, calculateEmissions);
    }, [approvedData]);

    const scopeTotals = useMemo(() => {
        return calculateScopeTotals(scopeRows);
    }, [scopeRows]);

    const moduleRows = useMemo(() => {
        return processModuleRows(approvedData, calculateEmissions);
    }, [approvedData]);

    const moduleTotals = useMemo(() => {
        return calculateModuleTotals(moduleRows);
    }, [moduleRows]);

    return {
        approvedData,
        loading,
        scopeRows,
        scopeTotals,
        moduleRows,
        moduleTotals,
        refetch: fetchApproved,
    };
};
