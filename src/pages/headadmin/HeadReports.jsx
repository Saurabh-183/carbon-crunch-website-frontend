import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useReportsData } from "../../features/organizationAdmin/reports/hooks/useReportsData";
import { useReportGeneration } from "../../features/organizationAdmin/reports/hooks/useReportGeneration";
import { buildReportData } from "../../features/organizationAdmin/reports/utils/reportDataBuilder";
import { downloadReportAsHtml, downloadReportAsPdf } from "../../features/organizationAdmin/reports/services/reportDownloadService";
import { resolveServiceBaseUrl } from "../../utils/baseUrl";
import { ChevronLeft } from "lucide-react";
import ReportHeader from "../../features/organizationAdmin/reports/components/ReportHeader";
import EmptyReportsState from "../../features/organizationAdmin/reports/components/EmptyReportsState";
import ReportCard from "../../features/organizationAdmin/reports/components/ReportCard";
import GenerateReportModal from "../../features/organizationAdmin/reports/components/GenerateReportModal";
import RcoReportEditor from "../../components/rco-editor/RcoReportEditor";
import Loader from "../../components/rf/Loader";
import api from "../../utils/api";
import { getSiteUnitLabel } from "../../utils/uiTerminology";

const HeadReports = () => {
  const { user } = useAuth();
  const organizationId = user?.organizationId?._id || user?.organizationId || "";
  const industry = user?.organizationId?.industry || user?.organizationIndustry || "";
  const [orgIndustry, setOrgIndustry] = useState(industry);
  const siteUnitLabel = getSiteUnitLabel(orgIndustry || industry, "singular", user?.role);
  const [showModal, setShowModal] = useState(false);
  const [previewReport, setPreviewReport] = useState(null);
  const [previewMode, setPreviewMode] = useState(null); // "RCO" | "HTML"
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

  /** Extract <body> content from a full HTML document */
  const extractBodyContent = (fullHtml) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(fullHtml, "text/html");
    return doc.body?.innerHTML || fullHtml;
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

  const openBlobPreview = (blob) => {
    const blobUrl = window.URL.createObjectURL(blob);
    window.open(blobUrl, "_blank", "noopener,noreferrer");
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000);
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

  // Preview now opens the generated PDF in a new tab.
  const handlePreview = async (report) => {
    const period = {
      startDate: report.startDate || report.reportData?.period?.startDate,
      endDate: report.endDate || report.reportData?.period?.endDate,
    };

    const isRco = report?.reportData?.reportType === "RCO";

    // RCO reports use the rich editor
    if (isRco) {
      try {
        setPreviewLoading(true);
        const corporatePayload = await buildCorporateRcoPayload(period);
        const response = await fetch(`${reportServiceBase}/render/rco-corporate/export/pdf`, {
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
          throw new Error(err || "Failed to open preview PDF");
        }
        const blob = await response.blob();
        openBlobPreview(blob);
      } catch (err) {
        console.error("RCO preview failed:", err);
        setMessage({ type: "error", text: err?.message || "Failed to open RCO preview" });
      } finally {
        setPreviewLoading(false);
      }
      return;
    }

    // Build report payload and render preview as PDF.
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
      const response = await fetch(`${reportServiceBase}/render/v2/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to render preview PDF");
      const blob = await response.blob();
      openBlobPreview(blob);
    } catch (err) {
      console.error("Preview failed:", err);
      setMessage({ type: "error", text: err?.message || "Failed to open preview PDF" });
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

  // ── Preview mode: RCO Editor or plain HTML preview ──
  if (previewReport) {
    if (previewMode === "RCO") {
      return (
        <RcoReportEditor
          html={previewReport}
          onBack={() => {
            setPreviewReport(null);
            setPreviewMode(null);
            setPreviewPayload(null);
            setPreviewNarrative({});
          }}
          onExportPdf={handleCorporateRcoPdfDownload}
          onExportDocx={handleCorporateRcoDocxDownload}
        />
      );
    }

    // Fallback: plain HTML preview (GHG/CBAM)
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200 px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => {
              setPreviewReport(null);
              setPreviewMode(null);
            }}
            className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        </div>
        <iframe title="Report Preview" srcDoc={previewReport} className="mx-auto block" style={{ width: "210mm", minHeight: "calc(100vh - 50px)", border: "none", background: "#fff" }} />
      </div>
    );
  }

  return (
    <div>
      <ReportHeader onGenerateClick={() => setShowModal(true)} industry={orgIndustry} />

      {/* Reports List */}
      {consolidatedReports.length === 0 ? (
        <EmptyReportsState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {consolidatedReports.map((report) => (
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

export default HeadReports;
