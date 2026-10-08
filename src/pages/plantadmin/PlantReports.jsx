import React, { useState, useEffect, useMemo } from "react";
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

const PlantReports = () => {
  const { user } = useAuth();
  const industry = user?.organizationId?.industry || user?.organizationIndustry || "";
  const [showModal, setShowModal] = useState(false);
  const [previewReport, setPreviewReport] = useState(null);
  const [previewMode, setPreviewMode] = useState(null);
  const [previewPayload, setPreviewPayload] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [enabledModules, setEnabledModules] = useState(null);
  const [plantReports, setPlantReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);

  // Resolve current user's facilityId
  const facilityId = user?.facilityId?._id || user?.facilityId || user?.facilities?.[0]?.facilityId?._id || user?.facilities?.[0]?.facilityId;

  const organizationId = user?.organizationId?._id || user?.organizationId;

  // Fetch org reports data (for facilities list)
  const { facilities, approvedData, productAllocationsByFacility, loading } = useReportsData(organizationId);

  const scopedFacilities = useMemo(() => {
    if (!facilityId) return facilities;
    return facilities.filter((facility) => {
      const candidateId = facility?._id || facility?.id;
      return String(candidateId || "") === String(facilityId || "");
    });
  }, [facilities, facilityId]);

  const scopedApprovedData = useMemo(() => {
    if (!facilityId) return approvedData;
    return approvedData.filter((item) => {
      const itemFacilityId = item?.facilityId?._id || item?.facilityId;
      return String(itemFacilityId || "") === String(facilityId || "");
    });
  }, [approvedData, facilityId]);

  // Fetch org-level enabled modules
  useEffect(() => {
    const fetchOrgModules = async () => {
      if (!organizationId) return;
      try {
        const res = await api.get(`/api/organizations/${organizationId}`);
        const org = res.data?.data || res.data;
        const modules = org?.complianceSettings?.enabledModules || [];
        setEnabledModules(modules.map((m) => (m === "GHG" ? "GHG" : m)));
      } catch (err) {
        console.error("Error fetching org modules:", err);
        setEnabledModules([]);
      }
    };
    fetchOrgModules();
  }, [organizationId]);

  // Fetch generated reports for this facility
  useEffect(() => {
    const fetchPlantReports = async () => {
      if (!organizationId) return;
      try {
        const res = await api.get(`/api/reports?organizationId=${organizationId}&includeDetails=true&limit=100`);
        const allReports = res.data?.data || [];
        const filteredReports = allReports.filter((r) => {
          const rtype = r.reportData?.reportType;
          if (rtype !== "ORG_CONSOLIDATED" && rtype !== "GHG" && rtype !== "GHG_INVENTORY") {
            return false;
          }

          // Branch reports are strictly facility-scoped.
          if (r.facilityId && facilityId) {
            const rFac = typeof r.facilityId === "object" ? r.facilityId._id : r.facilityId;
            return rFac === facilityId;
          }
          return false;
        });
        setPlantReports(filteredReports);
      } catch (err) {
        console.error("Error fetching plant reports:", err);
      } finally {
        setLoadingReports(false);
      }
    };
    fetchPlantReports();
  }, [organizationId, facilityId]);

  // Report generation state — pass facilityId for plant-level filtering
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
    buildRCOPayload,
    resetForm,
  } = useReportGeneration(() => {
    setShowModal(false);
    // Refetch reports
    setLoadingReports(true);
    (async () => {
      try {
        const res = await api.get(`/api/reports?organizationId=${organizationId}&includeDetails=true&limit=100`);
        const allReports = res.data?.data || [];
        const filteredReports = allReports.filter((r) => {
          const rtype = r.reportData?.reportType;
          if (rtype !== "ORG_CONSOLIDATED" && rtype !== "GHG" && rtype !== "GHG_INVENTORY") {
            return false;
          }
          if (r.facilityId && facilityId) {
            const rFac = typeof r.facilityId === "object" ? r.facilityId._id : r.facilityId;
            return rFac === facilityId;
          }
          return false;
        });
        setPlantReports(filteredReports);
      } catch (err) {
        console.error("Error refetching reports:", err);
      } finally {
        setLoadingReports(false);
      }
    })();
  }, user);

  // Build report data function wrapper
  const buildReportDataWrapper = (period) => {
    return buildReportData(period, scopedFacilities, scopedApprovedData, productAllocationsByFacility);
  };

  // Download handlers (pass facilityId for plant-level Excel)
  const handleDownloadExcel = async (report) => {
    await handleDownloadRcoExcel(report, scopedFacilities, facilityId);
  };

  const handleDownloadReport = async (report) => {
    await downloadReportAsHtml(report);
  };

  const handleDownloadPdf = async (report) => {
    await downloadReportAsPdf(report);
  };

  const reportServiceBase = resolveServiceBaseUrl("report");

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

  const fetchRcoPreviewHtml = async (payload) => {
    const response = await fetch(`${reportServiceBase}/render/rco/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payload,
        narrativeOverrides: {},
        useAiNarrative: true,
      }),
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || "Failed to render RCO preview");
    }
    return response.json();
  };

  const handleRcoDocxDownload = async (editedHtml) => {
    if (!previewPayload) return;
    try {
      const response = await fetch(`${reportServiceBase}/render/rco/export/docx`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: previewPayload,
          narrativeOverrides: {},
          useAiNarrative: true,
        }),
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || "Failed to download DOCX");
      }
      const blob = await response.blob();
      downloadBlob(blob, `${previewPayload?.reportName || "RCO_Report"}.docx`);
    } catch (error) {
      setMessage({ type: "error", text: error?.message || "Failed to download DOCX" });
    }
  };

  const handleRcoPdfDownload = async (editedHtml) => {
    if (!editedHtml && !previewPayload) return;
    try {
      // If we have edited HTML, send it directly for PDF rendering
      if (editedHtml) {
        const response = await fetch(`${reportServiceBase}/render/rco/export/pdf-from-html`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ html: editedHtml }),
        });
        if (!response.ok) {
          const err = await response.text();
          throw new Error(err || "Failed to download PDF");
        }
        const blob = await response.blob();
        downloadBlob(blob, `${previewPayload?.reportName || "RCO_Report"}.pdf`);
        return;
      }
      const response = await fetch(`${reportServiceBase}/render/rco/export/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: previewPayload,
          narrativeOverrides: {},
          useAiNarrative: true,
        }),
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || "Failed to download PDF");
      }
      const blob = await response.blob();
      downloadBlob(blob, `${previewPayload?.reportName || "RCO_Report"}.pdf`);
    } catch (error) {
      setMessage({ type: "error", text: error?.message || "Failed to download PDF" });
    }
  };

  // Preview now opens the generated PDF in a new tab.
  const handlePreview = async (report) => {
    try {
      setPreviewLoading(true);
      const isRco = report?.reportData?.reportType === "RCO";
      if (isRco) {
        const period = {
          startDate: report.startDate || report?.reportData?.period?.startDate,
          endDate: report.endDate || report?.reportData?.period?.endDate,
        };
        const rcoPayload = await buildRCOPayload(facilities, period, facilityId);
        const response = await fetch(`${reportServiceBase}/render/rco/export/pdf`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payload: rcoPayload,
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
        return;
      }

      const period = {
        startDate: report.startDate || report?.reportData?.period?.startDate,
        endDate: report.endDate || report?.reportData?.period?.endDate,
      };
      const reportDataForPeriod = buildReportDataWrapper(period);

      const orgFromFacilities = scopedFacilities.find((f) => f?.organizationId && typeof f.organizationId === "object")?.organizationId;
      const resolvedOrg = typeof user?.organizationId === "object" ? user.organizationId : orgFromFacilities || {};
      const facilityList = (reportDataForPeriod?.facilitySummaries || []).map((summary) => {
        const fac = summary.facility || {};
        return {
          id: summary.facilityId,
          name: fac.facilityName || fac.name || "Facility",
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

      const response = await fetch(`${reportServiceBase}/render/v2/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || "Failed to open preview PDF");
      }
      const blob = await response.blob();
      openBlobPreview(blob);
    } catch (error) {
      setMessage({ type: "error", text: error?.message || "Failed to open preview" });
    } finally {
      setPreviewLoading(false);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
    setMessage({ type: "", text: "" });
  };

  // Handle generate click — pass facilityId for plant-level RCO
  const handleGenerateClick = () => {
    const reportData = buildReportDataWrapper(reportPeriod);
    handleGenerateReport(reportData, scopedFacilities, facilityId);
  };

  // Loading state
  if (loading || loadingReports) {
    return <Loader />;
  }

  // Get facility summaries for modal preview
  const facilitySummaries = buildReportDataWrapper(reportPeriod).facilitySummaries;

  // Branch admin should only generate GHG reports.
  const plantModules = ["GHG"];

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
          }}
          onExportPdf={handleRcoPdfDownload}
          onExportDocx={handleRcoDocxDownload}
          loading={previewLoading}
        />
      );
    }

    // Fallback: plain HTML preview (non-RCO)
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200 px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => {
              setPreviewReport(null);
              setPreviewMode(null);
              setPreviewPayload(null);
            }}
            className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        </div>
        <iframe
          title="Report Preview"
          srcDoc={previewReport}
          className="mx-auto block"
          style={{
            width: "210mm",
            minHeight: "calc(100vh - 120px)",
            border: "none",
            background: "#fff",
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <ReportHeader onGenerateClick={() => setShowModal(true)} industry={industry} />

      {/* Reports List */}
      {plantReports.length === 0 ? (
        <EmptyReportsState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plantReports.map((report) => (
            <ReportCard
              key={report._id}
              report={report}
              onDownloadHtml={handleDownloadReport}
              onDownloadPdf={handleDownloadPdf}
              onDownloadExcel={handleDownloadExcel}
              onPreview={handlePreview}
              hidePdfForRco={true}
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
        enabledModules={plantModules.length > 0 ? plantModules : null}
      />
    </div>
  );
};

export default PlantReports;
