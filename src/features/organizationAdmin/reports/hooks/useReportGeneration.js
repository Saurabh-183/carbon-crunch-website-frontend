import { useState } from "react";
import api from "../../../../utils/api";
import { resolveServiceBaseUrl } from "../../../../utils/baseUrl";
import { generateCbamHtml } from "./cbamHtmlGenerator";
import { getSiteUnitLabel } from "../../../../utils/uiTerminology";

/**
 * Custom hook to manage report generation (GHG + RCO)
 */
export const useReportGeneration = (onSuccess, user) => {
  const industry = user?.organizationId?.industry || user?.organizationIndustry || "";
  const siteUnitLabel = getSiteUnitLabel(industry, "singular", user?.role);
  const [generating, setGenerating] = useState(false);
  const [reportName, setReportName] = useState("");
  const [reportType, setReportType] = useState("GHG"); // "GHG" | "RCO"
  const [reportPeriod, setReportPeriod] = useState({
    startDate: "",
    endDate: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  const resolveReportLevel = () => {
    if (user?.role === "HEAD") return "HEAD";
    if (user?.role === "REGION_ADMIN" || user?.role === "ORG_ADMIN") return "REGIONAL";
    if (user?.role === "PLANT_ADMIN") return "BRANCH";
    if (user?.role === "ENERGY_MANAGER") return "OFFICE";
    return "ORGANIZATION";
  };

  const buildReportPayload = (reportData, facilities) => {
    const orgFromFacilities = facilities.find((facility) => facility?.organizationId && typeof facility.organizationId === "object")?.organizationId;
    const resolvedOrg = typeof user?.organizationId === "object" ? user.organizationId : orgFromFacilities || {};

    const facilityList = (reportData?.facilitySummaries || []).map((summary) => {
      const facility = summary.facility || {};
      const boundaryApproach = summary.boundaryApproach || "Operational Control";
      return {
        id: summary.facilityId,
        name: facility.facilityName || facility.name || siteUnitLabel,
        location: facility.facilityLocation || facility.location || "-",
        activityType: facility.facilityType || "-",
        controlStatus: boundaryApproach,
        boundaryApproach,
        equityShare: summary.equityShare || 0,
      };
    });

    const totals = (reportData?.detailedRows || []).reduce(
      (acc, row) => {
        const value = Number(row.adjustedEmissions ?? row.emissions);
        if (!Number.isFinite(value)) return acc;
        if (row.scope === "Scope 1") acc.scope1 += value;
        if (row.scope === "Scope 2") acc.scope2 += value;
        if (row.scope === "Scope 3") acc.scope3 += value;
        acc.total += value;
        return acc;
      },
      { scope1: 0, scope2: 0, scope3: 0, total: 0 },
    );

    const primaryFacility = facilities?.[0] || null;
    const reportLevel = resolveReportLevel();
    const reportEntityName = reportLevel === "BRANCH" || reportLevel === "OFFICE" ? primaryFacility?.facilityName || primaryFacility?.name || siteUnitLabel : resolvedOrg?.name || "Organization";

    return {
      reportName: reportName || "GHG Inventory Report",
      period: { startDate: reportPeriod.startDate, endDate: reportPeriod.endDate },
      generatedOn: new Date().toISOString(),
      reportLevel,
      reportEntityName,
      organization: {
        name: resolvedOrg?.name || "Organization",
        legalName: resolvedOrg?.legalName || resolvedOrg?.name || "Organization",
        registeredOffice: resolvedOrg?.registeredOffice || resolvedOrg?.address || "-",
        address: resolvedOrg?.address || resolvedOrg?.registeredOffice || "-",
        city: resolvedOrg?.city || "-",
        state: resolvedOrg?.state || "-",
        zip: resolvedOrg?.zip || "-",
        headquarters: resolvedOrg?.headquarters || "-",
        industry: resolvedOrg?.industry || resolvedOrg?.businessType || "-",
        sector: resolvedOrg?.sector || resolvedOrg?.industry || "-",
        activities: resolvedOrg?.activities || "-",
        baseYear: resolvedOrg?.baseYear || "FY 2020-21",
        countries: resolvedOrg?.countries || "-",
        countryCount: resolvedOrg?.countryCount || 0,
      },
      facilities: facilityList,
      facilitySummaries: reportData?.facilitySummaries || [],
      detailedRows:
        (reportData?.detailedRows || []).map((row) => ({
          scope: row.scope,
          source: row.source || "-",
          category: row.activityCategory || "-",
          activityType: row.activityType || "-",
          activityGroup: row.activityGroup || "-",
          activityCategory: row.activityCategory || "-",
          unit: row.unit || "-",
          consumptionValue: typeof row.consumptionValue === "number" ? row.consumptionValue : 0,
          emissions: typeof row.adjustedEmissions === "number" ? row.adjustedEmissions : typeof row.emissions === "number" ? row.emissions : 0,
          co2: Number.isFinite(row.co2) ? row.co2 : null,
          ch4: Number.isFinite(row.ch4) ? row.ch4 : null,
          n2o: Number.isFinite(row.n2o) ? row.n2o : null,
        })) || [],
      totals,
      officeCount: resolvedOrg?.officeCount || 0,
      systemVersion: "CarbonOS v1",
    };
  };

  /**
   * Build the RCO payload by fetching real data from the backend.
   * Calls the /api/reports/rco-data endpoint which queries SourceEntry directly.
   */
  const buildRCOPayload = async (facilities, periodOverride = null, facilityIdOverride = null) => {
    const orgFromFacilities = facilities.find((f) => f?.organizationId && typeof f.organizationId === "object")?.organizationId;
    const resolvedOrg = typeof user?.organizationId === "object" ? user.organizationId : orgFromFacilities || {};

    const orgId = resolvedOrg?._id || user?.organizationId?._id || user?.organizationId;

    // Fetch real data from the backend endpoint
    let rcoData = null;
    try {
      const activePeriod = periodOverride || reportPeriod;
      const params = {
        organizationId: orgId,
        startDate: activePeriod.startDate,
        endDate: activePeriod.endDate,
      };
      // Add facilityId for plant-level filtering
      if (facilityIdOverride) {
        params.facilityId = facilityIdOverride;
      }
      const response = await api.get("/api/reports/rco-data", { params });
      rcoData = response.data?.data;
    } catch (err) {
      console.error("Failed to fetch RCO data from backend:", err);
    }

    // Use real monthly data from backend, or fallback to empty arrays
    const monthly = rcoData?.monthly || {};
    const fuels = rcoData?.fuels || [];
    const unitTracking = rcoData?.unitTracking || {};
    const energySummary = rcoData?.energySummary || {};

    // Turbine generation comes from Captive/Generated entries in Scope 2
    const turbineGen = monthly.turbineGeneration || new Array(12).fill(0);

    // Solar + Wind + Rooftop + Wheeled are renewable generation sources
    const solarGen = monthly.solarGeneration || new Array(12).fill(0);
    const windGen = monthly.windGeneration || new Array(12).fill(0);
    const wheeledPower = monthly.wheeledPower || new Array(12).fill(0);

    return {
      reportName: reportName || "RCO Compliance Report",
      period: {
        startDate: (periodOverride || reportPeriod).startDate,
        endDate: (periodOverride || reportPeriod).endDate,
      },
      generatedOn: new Date().toISOString(),
      organization: {
        name: resolvedOrg?.name || "Organization",
        legalName: resolvedOrg?.legalName || resolvedOrg?.name || "Organization",
        registeredOffice: resolvedOrg?.registeredOffice || resolvedOrg?.address || "-",
        address: resolvedOrg?.address || resolvedOrg?.registeredOffice || "-",
        city: resolvedOrg?.city || "-",
        state: resolvedOrg?.state || "-",
        zip: resolvedOrg?.zip || "-",
        headquarters: resolvedOrg?.headquarters || "-",
        industry: resolvedOrg?.industry || resolvedOrg?.businessType || "-",
        sector: resolvedOrg?.sector || resolvedOrg?.industry || "-",
        activities: resolvedOrg?.activities || "-",
        baseYear: resolvedOrg?.baseYear || "FY 2020-21",
        countries: resolvedOrg?.countries || "-",
        countryCount: resolvedOrg?.countryCount || 0,
        corporateOfficeAddress: resolvedOrg?.corporateOfficeAddress || null,
        boardOfDirectors: resolvedOrg?.boardOfDirectors || [],
        rawMaterialSourcing: resolvedOrg?.rawMaterialSourcing || null,
      },
      facilities: rcoData?.facilities || [],
      systemVersion: "CarbonOS v1",

      // ── Generation sources ──
      turbines: [],
      aux_type: "Common",
      common_auxiliary: { values: monthly.auxiliary || new Array(12).fill(0) },
      grid_import: { values: monthly.gridImport || new Array(12).fill(0) },
      dg_generation: { values: monthly.dgGeneration || new Array(12).fill(0) },
      open_access_import: { values: monthly.openAccessImport || new Array(12).fill(0) },
      total_consumption: { values: monthly.totalConsumption || new Array(12).fill(0) },

      // ── Detailed electricity breakdown ──
      turbine_generation: { values: turbineGen },
      solar_generation: { values: solarGen },
      wind_generation: { values: windGen },
      wheeled_power: { values: wheeledPower },
      open_access_renewable: { values: monthly.openAccessRenewable || new Array(12).fill(0) },
      open_access_non_renewable: { values: monthly.openAccessNonRenewable || new Array(12).fill(0) },

      // ── Fuel data with energy pre-calculated ──
      fuels: fuels.map((f) => ({
        name: f.name,
        category: f.category,
        consumption: f.consumption,
        gcv: f.gcv,
        energy: f.energy || [],
        unit: f.unit || "",
        gcvUnit: f.gcvUnit || "",
      })),

      // ── Pre-computed energy summary from backend ──
      energySummary: {
        monthlyFossilEnergy: energySummary.monthlyFossilEnergy || new Array(12).fill(0),
        monthlyRenewableEnergy: energySummary.monthlyRenewableEnergy || new Array(12).fill(0),
      },

      unitTracking,
      fossil_ppa_purchase: { values: new Array(12).fill(0) },
      fossil_banking: { values: new Array(12).fill(0) },
      fossil_sale: { values: new Array(12).fill(0) },
      fossil_sale_banking: { values: new Array(12).fill(0) },
      renewable_discom_purchase: { values: new Array(12).fill(0) },
      renewable_drawl: { values: new Array(12).fill(0) },
      renewable_sale: { values: new Array(12).fill(0) },
      renewable_banking: { values: new Array(12).fill(0) },
      // Include raw entry count for debugging
      _debug: {
        entryCount: rcoData?.entryCount || 0,
        approvedSubmissionCount: rcoData?.approvedSubmissionCount || 0,
      },
    };
  };

  const toFinancialYear = (startDate) => {
    if (!startDate) return "";
    const year = new Date(startDate).getFullYear();
    const nextYearShort = String((year + 1) % 100).padStart(2, "0");
    return `${year}-${nextYearShort}`;
  };

  const parseValue = (raw) => {
    if (raw === null || raw === undefined) return null;
    const cleaned = String(raw).replace(/,/g, "").replace(/%/g, "").trim();
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const buildNomenclatureMap = (rows = []) => {
    const out = {};
    rows.forEach((row) => {
      if (row?.kind !== "data") return;
      const nomenclature = (row?.nomenclature || "").trim();
      if (!nomenclature) return;
      const value = parseValue(row?.value);
      if (value === null) return;
      out[nomenclature] = value;
    });
    return out;
  };

  const quarterKeyFromLabel = (label = "") => {
    const match = String(label).match(/Q[1-4]/i);
    return match ? match[0].toUpperCase() : null;
  };

  const generateDownloadLink = (blob, report) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.reportName || "RCO_Report"}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadRcoExcel = async (report, facilities, facilityIdOverride = null) => {
    try {
      if (!report || report?.reportData?.reportType !== "RCO") return;

      const period = {
        startDate: report.startDate || report?.reportData?.period?.startDate,
        endDate: report.endDate || report?.reportData?.period?.endDate,
      };

      if (!period.startDate || !period.endDate) {
        throw new Error("Missing report period for Excel generation");
      }

      const reportServiceBase = resolveServiceBaseUrl("report");
      const excelServiceBase = resolveServiceBaseUrl("rcoexcel");

      const isMultiFacility = Array.isArray(facilities) && facilities.length > 1;
      const isOrgLevel = !facilityIdOverride;

      if (isMultiFacility && isOrgLevel) {
        // Corporate Compliance Format Excel Flow
        const orgObj = typeof user?.organizationId === "object" ? user.organizationId : {};
        const corporateFacilities = [];

        for (const fac of facilities) {
          try {
            const facId = fac._id || fac.id;
            const facPayload = await buildRCOPayload(facilities, period, facId);

            const mehaliRes = await fetch(`${reportServiceBase}/render/rco/mehali-data`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(facPayload),
            });

            let grossTotal = 0;
            let rcoApplicable = 0;
            let nonFossil = 0;
            let recs = 0;
            let rcoPct = 29.91;

            if (mehaliRes.ok) {
              const mehaliData = await mehaliRes.json();
              const annualRows = mehaliData?.mehali_annual_rows || [];
              for (const row of annualRows) {
                const nom = row?.nomenclature || "";
                const val = parseFloat(row?.total_energy) || 0;
                if (nom.includes("Etotal")) grossTotal = val;
                else if (nom.startsWith("K=") || nom === "K") rcoApplicable = val;
                else if (nom.startsWith("Y'=") || nom === "Y'") nonFossil = val;
                else if (nom.startsWith("T'=") || nom === "T'") recs = val;
                else if (nom === "Z'" || nom.startsWith("Z'")) rcoPct = val || 29.91;
              }
            }

            corporateFacilities.push({
              name: fac.facilityName || fac.name || `${siteUnitLabel} ${corporateFacilities.length + 1}`,
              registration_no: fac.registrationNo || "",
              obligation_type: fac.obligationType || "Captive Power Plant (CPP)",
              gross_total_energy: grossTotal,
              rco_applicable_consumption: rcoApplicable,
              non_fossil_consumption: nonFossil,
              recs_purchased: recs,
              rco_pct: rcoPct,
            });
          } catch (facErr) {
            console.error(`Failed to fetch Excel RCO data for facility ${fac.facilityName}:`, facErr);
          }
        }

        const corporateExcelPayload = {
          reportName: report.reportName || "RCO Corporate Compliance Report",
          generatedOn: new Date().toISOString(),
          organization: {
            name: orgObj.organizationName || orgObj.name || "Organization",
            address: orgObj.address || orgObj.registeredOffice || "",
            state: orgObj.state || "",
            baseYear: orgObj.baseYear || "FY 2024-25",
            target_year: toFinancialYear(period.startDate) || "FY 2024-25",
            sector: orgObj.sector || orgObj.industry || "",
            registration_no: "",
          },
          facilities: corporateFacilities,
        };

        const excelResponse = await fetch(`${excelServiceBase}/generate/corporate/xlsx`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(corporateExcelPayload),
        });

        if (!excelResponse.ok) {
          const errorText = await excelResponse.text();
          throw new Error(errorText || "Failed to generate Corporate Excel report");
        }

        const blob = await excelResponse.blob();
        generateDownloadLink(blob, report);
        return;
      }

      // Default Single-Facility Mehali FormA Excel Flow
      const rcoPayload = await buildRCOPayload(facilities, period, facilityIdOverride);

      const mehaliResponse = await fetch(`${reportServiceBase}/render/rco/mehali-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rcoPayload),
      });
      if (!mehaliResponse.ok) {
        const errorText = await mehaliResponse.text();
        throw new Error(errorText || "Failed to prepare Mehali rows");
      }
      const mehaliData = await mehaliResponse.json();

      const quarterlyValues = {};
      (mehaliData?.mehali_quarterly_tables || []).forEach((qt) => {
        const key = quarterKeyFromLabel(qt?.label);
        if (!key) return;
        quarterlyValues[key] = buildNomenclatureMap(qt?.rows || []);
      });

      const excelPayload = {
        company: {
          name: rcoPayload?.organization?.legalName || rcoPayload?.organization?.name || "Organization",
          sector: rcoPayload?.organization?.sector || rcoPayload?.organization?.industry || "",
          registration_no: "",
          obligation_type: "Captive power Plant (CPP)",
          target_year: toFinancialYear(period.startDate),
        },
        annual_values: buildNomenclatureMap(mehaliData?.mehali_annual_rows || []),
        quarterly_values: quarterlyValues,
      };

      const excelResponse = await fetch(`${excelServiceBase}/generate/mehali/xlsx`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(excelPayload),
      });
      if (!excelResponse.ok) {
        const errorText = await excelResponse.text();
        throw new Error(errorText || "Failed to generate Excel report");
      }

      const blob = await excelResponse.blob();
      generateDownloadLink(blob, report);
    } catch (error) {
      setMessage({
        type: "error",
        text: error?.message || "Failed to download RCO Excel",
      });
    }
  };

  /**
   * Build the CBAM payload by fetching real data from the backend.
   */
  const buildCBAMPayload = async (facilities, periodOverride = null) => {
    const orgFromFacilities = facilities.find((f) => f?.organizationId && typeof f.organizationId === "object")?.organizationId;
    const resolvedOrg = typeof user?.organizationId === "object" ? user.organizationId : orgFromFacilities || {};
    const orgId = resolvedOrg?._id || user?.organizationId?._id || user?.organizationId;

    const activePeriod = periodOverride || reportPeriod;
    const response = await api.get("/api/reports/cbam-data", {
      params: {
        organizationId: orgId,
        startDate: activePeriod.startDate,
        endDate: activePeriod.endDate,
      },
    });
    return response.data?.data;
  };

  /**
   * Download a CBAM Excel report.
   */
  const handleDownloadCbamExcel = async (report, facilities) => {
    try {
      const period = {
        startDate: report.startDate || report?.reportData?.period?.startDate,
        endDate: report.endDate || report?.reportData?.period?.endDate,
      };
      if (!period.startDate || !period.endDate) throw new Error("Missing report period for CBAM Excel");

      const orgFromFacilities = (facilities || []).find((f) => f?.organizationId && typeof f.organizationId === "object")?.organizationId;
      const resolvedOrg = typeof user?.organizationId === "object" ? user.organizationId : orgFromFacilities || {};
      const orgId = resolvedOrg?._id || user?.organizationId?._id || user?.organizationId;

      const response = await api.get("/api/reports/cbam-excel", {
        params: {
          organizationId: orgId,
          startDate: period.startDate,
          endDate: period.endDate,
        },
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${report.reportName || "CBAM_Report"}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setMessage({ type: "error", text: error?.message || "Failed to download CBAM Excel" });
    }
  };

  const handleGenerateReport = async (reportData, facilities, facilityIdOverride = null) => {
    if (!reportName || !reportPeriod.startDate || !reportPeriod.endDate) {
      setMessage({
        type: "error",
        text: "Please fill all required fields",
      });
      return;
    }

    setGenerating(true);
    setMessage({ type: "", text: "" });

    try {
      const reportServiceBase = resolveServiceBaseUrl("report");

      let html;
      let savedReportType;

      if (reportType === "RCO") {
        const isMultiFacility = Array.isArray(facilities) && facilities.length > 1;
        const isOrgLevel = !facilityIdOverride; // org admin = no specific facility

        if (isMultiFacility && isOrgLevel) {
          // ── Corporate Compliance Format (multi-facility org admin) ──
          // Fetch per-facility RCO data and compute each DC's summary values
          const orgObj = typeof user?.organizationId === "object" ? user.organizationId : {};
          const corporateFacilities = [];

          for (const fac of facilities) {
            try {
              const facId = fac._id || fac.id;
              const facPayload = await buildRCOPayload(facilities, reportPeriod, facId);

              // Get the computed values from the report service
              const mehaliRes = await fetch(`${reportServiceBase}/render/rco/mehali-data`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(facPayload),
              });

              let grossTotal = 0;
              let rcoApplicable = 0;
              let nonFossil = 0;
              let recs = 0;
              let rcoPct = 29.91;

              if (mehaliRes.ok) {
                const mehaliData = await mehaliRes.json();
                const annualRows = mehaliData?.mehali_annual_rows || [];
                // Extract key values from the annual rows by nomenclature
                for (const row of annualRows) {
                  const nom = row?.nomenclature || "";
                  const val = parseFloat(row?.total_energy) || 0;
                  if (nom.includes("Etotal")) grossTotal = val;
                  else if (nom.startsWith("K=") || nom === "K") rcoApplicable = val;
                  else if (nom.startsWith("Y'=") || nom === "Y'") nonFossil = val;
                  else if (nom.startsWith("T'=") || nom === "T'") recs = val;
                  else if (nom === "Z'" || nom.startsWith("Z'")) rcoPct = val || 29.91;
                }
              }

              corporateFacilities.push({
                name: fac.facilityName || fac.name || `${siteUnitLabel} ${corporateFacilities.length + 1}`,
                registration_no: fac.registrationNo || "",
                obligation_type: fac.obligationType || "Captive Power Plant (CPP)",
                gross_total_energy: grossTotal,
                rco_applicable_consumption: rcoApplicable,
                non_fossil_consumption: nonFossil,
                recs_purchased: recs,
                rco_pct: rcoPct,
              });
            } catch (facErr) {
              console.error(`Failed to fetch RCO data for facility ${fac.facilityName}:`, facErr);
            }
          }

          const corporatePayload = {
            reportName: reportName || "RCO Corporate Compliance Report",
            period: reportPeriod,
            generatedOn: new Date().toISOString(),
            organization: {
              name: orgObj.organizationName || orgObj.name || "Organization",
              address: orgObj.address || orgObj.registeredOffice || "",
              state: orgObj.state || "",
              baseYear: orgObj.baseYear || "FY 2024-25",
            },
            systemVersion: "CarbonOS v1",
            facilities: corporateFacilities,
          };

          const renderResponse = await fetch(`${reportServiceBase}/render/rco-corporate/html`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(corporatePayload),
          });
          if (!renderResponse.ok) {
            const errorText = await renderResponse.text();
            throw new Error(errorText || "Failed to render Corporate RCO report HTML");
          }
          html = await renderResponse.text();
          savedReportType = "RCO";
        } else {
          // ── Mehali Format (single-facility org admin OR plant admin) ──
          const rcoPayload = await buildRCOPayload(facilities, reportPeriod, facilityIdOverride);
          const renderResponse = await fetch(`${reportServiceBase}/render/rco/html`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(rcoPayload),
          });
          if (!renderResponse.ok) {
            const errorText = await renderResponse.text();
            throw new Error(errorText || "Failed to render RCO report HTML");
          }
          html = await renderResponse.text();
          savedReportType = "RCO";
        }
      } else if (reportType === "CBAM") {
        // ── CBAM Report ── fetch CBAM data and generate HTML client-side
        const cbamData = await buildCBAMPayload(facilities, reportPeriod);
        html = generateCbamHtml(cbamData);
        savedReportType = "CBAM";
      } else {
        // ── GHG Report (existing flow) ──
        const payload = buildReportPayload(reportData, facilities);
        const renderResponse = await fetch(`${reportServiceBase}/render/v2/html`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!renderResponse.ok) {
          const errorText = await renderResponse.text();
          throw new Error(errorText || "Failed to render report HTML");
        }
        html = await renderResponse.text();
        savedReportType = "ORG_CONSOLIDATED";
      }

      const topSource = Array.isArray(reportData?.detailedRows) ? reportData.detailedRows[0]?.source || "" : "";

      await api.post("/api/reports/generate", {
        reportName,
        startDate: reportPeriod.startDate,
        endDate: reportPeriod.endDate,
        organizationId: user?.organizationId?._id || user?.organizationId,
        facilityId: facilityIdOverride || undefined,
        totalEmissions: reportData?.organizationEmissions || 0,
        topSource,
        productAllocations: [],
        reportData: {
          reportType: savedReportType,
          html,
          period: reportPeriod,
          reportLevel: resolveReportLevel(),
        },
      });

      setMessage({ type: "success", text: `${reportType} report generated successfully` });
      setReportName("");
      setReportType("GHG");
      setReportPeriod({ startDate: "", endDate: "" });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || error.message || "Failed to generate report",
      });
    } finally {
      setGenerating(false);
    }
  };

  const resetForm = () => {
    setReportName("");
    setReportType("GHG");
    setReportPeriod({ startDate: "", endDate: "" });
    setMessage({ type: "", text: "" });
  };

  return {
    generating,
    reportName,
    setReportName,
    reportType,
    setReportType,
    reportPeriod,
    setReportPeriod,
    message,
    setMessage,
    handleGenerateReport,
    handleDownloadRcoExcel,
    handleDownloadCbamExcel,
    buildRCOPayload,
    resetForm,
  };
};
