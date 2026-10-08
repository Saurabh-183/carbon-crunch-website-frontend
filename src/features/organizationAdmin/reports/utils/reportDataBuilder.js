import { calculateEmissions, getScope3ModuleByActivityType } from "./emissionFactorUtils";

/**
 * Builds comprehensive report data from approved emissions data
 * @param {Object} period - The reporting period with startDate and endDate
 * @param {Array} facilities - Array of facility objects
 * @param {Array} approvedData - Array of approved submission data
 * @param {Object} productAllocationsByFacility - Product allocations by facility ID
 * @returns {Object} - Report data with facility summaries, detailed rows, and totals
 */
export const buildReportData = (period, facilities, approvedData, productAllocationsByFacility) => {
  if (!period.startDate || !period.endDate) {
    return {
      facilitySummaries: [],
      detailedRows: [],
      organizationEmissions: 0,
      productAllocations: [],
    };
  }
  const start = new Date(period.startDate);
  const end = new Date(period.endDate);
  const facilityMap = new Map(facilities.map((facility) => [facility._id, facility]));

  const rows = [];
  const parseReportingPeriod = (value) => {
    if (!value || typeof value !== "string") return null;
    const normalized = value.replace(/\s+/g, "");
    const parts = normalized.split(/_to_|to/i);
    if (parts.length === 2) {
      const start = new Date(parts[0]);
      const end = new Date(parts[1]);
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
        return { start, end };
      }
    }
    return null;
  };

  const toFiniteNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const pickFirstFinite = (...values) => {
    for (const value of values) {
      const parsed = toFiniteNumber(value);
      if (parsed !== null) return parsed;
    }
    return null;
  };

  const extractGasValues = (source = {}) => {
    const gasBreakdown = source?.gasBreakdown && typeof source.gasBreakdown === "object" ? source.gasBreakdown : {};
    const emissionsByGas = source?.emissionsByGas && typeof source.emissionsByGas === "object" ? source.emissionsByGas : {};
    const gases = source?.gases && typeof source.gases === "object" ? source.gases : {};

    const co2 = pickFirstFinite(
      source?.co2,
      source?.CO2,
      source?.co2Emission,
      source?.co2Emissions,
      source?.co2eCO2,
      source?.co2e_co2,
      gasBreakdown?.co2,
      gasBreakdown?.CO2,
      emissionsByGas?.co2,
      emissionsByGas?.CO2,
      gases?.co2,
      gases?.CO2,
    );
    const ch4 = pickFirstFinite(
      source?.ch4,
      source?.CH4,
      source?.ch4Emission,
      source?.ch4Emissions,
      source?.co2eCH4,
      source?.co2e_ch4,
      gasBreakdown?.ch4,
      gasBreakdown?.CH4,
      emissionsByGas?.ch4,
      emissionsByGas?.CH4,
      gases?.ch4,
      gases?.CH4,
    );
    const n2o = pickFirstFinite(
      source?.n2o,
      source?.N2O,
      source?.n2oEmission,
      source?.n2oEmissions,
      source?.co2eN2O,
      source?.co2e_n2o,
      gasBreakdown?.n2o,
      gasBreakdown?.N2O,
      emissionsByGas?.n2o,
      emissionsByGas?.N2O,
      gases?.n2o,
      gases?.N2O,
    );

    return { co2, ch4, n2o };
  };

  const resolveEntryDate = (source, payload, item) => {
    if (source?.date) {
      const direct = new Date(source.date);
      if (!Number.isNaN(direct.getTime())) return direct;
    }

    const reportingPeriod = parseReportingPeriod(payload?.reportingPeriod) || parseReportingPeriod(payload?.reportingPeriodLabel) || parseReportingPeriod(item?.reportingPeriod);

    if (reportingPeriod?.start) return reportingPeriod.start;

    if (item?.approvedAt) {
      const approvedAt = new Date(item.approvedAt);
      if (!Number.isNaN(approvedAt.getTime())) return approvedAt;
    }

    if (item?.createdAt) {
      const createdAt = new Date(item.createdAt);
      if (!Number.isNaN(createdAt.getTime())) return createdAt;
    }

    return null;
  };

  approvedData.forEach((item) => {
    const facilityId = item.facilityId?._id || item.facilityId;
    const facility = facilityMap.get(facilityId);
    const payloads = [];

    const scopedPayloads = [
      { scope: "Scope 1", data: item.scope1Data },
      { scope: "Scope 2", data: item.scope2Data },
      { scope: "Scope 3", data: item.scope3Data },
    ];

    scopedPayloads.forEach(({ scope, data }) => {
      if (Array.isArray(data?.sections) && data.sections.length > 0) {
        payloads.push({ scope, data });
      }
    });

    if (payloads.length === 0 && item.scope && item.data) {
      payloads.push({ scope: item.scope, data: item.data });
    }

    const rowsBefore = rows.length;

    payloads.forEach(({ scope, data }) => {
      if (!data?.sections) return;
      data.sections.forEach((section) => {
        (section.activities || []).forEach((activity) => {
          (activity.sources || []).forEach((source) => {
            const entryDate = resolveEntryDate(source, data, item);
            if (entryDate && (entryDate < start || entryDate > end)) return;
            const resolvedScope3Module = data.scope3Module || section.scope3Module || activity.scope3Module || getScope3ModuleByActivityType(activity.activityType || activity.activityCategory);
            const qty = Number(source.consumption);
            const calculatedEmissions = calculateEmissions(
              source.consumption,
              source.unit,
              source.source,
              scope,
              activity.activityType || activity.activityCategory,
              resolvedScope3Module,
              source.emissionFactor,
            );
            const calculatedValue = Number(calculatedEmissions);
            const fallbackEmissions = Number(source.emissions ?? source.emission ?? source.emissionValue ?? source.calculatedEmission ?? source.co2e);
            const emissions = Number.isFinite(calculatedValue) ? calculatedValue : Number.isFinite(fallbackEmissions) ? fallbackEmissions : null;
            const derivedFactor = Number.isFinite(emissions) && Number.isFinite(qty) && qty > 0 ? (emissions * 1000) / qty : null;
            const entryDateIso = entryDate ? entryDate.toISOString() : "no-date";
            const gasValues = extractGasValues(source);
            rows.push({
              id: `${item._id}-${scope}-${source.source}-${entryDateIso}`,
              facilityId,
              facilityName: facility?.facilityName || facility?.name || "Site",
              facilityType: facility?.facilityType || "-",
              scope,
              scope3Module: scope === "Scope 3" ? resolvedScope3Module : null,
              activityType: activity.activityType || activity.activityCategory || "-",
              activityGroup: activity.activityGroup || "-",
              activityCategory: activity.activityCategory || "-",
              source: source.source || "-",
              unit: source.unit || "-",
              consumption: `${source.consumption || "-"} ${source.unit || ""}`.trim(),
              consumptionValue: Number(source.consumption),
              measurementMethod: source.measurementMethod || "-",
              date: entryDate || new Date(),
              emissionFactor: Number.isFinite(derivedFactor) ? derivedFactor : "-",
              emissions,
              co2: gasValues.co2,
              ch4: gasValues.ch4,
              n2o: gasValues.n2o,
            });
          });
        });
      });
    });

    if (rows.length === rowsBefore) {
      const breakdownRows = item?.detailedBreakdown || item?.data?.detailedBreakdown || [];
      breakdownRows.forEach((entry, index) => {
        const entryScope = entry.category || item.scope || "Scope 1";
        const calculated = Number(entry.calculatedEmission);
        const emissions = Number.isFinite(calculated) ? calculated / 1000 : null;
        const entryDate = resolveEntryDate({}, item.data, item) || new Date();
        const co2 = toFiniteNumber(entry?.co2 ?? entry?.co2Emission ?? entry?.co2Emissions);
        const ch4 = toFiniteNumber(entry?.ch4 ?? entry?.ch4Emission ?? entry?.ch4Emissions);
        const n2o = toFiniteNumber(entry?.n2o ?? entry?.n2oEmission ?? entry?.n2oEmissions);
        rows.push({
          id: `${item._id}-${entryScope}-${entry.source || "source"}-${index}`,
          facilityId,
          facilityName: facility?.facilityName || facility?.name || "Site",
          facilityType: facility?.facilityType || "-",
          scope: entryScope,
          scope3Module: entryScope === "Scope 3" ? null : null,
          activityType: "-",
          activityGroup: "-",
          activityCategory: "-",
          source: entry.source || "-",
          unit: entry.consumptionUnit || "-",
          consumption: `${entry.consumption ?? "-"} ${entry.consumptionUnit || ""}`.trim(),
          consumptionValue: Number(entry.consumption),
          measurementMethod: "-",
          date: entryDate,
          emissionFactor: Number.isFinite(Number(entry.emissionFactor)) ? Number(entry.emissionFactor) : "-",
          emissions,
          co2,
          ch4,
          n2o,
        });
      });
    }
  });

  const summaries = {};
  rows.forEach((row) => {
    if (!summaries[row.facilityId]) {
      const facility = facilityMap.get(row.facilityId);
      const boundarySettings = facility?.boundarySettings || {};
      const boundaryApproach = boundarySettings.operationalControl
        ? "Operational Control"
        : boundarySettings.financialControl
          ? "Financial Control"
          : boundarySettings.equityShare > 0
            ? "Equity Share"
            : "Operational Control";
      const equityShare = boundarySettings.equityShare || 0;
      const boundaryFactor = boundaryApproach === "Equity Share" ? equityShare / 100 : 1;
      summaries[row.facilityId] = {
        facility,
        facilityId: row.facilityId,
        facilityTotal: 0,
        boundaryApproach,
        equityShare,
        boundaryFactor,
        organizationShare: 0,
      };
    }
    if (Number.isFinite(row.emissions)) {
      summaries[row.facilityId].facilityTotal += row.emissions;
    }
  });

  const facilitySummaries = Object.values(summaries).map((summary) => ({
    ...summary,
    organizationShare: summary.facilityTotal * summary.boundaryFactor,
  }));

  const organizationEmissions = facilitySummaries.reduce((sum, item) => sum + item.organizationShare, 0);

  const detailedRows = rows.map((row) => {
    const summary = summaries[row.facilityId];
    return {
      id: row.id,
      facilityName: row.facilityName,
      facilityType: row.facilityType,
      scope: row.scope,
      activityType: row.activityType,
      activityGroup: row.activityGroup,
      activityCategory: row.activityCategory,
      source: row.source,
      unit: row.unit,
      consumption: row.consumption,
      consumptionValue: row.consumptionValue,
      measurementMethod: row.measurementMethod,
      date: row.date,
      emissionFactor: row.emissionFactor,
      emissions: Number.isFinite(row.emissions) ? row.emissions : "-",
      adjustedEmissions: Number.isFinite(row.emissions) && summary ? row.emissions * summary.boundaryFactor : "-",
      co2: Number.isFinite(row.co2) ? row.co2 : null,
      ch4: Number.isFinite(row.ch4) ? row.ch4 : null,
      n2o: Number.isFinite(row.n2o) ? row.n2o : null,
    };
  });

  // --- DYNAMIC PRODUCT ALLOCATIONS ---
  // Instead of using manual allocations, dynamically calculate percentages based on Total Produced quantities.
  const productAllocations = facilitySummaries
    .map((summary) => {
      const facilityId = summary.facilityId;
      const facilityRows = detailedRows.filter((r) => String(r.facilityId) === String(facilityId));

      // Aggregate "Total Produced" for each product from Production Activity (Data Entry Module C)
      // Note: Production Activity logs use scope="Scope 1", but typically rely on activityType = product name and source = some origin.
      // Let's look for rows that represent produced goods by tracking consumption values where section implies production.
      // In the absence of a strict section marker in detailedRows, we look at the raw 'approvedData' items directly,
      // or infer from activityType matching known products.
      const productionTotals = {};
      approvedData.forEach((item) => {
        if (String(item.facilityId?._id || item.facilityId) !== String(facilityId)) return;

        const payloads = [{ data: item.scope1Data }, { data: item.scope2Data }, { data: item.scope3Data }];

        payloads.forEach(({ data }) => {
          if (!data?.sections) return;
          data.sections.forEach((section) => {
            // We only want Production Activity quantities
            if (section.section === "Production Activity" || section.section?.toLowerCase().includes("production")) {
              (section.activities || []).forEach((activity) => {
                const prodName = activity.activityType || activity.activityCategory;
                if (!prodName) return;

                (activity.sources || []).forEach((source) => {
                  const qty = Number(source.consumption) || 0;
                  productionTotals[prodName] = (productionTotals[prodName] || 0) + qty;
                });
              });
            }
          });
        });
      });

      // Calculate total facility production volume
      const totalVolume = Object.values(productionTotals).reduce((sum, qty) => sum + qty, 0);

      // Map into allocation objects with calculated percentages
      const allocationsArr = Object.entries(productionTotals).map(([productName, qtyProduced]) => {
        // If totalVolume is 0, split evenly among products, otherwise ratio
        const percentage = totalVolume > 0 ? (qtyProduced / totalVolume) * 100 : 0;
        return {
          product: productName,
          percentage: Number(percentage.toFixed(2)),
          quantityProduced: qtyProduced,
        };
      });

      // Add evenly split logic if a facility has zero logged production but *does* have emissions
      if (allocationsArr.length === 0 && summary.facilityTotal > 0) {
        allocationsArr.push({
          product: "General Operations",
          percentage: 100,
          quantityProduced: 0,
        });
      } else if (allocationsArr.length > 0 && totalVolume === 0) {
        const evenSplit = 100 / allocationsArr.length;
        allocationsArr.forEach((a) => (a.percentage = Number(evenSplit.toFixed(2))));
      }

      return {
        facilityId,
        facilityName: summary.facility?.facilityName || summary.facility?.name || "Site",
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        allocations: allocationsArr,
      };
    })
    .filter((p) => p.allocations.length > 0);

  return {
    facilitySummaries,
    detailedRows,
    organizationEmissions,
    productAllocations,
  };
};
