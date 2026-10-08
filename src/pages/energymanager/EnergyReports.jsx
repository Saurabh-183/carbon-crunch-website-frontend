import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useReportsData } from "../../features/organizationAdmin/reports/hooks/useReportsData";
import { useReportGeneration } from "../../features/organizationAdmin/reports/hooks/useReportGeneration";
import { buildReportData } from "../../features/organizationAdmin/reports/utils/reportDataBuilder";
import { downloadReportAsHtml, downloadReportAsPdf } from "../../features/organizationAdmin/reports/services/reportDownloadService";
import ReportHeader from "../../features/organizationAdmin/reports/components/ReportHeader";
import EmptyReportsState from "../../features/organizationAdmin/reports/components/EmptyReportsState";
import ReportCard from "../../features/organizationAdmin/reports/components/ReportCard";
import GenerateReportModal from "../../features/organizationAdmin/reports/components/GenerateReportModal";
import Loader from "../../components/rf/Loader";
import api from "../../utils/api";

const isSameId = (left, right) => String(left || "") === String(right || "");

const EnergyReports = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [previewReport, setPreviewReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);

  const organizationId = user?.organizationId?._id || user?.organizationId;
  const userFacilityId = user?.facilityId?._id || user?.facilityId || user?.facilities?.[0]?.facilityId?._id || user?.facilities?.[0]?.facilityId;

  const { facilities, approvedData, productAllocationsByFacility, loading } = useReportsData(organizationId);

  const scopedFacilities = useMemo(() => {
    if (!userFacilityId) return facilities;
    return facilities.filter((facility) => isSameId(facility?._id, userFacilityId));
  }, [facilities, userFacilityId]);

  const effectiveFacilityId = useMemo(() => {
    if (userFacilityId) return userFacilityId;
    return scopedFacilities?.[0]?._id || scopedFacilities?.[0]?.id || null;
  }, [userFacilityId, scopedFacilities]);

  const scopedApprovedData = useMemo(() => {
    if (!effectiveFacilityId) return approvedData;
    return approvedData.filter((item) => {
      const itemFacilityId = item?.facilityId?._id || item?.facilityId;
      return isSameId(itemFacilityId, effectiveFacilityId);
    });
  }, [approvedData, effectiveFacilityId]);

  const fetchEnergyReports = async () => {
    if (!organizationId) return;
    setLoadingReports(true);
    try {
      const res = await api.get(`/api/reports?organizationId=${organizationId}&includeDetails=true&limit=100`);
      const allReports = res.data?.data || [];

      const facilityReports = allReports.filter((report) => {
        const reportType = report?.reportData?.reportType;
        if (!["ORG_CONSOLIDATED", "GHG", "GHG_INVENTORY"].includes(reportType)) return false;

        // Prioritize strictly facility-scoped reports for office admins.
        const reportFacilityId = typeof report?.facilityId === "object" ? report.facilityId?._id : report?.facilityId;
        if (effectiveFacilityId) return isSameId(reportFacilityId, effectiveFacilityId);
        return !reportFacilityId;
      });

      setReports(facilityReports);
    } catch (err) {
      console.error("Error fetching office reports:", err);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchEnergyReports();
  }, [organizationId, effectiveFacilityId]);

  const { generating, reportName, setReportName, reportType, setReportType, reportPeriod, setReportPeriod, message, setMessage, handleGenerateReport, resetForm } = useReportGeneration(() => {
    setShowModal(false);
    fetchEnergyReports();
  }, user);

  const buildReportDataWrapper = (period) => {
    return buildReportData(period, scopedFacilities, scopedApprovedData, productAllocationsByFacility);
  };

  const handleGenerateClick = () => {
    if (!effectiveFacilityId) {
      setMessage({
        type: "error",
        text: "No office facility is mapped to this user. Please assign an office and try again.",
      });
      return;
    }
    const reportData = buildReportDataWrapper(reportPeriod);
    handleGenerateReport(reportData, scopedFacilities, effectiveFacilityId);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
    setMessage({ type: "", text: "" });
  };

  const handlePreview = async (report) => {
    if (report?.reportData?.html) {
      const textarea = document.createElement("textarea");
      textarea.innerHTML = report.reportData.html;
      setPreviewReport(textarea.value);
    }
  };

  const handleDownloadReport = async (report) => {
    await downloadReportAsHtml(report);
  };

  const handleDownloadPdf = async (report) => {
    await downloadReportAsPdf(report);
  };

  if (loading || loadingReports) {
    return <Loader />;
  }

  const facilitySummaries = buildReportDataWrapper(reportPeriod).facilitySummaries;

  if (previewReport) {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200 px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => {
              setPreviewReport(null);
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
      <ReportHeader onGenerateClick={() => setShowModal(true)} />

      {reports.length === 0 ? (
        <EmptyReportsState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <ReportCard key={report._id} report={report} onDownloadHtml={handleDownloadReport} onDownloadPdf={handleDownloadPdf} onPreview={handlePreview} />
          ))}
        </div>
      )}

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
        enabledModules={["GHG"]}
      />
    </div>
  );
};

export default EnergyReports;
