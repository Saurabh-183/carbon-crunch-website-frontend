import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useReportsData } from "../../features/organizationAdmin/reports/hooks/useReportsData";
import { useReportGeneration } from "../../features/organizationAdmin/reports/hooks/useReportGeneration";
import { buildReportData } from "../../features/organizationAdmin/reports/utils/reportDataBuilder";
import { downloadReportAsHtml, downloadReportAsPdf } from "../../features/organizationAdmin/reports/services/reportDownloadService";
import { resolveServiceBaseUrl } from "../../utils/baseUrl";
import ReportHeader from "../../features/organizationAdmin/reports/components/ReportHeader";
import EmptyReportsState from "../../features/organizationAdmin/reports/components/EmptyReportsState";
import ReportCard from "../../features/organizationAdmin/reports/components/ReportCard";
import GenerateReportModal from "../../features/organizationAdmin/reports/components/GenerateReportModal";
import RcoReportEditor from "../../components/rco-editor/RcoReportEditor";
import Loader from "../../components/rf/Loader";
import api from "../../utils/api";
import { getSiteUnitLabel } from "../../utils/uiTerminology";

const OrgReports2 = () => {
  const { user } = useAuth();
  const organizationId = user?.organizationId?._id || user?.organizationId || "";
  const industry = user?.organizationId?.industry || user?.organizationIndustry || "";
  const [orgIndustry, setOrgIndustry] = useState(industry);
  const siteUnitLabel = getSiteUnitLabel(industry, "singular", user?.role);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterFacility, setFilterFacility] = useState("all");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [previewReport, setPreviewReport] = useState(null);
  const [previewMode, setPreviewMode] = useState(null); // "RCO" | "HTML"
  const [previewTitle, setPreviewTitle] = useState("Report Preview");
  const [previewPayload, setPreviewPayload] = useState(null);
  const [previewNarrative, setPreviewNarrative] = useState({});
  const [previewLoading, setPreviewLoading] = useState(false);
  const [enabledModules, setEnabledModules] = useState(null);
  const corporatePreviewCacheRef = useRef(new Map());

  // Fetch reports data
  const { facilities, approvedData, productAllocationsByFacility, loading, consolidatedReports, refetch } = useReportsData(organizationId);

  // Fetch org-level enabled modules
  useEffect(() => {
    const fetchOrgModules = async () => {
      if (!organizationId) return;
      try {
        const res = await api.get(`/api/organizations/${organizationId}`);
        const org = res.data?.data || res.data;
        const modules = org?.complianceSettings?.enabledModules || [];
        setEnabledModules(modules.map((m) => (m === "GHG" ? "GHG" : m)));
        setOrgIndustry(org?.industry || industry);
      } catch (err) {
        console.error("Error fetching org modules:", err);
        setEnabledModules([]);
      }
    };
    fetchOrgModules();
  }, [organizationId]);

  // Report generation state
  const {
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
  } = useReportGeneration(() => {
    setShowModal(false);
    refetch();
  }, user);

  const reportServiceBase = resolveServiceBaseUrl("report");

  const getReportTypeValue = (report) => report.reportData?.reportType || report.reportType || "GHG";

  const reportTypeOptions = useMemo(() => {
    const types = new Set(consolidatedReports.map(getReportTypeValue));
    return Array.from(types).sort();
  }, [consolidatedReports]);

  const facilityOptions = useMemo(() => {
    return facilities
      .filter((fac) => fac && (fac._id || fac.id))
      .map((fac) => ({
        id: fac._id || fac.id,
        label: fac.facilityName || fac.name || fac.code || "Facility",
      }));
  }, [facilities]);

  const filteredReports = useMemo(() => {
    const startFilterDate = filterStartDate ? new Date(filterStartDate) : null;
    const endFilterDate = filterEndDate ? new Date(filterEndDate) : null;

    return consolidatedReports.filter((report) => {
      const type = getReportTypeValue(report);
      if (filterType !== "all" && type !== filterType) return false;

      if (filterFacility !== "all") {
        const facilityId = typeof report.facilityId === "object" ? report.facilityId._id : report.facilityId;
        if (!facilityId || facilityId !== filterFacility) return false;
      }

      const period = report.period || report.reportData?.period;
      const reportStart = period?.startDate ? new Date(period.startDate) : report.createdAt ? new Date(report.createdAt) : null;
      const reportEnd = period?.endDate ? new Date(period.endDate) : report.createdAt ? new Date(report.createdAt) : reportStart;

      if (startFilterDate && reportEnd && reportEnd < startFilterDate) return false;
      if (endFilterDate && reportStart && reportStart > endFilterDate) return false;
      return true;
    });
  }, [consolidatedReports, filterType, filterFacility, filterStartDate, filterEndDate]);

  const hasActiveFilters = useMemo(
    () => filterType !== "all" || filterFacility !== "all" || filterStartDate || filterEndDate,
    [filterType, filterFacility, filterStartDate, filterEndDate],
  );

  const resetFilters = () => {
    setFilterType("all");
    setFilterFacility("all");
    setFilterStartDate("");
    setFilterEndDate("");
  };

  const decodeHtml = (value) => {
    if (!value) return "";
    if (!value.includes("&lt;") && !value.includes("&gt;") && !value.includes("&amp;")) {
      return value;
    }
    const textarea = document.createElement("textarea");
    textarea.innerHTML = value;
    return textarea.value;
  };

  const downloadBlob = (blob, fileName) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const downloadPdfFromHtml = (html) => {
    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) {
      setMessage({ type: "error", text: "Popup blocked. Please allow popups to export PDF." });
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`${html}<script>window.addEventListener('load', () => { window.print(); });<\/script>`);
    printWindow.document.close();
  };

  // Build report data function wrapper
  const buildReportDataWrapper = (period) => {
    return buildReportData(period, facilities, approvedData, productAllocationsByFacility);
  };

  // Download handlers
  const handleDownloadReport = (report) => {
    downloadReportAsHtml(report, buildReportDataWrapper, reportName, facilities, user);
  };

  const handleDownloadPdf = (report) => {
    downloadReportAsPdf(report, buildReportDataWrapper, reportName, facilities, user);
  };

  const handleDownloadExcel = async (report) => {
    await handleDownloadRcoExcel(report, facilities);
  };

  const handleCbamExcel = async (report) => {
    await handleDownloadCbamExcel(report, facilities);
  };

  /** Build corporate payload by fetching per-facility data from report service */
  const buildCorporateRcoPayload = async (period) => {
    const orgObj = typeof user?.organizationId === "object" ? user.organizationId : {};
    const facilityRows = await Promise.all(
      facilities.map(async (fac, index) => {
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

          return {
            name: fac.facilityName || fac.name || `Facility ${index + 1}`,
            registration_no: fac.registrationNo || "",
            obligation_type: fac.obligationType || "Captive Power Plant (CPP)",
            gross_total_energy: grossTotal,
            rco_applicable_consumption: rcoApplicable,
            non_fossil_consumption: nonFossil,
            recs_purchased: recs,
            rco_pct: rcoPct,
          };
        } catch (facErr) {
          console.error(`Failed to fetch RCO data for facility ${fac.facilityName}:`, facErr);
          return null;
        }
      }),
    );

    const corporateFacilities = facilityRows.filter(Boolean);

    return {
      reportName: "RCO Corporate Compliance Report",
      period,
      generatedOn: new Date().toISOString(),
      organization: {
        name: orgObj.organizationName || orgObj.name || "Organization",
        address: orgObj.address || orgObj.registeredOffice || "",
        corporateOfficeAddress: orgObj.corporateOfficeAddress || "",
        boardOfDirectors: orgObj.boardOfDirectors || [],
        rawMaterialSourcing: orgObj.rawMaterialSourcing || "",
        state: orgObj.state || "",
        industry: orgObj.industry || orgObj.sector || "",
        baseYear: orgObj.baseYear || "FY 2024-25",
      },
      systemVersion: "CarbonOS v1",
      facilities: corporateFacilities,
    };
  };

  /** Fetch the rich corporate RCO preview with narratives */
  const fetchCorporateRcoPreview = async (corporatePayload) => {
    const response = await fetch(`${reportServiceBase}/render/rco-corporate/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payload: corporatePayload,
        narrativeOverrides: {},
        useAiNarrative: true,
      }),
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || "Failed to render corporate RCO preview");
    }
    return response.json();
  };

  /** Download corporate RCO DOCX */
  const handleCorporateRcoDocxDownload = async () => {
    if (!previewPayload) return;
    try {
      const response = await fetch(`${reportServiceBase}/render/rco-corporate/export/docx`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: previewPayload,
          narrativeOverrides: previewNarrative || {},
          useAiNarrative: false,
        }),
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || "Failed to download DOCX");
      }
      const blob = await response.blob();
      downloadBlob(blob, `${previewPayload?.reportName || "RCO_Corporate_Report"}.docx`);
    } catch (error) {
      setMessage({ type: "error", text: error?.message || "Failed to download DOCX" });
    }
  };

  /** Download corporate RCO PDF (from edited HTML or fresh render) */
  const handleCorporateRcoPdfDownload = async (editedHtml) => {
    if (!editedHtml && !previewPayload) return;
    try {
      if (editedHtml) {
        const response = await fetch(`${reportServiceBase}/render/rco-corporate/export/pdf-from-html`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ html: editedHtml }),
        });
        if (!response.ok) {
          const err = await response.text();
          throw new Error(err || "Failed to download PDF");
        }
        const blob = await response.blob();
        downloadBlob(blob, `${previewPayload?.reportName || "RCO_Corporate_Report"}.pdf`);
        return;
      }
      const response = await fetch(`${reportServiceBase}/render/rco-corporate/export/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: previewPayload,
          narrativeOverrides: previewNarrative || {},
          useAiNarrative: false,
        }),
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || "Failed to download PDF");
      }
      const blob = await response.blob();
      downloadBlob(blob, `${previewPayload?.reportName || "RCO_Corporate_Report"}.pdf`);
    } catch (error) {
      setMessage({ type: "error", text: error?.message || "Failed to download PDF" });
    }
  };

  // Preview opens inside the editor so users can edit before exporting.
  const handlePreview = async (report) => {
    const period = {
      startDate: report.startDate || report.reportData?.period?.startDate,
      endDate: report.endDate || report.reportData?.period?.endDate,
    };

    const reportTypeValue = report?.reportData?.reportType || "ORG_CONSOLIDATED";
    const isRco = reportTypeValue === "RCO";
    const storedHtml = decodeHtml(report?.reportData?.html || "");

    const openEditor = ({ html, mode, title, payload = null, narrative = {} }) => {
      setPreviewReport(html);
      setPreviewMode(mode);
      setPreviewTitle(title || "Report Preview");
      setPreviewPayload(payload);
      setPreviewNarrative(narrative || {});
    };

    if (storedHtml) {
      openEditor({
        html: storedHtml,
        mode: isRco ? "RCO" : "HTML",
        title: report.reportName || `${reportTypeValue} Report`,
      });
      return;
    }

    // Fallback for old reports that don't have embedded HTML yet.
    if (isRco) {
      try {
        setPreviewLoading(true);
        const cacheKey = `${period.startDate || ""}_${period.endDate || ""}`;
        let cached = corporatePreviewCacheRef.current.get(cacheKey);

        if (!cached) {
          const corporatePayload = await buildCorporateRcoPayload(period);
          const previewData = await fetchCorporateRcoPreview(corporatePayload);
          cached = {
            html: previewData?.html || "",
            narrative: previewData?.narrative || previewData?.narrativeOverrides || {},
            payload: corporatePayload,
          };
          corporatePreviewCacheRef.current.set(cacheKey, cached);
        }

        if (!cached?.html) {
          throw new Error("Failed to build report preview");
        }

        openEditor({
          html: cached.html,
          mode: "RCO",
          title: report.reportName || "RCO Report",
          payload: cached.payload,
          narrative: cached.narrative,
        });
      } catch (err) {
        console.error("RCO preview failed:", err);
        setMessage({ type: "error", text: err?.message || "Failed to open RCO preview" });
      } finally {
        setPreviewLoading(false);
      }
      return;
    }

    // Build report payload and render preview HTML for editor mode.
    const reportDataForPeriod = buildReportDataWrapper(period);

    const orgFromFacilities = facilities.find((f) => f?.organizationId && typeof f.organizationId === "object")?.organizationId;
    const resolvedOrg = typeof user?.organizationId === "object" ? user.organizationId : orgFromFacilities || {};
    const facilityList = (reportDataForPeriod?.facilitySummaries || []).map((summary) => {
      const fac = summary.facility || {};
      return {
        id: summary.facilityId,
        name: fac.facilityName || fac.name || siteUnitLabel,
        location: fac.facilityLocation || fac.location || "-",
        activityType: fac.facilityType || "-",
        controlStatus: summary.boundaryApproach || "Operational Control",
        boundaryApproach: summary.boundaryApproach || "Operational Control",
        equityShare: summary.equityShare || 0,
      };
    });
    const totals = (reportDataForPeriod?.detailedRows || []).reduce(
      (acc, row) => {
        const v = Number(row.adjustedEmissions ?? row.emissions);
        if (!Number.isFinite(v)) return acc;
        if (row.scope === "Scope 1") acc.scope1 += v;
        if (row.scope === "Scope 2") acc.scope2 += v;
        if (row.scope === "Scope 3") acc.scope3 += v;
        acc.total += v;
        return acc;
      },
      { scope1: 0, scope2: 0, scope3: 0, total: 0 },
    );
    const payload = {
      reportName: report.reportName || "GHG Inventory Report",
      period,
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
      },
      facilities: facilityList,
      facilitySummaries: reportDataForPeriod?.facilitySummaries || [],
      detailedRows: (reportDataForPeriod?.detailedRows || []).map((row) => ({
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
      })),
      totals,
      systemVersion: "CarbonOS v1",
    };

    try {
      const response = await fetch(`${reportServiceBase}/render/v2/html`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to render report preview");
      const html = await response.text();
      openEditor({
        html,
        mode: "HTML",
        title: report.reportName || "GHG Inventory Report",
      });
    } catch (err) {
      console.error("Preview failed:", err);
      setMessage({ type: "error", text: err?.message || "Failed to open report preview" });
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
    setMessage({ type: "", text: "" });
  };

  // Handle generate click
  const handleGenerateClick = () => {
    const reportData = buildReportDataWrapper(reportPeriod);
    handleGenerateReport(reportData, facilities);
  };

  // Loading state
  if (loading || previewLoading) {
    return <Loader />;
  }

  // Get facility summaries for modal preview
  const facilitySummaries = buildReportDataWrapper(reportPeriod).facilitySummaries;

  // ── Preview mode: editable report editor ──
  if (previewReport) {
    return (
      <RcoReportEditor
        html={previewReport}
        title={previewTitle}
        onBack={() => {
          setPreviewReport(null);
          setPreviewMode(null);
          setPreviewTitle("Report Preview");
          setPreviewPayload(null);
          setPreviewNarrative({});
        }}
        onExportPdf={(editedHtml) => {
          if (previewMode === "RCO" && previewPayload) {
            handleCorporateRcoPdfDownload(editedHtml);
            return;
          }
          downloadPdfFromHtml(editedHtml);
        }}
        onExportDocx={previewMode === "RCO" && previewPayload ? handleCorporateRcoDocxDownload : undefined}
      />
    );
  }

  return (
    <div>
      <ReportHeader onGenerateClick={() => setShowModal(true)} industry={orgIndustry} />

      <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Report type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All types</option>
              {reportTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Facility</label>
            <select
              value={filterFacility}
              onChange={(e) => setFilterFacility(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All facilities</option>
              {facilityOptions.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Start date</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">End date</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 justify-between">
          <p className="text-xs text-slate-500">
            Showing {filteredReports.length.toLocaleString()} of {consolidatedReports.length.toLocaleString()} reports
          </p>
          <button
            onClick={resetFilters}
            disabled={!hasActiveFilters}
            className="px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wide text-slate-500 border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset filters
          </button>
        </div>
      </div>

      {/* Reports List */}
      {consolidatedReports.length === 0 ? (
        <EmptyReportsState />
      ) : filteredReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <p className="text-sm font-semibold">No reports match the selected filters.</p>
          <p className="text-xs mt-2">Try relaxing the date range or clearing the filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <ReportCard
              key={report._id}
              report={report}
              onDownloadHtml={handleDownloadReport}
              onDownloadPdf={handleDownloadPdf}
              onDownloadExcel={handleDownloadExcel}
              onDownloadCbamExcel={handleCbamExcel}
              onPreview={handlePreview}
              hidePdfForRco={report?.reportData?.reportType === "RCO"}
            />
          ))}
        </div>
      )}

      {/* Generate Report Modal */}
      <GenerateReportModal
        isOpen={showModal}
        onClose={handleCloseModal}
        reportName={reportName}
        setReportName={setReportName}
        reportPeriod={reportPeriod}
        setReportPeriod={setReportPeriod}
        message={message}
        generating={generating}
        onGenerate={handleGenerateClick}
        facilitySummaries={facilitySummaries}
        reportType={reportType}
        setReportType={setReportType}
        enabledModules={enabledModules}
        industry={orgIndustry}
      />
    </div>
  );
};

export default OrgReports2;
